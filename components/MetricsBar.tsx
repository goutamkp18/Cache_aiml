'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Activity, CheckCircle, XCircle, Radio, Zap } from 'lucide-react'
import type { SimulationMetrics, SimulationEvent } from '@/simulation/simulationTypes'

interface MetricsBarProps {
  metrics?: SimulationMetrics
  events?: SimulationEvent[]
}

export default function MetricsBar({ metrics, events = [] }: MetricsBarProps) {
  const [showSecondary, setShowSecondary] = useState(false)

  if (!metrics) {
    return null
  }

  // Derive accurate count of evictions from actual event history
  const evictionCount = events.filter((e) => !!e.evicted).length
  const uselessPrefetches = Math.max(0, metrics.totalPrefetches - metrics.usefulPrefetches)

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm transition-colors mt-4">
      {/* Primary Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Hit Rate */}
        <div className="p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Hit Rate</span>
            <CheckCircle className="w-3.5 h-3.5 text-[var(--accent-green)]" />
          </div>
          <span className="text-xl sm:text-2xl font-bold font-mono text-[var(--accent-green)] mt-1 block">
            {metrics.hitRate}
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">
            {metrics.hits} hits recorded
          </span>
        </div>

        {/* Miss Rate */}
        <div className="p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Miss Rate</span>
            <XCircle className="w-3.5 h-3.5 text-[var(--accent-crimson)]" />
          </div>
          <span className="text-xl sm:text-2xl font-bold font-mono text-[var(--accent-crimson)] mt-1 block">
            {metrics.missRate}
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">
            {metrics.misses} misses recorded
          </span>
        </div>

        {/* Prefetch Accuracy */}
        <div className="p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Prefetch Accuracy</span>
            <Zap className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
          </div>
          <span className="text-xl sm:text-2xl font-bold font-mono text-[var(--accent-cyan)] mt-1 block">
            {metrics.prefetchAccuracy}
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">
            {metrics.usefulPrefetches} useful / {metrics.totalPrefetches} total
          </span>
        </div>

        {/* Prefetch Coverage */}
        <div className="p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Prefetch Coverage</span>
            <Radio className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <span className="text-xl sm:text-2xl font-bold font-mono text-blue-500 mt-1 block">
            {metrics.prefetchCoverage}
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">
            Miss reduction share
          </span>
        </div>
      </div>

      {/* Secondary Metrics Drawer Toggle */}
      <div className="mt-3 pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between">
        <button
          onClick={() => setShowSecondary(!showSecondary)}
          className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors"
        >
          <span>{showSecondary ? 'Hide Detailed Counters' : 'View Detailed Counters'}</span>
          {showSecondary ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        <span className="text-[11px] text-[var(--text-muted)]">
          FastAPI Real-Time Telemetry
        </span>
      </div>

      {/* Collapsible Secondary Counters Grid */}
      {showSecondary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mt-3 pt-3 border-t border-[var(--border-subtle)]">
          <div className="p-2 rounded bg-[var(--bg-surface-elevated)] text-center">
            <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">Hits</span>
            <span className="text-base font-bold font-mono text-[var(--text-primary)]">{metrics.hits}</span>
          </div>

          <div className="p-2 rounded bg-[var(--bg-surface-elevated)] text-center">
            <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">Misses</span>
            <span className="text-base font-bold font-mono text-[var(--text-primary)]">{metrics.misses}</span>
          </div>

          <div className="p-2 rounded bg-[var(--bg-surface-elevated)] text-center">
            <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">Evictions</span>
            <span className="text-base font-bold font-mono text-[var(--accent-crimson)]">{evictionCount}</span>
          </div>

          <div className="p-2 rounded bg-[var(--bg-surface-elevated)] text-center">
            <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">Total Prefetches</span>
            <span className="text-base font-bold font-mono text-[var(--text-primary)]">{metrics.totalPrefetches}</span>
          </div>

          <div className="p-2 rounded bg-[var(--bg-surface-elevated)] text-center">
            <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">Useful</span>
            <span className="text-base font-bold font-mono text-[var(--accent-green)]">{metrics.usefulPrefetches}</span>
          </div>

          <div className="p-2 rounded bg-[var(--bg-surface-elevated)] text-center">
            <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">Useless</span>
            <span className="text-base font-bold font-mono text-[var(--text-muted)]">{uselessPrefetches}</span>
          </div>
        </div>
      )}
    </div>
  )
}
