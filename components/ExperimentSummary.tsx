'use client'

import React from 'react'
import { Sliders, Cpu, Database, Activity, FileText } from 'lucide-react'

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
    <div className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 shadow-sm transition-colors flex flex-wrap items-center justify-between gap-2.5 text-xs">
      <div className="flex items-center gap-2">
        <Sliders className="w-3.5 h-3.5 text-[var(--accent-crimson)] flex-shrink-0" />
        <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
          Experiment Configuration:
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Trace Mode */}
        <span className="px-2.5 py-0.5 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] font-medium text-[var(--text-secondary)]">
          Mode: <strong className="text-[var(--text-primary)]">{traceMode === 'auto' ? 'Auto Generate' : 'Manual Sequence'}</strong>
        </span>

        {/* Workload */}
        <span className="px-2.5 py-0.5 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] font-medium text-[var(--text-secondary)]">
          Workload: <strong className={traceMode === 'manual' ? 'text-[var(--accent-cyan)] font-bold' : 'text-[var(--text-primary)]'}>{displayWorkload}</strong>
        </span>

        {/* Requests Count */}
        <span className="px-2.5 py-0.5 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] font-medium text-[var(--text-secondary)]">
          Requests: <strong className="text-[var(--text-primary)] font-mono">{requestCount}</strong>
        </span>

        {/* Cache Capacity */}
        <span className="px-2.5 py-0.5 rounded-full bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] font-medium text-[var(--text-secondary)]">
          Capacity: <strong className="text-[var(--text-primary)] font-mono">{cacheCapacity} blocks</strong>
        </span>

        {/* Policy */}
        <span className="px-2.5 py-0.5 rounded-full bg-[var(--accent-crimson-subtle)] border border-[var(--accent-crimson-border)] font-medium text-[var(--accent-crimson)]">
          Policy: <strong className="font-bold">{policy}</strong>
        </span>
      </div>
    </div>
  )
}
