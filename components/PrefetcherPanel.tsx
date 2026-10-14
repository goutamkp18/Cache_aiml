'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Radio, Zap, Sparkles, AlertCircle } from 'lucide-react'
import type { SimulationEvent } from '@/simulation/simulationTypes'

interface PrefetcherPanelProps {
  currentEvent?: SimulationEvent
  policy: string
}

export default function PrefetcherPanel({ currentEvent, policy }: PrefetcherPanelProps) {
  if (!currentEvent) {
    return (
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 sm:p-5 flex flex-col justify-center items-center text-center min-h-[190px]">
        <Radio className="w-8 h-8 text-[var(--text-muted)] mb-2" />
        <span className="text-xs font-semibold text-[var(--text-primary)]">Adaptive Prefetcher</span>
        <span className="text-[11px] text-[var(--text-muted)]">Awaiting simulation data</span>
      </div>
    )
  }

  const { prefetch } = currentEvent
  const isPrefetched = prefetch?.status === 'PREFETCHED' && !!prefetch.block
  const hasPrefetchPolicy = policy === 'ML + Prefetch'
  const confidencePercent =
    prefetch?.confidence != null ? Math.round(prefetch.confidence * 100) : null

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 sm:p-5 shadow-sm transition-colors relative overflow-hidden">
      {/* Dynamic Animated Cyan Energy Ray on actual Prefetch */}
      {isPrefetched && (
        <motion.div
          key={`prefetch-anim-${currentEvent.index}`}
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: '100%', opacity: [0, 0.9, 0] }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--accent-cyan)] to-transparent pointer-events-none"
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-[var(--accent-cyan)]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            Adaptive Prefetcher
          </h3>
        </div>

        <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-[var(--accent-cyan-subtle)] text-[var(--accent-cyan)] border border-[var(--accent-cyan-border)]">
          {hasPrefetchPolicy ? 'Markov Predictor' : 'Inactive'}
        </span>
      </div>

      {/* Main Prefetch State Indicators */}
      <div className="grid grid-cols-2 gap-3 my-3">
        {/* Next Block */}
        <div className="p-2.5 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
            Predicted Next Block
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-2xl font-bold font-mono ${
                isPrefetched ? 'text-[var(--accent-cyan)]' : 'text-[var(--text-muted)]'
              }`}
            >
              {prefetch?.block || '—'}
            </span>
            {isPrefetched && (
              <span className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] animate-ping-subtle" />
            )}
          </div>
        </div>

        {/* Confidence Gauge */}
        <div className="p-2.5 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
            Model Confidence
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-2xl font-bold font-mono ${
                confidencePercent != null
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              {confidencePercent != null ? `${confidencePercent}%` : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* Prefetch Status Pill */}
      <div className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-xs mb-3">
        <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
          Action Status
        </span>
        <span
          className={`font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
            isPrefetched
              ? 'bg-[var(--accent-cyan-subtle)] text-[var(--accent-cyan)] border border-[var(--accent-cyan-border)]'
              : 'bg-transparent text-[var(--text-muted)]'
          }`}
        >
          {prefetch?.status || 'NO PREFETCH'}
        </span>
      </div>

      {/* Context History & Model Note */}
      <div className="pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs text-[var(--text-secondary)]">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
            Context:
          </span>
          <span className="font-mono text-[11px] font-semibold text-[var(--text-primary)]">
            {prefetch?.context && prefetch.context.length > 0
              ? `[ ${prefetch.context.join(', ')} ]`
              : '[ — ]'}
          </span>
        </div>

        <span className="text-[10px] text-[var(--text-muted)]">
          Threshold &ge; 70%
        </span>
      </div>
    </div>
  )
}
