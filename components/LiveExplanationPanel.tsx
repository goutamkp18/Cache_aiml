'use client'

import React, { memo } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  Sparkles,
  BrainCircuit,
  Radio,
  CheckCircle2,
  XCircle,
  GraduationCap
} from 'lucide-react'
import type { SimulationEvent } from '@/simulation/simulationTypes'

interface LiveExplanationPanelProps {
  currentEvent: SimulationEvent | null
  currentStep: number
  totalSteps: number
  policy: string
  capacity: number
  explainMode: boolean
  onToggleExplainMode: () => void
}

function LiveExplanationPanel({
  currentEvent,
  currentStep,
  totalSteps,
  policy,
  capacity,
  explainMode,
  onToggleExplainMode,
}: LiveExplanationPanelProps) {
  const shouldReduceMotion = useReducedMotion()

  // Compact single-row standby strip — avoids unnecessary dead space before execution
  if (!currentEvent) {
    return (
      <div className="glass-card rounded-2xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[var(--brand-sage)] flex items-center justify-center text-[#F1EEE3] flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={1.8} />
          </div>
          <div className="min-w-0">
            <h3 className="text-[11px] font-bold text-[var(--text-primary)] tracking-[0.06em] uppercase">
              Live Execution Narrator
            </h3>
            <p className="text-xs text-[var(--text-secondary)] truncate">
              Run a simulation to view step-by-step lookup outcomes, Random Forest scoring, and Markov prefetching logic.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onToggleExplainMode}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer ui-interactive flex-shrink-0 ${
            explainMode
              ? 'bg-[var(--brand-sage)] text-[#F1EEE3]'
              : 'bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>{explainMode ? 'Explain Mode: ON' : 'Explain AI'}</span>
        </button>
      </div>
    )
  }

  const {
    request,
    result,
    cacheBefore = [],
    cacheAfter = [],
    predictions = {},
    selectedVictim,
    evicted,
    prefetch,
  } = currentEvent

  const isHit = result === 'HIT'
  const hasPrefetch = prefetch?.status === 'PREFETCHED' && !!prefetch.block
  const isMLPolicy = policy.includes('ML')
  const activeVictim = evicted || selectedVictim

  let phaseNumber = 1
  let phaseTitle = 'CPU Memory Request'
  if (isHit) {
    phaseNumber = 3
    phaseTitle = 'Cache Hit'
  } else if (activeVictim) {
    phaseNumber = 4
    phaseTitle = `AI Eviction [${activeVictim}]`
  } else if (hasPrefetch) {
    phaseNumber = 6
    phaseTitle = `Prefetching [${prefetch.block}]`
  } else {
    phaseNumber = 5
    phaseTitle = 'Cache Allocation'
  }

  let primaryExplanation = ''
  let aiExplanation = ''
  let prefetchExplanation = ''

  if (isHit) {
    const slotIdx = cacheBefore.indexOf(request)
    primaryExplanation = `Block ${request} is already present in cache ${slotIdx >= 0 ? `(Slot ${slotIdx})` : ''}. The CPU retrieved it immediately without accessing main memory.`
    aiExplanation = `Search through resident cache [${cacheBefore.join(', ')}] matched block "${request}". No eviction needed.`
  } else {
    if (activeVictim) {
      if (isMLPolicy) {
        primaryExplanation = `Block ${request} is not resident in cache (MISS), and all ${capacity} slots are full. The Random Forest model evaluated resident candidates and chose block ${activeVictim} for eviction due to its largest predicted future-use distance.`
        aiExplanation = `Candidate distance scores: ${Object.entries(predictions)
          .map(([k, v]) => `${k}=${v.toFixed(1)}`)
          .join(', ')}. Block ${activeVictim} had the highest score and was evicted.`
      } else {
        primaryExplanation = `Block ${request} is not resident (MISS), and cache is full. Block ${activeVictim} was selected for eviction according to the ${policy} policy.`
        aiExplanation = `Policy ${policy} selected block ${activeVictim} based on access history.`
      }
    } else {
      primaryExplanation = `Block ${request} is not resident (MISS). Cache had free capacity (${cacheBefore.length}/${capacity} slots used), so block ${request} was allocated without eviction.`
      aiExplanation = 'No eviction necessary. Free cache slot allocated.'
    }
  }

  if (hasPrefetch) {
    const conf = prefetch?.confidence != null ? `${Math.round(prefetch.confidence * 100)}%` : 'high'
    prefetchExplanation = `The Adaptive Markov Prefetcher observed context [${prefetch?.context?.join(', ')}] and predicted upcoming block "${prefetch?.block}" with ${conf} confidence (≥ 70% threshold).`
  } else if (
    prefetch?.status === 'THRESHOLD_NOT_MET' ||
    (prefetch?.confidence != null && prefetch.confidence < 0.7)
  ) {
    const conf = prefetch?.confidence != null ? `${Math.round(prefetch.confidence * 100)}%` : 'low'
    prefetchExplanation = `Markov model observed context [${prefetch?.context?.join(', ')}], but confidence was ${conf} (< 70% threshold). Speculative prefetching skipped to avoid cache pollution.`
  } else {
    prefetchExplanation =
      'No high-confidence Markov transition found for the current access pattern. Prefetching idle.'
  }

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-3.5">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between pb-2.5 border-b border-[var(--border-subtle)] gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--brand-sage)] flex items-center justify-center text-[#F1EEE3]">
            <Sparkles className="w-3.5 h-3.5" strokeWidth={1.8} />
          </div>
          <h3 className="text-[11px] font-bold text-[var(--text-primary)] tracking-[0.06em] uppercase flex items-center gap-2">
            <span>What Is Happening Right Now?</span>
            <span className="text-[11px] font-mono font-medium text-[var(--text-muted)] tabular-nums">
              ({currentStep + 1}/{totalSteps})
            </span>
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[var(--accent-sage-subtle)] text-[var(--accent-sage-text)] border border-[var(--accent-sage-border)]">
            Phase {phaseNumber}: {phaseTitle}
          </span>

          <button
            type="button"
            onClick={onToggleExplainMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer ui-interactive ${
              explainMode
                ? 'bg-[var(--brand-sage)] text-[#F1EEE3]'
                : 'bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
            }`}
            title="Toggle in-depth educational architectural explanations"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{explainMode ? 'Explain Mode: ON' : 'Explain AI'}</span>
          </button>
        </div>
      </div>

      {/* Primary Highlight Callout */}
      <motion.div
        key={`primary-exp-${currentStep}`}
        initial={shouldReduceMotion ? false : { opacity: 0, y: 3 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.16 }}
        className={`p-3.5 rounded-xl border flex items-start gap-3 ${
          isHit
            ? 'bg-[var(--accent-sage-subtle)] border-[var(--accent-sage-border)] text-[var(--text-primary)]'
            : 'bg-[var(--accent-vermilion-subtle)] border-[var(--accent-vermilion-border)] text-[var(--text-primary)]'
        }`}
      >
        <div className="mt-0.5 flex-shrink-0">
          {isHit ? (
            <CheckCircle2 className="w-4 h-4 text-[var(--accent-sage-text)]" />
          ) : (
            <XCircle className="w-4 h-4 text-[var(--accent-vermilion-text)]" />
          )}
        </div>
        <div className="space-y-1 min-w-0">
          <p className="text-xs sm:text-sm font-medium leading-relaxed">{primaryExplanation}</p>
          <p className="text-[11px] text-[var(--text-secondary)] font-mono truncate">
            Before: [{cacheBefore.join(', ') || 'Empty'}] &rarr; After: [
            {cacheAfter.join(', ')}]
          </p>
        </div>
      </motion.div>

      {/* Compact 7-Phase Execution Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5 text-center">
        <div className="p-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex flex-col items-center">
          <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase">1. Request</span>
          <span className="text-xs font-mono font-bold text-[var(--text-primary)] mt-0.5">
            [{request}]
          </span>
        </div>

        <div className="p-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex flex-col items-center">
          <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase">2. Lookup</span>
          <span className="text-xs font-mono font-bold text-[var(--text-secondary)] mt-0.5">
            0-{capacity - 1}
          </span>
        </div>

        <div
          className={`p-2 rounded-lg border flex flex-col items-center ${
            isHit
              ? 'bg-[var(--accent-sage-subtle)] border-[var(--accent-sage-border)] text-[var(--accent-sage-text)]'
              : 'bg-[var(--accent-vermilion-subtle)] border-[var(--accent-vermilion-border)] text-[var(--accent-vermilion-text)]'
          }`}
        >
          <span className="text-[9px] font-bold uppercase">3. Result</span>
          <span className="text-xs font-mono font-black mt-0.5">{result}</span>
        </div>

        <div className="p-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex flex-col items-center">
          <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase">4. Evict</span>
          <span className="text-xs font-mono font-bold mt-0.5">
            {activeVictim ? (
              <span className="text-[var(--accent-vermilion-text)]">{activeVictim}</span>
            ) : isHit ? (
              <span className="text-[var(--text-muted)]">—</span>
            ) : (
              <span className="text-[var(--accent-sage-text)]">Free</span>
            )}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex flex-col items-center">
          <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase">5. Slots</span>
          <span className="text-xs font-mono font-bold text-[var(--text-primary)] mt-0.5">
            {cacheAfter.length}/{capacity}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex flex-col items-center">
          <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase">6. Prefetch</span>
          <span className="text-xs font-mono font-bold mt-0.5">
            {hasPrefetch ? (
              <span className="text-[var(--accent-amber-text)]">+{prefetch?.block}</span>
            ) : (
              <span className="text-[var(--text-muted)]">Idle</span>
            )}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex flex-col items-center col-span-2 sm:col-span-1">
          <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase">7. Hit Score</span>
          <span className="text-xs font-mono font-bold text-[var(--accent-sage-text)] mt-0.5">
            {isHit ? '100%' : '0%'}
          </span>
        </div>
      </div>

      {/* Collapsible Educational Insights */}
      <AnimatePresence>
        {explainMode && (
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="pt-2.5 border-t border-[var(--border-subtle)] space-y-2 overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--accent-vermilion-text)] flex items-center gap-1.5">
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>Replacement Decision ({policy})</span>
                </span>
                <p className="text-[var(--text-secondary)] leading-relaxed">{aiExplanation}</p>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[var(--accent-amber-text)] flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5" />
                  <span>Markov Prefetching Logic</span>
                </span>
                <p className="text-[var(--text-secondary)] leading-relaxed">
                  {prefetchExplanation}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default memo(LiveExplanationPanel)
