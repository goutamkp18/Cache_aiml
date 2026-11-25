'use client'

import React from 'react'
import { Sliders } from 'lucide-react'

interface ExperimentSummaryProps {
  traceMode: 'auto' | 'manual'
  workload: string
  requestCount: number
  cacheCapacity: number
  policy: string
}

export default function ExperimentSummary({
  traceMode,
  workload,
  requestCount,
  cacheCapacity,
  policy,
}: ExperimentSummaryProps) {
  const displayWorkload = traceMode === 'manual' ? 'Custom Trace' : workload

  return (
    <div className="w-full glass-card rounded-2xl px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 text-xs">
      <div className="flex items-center gap-2">
        <Sliders className="w-3.5 h-3.5 text-[var(--accent-vermilion-text)] flex-shrink-0" />
        <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
          Experiment Configuration:
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="px-2.5 py-0.5 rounded-full bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] font-medium text-[var(--text-secondary)]">
          Mode: <strong className="text-[var(--text-primary)]">{traceMode === 'auto' ? 'Auto Generate' : 'Manual Sequence'}</strong>
        </span>

        <span className="px-2.5 py-0.5 rounded-full bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] font-medium text-[var(--text-secondary)]">
          Workload: <strong className="text-[var(--text-primary)]">{displayWorkload}</strong>
        </span>

        <span className="px-2.5 py-0.5 rounded-full bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] font-medium text-[var(--text-secondary)]">
          Requests: <strong className="text-[var(--text-primary)] font-mono">{requestCount}</strong>
        </span>

        <span className="px-2.5 py-0.5 rounded-full bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] font-medium text-[var(--text-secondary)]">
          Capacity: <strong className="text-[var(--text-primary)] font-mono">{cacheCapacity} blocks</strong>
        </span>

        <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent-vermilion-subtle)] border border-[var(--accent-vermilion-border)] font-medium text-[var(--accent-vermilion-text)]">
          Policy: <strong className="font-bold">{policy}</strong>
        </span>
      </div>
    </div>
  )
}
