'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Layers,
  Workflow,
  Sparkles,
  BarChart3,
  TrendingUp,
  Download,
  AlertTriangle,
  RotateCcw,
  Play,
  Activity,
  Database,
  Radio,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'
import type {
  ActiveExperimentRecord,
  SimulationEvent,
  SimulationMetrics,
  LiveTelemetryPoint
} from '@/simulation/simulationTypes'

interface ResultsViewProps {
  experiment: ActiveExperimentRecord | null
  currentStep?: number
  onStartSimulation: () => void
  onReturnToSimulator?: () => void
}

export default function ResultsView({
  experiment,
  currentStep = 0,
  onStartSimulation,
  onReturnToSimulator,
}: ResultsViewProps) {
  const [downloadSuccess, setDownloadSuccess] = useState(false)

  // 1. STATE: NO EXPERIMENT
  if (!experiment || experiment.status === 'NO_EXPERIMENT') {
    return (
      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4 shadow-xl min-h-[460px]">
        <div className="w-16 h-16 rounded-2xl bg-[#0c121e] border border-[#1e293b] flex items-center justify-center text-[#FF454F] shadow-inner">
          <BarChart3 className="w-8 h-8" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#64748b] block">
            ANALYTICS REPORT STANDBY
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            NO COMPLETED EXPERIMENT
          </h2>
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            Run a simulation to generate its performance report. The Results page displays metrics and charts for only your current, completed experiment.
          </p>
        </div>
        <button
          onClick={onStartSimulation}
          className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF454F] to-[#e11d48] hover:from-[#ff5e67] hover:to-[#f43f5e] text-white text-xs font-bold shadow-[0_0_15px_rgba(255,69,79,0.4)] transition-all active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Go to Simulator &amp; Run</span>
        </button>
      </div>
    )
  }

  // 2. STATE: CONFIGURATION CHANGED
  if (experiment.status === 'CONFIG_CHANGED') {
    return (
      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4 shadow-xl min-h-[460px]">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 block">
            CONFIGURATION INVALIDATED
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            EXPERIMENT CONFIGURATION CHANGED
          </h2>
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            The workload, sequence, or cache capacity was modified after the last run. Stale results have been hidden to ensure 100% data integrity. Run a new simulation to generate updated results.
          </p>
        </div>
        <button
          onClick={onReturnToSimulator || onStartSimulation}
          className="mt-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF454F] to-[#e11d48] hover:from-[#ff5e67] hover:to-[#f43f5e] text-white text-xs font-bold shadow-[0_0_15px_rgba(255,69,79,0.4)] transition-all active:scale-95 cursor-pointer flex items-center gap-2"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Return to Simulator &amp; Run</span>
        </button>
      </div>
    )
  }

  // 3. STATE: COMPUTING
  if (experiment.status === 'COMPUTING') {
    return (
      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4 shadow-xl min-h-[460px]">
        <div className="w-16 h-16 rounded-2xl bg-[#12CBEA]/10 border border-[#12CBEA]/30 flex items-center justify-center text-[#12CBEA]">
          <span className="w-8 h-8 rounded-full border-3 border-[#12CBEA] border-t-transparent animate-spin" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#12CBEA] block">
            BACKEND MACHINE LEARNING INFERENCE
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            COMPUTING EXPERIMENT SIMULATION...
          </h2>
          <p className="text-xs text-[#94a3b8] leading-relaxed">
            FastAPI is evaluating Random Forest cache candidate distances and Markov prefetch transitions on the current trace.
          </p>
        </div>
      </div>
    )
  }

  // 4. STATE: ERROR
  if (experiment.status === 'ERROR') {
    return (
      <div className="bg-[#111827] border border-[#ef4444]/40 rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4 shadow-xl min-h-[460px]">
        <div className="w-16 h-16 rounded-2xl bg-[#ef4444]/10 border border-[#ef4444]/30 flex items-center justify-center text-[#ef4444]">
          <XCircle className="w-8 h-8" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#ef4444] block">
            SIMULATION FAILED
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            EXPERIMENT ERROR
          </h2>
          <p className="text-xs text-[#fca5a5] leading-relaxed">
            {experiment.errorMessage || 'An error occurred while executing the simulation.'}
          </p>
        </div>
        <button
          onClick={onStartSimulation}
          className="mt-2 px-5 py-2.5 rounded-xl bg-[#ef4444] hover:bg-[#dc2626] text-white text-xs font-bold transition-all cursor-pointer"
        >
          <span>Retry Simulation</span>
        </button>
      </div>
    )
  }

  // 5. STATES: READY_FOR_PLAYBACK, PLAYING, PAUSED, COMPLETED
  const {
    experimentId,
    workload,
    trace,
    traceLength,
    cacheCapacity,
    policy,
    events,
    metrics,
    telemetryPoints,
    startedAt,
    completedAt,
    status
  } = experiment

  const isCompleted = status === 'COMPLETED'
  const isPlayingOrPaused = status === 'PLAYING' || status === 'PAUSED' || status === 'READY_FOR_PLAYBACK'

  const hasPrefetcher = policy.includes('Prefetch')

  // Calculate actual counts from events
  const totalEvents = events.length
  const totalHits = events.filter((e) => e.result === 'HIT').length
  const totalMisses = events.filter((e) => e.result === 'MISS').length
  const totalEvictions = events.filter((e) => !!e.evicted || !!e.selectedVictim).length
  const totalPrefetches = events.filter((e) => e.prefetch?.status === 'PREFETCHED').length
  const usefulPrefetches = events.filter((e, idx) => {
    if (e.prefetch?.status !== 'PREFETCHED' || !e.prefetch?.block) return false
    return events.slice(idx + 1).some((sub) => sub.request === e.prefetch.block && sub.result === 'HIT')
  }).length
  const uselessPrefetches = Math.max(0, totalPrefetches - usefulPrefetches)

  const hitRateStr = metrics?.hitRate || (totalEvents > 0 ? `${((totalHits / totalEvents) * 100).toFixed(2)}%` : '0.00%')
  const missRateStr = metrics?.missRate || (totalEvents > 0 ? `${((totalMisses / totalEvents) * 100).toFixed(2)}%` : '0.00%')
  const prefetchAccuracyStr = hasPrefetcher
    ? (totalPrefetches > 0 ? `${((usefulPrefetches / totalPrefetches) * 100).toFixed(2)}%` : '0.00%')
    : 'Not applicable'
  const prefetchCoverageStr = hasPrefetcher
    ? (totalMisses + usefulPrefetches > 0 ? `${((usefulPrefetches / (totalMisses + usefulPrefetches)) * 100).toFixed(2)}%` : '0.00%')
    : 'Not applicable'

  // Prepare Chart 1: Cumulative Hit Rate
  const hitRateChartData = telemetryPoints.map((pt) => ({
    access: pt.accessIndex + 1,
    hitRate: Number(pt.hitRate.toFixed(2)),
  }))

  // Prepare Chart 2: Hits vs Misses
  const hitMissPieData = [
    { name: 'Hits', value: totalHits, color: '#22C55E' },
    { name: 'Misses', value: totalMisses, color: '#FF454F' },
  ]

  // Prepare Chart 4: Prefetch breakdown
  const prefetchPieData = [
    { name: 'Useful', value: usefulPrefetches, color: '#12CBEA' },
    { name: 'Useless', value: uselessPrefetches, color: '#64748B' },
  ]

  // Prepare Chart 5: Cache Occupancy Progression
  const occupancyChartData = events.map((ev, idx) => ({
    access: idx + 1,
    occupancy: ev.cacheAfter ? ev.cacheAfter.length : 0,
    capacity: cacheCapacity,
  }))

  // CSV Export Handler
  const handleExportCSV = () => {
    if (events.length === 0) return
    const headers = [
      'AccessIndex',
      'RequestedBlock',
      'Result',
      'CacheBefore',
      'CacheAfter',
      'EvictedVictim',
      'PrefetchedBlock',
      'PrefetchStatus',
    ]
    const rows = events.map((e) => [
      e.index + 1,
      `"${e.request}"`,
      e.result,
      `"${(e.cacheBefore || []).join(';')}"`,
      `"${(e.cacheAfter || []).join(';')}"`,
      `"${e.evicted || e.selectedVictim || ''}"`,
      `"${e.prefetch?.block || ''}"`,
      `"${e.prefetch?.status || 'NO_PREFETCH'}"`,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `${experimentId || 'experiment'}-results.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    setDownloadSuccess(true)
    setTimeout(() => setDownloadSuccess(false), 2500)
  }

  return (
    <div className="space-y-5 pb-8 select-none">
      {/* Intermediate Warning Banner if Playback Still In Progress */}
      {isPlayingOrPaused && (
        <div className="p-3.5 rounded-xl bg-[#0c1a2e] border border-[#12CBEA]/40 flex items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2 text-[#38bdf8]">
            <Info className="w-4 h-4 text-[#12CBEA] flex-shrink-0" />
            <span>
              Simulation completed computation. Intermediate playback is active (Access {currentStep + 1} of {totalEvents}). Full report reflects total recorded outcomes.
            </span>
          </div>
          {onReturnToSimulator && (
            <button
              onClick={onReturnToSimulator}
              className="px-3 py-1 rounded-lg bg-[#12CBEA]/20 hover:bg-[#12CBEA]/30 text-[#12CBEA] font-bold text-[11px] cursor-pointer"
            >
              Back to Visualizer
            </button>
          )}
        </div>
      )}

      {/* A. EXPERIMENT SUMMARY HEADER */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#1e293b]/80 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FF454F]/15 text-[#FF454F] border border-[#FF454F]/30">
                {experimentId || 'EXP-CURRENT'}
              </span>
              <h1 className="text-base sm:text-lg font-black text-white tracking-tight uppercase">
                Experiment Performance Report
              </h1>
            </div>
            <p className="text-xs text-[#94a3b8] mt-0.5 font-medium">
              Empirical analytics belonging exclusively to this completed simulation run.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Badge */}
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isCompleted
                  ? 'bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30'
                  : 'bg-[#12CBEA]/15 text-[#12CBEA] border border-[#12CBEA]/30'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isCompleted ? 'Completed' : 'Computed (Playback Ready)'}</span>
            </span>

            {/* CSV Download */}
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#172235] hover:bg-[#1e2c44] border border-[#1e293b] text-white text-xs font-semibold transition-all cursor-pointer"
              title="Download exact experiment event trace CSV"
            >
              <Download className="w-3.5 h-3.5 text-[#12CBEA]" />
              <span>{downloadSuccess ? 'Downloaded!' : 'Export CSV'}</span>
            </button>
          </div>
        </div>

        {/* Experiment Parameters Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 text-xs">
          <div className="p-2.5 rounded-xl bg-[#0c121e] border border-[#1e293b]">
            <span className="text-[10px] uppercase font-bold text-[#64748b] block">Workload</span>
            <span className="text-white font-mono font-bold text-xs sm:text-sm">{workload}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0c121e] border border-[#1e293b]">
            <span className="text-[10px] uppercase font-bold text-[#64748b] block">Requests</span>
            <span className="text-white font-mono font-bold text-xs sm:text-sm">{traceLength} Blocks</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0c121e] border border-[#1e293b]">
            <span className="text-[10px] uppercase font-bold text-[#64748b] block">Cache Capacity</span>
            <span className="text-white font-mono font-bold text-xs sm:text-sm">{cacheCapacity} Slots</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0c121e] border border-[#1e293b]">
            <span className="text-[10px] uppercase font-bold text-[#64748b] block">Policy</span>
            <span className="text-[#12CBEA] font-mono font-bold text-xs sm:text-sm">{policy}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0c121e] border border-[#1e293b]">
            <span className="text-[10px] uppercase font-bold text-[#64748b] block">Timestamp</span>
            <span className="text-[#94a3b8] font-mono text-[11px]">{completedAt || startedAt || 'Just now'}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-[#0c121e] border border-[#1e293b]">
            <span className="text-[10px] uppercase font-bold text-[#64748b] block">Execution Time</span>
            <span className="text-white font-mono text-xs sm:text-sm">
              {metrics?.executionTimeMs ? `${metrics.executionTimeMs} ms` : 'Measured'}
            </span>
          </div>
        </div>

        {/* Exact Trace Sequence Display */}
        <div className="p-3 rounded-xl bg-[#0c121e] border border-[#1e293b] space-y-1">
          <span className="text-[10px] uppercase font-bold text-[#64748b] block">
            Exact Access Sequence
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin text-xs font-mono">
            {trace.map((b, i) => (
              <span key={`rep-trace-${i}`} className="inline-flex items-center gap-1.5 flex-shrink-0">
                <span className="px-2 py-0.5 rounded bg-[#172235] border border-[#1e293b] text-white font-bold">
                  {b}
                </span>
                {i < trace.length - 1 && <span className="text-[#475569]">&rarr;</span>}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* B. MAIN PERFORMANCE METRICS (10 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* 1. Hit Rate */}
        <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#1e293b] shadow-xl flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#94a3b8]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
            <span>Hit Rate</span>
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-black font-mono text-[#22c55e]">{hitRateStr}</span>
          </div>
          <span className="text-[10px] font-mono text-[#64748b]">{totalHits} hits / {totalEvents} accesses</span>
        </div>

        {/* 2. Miss Rate */}
        <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#1e293b] shadow-xl flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#94a3b8]">
            <XCircle className="w-3.5 h-3.5 text-[#FF454F]" />
            <span>Miss Rate</span>
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-black font-mono text-[#FF454F]">{missRateStr}</span>
          </div>
          <span className="text-[10px] font-mono text-[#64748b]">{totalMisses} misses</span>
        </div>

        {/* 3. Total Hits */}
        <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#1e293b] shadow-xl flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#94a3b8]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
            <span>Total Hits</span>
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-black font-mono text-white">{totalHits}</span>
          </div>
          <span className="text-[10px] font-mono text-[#64748b]">Resident retrievals</span>
        </div>

        {/* 4. Total Misses */}
        <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#1e293b] shadow-xl flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#94a3b8]">
            <XCircle className="w-3.5 h-3.5 text-[#FF454F]" />
            <span>Total Misses</span>
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-black font-mono text-white">{totalMisses}</span>
          </div>
          <span className="text-[10px] font-mono text-[#64748b]">Memory fetches</span>
        </div>

        {/* 5. Total Evictions */}
        <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#1e293b] shadow-xl flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#94a3b8]">
            <Trash2 className="w-3.5 h-3.5 text-[#f59e0b]" />
            <span>Total Evictions</span>
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-black font-mono text-[#f59e0b]">{totalEvictions}</span>
          </div>
          <span className="text-[10px] font-mono text-[#64748b]">Victim replacements</span>
        </div>

        {/* 6. Prefetch Accuracy */}
        <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#1e293b] shadow-xl flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#94a3b8]">
            <Zap className="w-3.5 h-3.5 text-[#12CBEA]" />
            <span>Prefetch Accuracy</span>
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-black font-mono text-[#12CBEA]">{prefetchAccuracyStr}</span>
          </div>
          <span className="text-[10px] font-mono text-[#64748b]">Useful / Total prefetches</span>
        </div>

        {/* 7. Prefetch Coverage */}
        <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#1e293b] shadow-xl flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#94a3b8]">
            <Layers className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span>Prefetch Coverage</span>
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-black font-mono text-[#38bdf8]">{prefetchCoverageStr}</span>
          </div>
          <span className="text-[10px] font-mono text-[#64748b]">Share of avoided misses</span>
        </div>

        {/* 8. Useful Prefetches */}
        <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#1e293b] shadow-xl flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#94a3b8]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
            <span>Useful Prefetches</span>
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-black font-mono text-[#22c55e]">{hasPrefetcher ? usefulPrefetches : '—'}</span>
          </div>
          <span className="text-[10px] font-mono text-[#64748b]">Subsequently accessed</span>
        </div>

        {/* 9. Useless Prefetches */}
        <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#1e293b] shadow-xl flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#94a3b8]">
            <Radio className="w-3.5 h-3.5 text-[#64748b]" />
            <span>Useless Prefetches</span>
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-black font-mono text-[#64748b]">{hasPrefetcher ? uselessPrefetches : '—'}</span>
          </div>
          <span className="text-[10px] font-mono text-[#64748b]">Unused speculative lines</span>
        </div>

        {/* 10. Execution Time */}
        <div className="p-3.5 rounded-2xl bg-[#111827] border border-[#1e293b] shadow-xl flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#94a3b8]">
            <Clock className="w-3.5 h-3.5 text-[#a855f7]" />
            <span>Simulation Time</span>
          </div>
          <div className="my-1.5">
            <span className="text-2xl font-black font-mono text-white">
              {metrics?.executionTimeMs ? `${metrics.executionTimeMs} ms` : '< 1 ms'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-[#64748b]">FastAPI execution</span>
        </div>
      </div>

      {/* C. CURRENT EXPERIMENT CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Chart 1: Cumulative Hit Rate Progression (8 cols) */}
        <div className="lg:col-span-8 bg-[#111827] border border-[#1e293b] rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]/80">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#12CBEA]" />
              <h3 className="text-xs font-bold text-white tracking-wide uppercase">
                Chart 1: Cumulative Hit Rate Progression
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#12CBEA] font-bold">
              Final: {hitRateStr}
            </span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hitRateChartData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis
                  dataKey="access"
                  stroke="#64748b"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#1e293b' }}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  stroke="#64748b"
                  fontSize={10}
                  tickFormatter={(v) => `${v}%`}
                  tickLine={false}
                  axisLine={{ stroke: '#1e293b' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-[#0c121e] border border-[#1e293b] p-2 rounded-lg text-xs font-mono shadow-xl">
                          <p className="text-[#94a3b8]">Access #{data.access}</p>
                          <p className="text-[#12CBEA] font-bold">Hit Rate: {data.hitRate}%</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="hitRate"
                  stroke="#12CBEA"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#12CBEA', stroke: '#080B12', strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: '#FF454F', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Hits vs Misses Donut (4 cols) */}
        <div className="lg:col-span-4 bg-[#111827] border border-[#1e293b] rounded-2xl p-5 shadow-xl space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]/80">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#22c55e]" />
              <h3 className="text-xs font-bold text-white tracking-wide uppercase">
                Chart 2: Hits vs Misses
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#94a3b8]">{totalEvents} total</span>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={hitMissPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {hitMissPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0]
                      return (
                        <div className="bg-[#0c121e] border border-[#1e293b] p-2 rounded-lg text-xs font-mono shadow-xl">
                          <p style={{ color: d.payload.color }} className="font-bold">
                            {d.name}: {d.value}
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-around text-xs font-mono pt-1">
            <span className="flex items-center gap-1.5 text-[#22c55e]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" />
              <span>Hits: {totalHits} ({hitRateStr})</span>
            </span>
            <span className="flex items-center gap-1.5 text-[#FF454F]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF454F]" />
              <span>Misses: {totalMisses} ({missRateStr})</span>
            </span>
          </div>
        </div>

        {/* Chart 3: Cache Event Timeline (12 cols) */}
        <div className="lg:col-span-12 bg-[#111827] border border-[#1e293b] rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]/80">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#FF454F]" />
              <h3 className="text-xs font-bold text-white tracking-wide uppercase">
                Chart 3: Memory Access Event Breakdown Timeline
              </h3>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono text-[#94a3b8]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#22c55e]" /> Hit</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#FF454F]" /> Miss</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#12CBEA]" /> Prefetch</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm bg-[#f59e0b]" /> Eviction</span>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-2 px-1 scrollbar-thin">
            {events.map((ev, idx) => {
              const isHit = ev.result === 'HIT'
              const hasPref = ev.prefetch?.status === 'PREFETCHED'
              const hasEvict = !!ev.evicted || !!ev.selectedVictim

              return (
                <div
                  key={`res-timeline-tile-${idx}`}
                  className={`flex-shrink-0 flex flex-col items-center justify-between w-14 h-20 p-2 rounded-xl border text-center font-mono ${
                    isHit
                      ? 'bg-[#064e3b]/20 border-[#22c55e]/40'
                      : 'bg-[#7f1d1d]/20 border-[#ef4444]/40'
                  }`}
                >
                  <span className="text-[9px] text-[#64748b]">#{idx + 1}</span>
                  <span className="text-base font-black text-white">{ev.request}</span>
                  <span
                    className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                      isHit ? 'text-[#22c55e] bg-[#22c55e]/15' : 'text-[#FF454F] bg-[#FF454F]/15'
                    }`}
                  >
                    {ev.result}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5">
                    {hasPref && <span className="w-1.5 h-1.5 rounded-full bg-[#12CBEA]" title={`Prefetched: ${ev.prefetch?.block}`} />}
                    {hasEvict && <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" title={`Evicted: ${ev.evicted || ev.selectedVictim}`} />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Chart 4: Prefetch Analysis (6 cols) */}
        <div className="lg:col-span-6 bg-[#111827] border border-[#1e293b] rounded-2xl p-5 shadow-xl space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]/80">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#12CBEA]" />
              <h3 className="text-xs font-bold text-white tracking-wide uppercase">
                Chart 4: Speculative Prefetch Analysis
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#94a3b8]">
              {hasPrefetcher ? `${totalPrefetches} issued` : 'N/A'}
            </span>
          </div>

          {hasPrefetcher ? (
            <div className="grid grid-cols-2 gap-3 items-center">
              <div className="h-36 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={prefetchPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={32}
                      outerRadius={52}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {prefetchPieData.map((entry, index) => (
                        <Cell key={`pref-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-[#12CBEA]">
                  <span>Useful Prefetches:</span>
                  <strong>{usefulPrefetches}</strong>
                </div>
                <div className="flex items-center justify-between text-[#64748b]">
                  <span>Useless Prefetches:</span>
                  <strong>{uselessPrefetches}</strong>
                </div>
                <div className="flex items-center justify-between text-white pt-1 border-t border-[#1e293b]">
                  <span>Accuracy:</span>
                  <strong>{prefetchAccuracyStr}</strong>
                </div>
                <div className="flex items-center justify-between text-[#38bdf8]">
                  <span>Coverage:</span>
                  <strong>{prefetchCoverageStr}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#64748b]">
              Selected policy ({policy}) does not feature speculative prefetching.
            </div>
          )}
        </div>

        {/* Chart 5: Cache Occupancy Progression (6 cols) */}
        <div className="lg:col-span-6 bg-[#111827] border border-[#1e293b] rounded-2xl p-5 shadow-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#1e293b]/80">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#38bdf8]" />
              <h3 className="text-xs font-bold text-white tracking-wide uppercase">
                Chart 5: Cache Slot Occupancy
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[#94a3b8]">
              Capacity: {cacheCapacity} slots
            </span>
          </div>

          <div className="h-40 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyChartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="access" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis domain={[0, cacheCapacity]} stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload
                      return (
                        <div className="bg-[#0c121e] border border-[#1e293b] p-2 rounded-lg text-xs font-mono shadow-xl">
                          <p className="text-[#94a3b8]">Access #{d.access}</p>
                          <p className="text-[#38bdf8] font-bold">Occupancy: {d.occupancy} / {d.capacity} slots</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="occupancy" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* D. ACTUAL AI DECISION SUMMARY */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]/80">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[#FF454F]" />
            <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase">
              Actual Machine Learning Decisions Log
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#94a3b8]">
            Recorded across {totalEvents} accesses
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Evictions Log */}
          <div className="p-3.5 rounded-xl bg-[#0c121e] border border-[#1e293b] space-y-2">
            <span className="text-[11px] font-bold text-[#FF454F] uppercase tracking-wider flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Evicted Cache Blocks ({totalEvictions})</span>
            </span>
            {totalEvictions > 0 ? (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                {events
                  .filter((e) => !!e.evicted || !!e.selectedVictim)
                  .map((e, idx) => (
                    <div key={`evict-log-${idx}`} className="flex items-center justify-between p-1.5 rounded-lg bg-[#111827] font-mono text-[11px]">
                      <span className="text-[#94a3b8]">Access #{e.index + 1} (Req: {e.request}):</span>
                      <span className="text-[#FF454F] font-bold">
                        Evicted [{e.evicted || e.selectedVictim}]
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-[#64748b] text-[11px]">No block evictions were required during this experiment.</p>
            )}
          </div>

          {/* Prefetches Log */}
          <div className="p-3.5 rounded-xl bg-[#0c121e] border border-[#1e293b] space-y-2">
            <span className="text-[11px] font-bold text-[#12CBEA] uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" />
              <span>Markov Prefetches Triggered ({totalPrefetches})</span>
            </span>
            {totalPrefetches > 0 ? (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                {events
                  .filter((e) => e.prefetch?.status === 'PREFETCHED')
                  .map((e, idx) => (
                    <div key={`pref-log-${idx}`} className="flex items-center justify-between p-1.5 rounded-lg bg-[#111827] font-mono text-[11px]">
                      <span className="text-[#94a3b8]">Access #{e.index + 1}:</span>
                      <span className="text-[#12CBEA] font-bold">
                        Prefetched [{e.prefetch?.block}] (Conf: {Math.round((e.prefetch?.confidence || 0) * 100)}%)
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-[#64748b] text-[11px]">
                {hasPrefetcher
                  ? 'No speculative prefetches met the ≥ 70% confidence threshold.'
                  : `Policy ${policy} operates without prefetch inference.`}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* E. EXPERIMENT CONCLUSION */}
      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-5 sm:p-6 shadow-xl space-y-2">
        <span className="text-[10px] uppercase font-bold text-[#64748b] tracking-wider block">
          Experiment Conclusion
        </span>
        <p className="text-xs sm:text-sm text-[#F8FAFC] leading-relaxed font-medium">
          The simulation processed <strong className="text-white">{traceLength} memory requests</strong> with a cache capacity of <strong className="text-white">{cacheCapacity} slots</strong> under the <strong className="text-[#12CBEA]">{policy}</strong> policy on workload pattern <strong className="text-white">&quot;{workload}&quot;</strong>. The cache achieved a final hit rate of <strong className="text-[#22c55e]">{hitRateStr}</strong> ({totalHits} hits, {totalMisses} misses), with <strong className="text-[#f59e0b]">{totalEvictions} eviction victim selections</strong>.
          {hasPrefetcher && ` The Adaptive Markov Prefetcher issued ${totalPrefetches} speculative block loads, of which ${usefulPrefetches} were subsequently hit (${prefetchAccuracyStr} accuracy and ${prefetchCoverageStr} coverage).`}
        </p>
      </div>
    </div>
  )
}
