'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Navbar from './Navbar'
import SimulatorSidebar from './SimulatorSidebar'
import AIChip3D from './AIChip3D'
import GeneratedTracePreview from './GeneratedTracePreview'
import CacheVisualizer from './CacheVisualizer'
import AIDecisionPanel from './AIDecisionPanel'
import PrefetcherPanel from './PrefetcherPanel'
import LiveExplanationPanel from './LiveExplanationPanel'
import TimelineAndControls, { PlaybackSpeed, SPEED_DELAYS } from './TimelineAndControls'
import BottomAnalyticsSection from './BottomAnalyticsSection'
import ResultsView from './ResultsView'
import HowItWorksView from './HowItWorksView'
import BackendOfflineModal from './BackendOfflineModal'
import SettingsModal from './SettingsModal'
import type { WorkloadType, PolicyType } from './ConfigToolbar'

import { checkBackendHealth, fetchSimulation, generateTracePreview } from '@/lib/api'
import {
  parseTraceTokens,
  type SimulationEvent,
  type SimulationMetrics,
  type BenchmarkItem,
  type HealthStatus,
  type BenchmarkPolicyProgress,
  type LiveTelemetryPoint,
  type ActiveExperimentRecord,
  type ExperimentStatus
} from '@/simulation/simulationTypes'

export type SimulationAppState =
  | 'IDLE'
  | 'TRACE_GENERATED'
  | 'COMPUTING'
  | 'READY_FOR_PLAYBACK'
  | 'PLAYING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'ERROR'

