'use client'

import React, { useState, memo } from 'react'
import {
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Layers,
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
  Zap,
  Info,
  Award
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
  CartesianGrid,
  Legend,
  LabelList
} from 'recharts'
import type { ActiveExperimentRecord } from '@/simulation/simulationTypes'
import { useTheme } from './ThemeProvider'
import RobotMascot from './RobotMascot'

interface ResultsViewProps {
  experiment: ActiveExperimentRecord | null
  currentStep?: number
  onStartSimulation: () => void
  onReturnToSimulator?: () => void
}

function ResultsView({
  experiment,
  currentStep = 0,
  onStartSimulation,
  onReturnToSimulator,
}: ResultsViewProps) {
  const { theme } = useTheme()
  const [downloadSuccess, setDownloadSuccess] = useState(false)

  const isDark = theme === 'dark'
  const gridColor = isDark ? 'rgba(241, 238, 227, 0.10)' : 'rgba(75, 90, 80, 0.14)'
  const axisColor = isDark ? '#98A59C' : '#5B6B61'
  const sageColor = isDark ? '#7AA889' : '#4B5A50'
  const sageSoft = isDark ? '#587863' : '#74897B'
  const sageMuted = isDark ? '#43584B' : '#95A59A'
  const amberColor = isDark ? '#D99B38' : '#B47418'
  const vermilionColor = '#F20B0B'
  const neutralMuted = isDark ? '#66756B' : '#A6A295'

  // 1. STATE: NO EXPERIMENT
  if (!experiment || experiment.status === 'NO_EXPERIMENT') {
    return (
      <div className="glass-card rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[460px]">
        <RobotMascot />
        <div className="space-y-1.5 max-w-md">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] block">
            Analytics Report Standby
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            NO EXPERIMENT RUN
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Configure your workload and run a simulation to generate performance analytics. This view reports exclusively on your active simulation experiment.
          </p>
        </div>
        <button
          type="button"
          onClick={onStartSimulation}
          className="mt-2 px-5 py-2.5 rounded-xl bg-[var(--accent-vermilion)] hover:bg-[var(--accent-vermilion-hover)] text-white text-xs font-bold shadow-sm ui-interactive cursor-pointer flex items-center gap-2"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Start Simulation</span>
        </button>
      </div>
    )
  }

  // 2. STATE: CONFIGURATION CHANGED
  if (experiment.status === 'CONFIG_CHANGED') {
    return (
      <div className="glass-card rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[460px]">
        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-amber-subtle)] border border-[var(--accent-amber-border)] flex items-center justify-center text-[var(--accent-amber-text)]">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--accent-amber-text)] block">
            Configuration Invalidated
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            EXPERIMENT CONFIGURATION CHANGED
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            The workload, sequence, or cache capacity was modified after the last run. Stale results are cleared to preserve scientific accuracy. Run a new simulation to generate updated metrics.
          </p>
        </div>
        <button
          type="button"
          onClick={onReturnToSimulator || onStartSimulation}
          className="mt-2 px-5 py-2.5 rounded-xl bg-[var(--accent-vermilion)] hover:bg-[var(--accent-vermilion-hover)] text-white text-xs font-bold shadow-sm transition-all active:scale-[0.99] cursor-pointer flex items-center gap-2"
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
      <div className="glass-card rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[460px]">
        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-sage-subtle)] border border-[var(--accent-sage-border)] flex items-center justify-center">
          <span className="w-7 h-7 rounded-full border-3 border-[var(--brand-sage)] dark:border-[var(--accent-sage-text)] border-t-transparent animate-spin" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--accent-sage-text)] block">
            Backend Machine Learning Inference
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            COMPUTING EXPERIMENT SIMULATION...
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            FastAPI is evaluating Random Forest cache candidate distances and Markov prefetch transitions on the current trace.
          </p>
        </div>
      </div>
    )
  }

  // 4. STATE: ERROR
  if (experiment.status === 'ERROR') {
    return (
      <div className="glass-card border-[var(--accent-vermilion-border)] rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-4 min-h-[460px]">
        <div className="w-14 h-14 rounded-2xl bg-[var(--accent-vermilion-subtle)] border border-[var(--accent-vermilion-border)] flex items-center justify-center text-[var(--accent-vermilion-text)]">
          <XCircle className="w-7 h-7" />
        </div>
        <div className="space-y-1.5 max-w-md">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--accent-vermilion-text)] block">
            Simulation Failed
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            EXPERIMENT ERROR
          </h2>
          <p className="text-xs text-[var(--accent-vermilion-text)] leading-relaxed">
            {experiment.errorMessage || 'An error occurred while executing the simulation.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onStartSimulation}
          className="mt-2 px-5 py-2.5 rounded-xl bg-[var(--accent-vermilion)] hover:bg-[var(--accent-vermilion-hover)] text-white text-xs font-bold transition-colors cursor-pointer"
        >
          Retry Simulation
        </button>
      </div>
    )
  }

  // 5. COMPLETED / PLAYBACK READY STATES
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
    status,
    benchmark = [],
  } = experiment

  const isCompleted = status === 'COMPLETED'
  const isPlayingOrPaused =
    status === 'PLAYING' || status === 'PAUSED' || status === 'READY_FOR_PLAYBACK'
  const hasPrefetcher = policy.includes('Prefetch')

  const totalEvents = events.length
  const totalHits = events.filter((e) => e.result === 'HIT').length
  const totalMisses = events.filter((e) => e.result === 'MISS').length
  const totalEvictions = events.filter((e) => !!e.evicted || !!e.selectedVictim).length
  const totalPrefetches = events.filter((e) => e.prefetch?.status === 'PREFETCHED').length
  const usefulPrefetches = events.filter((e, idx) => {
    if (e.prefetch?.status !== 'PREFETCHED' || !e.prefetch?.block) return false
    return events
      .slice(idx + 1)
      .some((sub) => sub.request === e.prefetch.block && sub.result === 'HIT')
  }).length
  const uselessPrefetches = Math.max(0, totalPrefetches - usefulPrefetches)

  const hitRateStr =
    metrics?.hitRate ||
    (totalEvents > 0 ? `${((totalHits / totalEvents) * 100).toFixed(2)}%` : '0.00%')
  const missRateStr =
    metrics?.missRate ||
    (totalEvents > 0 ? `${((totalMisses / totalEvents) * 100).toFixed(2)}%` : '0.00%')
  const prefetchAccuracyStr = hasPrefetcher
    ? totalPrefetches > 0
      ? `${((usefulPrefetches / totalPrefetches) * 100).toFixed(2)}%`
      : '0.00%'
    : 'Not applicable'
  const prefetchCoverageStr = hasPrefetcher
    ? totalMisses + usefulPrefetches > 0
      ? `${((usefulPrefetches / (totalMisses + usefulPrefetches)) * 100).toFixed(2)}%`
      : '0.00%'
    : 'Not applicable'

  // Chart 1: Cumulative Hit Rate
  const hitRateChartData = telemetryPoints.map((pt) => ({
    access: pt.accessIndex + 1,
    hitRate: Number(pt.hitRate.toFixed(2)),
  }))

  // Chart 2: Hits vs Misses
  const hitMissPieData = [
    { name: 'Hits', value: totalHits, color: sageColor },
    { name: 'Misses', value: totalMisses, color: vermilionColor },
  ]

  // Chart 4: Prefetch breakdown
  const prefetchPieData = [
    { name: 'Useful', value: usefulPrefetches, color: amberColor },
    { name: 'Useless', value: uselessPrefetches, color: neutralMuted },
  ]

  // Chart 5: Cache Occupancy Progression
  const occupancyChartData = events.map((ev, idx) => ({
    access: idx + 1,
    occupancy: ev.cacheAfter ? ev.cacheAfter.length : 0,
    capacity: cacheCapacity,
  }))

  // Policy Color Mapping for Real Backend Benchmark Data
  const getPolicyColor = (polName: string) => {
    if (polName === 'ML + Prefetch') return vermilionColor
    if (polName === 'ML Replacement') return sageColor
    if (polName === 'LRU') return sageSoft
    if (polName === 'FIFO') return amberColor
    return sageMuted
  }

  const benchmarkChartData = benchmark.map((b) => ({
    name: b.name,
    hitRate: Number(b.value.toFixed(2)),
    fill: getPolicyColor(b.name),
    isHighlighted: b.name === 'ML + Prefetch',
  }))

  // CSV Export Handler (Strictly Preserved)
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
    <div className="space-y-5 pb-10">
      {/* Intermediate Banner */}
      {isPlayingOrPaused && (
        <div className="p-3.5 rounded-xl bg-[var(--accent-sage-subtle)] border border-[var(--accent-sage-border)] flex flex-wrap items-center justify-between text-xs gap-3">
          <div className="flex items-center gap-2 text-[var(--text-primary)]">
            <Info className="w-4 h-4 text-[var(--accent-sage-text)] flex-shrink-0" />
            <span>
              Backend simulation completed. Interactive playback is at Access {currentStep + 1} of{' '}
              {totalEvents}. Metrics below reflect total recorded outcomes for this experiment.
            </span>
          </div>
          {onReturnToSimulator && (
            <button
              type="button"
              onClick={onReturnToSimulator}
              className="px-3 py-1.5 rounded-lg bg-[var(--brand-sage)] text-[#F1EEE3] font-semibold text-[11px] cursor-pointer hover:opacity-90"
            >
              Back to Visualizer
            </button>
          )}
        </div>
      )}

      {/* A. EXPERIMENT SUMMARY HEADER */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[var(--border-subtle)] gap-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[var(--accent-vermilion-subtle)] text-[var(--accent-vermilion-text)] border border-[var(--accent-vermilion-border)]">
                {experimentId || 'EXP-CURRENT'}
              </span>
              <h1 className="text-base sm:text-lg font-extrabold text-[var(--text-primary)] tracking-tight uppercase">
                Experiment Performance Report
              </h1>
            </div>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5 font-medium">
              Empirical analytics generated directly from your completed simulation trace.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 bg-[var(--accent-sage-subtle)] text-[var(--accent-sage-text)] border border-[var(--accent-sage-border)]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isCompleted ? 'Completed' : 'Computed (Playback Ready)'}</span>
            </span>

            <button
              type="button"
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[var(--brand-sage)] hover:opacity-90 text-[#F1EEE3] text-xs font-semibold transition-opacity cursor-pointer"
              title="Download exact experiment event trace CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloadSuccess ? 'Exported CSV!' : 'Export CSV'}</span>
            </button>
          </div>
        </div>

        {/* Experiment Parameters Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
          <div className="p-2.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
              Workload
            </span>
            <span className="text-[var(--text-primary)] font-mono font-bold text-xs sm:text-sm">
              {workload}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
              Requests
            </span>
            <span className="text-[var(--text-primary)] font-mono font-bold text-xs sm:text-sm">
              {traceLength} Blocks
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
              Cache Capacity
            </span>
            <span className="text-[var(--text-primary)] font-mono font-bold text-xs sm:text-sm">
              {cacheCapacity} Slots
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
              Policy
            </span>
            <span className="text-[var(--accent-vermilion-text)] font-mono font-bold text-xs sm:text-sm">
              {policy}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
              Timestamp
            </span>
            <span className="text-[var(--text-secondary)] font-mono text-[11px]">
              {completedAt || startedAt || 'Measured'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
              Execution Time
            </span>
            <span className="text-[var(--text-primary)] font-mono text-xs sm:text-sm">
              {metrics?.executionTimeMs != null ? `${metrics.executionTimeMs} ms` : 'Measured'}
            </span>
          </div>
        </div>

        {/* Exact Trace Sequence */}
        <div className="p-3 rounded-xl glass-inset space-y-1.5">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
            Exact Access Sequence
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs font-mono">
            {trace.map((b, i) => (
              <span key={`rep-trace-${i}`} className="inline-flex items-center gap-1.5 flex-shrink-0">
                <span className="px-2 py-0.5 rounded bg-[var(--bg-surface-solid)] border border-[var(--border-subtle)] text-[var(--text-primary)] font-bold">
                  {b}
                </span>
                {i < trace.length - 1 && (
                  <span className="text-[var(--text-muted)]">&rarr;</span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* B. MAIN PERFORMANCE METRICS (10 Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="glass-card p-3.5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[var(--text-muted)]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-sage-text)]" />
            <span>Hit Rate</span>
          </div>
          <span className="text-2xl font-black font-mono text-[var(--accent-sage-text)] my-1.5">
            {hitRateStr}
          </span>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            {totalHits} hits / {totalEvents} accesses
          </span>
        </div>

        <div className="glass-card p-3.5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[var(--text-muted)]">
            <XCircle className="w-3.5 h-3.5 text-[var(--accent-vermilion-text)]" />
            <span>Miss Rate</span>
          </div>
          <span className="text-2xl font-black font-mono text-[var(--accent-vermilion-text)] my-1.5">
            {missRateStr}
          </span>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            {totalMisses} misses
          </span>
        </div>

        <div className="glass-card p-3.5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[var(--text-muted)]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-sage-text)]" />
            <span>Total Hits</span>
          </div>
          <span className="text-2xl font-black font-mono text-[var(--text-primary)] my-1.5">
            {totalHits}
          </span>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            Resident retrievals
          </span>
        </div>

        <div className="glass-card p-3.5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[var(--text-muted)]">
            <XCircle className="w-3.5 h-3.5 text-[var(--accent-vermilion-text)]" />
            <span>Total Misses</span>
          </div>
          <span className="text-2xl font-black font-mono text-[var(--text-primary)] my-1.5">
            {totalMisses}
          </span>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">Memory fetches</span>
        </div>

        <div className="glass-card p-3.5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[var(--text-muted)]">
            <Trash2 className="w-3.5 h-3.5 text-[var(--accent-vermilion-text)]" />
            <span>Total Evictions</span>
          </div>
          <span className="text-2xl font-black font-mono text-[var(--accent-vermilion-text)] my-1.5">
            {totalEvictions}
          </span>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            Victim replacements
          </span>
        </div>

        <div className="glass-card p-3.5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[var(--text-muted)]">
            <Zap className="w-3.5 h-3.5 text-[var(--accent-amber-text)]" />
            <span>Prefetch Accuracy</span>
          </div>
          <span className="text-2xl font-black font-mono text-[var(--accent-amber-text)] my-1.5">
            {prefetchAccuracyStr}
          </span>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            Useful / Total prefetches
          </span>
        </div>

        <div className="glass-card p-3.5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[var(--text-muted)]">
            <Layers className="w-3.5 h-3.5 text-[var(--accent-sage-text)]" />
            <span>Prefetch Coverage</span>
          </div>
          <span className="text-2xl font-black font-mono text-[var(--accent-sage-text)] my-1.5">
            {prefetchCoverageStr}
          </span>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            Share of avoided misses
          </span>
        </div>

        <div className="glass-card p-3.5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[var(--text-muted)]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-sage-text)]" />
            <span>Useful Prefetches</span>
          </div>
          <span className="text-2xl font-black font-mono text-[var(--accent-sage-text)] my-1.5">
            {hasPrefetcher ? usefulPrefetches : '—'}
          </span>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            Subsequently accessed
          </span>
        </div>

        <div className="glass-card p-3.5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[var(--text-muted)]">
            <Radio className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>Useless Prefetches</span>
          </div>
          <span className="text-2xl font-black font-mono text-[var(--text-muted)] my-1.5">
            {hasPrefetcher ? uselessPrefetches : '—'}
          </span>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            Unused speculative lines
          </span>
        </div>

        <div className="glass-card p-3.5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[var(--text-muted)]">
            <Clock className="w-3.5 h-3.5 text-[var(--brand-sage)] dark:text-[var(--accent-sage-text)]" />
            <span>Simulation Time</span>
          </div>
          <span className="text-2xl font-black font-mono text-[var(--text-primary)] my-1.5">
            {metrics?.executionTimeMs != null ? `${metrics.executionTimeMs} ms` : '< 1 ms'}
          </span>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            FastAPI execution
          </span>
        </div>
      </div>

      {/* C. EXPERIMENT CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Chart 1: Cumulative Hit Rate Progression */}
        <div className="lg:col-span-8 glass-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[var(--accent-sage-text)]" />
              <h3 className="text-xs font-bold text-[var(--text-primary)] tracking-wide uppercase">
                Chart 1: Cumulative Hit Rate Progression
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[var(--accent-sage-text)] font-bold">
              Final: {hitRateStr}
            </span>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={hitRateChartData} margin={{ top: 10, right: 16, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="access"
                  stroke={axisColor}
                  tick={{ fill: axisColor, fontSize: 10 }}
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                />
                <YAxis
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                  stroke={axisColor}
                  tick={{ fill: axisColor, fontSize: 10 }}
                  tickFormatter={(v) => `${v}%`}
                  tickLine={false}
                  axisLine={{ stroke: gridColor }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-[var(--bg-surface-solid)] border border-[var(--border-strong)] p-2 rounded-lg text-xs font-mono shadow-md">
                          <p className="text-[var(--text-muted)]">Access #{data.access}</p>
                          <p className="text-[var(--accent-sage-text)] font-bold">
                            Hit Rate: {data.hitRate}%
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }}
                  formatter={() => <span className="text-[var(--text-secondary)]">Cumulative Hit Rate (%)</span>}
                />
                <Line
                  type="monotone"
                  dataKey="hitRate"
                  name="Cumulative Hit Rate"
                  stroke={sageColor}
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: isDark ? '#29352D' : '#FFFDF8', stroke: sageColor, strokeWidth: 2 }}
                  activeDot={{ r: 5, fill: vermilionColor, stroke: '#F1EEE3', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Hits vs Misses Donut */}
        <div className="lg:col-span-4 glass-card rounded-2xl p-5 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[var(--accent-sage-text)]" />
              <h3 className="text-xs font-bold text-[var(--text-primary)] tracking-wide uppercase">
                Chart 2: Hits vs Misses
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">{totalEvents} total</span>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={hitMissPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={66}
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
                        <div className="bg-[var(--bg-surface-solid)] border border-[var(--border-strong)] p-2 rounded-lg text-xs font-mono shadow-md">
                          <p className="font-bold text-[var(--text-primary)]">
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
            <span className="flex items-center gap-1.5 text-[var(--accent-sage-text)]">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: sageColor }} />
              <span>Hits: {totalHits} ({hitRateStr})</span>
            </span>
            <span className="flex items-center gap-1.5 text-[var(--accent-vermilion-text)]">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-vermilion)]" />
              <span>Misses: {totalMisses} ({missRateStr})</span>
            </span>
          </div>
        </div>

        {/* Chart 3: Cache Event Timeline */}
        <div className="lg:col-span-12 glass-card rounded-2xl p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between pb-2 border-b border-[var(--border-subtle)] gap-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-[var(--accent-vermilion-text)]" />
              <h3 className="text-xs font-bold text-[var(--text-primary)] tracking-wide uppercase">
                Chart 3: Memory Access Event Breakdown Timeline
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-[var(--text-secondary)]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs bg-[var(--accent-sage-hit)]" /> Hit
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs bg-[var(--accent-vermilion)]" /> Miss
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs bg-[var(--accent-amber)]" /> Prefetch
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-xs border border-[var(--accent-vermilion)]" /> Eviction
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-2 px-1">
            {events.map((ev, idx) => {
              const isHit = ev.result === 'HIT'
              const hasPref = ev.prefetch?.status === 'PREFETCHED'
              const hasEvict = !!ev.evicted || !!ev.selectedVictim

              return (
                <div
                  key={`res-timeline-tile-${idx}`}
                  className={`flex-shrink-0 flex flex-col items-center justify-between w-14 h-20 p-2 rounded-xl border text-center font-mono ${
                    isHit
                      ? 'bg-[var(--accent-sage-subtle)] border-[var(--accent-sage-border)]'
                      : 'bg-[var(--accent-vermilion-subtle)] border-[var(--accent-vermilion-border)]'
                  }`}
                >
                  <span className="text-[9px] text-[var(--text-muted)]">#{idx + 1}</span>
                  <span className="text-base font-black text-[var(--text-primary)]">
                    {ev.request}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-1 py-0.5 rounded ${
                      isHit
                        ? 'text-[var(--accent-sage-text)] bg-[var(--bg-surface-solid)]/60'
                        : 'text-[var(--accent-vermilion-text)] bg-[var(--bg-surface-solid)]/60'
                    }`}
                  >
                    {ev.result}
                  </span>
                  <div className="flex items-center gap-1 mt-0.5 h-2">
                    {hasPref && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-[var(--accent-amber)]"
                        title={`Prefetched: ${ev.prefetch?.block}`}
                      />
                    )}
                    {hasEvict && (
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-[var(--accent-vermilion)]"
                        title={`Evicted: ${ev.evicted || ev.selectedVictim}`}
                      />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Chart 4: Speculative Prefetch Analysis */}
        <div className="lg:col-span-6 glass-card rounded-2xl p-5 space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-[var(--accent-amber-text)]" />
              <h3 className="text-xs font-bold text-[var(--text-primary)] tracking-wide uppercase">
                Chart 4: Speculative Prefetch Analysis
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              {hasPrefetcher ? `${totalPrefetches} issued` : 'N/A'}
            </span>
          </div>

          {hasPrefetcher ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              <div className="h-40 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={prefetchPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={34}
                      outerRadius={54}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {prefetchPieData.map((entry, index) => (
                        <Cell key={`pref-cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0]
                          return (
                            <div className="bg-[var(--bg-surface-solid)] border border-[var(--border-strong)] p-2 rounded-lg text-xs font-mono shadow-md">
                              <span className="font-bold text-[var(--text-primary)]">
                                {d.name}: {d.value}
                              </span>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between text-[var(--accent-amber-text)]">
                  <span>Useful Prefetches:</span>
                  <strong>{usefulPrefetches}</strong>
                </div>
                <div className="flex items-center justify-between text-[var(--text-muted)]">
                  <span>Useless Prefetches:</span>
                  <strong>{uselessPrefetches}</strong>
                </div>
                <div className="flex items-center justify-between text-[var(--text-primary)] pt-1.5 border-t border-[var(--border-subtle)]">
                  <span>Accuracy:</span>
                  <strong>{prefetchAccuracyStr}</strong>
                </div>
                <div className="flex items-center justify-between text-[var(--accent-sage-text)]">
                  <span>Coverage:</span>
                  <strong>{prefetchCoverageStr}</strong>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[var(--text-muted)]">
              Selected policy ({policy}) operates without speculative prefetching.
            </div>
          )}
        </div>

        {/* Chart 5: Cache Slot Occupancy */}
        <div className="lg:col-span-6 glass-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[var(--accent-sage-text)]" />
              <h3 className="text-xs font-bold text-[var(--text-primary)] tracking-wide uppercase">
                Chart 5: Cache Slot Occupancy
              </h3>
            </div>
            <span className="text-[10px] font-mono text-[var(--text-muted)]">
              Capacity: {cacheCapacity} slots
            </span>
          </div>

          <div className="h-44 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyChartData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis
                  dataKey="access"
                  stroke={axisColor}
                  tick={{ fill: axisColor, fontSize: 10 }}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, cacheCapacity]}
                  stroke={axisColor}
                  tick={{ fill: axisColor, fontSize: 10 }}
                  tickLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload
                      return (
                        <div className="bg-[var(--bg-surface-solid)] border border-[var(--border-strong)] p-2 rounded-lg text-xs font-mono shadow-md">
                          <p className="text-[var(--text-muted)]">Access #{d.access}</p>
                          <p className="text-[var(--accent-sage-text)] font-bold">
                            Occupancy: {d.occupancy} / {d.capacity} slots
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="occupancy" name="Occupied Slots" fill={sageColor} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 6: Comparative Policy Benchmark (Actual Backend Evaluation) */}
        {benchmarkChartData.length > 0 && (
          <div className="lg:col-span-12 glass-card rounded-2xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between pb-2 border-b border-[var(--border-subtle)] gap-2">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[var(--accent-vermilion-text)]" />
                <h3 className="text-xs font-bold text-[var(--text-primary)] tracking-wide uppercase">
                  Chart 6: Replacement Policy Benchmark Comparison ({workload} &bull; {cacheCapacity} Slots)
                </h3>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-mono text-[var(--text-secondary)]">
                <span className="flex items-center gap-1.5 font-bold text-[var(--accent-vermilion-text)]">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#F20B0B]" /> ML + Prefetch (Highlighted)
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: sageColor }} /> ML / Baselines
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              <div className="lg:col-span-7 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={benchmarkChartData}
                    margin={{ top: 18, right: 16, left: -16, bottom: 4 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                    <XAxis
                      dataKey="name"
                      stroke={axisColor}
                      tick={{ fill: axisColor, fontSize: 10, fontWeight: 600 }}
                      tickLine={false}
                      interval={0}
                    />
                    <YAxis
                      domain={[0, 100]}
                      stroke={axisColor}
                      tick={{ fill: axisColor, fontSize: 10 }}
                      tickFormatter={(v) => `${v}%`}
                      tickLine={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const d = payload[0].payload
                          return (
                            <div className="bg-[var(--bg-surface-solid)] border border-[var(--border-strong)] p-2.5 rounded-lg text-xs font-mono shadow-md">
                              <p className="font-bold text-[var(--text-primary)]">{d.name}</p>
                              <p
                                className="font-bold mt-0.5"
                                style={{ color: d.isHighlighted ? vermilionColor : sageColor }}
                              >
                                Hit Rate: {d.hitRate}%
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey="hitRate" name="Hit Rate (%)" radius={[6, 6, 0, 0]} maxBarSize={56}>
                      {benchmarkChartData.map((entry, idx) => (
                        <Cell key={`bm-cell-${idx}`} fill={entry.fill} />
                      ))}
                      <LabelList
                        dataKey="hitRate"
                        position="top"
                        formatter={(val: unknown) => `${val}%`}
                        style={{ fill: axisColor, fontSize: 10, fontFamily: 'monospace', fontWeight: 700 }}
                      />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Clean Benchmark Comparison Table */}
              <div className="lg:col-span-5 overflow-x-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[var(--border-subtle)] text-[10px] uppercase font-bold text-[var(--text-muted)]">
                      <th className="py-2.5 px-3">Policy</th>
                      <th className="py-2.5 px-3 text-right">Hit Rate</th>
                      <th className="py-2.5 px-3 text-right">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)] font-mono">
                    {benchmarkChartData.map((row) => (
                      <tr
                        key={row.name}
                        className={
                          row.isHighlighted ? 'bg-[var(--accent-vermilion-subtle)] font-bold' : ''
                        }
                      >
                        <td className="py-2 px-3 flex items-center gap-2 text-[var(--text-primary)] font-sans font-semibold">
                          <span
                            className="w-2.5 h-2.5 rounded-xs flex-shrink-0"
                            style={{ backgroundColor: row.fill }}
                          />
                          <span>{row.name}</span>
                        </td>
                        <td
                          className={`py-2 px-3 text-right font-bold ${
                            row.isHighlighted
                              ? 'text-[var(--accent-vermilion-text)]'
                              : 'text-[var(--text-primary)]'
                          }`}
                        >
                          {row.hitRate.toFixed(2)}%
                        </td>
                        <td className="py-2 px-3 text-right text-[10px] text-[var(--text-muted)] font-sans">
                          {row.name.includes('ML') ? 'Learned AI' : 'Heuristic'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* D. ACTUAL AI DECISION SUMMARY & TRACE TABLE */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-[var(--accent-vermilion-text)]" />
            <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] tracking-wide uppercase">
              Actual Machine Learning Decisions Log
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[var(--text-muted)]">
            Recorded across {totalEvents} accesses
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Evictions Log */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] space-y-2">
            <span className="text-[11px] font-bold text-[var(--accent-vermilion-text)] uppercase tracking-wider flex items-center gap-1.5">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Evicted Cache Blocks ({totalEvictions})</span>
            </span>
            {totalEvictions > 0 ? (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {events
                  .filter((e) => !!e.evicted || !!e.selectedVictim)
                  .map((e, idx) => (
                    <div
                      key={`evict-log-${idx}`}
                      className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-surface-solid)] border border-[var(--border-subtle)] font-mono text-[11px]"
                    >
                      <span className="text-[var(--text-secondary)]">
                        Access #{e.index + 1} (Req: {e.request})
                      </span>
                      <span className="text-[var(--accent-vermilion-text)] font-bold">
                        Evicted [{e.evicted || e.selectedVictim}]
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-[var(--text-muted)] text-[11px]">
                No block evictions were required during this experiment.
              </p>
            )}
          </div>

          {/* Prefetches Log */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] space-y-2">
            <span className="text-[11px] font-bold text-[var(--accent-amber-text)] uppercase tracking-wider flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5" />
              <span>Markov Prefetches Triggered ({totalPrefetches})</span>
            </span>
            {totalPrefetches > 0 ? (
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {events
                  .filter((e) => e.prefetch?.status === 'PREFETCHED')
                  .map((e, idx) => (
                    <div
                      key={`pref-log-${idx}`}
                      className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-surface-solid)] border border-[var(--border-subtle)] font-mono text-[11px]"
                    >
                      <span className="text-[var(--text-secondary)]">Access #{e.index + 1}</span>
                      <span className="text-[var(--accent-amber-text)] font-bold">
                        Prefetched [{e.prefetch?.block}] (Conf:{' '}
                        {Math.round((e.prefetch?.confidence || 0) * 100)}%)
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-[var(--text-muted)] text-[11px]">
                {hasPrefetcher
                  ? 'No speculative prefetches met the ≥ 70% confidence threshold.'
                  : `Policy ${policy} operates without prefetch inference.`}
              </p>
            )}
          </div>
        </div>

        {/* Step-by-Step Results Ledger Table */}
        <div className="pt-2">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block mb-2">
            Experiment Access Event Ledger
          </span>
          <div className="overflow-x-auto max-h-64 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)]">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="sticky top-0 bg-[var(--bg-surface-solid)] border-b border-[var(--border-subtle)] text-[10px] uppercase font-bold text-[var(--text-muted)] z-10">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Request</th>
                  <th className="py-2.5 px-3">Outcome</th>
                  <th className="py-2.5 px-3">Cache Before</th>
                  <th className="py-2.5 px-3">Cache After</th>
                  <th className="py-2.5 px-3">Evicted</th>
                  <th className="py-2.5 px-3">Prefetch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)] font-mono text-[11px]">
                {events.map((ev) => {
                  const isHit = ev.result === 'HIT'
                  return (
                    <tr key={`ledger-row-${ev.index}`} className="hover:bg-[var(--bg-surface)]">
                      <td className="py-2 px-3 text-[var(--text-muted)]">{ev.index + 1}</td>
                      <td className="py-2 px-3 font-bold text-[var(--text-primary)]">{ev.request}</td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isHit
                              ? 'bg-[var(--accent-sage-subtle)] text-[var(--accent-sage-text)]'
                              : 'bg-[var(--accent-vermilion-subtle)] text-[var(--accent-vermilion-text)]'
                          }`}
                        >
                          {ev.result}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-[var(--text-secondary)]">
                        [{(ev.cacheBefore || []).join(', ') || 'Empty'}]
                      </td>
                      <td className="py-2 px-3 text-[var(--text-primary)]">
                        [{(ev.cacheAfter || []).join(', ')}]
                      </td>
                      <td className="py-2 px-3 text-[var(--accent-vermilion-text)] font-semibold">
                        {ev.evicted || ev.selectedVictim || '—'}
                      </td>
                      <td className="py-2 px-3 text-[var(--accent-amber-text)] font-semibold">
                        {ev.prefetch?.status === 'PREFETCHED'
                          ? `${ev.prefetch.block} (${Math.round((ev.prefetch.confidence || 0) * 100)}%)`
                          : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* E. EXPERIMENT CONCLUSION */}
      <div className="glass-card rounded-2xl p-5 sm:p-6 space-y-2">
        <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
          Experiment Conclusion
        </span>
        <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed font-medium">
          The simulation processed <strong>{traceLength} memory requests</strong> with a cache capacity of{' '}
          <strong>{cacheCapacity} slots</strong> under the{' '}
          <strong className="text-[var(--accent-vermilion-text)]">{policy}</strong> policy on workload pattern{' '}
          <strong>&quot;{workload}&quot;</strong>. The cache achieved a final hit rate of{' '}
          <strong className="text-[var(--accent-sage-text)]">{hitRateStr}</strong> ({totalHits} hits,{' '}
          {totalMisses} misses), with{' '}
          <strong className="text-[var(--accent-vermilion-text)]">
            {totalEvictions} eviction victim selections
          </strong>
          .
          {hasPrefetcher &&
            ` The Adaptive Markov Prefetcher issued ${totalPrefetches} speculative block loads, of which ${usefulPrefetches} were subsequently hit (${prefetchAccuracyStr} accuracy and ${prefetchCoverageStr} coverage).`}
        </p>
      </div>
    </div>
  )
}

export default memo(ResultsView)
