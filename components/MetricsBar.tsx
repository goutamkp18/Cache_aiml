'use client'

import React, { useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Activity,
  CheckCircle,
  XCircle,
  Radio,
  Zap,
  Timer
} from 'lucide-react'
import type { SimulationMetrics, SimulationEvent } from '@/simulation/simulationTypes'

interface MetricsBarProps {
  metrics?: SimulationMetrics
  events?: SimulationEvent[]
}

export default function MetricsBar({ metrics, events = [] }: MetricsBarProps) {
  const [showSecondary, setShowSecondary] = useState(false)

  if (!metrics) {
    return (
      <div className="glass-card rounded-2xl p-4 sm:p-5 mt-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)] mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[var(--text-muted)]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Simulation Telemetry &bull; Performance Counters
            </h4>
          </div>
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[var(--bg-surface-secondary)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
            NO EXPERIMENT RUN
          </span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {['Hit Rate', 'Miss Rate', 'Prefetch Accuracy', 'Prefetch Coverage'].map((label) => (
            <div
              key={label}
              className="p-3 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]"
            >
              <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] block">
                {label}
              </span>
              <span className="text-xl sm:text-2xl font-mono font-bold text-[var(--text-muted)] mt-1 block">
                --%
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">Awaiting run</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const evictionCount = metrics.evictions ?? events.filter((e) => !!e.evicted).length
  const uselessPrefetches = Math.max(0, metrics.totalPrefetches - metrics.usefulPrefetches)
  const totalAccesses = metrics.totalAccesses ?? metrics.hits + metrics.misses

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 mt-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Hit Rate</span>
            <div className="w-6 h-6 rounded-md bg-[var(--accent-sage-subtle)] border border-[var(--accent-sage-border)] flex items-center justify-center text-[var(--accent-sage-text)]">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--accent-sage-text)] mt-1.5 block tracking-tight">
            {metrics.hitRate}
          </span>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            <strong className="text-[var(--text-primary)] font-mono">{metrics.hits}</strong> hits out of {totalAccesses} accesses
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Miss Rate</span>
            <div className="w-6 h-6 rounded-md bg-[var(--accent-vermilion-subtle)] border border-[var(--accent-vermilion-border)] flex items-center justify-center text-[var(--accent-vermilion-text)]">
              <XCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--accent-vermilion-text)] mt-1.5 block tracking-tight">
            {metrics.missRate}
          </span>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            <strong className="text-[var(--text-primary)] font-mono">{metrics.misses}</strong> misses requiring fetch
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Prefetch Accuracy</span>
            <div className="w-6 h-6 rounded-md bg-[var(--accent-amber-subtle)] border border-[var(--accent-amber-border)] flex items-center justify-center text-[var(--accent-amber-text)]">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--accent-amber-text)] mt-1.5 block tracking-tight">
            {metrics.prefetchAccuracy}
          </span>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            <strong className="text-[var(--text-primary)] font-mono">{metrics.usefulPrefetches}</strong> useful / {metrics.totalPrefetches} issued
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            <span>Prefetch Coverage</span>
            <div className="w-6 h-6 rounded-md bg-[var(--accent-sage-subtle)] border border-[var(--accent-sage-border)] flex items-center justify-center text-[var(--accent-sage-text)]">
              <Radio className="w-3.5 h-3.5" />
            </div>
          </div>
          <span className="text-2xl sm:text-3xl font-extrabold font-mono text-[var(--text-primary)] mt-1.5 block tracking-tight">
            {metrics.prefetchCoverage}
          </span>
          <p className="text-[11px] text-[var(--text-muted)] mt-1">
            Share of potential misses avoided
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowSecondary(!showSecondary)}
            className="text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center gap-1.5 transition-colors cursor-pointer px-2.5 py-1 rounded-md bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]"
          >
            <span>{showSecondary ? 'Collapse Telemetry Counters' : 'Research Telemetry & Latencies'}</span>
            {showSecondary ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 text-[var(--accent-vermilion-text)]" />
            )}
          </button>

          {metrics.executionTimeMs != null && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[var(--text-secondary)]">
              <Timer className="w-3 h-3 text-[var(--accent-sage-text)]" />
              Exec Time: <strong className="text-[var(--text-primary)]">{metrics.executionTimeMs} ms</strong>
            </span>
          )}

          {metrics.avgAccessTimeUs != null && (
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-mono text-[var(--text-secondary)]">
              <Activity className="w-3 h-3 text-[var(--accent-vermilion-text)]" />
              Latency: <strong className="text-[var(--text-primary)]">{metrics.avgAccessTimeUs} &mu;s/access</strong>
            </span>
          )}
        </div>

        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)]">
          FastAPI Benchmark Engine
        </span>
      </div>

      {showSecondary && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 mt-3 pt-3 border-t border-[var(--border-subtle)]">
          <div className="p-2.5 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-center">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">Total Hits</span>
            <span className="text-lg font-bold font-mono text-[var(--accent-sage-text)] mt-0.5 block">{metrics.hits}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-center">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">Total Misses</span>
            <span className="text-lg font-bold font-mono text-[var(--accent-vermilion-text)] mt-0.5 block">{metrics.misses}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-center">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">Evictions</span>
            <span className="text-lg font-bold font-mono text-[var(--accent-vermilion-text)] mt-0.5 block">{evictionCount}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-center">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">Prefetches Issued</span>
            <span className="text-lg font-bold font-mono text-[var(--accent-amber-text)] mt-0.5 block">{metrics.totalPrefetches}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-center">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">Useful Prefetches</span>
            <span className="text-lg font-bold font-mono text-[var(--accent-sage-text)] mt-0.5 block">{metrics.usefulPrefetches}</span>
          </div>
          <div className="p-2.5 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-center">
            <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">Useless Prefetches</span>
            <span className="text-lg font-bold font-mono text-[var(--text-muted)] mt-0.5 block">{uselessPrefetches}</span>
          </div>
        </div>
      )}
    </div>
  )
}