export default function CacheSimulator() {
  // Navigation View State
  const [activeTab, setActiveTab] = useState<'simulator' | 'results' | 'how-it-works'>('simulator')

  // Strict Simulation Application State
  const [appState, setAppState] = useState<SimulationAppState>('IDLE')

  // Execution Mode: 'step' (Step-by-Step Manual) or 'auto' (Automatic Playback)
  const [executionMode, setExecutionMode] = useState<'step' | 'auto'>('step')

  // Educational Mode: Explain AI decisions toggle
  const [explainMode, setExplainMode] = useState<boolean>(true)

  // Trace Mode State: 'auto' (default) or 'manual'
  const [traceMode, setTraceMode] = useState<'auto' | 'manual'>('auto')

  // Auto Mode Configuration
  const [workload, setWorkload] = useState<WorkloadType>('Dynamic')
  const [traceLength, setTraceLength] = useState<number>(12)
  const [activeSeed, setActiveSeed] = useState<number | null>(42)

  // Manual Mode Configuration (Controlled Input)
  const [customTraceInput, setCustomTraceInput] = useState<string>('S, B, C, D, A, B, C, D, H, E, K, B, F, G, A')
  const [isCustomValidated, setIsCustomValidated] = useState<boolean>(true)
  const [customValidationError, setCustomValidationError] = useState<string | null>(null)

  // Authoritative Memory Trace Preview
  const [trace, setTrace] = useState<string[]>([])

  // Hardware Configuration
  const [cacheSize, setCacheSize] = useState<number>(4)
  const [policy, setPolicy] = useState<PolicyType>('ML + Prefetch')

  // Single Authoritative Experiment State Record (Shared with Results Page)
  const [activeExperiment, setActiveExperiment] = useState<ActiveExperimentRecord | null>(null)
  const activeExpIdRef = useRef<string | null>(null)

  // Backend Health and Status
  const [backendStatus, setBackendStatus] = useState<'CONNECTED' | 'OFFLINE' | 'PROCESSING'>('PROCESSING')
  const [healthData, setHealthData] = useState<HealthStatus | undefined>()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Simulation Data returned by FastAPI upon clicking "Run Simulation"
  const [events, setEvents] = useState<SimulationEvent[]>([])
  const [finalMetrics, setFinalMetrics] = useState<SimulationMetrics | undefined>()
  const [benchmark, setBenchmark] = useState<BenchmarkItem[]>([])
  const [benchmarkProgress, setBenchmarkProgress] = useState<BenchmarkPolicyProgress[]>([])
  const [telemetryPoints, setTelemetryPoints] = useState<LiveTelemetryPoint[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Playback Control State
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [speed, setSpeed] = useState<PlaybackSpeed>(1)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Reset/Invalidate previous simulation state whenever trace or configuration changes
  const invalidatePreviousSimulation = useCallback((markConfigChanged: boolean = true) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
    setEvents([])
    setFinalMetrics(undefined)
    setBenchmark([])
    setBenchmarkProgress([])
    setTelemetryPoints([])
    setCurrentStep(0)

    if (markConfigChanged) {
      setActiveExperiment((prev) =>
        prev && prev.status !== 'NO_EXPERIMENT'
          ? { ...prev, status: 'CONFIG_CHANGED' }
          : null
      )
    }
  }, [])

  // STEP 2: Load/Update Trace Preview WITHOUT running simulation
  const loadTracePreview = useCallback(
    async (
      targetWorkload: WorkloadType,
      targetLength: number,
      targetSeed: number | null,
      mode: 'auto' | 'manual' = traceMode,
      customInput: string = customTraceInput
    ) => {
      invalidatePreviousSimulation(true)

      if (mode === 'manual') {
        const tokens = parseTraceTokens(customInput)
        setTrace(tokens)
        setAppState('TRACE_GENERATED')
        return
      }

      // Auto mode: Request trace preview directly from backend generator
      const res = await generateTracePreview({
        workload: targetWorkload,
        trace_length: targetLength,
        seed: targetSeed,
      })

      if (res.success && res.data?.trace) {
        setTrace(res.data.trace)
        setAppState('TRACE_GENERATED')
      } else {
        const fallback = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].slice(0, targetLength)
        setTrace(fallback)
        setAppState('TRACE_GENERATED')
      }
    },
    [invalidatePreviousSimulation, traceMode, customTraceInput]
  )

  // Initial Health Check & Initial Trace Generation
  const verifyBackendAndInitTrace = useCallback(async () => {
    setIsRetrying(true)
    setBackendStatus('PROCESSING')

    const health = await checkBackendHealth()
    if (health.connected) {
      setBackendStatus('CONNECTED')
      setHealthData(health.data)
      setErrorMessage(null)
      // Generate trace preview on load without simulating
      await loadTracePreview(workload, traceLength, activeSeed, 'auto')
    } else {
      setBackendStatus('OFFLINE')
      setErrorMessage(health.error || 'FastAPI backend is offline or models failed to load.')
    }
    setIsRetrying(false)
  }, [loadTracePreview, workload, traceLength, activeSeed])

  useEffect(() => {
    verifyBackendAndInitTrace()
  }, [verifyBackendAndInitTrace])

  // PART 1: Controlled Custom Trace Input Handler
  const handleCustomTraceInputChange = (newVal: string) => {
    setCustomTraceInput(newVal)

    // Parse tokens immediately
    const tokens = parseTraceTokens(newVal)
    setTrace(tokens)

    // Mark validation as required
    setIsCustomValidated(false)
    if (tokens.length === 0) {
      setCustomValidationError('Custom sequence cannot be empty.')
    } else {
      setCustomValidationError(null)
    }

    // Invalidate old experiment and stop playback immediately
    invalidatePreviousSimulation(true)
    setAppState('TRACE_GENERATED')
  }

  // PART 1: Validate Sequence Handler
  const handleValidateSequence = () => {
    if (traceMode === 'manual') {
      const tokens = parseTraceTokens(customTraceInput)
      if (tokens.length === 0) {
        setCustomValidationError('Custom sequence cannot be empty. Enter identifiers like A, B, C or S 1 2 3.')
        setIsCustomValidated(false)
        return
      }

      setTrace(tokens)
      setIsCustomValidated(true)
      setCustomValidationError(null)
      setAppState('TRACE_GENERATED')
      invalidatePreviousSimulation(true)
    } else {
      setIsCustomValidated(true)
      setCustomValidationError(null)
      alert(`Workload Validated: ${workload} pattern with ${trace.length} blocks and ${cacheSize} cache slots.`)
    }
  }

  // Workload and Configuration Handlers (Updates preview ONLY, never auto-simulates)
  const handleWorkloadChange = (newWorkload: WorkloadType) => {
    setWorkload(newWorkload)
    loadTracePreview(newWorkload, traceLength, activeSeed, 'auto')
  }

  const handleTraceLengthChange = (newLength: number) => {
    setTraceLength(newLength)
    loadTracePreview(workload, newLength, activeSeed, 'auto')
  }

  const handleGenerateNewSequence = () => {
    const freshSeed = Math.floor(Math.random() * 900000) + 100000
    setActiveSeed(freshSeed)
    loadTracePreview(workload, traceLength, freshSeed, traceMode, customTraceInput)
  }

  const handleTraceModeChange = (newMode: 'auto' | 'manual') => {
    setTraceMode(newMode)
    if (newMode === 'manual') {
      const tokens = parseTraceTokens(customTraceInput)
      setTrace(tokens)
      setIsCustomValidated(tokens.length > 0)
      setCustomValidationError(tokens.length === 0 ? 'Custom sequence cannot be empty.' : null)
      invalidatePreviousSimulation(true)
      setAppState('TRACE_GENERATED')
    } else {
      setIsCustomValidated(true)
      setCustomValidationError(null)
      loadTracePreview(workload, traceLength, activeSeed, 'auto')
    }
  }

  const handlePolicyChange = (p: PolicyType) => {
    setPolicy(p)
    invalidatePreviousSimulation(true)
    if (trace.length > 0) setAppState('TRACE_GENERATED')
  }

  const handleCacheSizeChange = (s: number) => {
    setCacheSize(s)
    invalidatePreviousSimulation(true)
    if (trace.length > 0) setAppState('TRACE_GENERATED')
  }

  const handleClearAll = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setIsPlaying(false)
    setIsLoading(false)
    setEvents([])
    setFinalMetrics(undefined)
    setBenchmark([])
    setCurrentStep(0)
    setAppState('TRACE_GENERATED')
    setActiveExperiment((prev) => (prev ? { ...prev, status: 'CONFIG_CHANGED' } : null))
  }

  // PART 1 & 2: Start Simulation ONLY when user clicks "Run Simulation"
  const handleRunSimulation = useCallback(async () => {
    // If manual mode, ensure trace is non-empty and validated
    if (traceMode === 'manual') {
      const tokens = parseTraceTokens(customTraceInput)
      if (tokens.length === 0) {
        setCustomValidationError('Custom sequence cannot be empty.')
        setIsCustomValidated(false)
        return
      }
      setIsCustomValidated(true)
      setCustomValidationError(null)
      setTrace(tokens)
    }

    if (trace.length === 0) return

    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    // Generate unique experiment ID and track with ref to prevent stale async overwrites
    const expId = `EXP-${Date.now().toString(36).toUpperCase().slice(-5)}`
    activeExpIdRef.current = expId

    setIsLoading(true)
    setIsPlaying(false)
    setAppState('COMPUTING')
    setErrorMessage(null)
    invalidatePreviousSimulation(false)

    // Set authoritative experiment state to COMPUTING
    setActiveExperiment({
      experimentId: expId,
      status: 'COMPUTING',
      workload: traceMode === 'manual' ? 'Custom Trace' : workload,
      trace: [...trace],
      traceLength: trace.length,
      cacheCapacity: cacheSize,
      policy,
      events: [],
      metrics: null,
      telemetryPoints: [],
      startedAt: new Date().toLocaleTimeString(),
      completedAt: null,
    })

    // Submit the EXACT previewed trace to FastAPI backend
    const result = await fetchSimulation({
      workload,
      policy,
      cache_size: cacheSize,
      trace_length: trace.length,
      custom_trace: trace,
      seed: activeSeed,
    })

    // Stale response guard: check if this request was superseded by a newer one
    if (activeExpIdRef.current !== expId) {
      return
    }

    if (!result.success || !result.data) {
      setAppState('ERROR')
      setErrorMessage(result.error || 'Failed to simulate on backend')
      setIsLoading(false)
      setActiveExperiment((prev) =>
        prev
          ? {
              ...prev,
              status: 'ERROR',
              errorMessage: result.error || 'Backend simulation failed',
            }
          : null
      )
      return
    }

    const { trace: outTrace, events: outEvents, metrics: outMetrics, benchmark: outBenchmark } = result.data

    setTrace(outTrace)
    setEvents(outEvents)
    setFinalMetrics(outMetrics)
    setBenchmark(outBenchmark)

    // Precalculate telemetry convergence points
    let cumHits = 0
    let cumMisses = 0
    let cumUseful = 0
    let cumTotalPref = 0

    const points: LiveTelemetryPoint[] = outEvents.map((ev, idx) => {
      if (ev.result === 'HIT') cumHits++
      else cumMisses++

      if (ev.prefetch?.status === 'PREFETCHED') {
        cumTotalPref++
        if (
          idx + 1 < outEvents.length &&
          outEvents[idx + 1].request === ev.prefetch.block &&
          outEvents[idx + 1].result === 'HIT'
        ) {
          cumUseful++
        }
      }

      const tot = cumHits + cumMisses
      const hr = tot > 0 ? (cumHits / tot) * 100 : 0
      const mr = tot > 0 ? (cumMisses / tot) * 100 : 0

      return {
        accessIndex: idx,
        request: ev.request,
        result: ev.result,
        hits: cumHits,
        misses: cumMisses,
        hitRate: hr,
        missRate: mr,
        occupancy: ev.cacheAfter?.length || 0,
        capacity: cacheSize,
        totalPrefetches: cumTotalPref,
        usefulPrefetches: cumUseful,
        prefetchAccuracy: cumTotalPref > 0 ? (cumUseful / cumTotalPref) * 100 : 0,
      }
    })

    setTelemetryPoints(points)
    setCurrentStep(0)
    setIsLoading(false)
    setBackendStatus('CONNECTED')

    // Update authoritative experiment state to READY_FOR_PLAYBACK
    setActiveExperiment({
      experimentId: expId,
      status: 'READY_FOR_PLAYBACK',
      workload: traceMode === 'manual' ? 'Custom Trace' : workload,
      trace: outTrace,
      traceLength: outTrace.length,
      cacheCapacity: cacheSize,
      policy,
      events: outEvents,
      metrics: outMetrics,
      telemetryPoints: points,
      startedAt: new Date().toLocaleTimeString(),
      completedAt: null,
    })

    setAppState('READY_FOR_PLAYBACK')
    setIsPlaying(false)
  }, [trace, workload, policy, cacheSize, activeSeed, traceMode, customTraceInput, invalidatePreviousSimulation])

  // Central Playback Timer
  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }

    if (isPlaying && events.length > 0) {
      if (currentStep >= events.length - 1) {
        setIsPlaying(false)
        setAppState('COMPLETED')
        setActiveExperiment((prev) =>
          prev
            ? {
                ...prev,
                status: 'COMPLETED',
                completedAt: new Date().toLocaleTimeString(),
              }
            : null
        )
        return
      }

      const delayMs = SPEED_DELAYS[speed] || 1500

      timerRef.current = setTimeout(() => {
        setCurrentStep((prev) => {
          const next = prev + 1
          if (next >= events.length - 1) {
            setIsPlaying(false)
            setAppState('COMPLETED')
            setActiveExperiment((p) =>
              p
                ? {
                    ...p,
                    status: 'COMPLETED',
                    completedAt: new Date().toLocaleTimeString(),
                  }
                : null
            )
          }
          return next
        })
      }, delayMs)
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }
  }, [isPlaying, currentStep, speed, events.length])

  // Step-by-Step Navigation Handlers
  const handleTogglePlay = () => {
    if (events.length === 0) {
      handleRunSimulation()
      return
    }
    if (currentStep >= events.length - 1) {
      setCurrentStep(0)
      setIsPlaying(true)
      setAppState('PLAYING')
      setActiveExperiment((prev) => (prev ? { ...prev, status: 'PLAYING' } : null))
    } else {
      const nextPlay = !isPlaying
      setIsPlaying(nextPlay)
      setAppState(nextPlay ? 'PLAYING' : 'PAUSED')
      setActiveExperiment((prev) => (prev ? { ...prev, status: nextPlay ? 'PLAYING' : 'PAUSED' } : null))
    }
  }

  const handleStepForward = () => {
    setIsPlaying(false)
    if (currentStep < events.length - 1) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      if (nextStep >= events.length - 1) {
        setAppState('COMPLETED')
        setActiveExperiment((prev) =>
          prev
            ? {
                ...prev,
                status: 'COMPLETED',
                completedAt: new Date().toLocaleTimeString(),
              }
            : null
        )
      } else {
        setAppState('PAUSED')
        setActiveExperiment((prev) => (prev ? { ...prev, status: 'PAUSED' } : null))
      }
    }
  }

  const handleStepBackward = () => {
    setIsPlaying(false)
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
      setAppState('PAUSED')
      setActiveExperiment((prev) => (prev ? { ...prev, status: 'PAUSED' } : null))
    }
  }

  const handleJumpToStart = () => {
    setIsPlaying(false)
    setCurrentStep(0)
    setAppState('READY_FOR_PLAYBACK')
    setActiveExperiment((prev) => (prev ? { ...prev, status: 'READY_FOR_PLAYBACK' } : null))
  }

  const handleJumpToEnd = () => {
    setIsPlaying(false)
    if (events.length > 0) {
      setCurrentStep(events.length - 1)
      setAppState('COMPLETED')
      setActiveExperiment((prev) =>
        prev
          ? {
              ...prev,
              status: 'COMPLETED',
              completedAt: new Date().toLocaleTimeString(),
            }
          : null
      )
    }
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentStep(0)
    setAppState('READY_FOR_PLAYBACK')
    setActiveExperiment((prev) => (prev ? { ...prev, status: 'READY_FOR_PLAYBACK' } : null))
  }

  const handleManualStepChange = (stepIdx: number) => {
    setIsPlaying(false)
    setCurrentStep(stepIdx)
    if (stepIdx >= events.length - 1) {
      setAppState('COMPLETED')
      setActiveExperiment((prev) =>
        prev
          ? {
              ...prev,
              status: 'COMPLETED',
              completedAt: new Date().toLocaleTimeString(),
            }
          : null
      )
    } else {
      setAppState('PAUSED')
      setActiveExperiment((prev) => (prev ? { ...prev, status: 'PAUSED' } : null))
    }
  }

  // Active event for current step
  const currentEvent = events[currentStep] || null

  // Calculate live cumulative metrics for current step
  const activeEventsSlice = events.slice(0, currentStep + 1)
  const activeHits = activeEventsSlice.filter((e) => e.result === 'HIT').length
  const activeMisses = activeEventsSlice.filter((e) => e.result === 'MISS').length
  const totalCalls = activeHits + activeMisses
  const activeHitRate = totalCalls > 0 ? (activeHits / totalCalls) * 100 : 0
  const activeMissRate = totalCalls > 0 ? (activeMisses / totalCalls) * 100 : 0
  const activeTotalPref = activeEventsSlice.filter((e) => e.prefetch?.status === 'PREFETCHED').length
  const activeUseful = activeEventsSlice.filter((e, idx) => {
    if (e.prefetch?.status !== 'PREFETCHED' || !e.prefetch?.block) return false
    return activeEventsSlice.slice(idx + 1).some((sub) => sub.request === e.prefetch.block && sub.result === 'HIT')
  }).length
  const activeUseless = Math.max(0, activeTotalPref - activeUseful)
  const activeEvictions = activeEventsSlice.filter((e) => !!e.evicted || !!e.selectedVictim).length

  // Live metrics structure
  const liveMetrics: SimulationMetrics = {
    hits: activeHits,
    misses: activeMisses,
    totalPrefetches: activeTotalPref,
    usefulPrefetches: activeUseful,
    hitRate: `${activeHitRate.toFixed(2)}%`,
    missRate: `${activeMissRate.toFixed(2)}%`,
    prefetchAccuracy: activeTotalPref > 0 ? `${((activeUseful / activeTotalPref) * 100).toFixed(2)}%` : '0.00%',
    prefetchCoverage: activeMisses + activeUseful > 0 ? `${((activeUseful / (activeMisses + activeUseful)) * 100).toFixed(2)}%` : '0.00%',
    executionTimeMs: finalMetrics?.executionTimeMs,
    avgAccessTimeUs: finalMetrics?.avgAccessTimeUs,
    totalAccesses: totalCalls,
    evictions: activeEvictions,
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#080B12] text-[#F8FAFC] transition-colors selection:bg-[#FF454F] selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        backendStatus={backendStatus}
        onRetryConnection={verifyBackendAndInitTrace}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-[1560px] w-full mx-auto px-4 sm:px-6 py-5">
        {/* Backend Offline Modal */}
        {backendStatus === 'OFFLINE' && (
          <BackendOfflineModal
            onRetry={verifyBackendAndInitTrace}
            isRetrying={isRetrying}
            errorMessage={errorMessage}
          />
        )}

        {/* Tab 1: Simulator View */}
        {activeTab === 'simulator' && (
          <div className="flex flex-col lg:flex-row gap-5 items-start">
            {/* STEP 1: LEFT SIDEBAR - Experiment Configuration & Controlled Custom Sequence */}
            <SimulatorSidebar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              workload={workload}
              onWorkloadChange={handleWorkloadChange}
              cacheSize={cacheSize}
              onCacheSizeChange={handleCacheSizeChange}
              policy={policy}
              onPolicyChange={handlePolicyChange}
              traceLength={traceLength}
              onTraceLengthChange={handleTraceLengthChange}
              traceMode={traceMode}
              onTraceModeChange={handleTraceModeChange}
              customTraceInput={customTraceInput}
              onCustomTraceInputChange={handleCustomTraceInputChange}
              isCustomValidated={isCustomValidated}
              customValidationError={customValidationError}
              parsedCustomCount={trace.length}
              onGenerateSequence={handleGenerateNewSequence}
              onValidateSequence={handleValidateSequence}
              onClear={handleClearAll}
              onRunSimulation={handleRunSimulation}
              isLoading={isLoading}
            />

            {/* MAIN DASHBOARD CONTENT AREA */}
            <div className="flex-1 min-w-0 flex flex-col gap-4">
              {/* TOP BANNER */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF454F]/10 border border-[#FF454F]/30 text-[#FF454F] text-[10px] font-bold tracking-wider uppercase">
                    <span>⚡ AI COMMAND CENTER &bull; WORKLOAD WORKFLOW</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1.5">
                    Live Cache Simulation
                  </h1>
                  <p className="text-xs text-[#94a3b8] mt-0.5 font-medium">
                    Review generated memory access sequence, then execute AI cache replacement and adaptive prefetching.
                  </p>
                </div>

                {/* 3D Floating AI Microchip */}
                <div className="flex-shrink-0 self-end sm:self-center">
                  <AIChip3D />
                </div>
              </div>

              {/* STEP 2 & 3: GENERATED MEMORY ACCESS SEQUENCE PREVIEW */}
              <GeneratedTracePreview
                trace={trace}
                workload={traceMode === 'manual' ? 'Custom Trace' : workload}
                traceLength={trace.length}
                cacheSize={cacheSize}
                policy={policy}
                appState={appState}
                currentStep={currentStep}
                isCustomMode={traceMode === 'manual'}
                isCustomValidated={isCustomValidated}
                customValidationError={customValidationError}
                onValidateSequence={handleValidateSequence}
                onGenerateNewSequence={handleGenerateNewSequence}
                onRunSimulation={handleRunSimulation}
                isComputing={isLoading}
              />

              {/* STEP 5: LIVE EXPLANATION PANEL ("WHAT IS HAPPENING RIGHT NOW?") */}
              <LiveExplanationPanel
                currentEvent={currentEvent}
                currentStep={currentStep}
                totalSteps={trace.length}
                policy={policy}
                capacity={cacheSize}
                explainMode={explainMode}
                onToggleExplainMode={() => setExplainMode(!explainMode)}
              />

              {/* CENTER & RIGHT TWO-COLUMN GRID */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
                {/* Left/Center Column: 3D Cache Visualizer + Timeline (7 cols) */}
                <div className="xl:col-span-7 flex flex-col gap-4">
                  <CacheVisualizer
                    currentEvent={currentEvent}
                    step={currentStep}
                    totalSteps={trace.length}
                    capacity={cacheSize}
                    onStartSimulation={handleRunSimulation}
                    isRunning={isPlaying || isLoading}
                    isCompleted={appState === 'COMPLETED'}
                  />

                  {/* Interactive Memory Access Timeline with Step Controls */}
                  <TimelineAndControls
                    events={events}
                    currentStep={currentStep}
                    onStepChange={handleManualStepChange}
                    isPlaying={isPlaying}
                    onTogglePlay={handleTogglePlay}
                    onStepForward={handleStepForward}
                    onStepBackward={handleStepBackward}
                    onJumpToStart={handleJumpToStart}
                    onJumpToEnd={handleJumpToEnd}
                    onReset={handleReset}
                    speed={speed}
                    onSpeedChange={setSpeed}
                    executionMode={executionMode}
                    onExecutionModeChange={setExecutionMode}
                  />
                </div>

                {/* Right Column: AI Decision Engine + Adaptive Prefetcher (5 cols) */}
                <div className="xl:col-span-5 flex flex-col gap-4">
                  <AIDecisionPanel
                    currentEvent={currentEvent}
                    policy={policy}
                    explainMode={explainMode}
                  />

                  <PrefetcherPanel
                    currentEvent={currentEvent}
                    policy={policy}
                    explainMode={explainMode}
                  />
                </div>
              </div>

              {/* BOTTOM ANALYTICS REGION: Performance Metrics, Cumulative Hit Rate, Telemetry Counters */}
              <BottomAnalyticsSection
                lifecycleState={
                  events.length === 0
                    ? 'IDLE'
                    : appState === 'COMPLETED'
                    ? 'COMPLETED'
                    : 'RUNNING'
                }
                metrics={liveMetrics}
                telemetryPoints={telemetryPoints}
                currentAccessIndex={currentStep}
                totalAccesses={trace.length}
                hits={activeHits}
                misses={activeMisses}
                usefulPrefetches={activeUseful}
                uselessPrefetches={activeUseless}
                totalPrefetches={activeTotalPref}
                evictionsCount={activeEvictions}
              />
            </div>
          </div>
        )}

        {/* Tab 2: PART 2 - Results View (Dedicated to Current Experiment ONLY) */}
        {activeTab === 'results' && (
          <ResultsView
            experiment={activeExperiment}
            currentStep={currentStep}
            onStartSimulation={() => {
              setActiveTab('simulator')
              handleRunSimulation()
            }}
            onReturnToSimulator={() => setActiveTab('simulator')}
          />
        )}

        {/* Tab 3: How It Works View */}
        {activeTab === 'how-it-works' && <HowItWorksView />}
      </main>

      {/* Settings / API Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        healthData={healthData}
        backendStatus={backendStatus}
      />

      {/* Footer */}
      <footer className="w-full border-t border-[#1e293b] bg-[#0c111b] py-4 mt-8 transition-colors">
        <div className="max-w-[1560px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#64748b] gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#94a3b8]">
              Adaptive Cache AI Simulator
            </span>
            <span>&bull;</span>
            <span>Random Forest Regressor &bull; Markov Prefetcher</span>
          </div>

          <div className="flex items-center gap-3">
            <span>FastAPI Port 8000</span>
            <span>&bull;</span>
            <span>Next.js Port 3000</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
