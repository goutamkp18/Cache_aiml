'use client'

import React, { memo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Radio } from 'lucide-react'
import type { SimulationEvent } from '@/simulation/simulationTypes'

interface PrefetcherPanelProps {
  currentEvent?: SimulationEvent
  policy: string
  explainMode?: boolean
}

function PrefetcherPanel({
  currentEvent,
  policy,
  explainMode = false,
}: PrefetcherPanelProps) {
  const shouldReduceMotion = useReducedMotion()

  if (!currentEvent) {
    return (
      <div className="glass-card rounded-2xl p-5 flex flex-col justify-center items-center text-center min-h-[136px] space-y-2">
        <div className="w-9 h-9 rounded-xl bg-[var(--accent-amber-subtle)] border border-[var(--accent-amber-border)] flex items-center justify-center text-[var(--accent-amber-text)]">
          <Radio className="w-4.5 h-4.5" strokeWidth={1.8} />
        </div>
        <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-[0.06em]">
          Adaptive Prefetcher &bull; Standby
        </h4>
        <span className="text-[11px] text-[var(--text-secondary)] max-w-xs leading-relaxed">
          Run a simulation with ML + Prefetch to observe Markov context and speculative block loads.
        </span>
      </div>
    )
  }

  const { prefetch } = currentEvent
  const isPrefetched = prefetch?.status === 'PREFETCHED' && !!prefetch.block
  const hasPrefetchPolicy = policy === 'ML + Prefetch'
  const confidencePercent =
    prefetch?.confidence != null ? Math.round(prefetch.confidence * 100) : null

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-3.5 relative overflow-hidden">
      {isPrefetched && !shouldReduceMotion && (
        <motion.div
          key={`prefetch-anim-${currentEvent.index}`}
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: '100%', opacity: [0, 0.85, 0] }}
          transition={{ duration: 0.85, ease: 'easeOut' }}
          className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent-amber)] to-transparent pointer-events-none"
        />
      )}

      <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-subtle)] gap-2">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-[var(--accent-amber-text)]" strokeWidth={1.85} />
          <h3 className="text-[11px] font-bold text-[var(--text-primary)] tracking-[0.06em] uppercase">
            Adaptive Prefetcher
          </h3>
        </div>

        <span
          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${
            hasPrefetchPolicy
              ? 'bg-[var(--accent-amber-subtle)] text-[var(--accent-amber-text)] border-[var(--accent-amber-border)]'
              : 'bg-[var(--bg-surface-secondary)] text-[var(--text-muted)] border-[var(--border-subtle)]'
          }`}
        >
          {hasPrefetchPolicy ? 'Markov Predictor' : 'Inactive'}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="p-2.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex flex-col justify-between items-center text-center">
          <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] block mb-1">
            Predicted Next
          </span>
          <span
            className={`text-lg font-mono font-bold ${
              isPrefetched ? 'text-[var(--accent-amber-text)]' : 'text-[var(--text-muted)]'
            }`}
          >
            {prefetch?.block || '—'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex flex-col justify-between items-center text-center">
          <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] block mb-1">
            Confidence
          </span>
          <span
            className={`text-lg font-mono font-bold tabular-nums ${
              confidencePercent != null ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
            }`}
          >
            {confidencePercent != null ? `${confidencePercent}%` : '—'}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex flex-col justify-between items-center text-center">
          <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] block mb-1">
            Action Status
          </span>
          <span
            className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase border ${
              isPrefetched
                ? 'bg-[var(--accent-amber-subtle)] text-[var(--accent-amber-text)] border-[var(--accent-amber-border)]'
                : 'bg-[var(--bg-surface-solid)] text-[var(--text-muted)] border-[var(--border-subtle)]'
            }`}
          >
            {isPrefetched ? 'Prefetched' : 'No Prefetch'}
          </span>
        </div>
      </div>

      <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-[var(--text-muted)]">Context:</span>
          <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
            {prefetch?.context && prefetch.context.length > 0
              ? `[ ${prefetch.context.join(' , ')} ]`
              : '[ — ]'}
          </span>
        </div>

        <span className="text-[11px] font-mono text-[var(--text-muted)] tabular-nums">
          Threshold &ge; 70%
        </span>
      </div>

      {explainMode && (
        <div className="p-2.5 rounded-xl bg-[var(--accent-amber-subtle)] border border-[var(--accent-amber-border)] text-[11px] text-[var(--text-secondary)] space-y-1">
          <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--accent-amber-text)] block">
            Adaptive Markov Speculation
          </span>
          <p className="leading-snug">
            Speculative prefetching loads predicted memory blocks ahead of CPU requests. High confidence (&ge; 70%) prevents cache thrashing by fetching only strong transition candidates.
          </p>
        </div>
      )}
    </div>
  )
}

export default memo(PrefetcherPanel)
