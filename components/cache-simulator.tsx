'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Navbar from './Navbar'
import HeroSection from './HeroSection'
import ConfigToolbar, { WorkloadType, PolicyType } from './ConfigToolbar'
import CacheVisualizer from './CacheVisualizer'
import AIDecisionPanel from './AIDecisionPanel'
import PrefetcherPanel from './PrefetcherPanel'
import TimelineAndControls from './TimelineAndControls'
import MetricsBar from './MetricsBar'
import ResultsView from './ResultsView'
import HowItWorksView from './HowItWorksView'
import BackendOfflineModal from './BackendOfflineModal'
import SettingsModal from './SettingsModal'

import { checkBackendHealth, fetchSimulation } from '@/lib/api'
import type {
  SimulationEvent,
  SimulationMetrics,
  BenchmarkItem,
  HealthStatus
} from '@/simulation/simulationTypes'

export default function CacheSimulator() {
  // Navigation View State
  const [activeTab, setActiveTab] = useState<'simulator' | 'results' | 'how-it-works'>('simulator')

  // Configuration Parameters
  const [workload, setWorkload] = useState<WorkloadType>('Dynamic')
  const [cacheSize, setCacheSize] = useState<number>(4)
  const [policy, setPolicy] = useState<PolicyType>('ML + Prefetch')
  const [traceLength, setTraceLength] = useState<number>(15)
  const [customTrace, setCustomTrace] = useState<string>('')

  // Backend Health and Status
  const [backendStatus, setBackendStatus] = useState<'CONNECTED' | 'OFFLINE' | 'PROCESSING'>('PROCESSING')
  const [healthData, setHealthData] = useState<HealthStatus | undefined>()
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isRetrying, setIsRetrying] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Simulation Data returned by FastAPI
  const [events, setEvents] = useState<SimulationEvent[]>([])
  const [trace, setTrace] = useState<string[]>([])
  const [metrics, setMetrics] = useState<SimulationMetrics | undefined>()
  const [benchmark, setBenchmark] = useState<BenchmarkItem[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Playback Control State
  const [currentStep, setCurrentStep] = useState<number>(0)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [speed, setSpeed] = useState<number>(1)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Trigger Simulation from Backend
  const executeSimulation = useCallback(
    async (
      targetWorkload: WorkloadType,
      targetPolicy: PolicyType,
      targetCapacity: number,
      targetLength: number,
      targetCustomTrace: string
    ) => {
      setIsLoading(true)
      setIsPlaying(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      // Parse custom trace if user typed blocks
      let parsedCustomTrace: string[] | null = null
      if (targetCustomTrace.trim().length > 0) {
        parsedCustomTrace = targetCustomTrace
          .trim()
          .toUpperCase()
          .split(/[\s,]+/)
          .filter(Boolean)
      }

      const res = await fetchSimulation({
        workload: targetWorkload,
        policy: targetPolicy,
        cache_size: targetCapacity,
        trace_length: targetLength,
        custom_trace: parsedCustomTrace,
      })

      if (res.success && res.data) {
        setEvents(res.data.events)
        setTrace(res.data.trace)
        setMetrics(res.data.metrics)
        setBenchmark(res.data.benchmark || [])
        setCurrentStep(0)
        setBackendStatus('CONNECTED')
        setErrorMessage(null)
      } else {
        setBackendStatus('OFFLINE')
        setErrorMessage(res.error || 'Failed to communicate with FastAPI backend')
      }

      setIsLoading(false)
    },
    []
  )

  // Health Check & Initial Load
  const verifyBackendAndLoad = useCallback(async () => {
    setIsRetrying(true)
    setBackendStatus('PROCESSING')

    const health = await checkBackendHealth()
    if (health.connected) {
      setBackendStatus('CONNECTED')
      setHealthData(health.data)
      setErrorMessage(null)
      // Execute initial simulation on verified backend
      await executeSimulation(workload, policy, cacheSize, traceLength, customTrace)
    } else {
      setBackendStatus('OFFLINE')
      setErrorMessage(health.error || 'FastAPI backend is offline or models failed to load.')
    }
    setIsRetrying(false)
  }, [executeSimulation, workload, policy, cacheSize, traceLength, customTrace])

  useEffect(() => {
    verifyBackendAndLoad()
  }, []) // run once on mount

  // Playback Timer Management
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (isPlaying && events.length > 0) {
      const intervalMs = Math.round(1200 / speed)
      timerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= events.length - 1) {
            setIsPlaying(false)
            return prev
          }
          return prev + 1
        })
      }, intervalMs)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isPlaying, speed, events.length])

  // Playback Handlers
  const handleTogglePlay = () => {
    if (currentStep >= events.length - 1) {
      setCurrentStep(0)
      setIsPlaying(true)
    } else {
      setIsPlaying(!isPlaying)
    }
  }

  const handleStepForward = () => {
    setIsPlaying(false)
    if (currentStep < events.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentStep(0)
  }

  const handleManualStepChange = (stepIdx: number) => {
    setIsPlaying(false)
    setCurrentStep(stepIdx)
  }

  // Toolbar Configuration Change Handlers
  const handleWorkloadChange = (w: WorkloadType) => {
    setWorkload(w)
    executeSimulation(w, policy, cacheSize, traceLength, customTrace)
  }

  const handlePolicyChange = (p: PolicyType) => {
    setPolicy(p)
    executeSimulation(workload, p, cacheSize, traceLength, customTrace)
  }

  const handleCacheSizeChange = (s: number) => {
    setCacheSize(s)
    executeSimulation(workload, policy, s, traceLength, customTrace)
  }

  const handleTraceLengthChange = (l: number) => {
    setTraceLength(l)
    executeSimulation(workload, policy, cacheSize, l, customTrace)
  }

  const handleCustomTraceChange = (t: string) => {
    setCustomTrace(t)
  }

  const handleRunSimulation = () => {
    executeSimulation(workload, policy, cacheSize, traceLength, customTrace)
  }

  const currentEvent = events[currentStep]

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-page)] text-[var(--text-primary)] transition-colors">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        backendStatus={backendStatus}
        onRetryConnection={verifyBackendAndLoad}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Hero Section */}
      <HeroSection backendConnected={backendStatus === 'CONNECTED'} />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* If Backend is Offline, Show Offline Diagnostic Banner */}
        {backendStatus === 'OFFLINE' && (
          <BackendOfflineModal
            onRetry={verifyBackendAndLoad}
            isRetrying={isRetrying}
            errorMessage={errorMessage}
          />
        )}

        {/* Tab 1: Simulator View */}
        {activeTab === 'simulator' && (
          <div className="space-y-4">
            {/* Configuration Toolbar */}
            <ConfigToolbar
              workload={workload}
              onWorkloadChange={handleWorkloadChange}
              cacheSize={cacheSize}
              onCacheSizeChange={handleCacheSizeChange}
              policy={policy}
              onPolicyChange={handlePolicyChange}
              traceLength={traceLength}
              onTraceLengthChange={handleTraceLengthChange}
              customTrace={customTrace}
              onCustomTraceChange={handleCustomTraceChange}
              onRunSimulation={handleRunSimulation}
              isLoading={isLoading}
            />

            {/* Primary Simulation Workspace (Two Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left Column: Live Cache Visualizer (7 cols) */}
              <div className="lg:col-span-7 flex flex-col">
                <CacheVisualizer
                  currentEvent={currentEvent}
                  step={currentStep}
                  totalSteps={events.length}
                  capacity={cacheSize}
                />
              </div>

              {/* Right Column: AI Decision Engine & Prefetcher (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <AIDecisionPanel currentEvent={currentEvent} policy={policy} />
                <PrefetcherPanel currentEvent={currentEvent} policy={policy} />
              </div>
            </div>

            {/* Simulation Timeline & Controls */}
            <TimelineAndControls
              events={events}
              currentStep={currentStep}
              onStepChange={handleManualStepChange}
              isPlaying={isPlaying}
              onTogglePlay={handleTogglePlay}
              onStepForward={handleStepForward}
              onReset={handleReset}
              speed={speed}
              onSpeedChange={setSpeed}
            />

            {/* Metrics Bar */}
            <MetricsBar metrics={metrics} events={events} />
          </div>
        )}

        {/* Tab 2: Results View */}
        {activeTab === 'results' && (
          <ResultsView
            benchmark={benchmark}
            workload={workload}
            policy={policy}
            cacheSize={cacheSize}
            metrics={metrics}
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

      {/* Engineering Footer */}
      <footer className="w-full border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-4 mt-8 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--text-muted)] gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[var(--text-primary)]">
              Adaptive Cache AI Simulator
            </span>
            <span>&bull;</span>
            <span>AIML PBL Research Demonstration</span>
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
