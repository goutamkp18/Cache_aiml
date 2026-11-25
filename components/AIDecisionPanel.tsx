'use client'

import React, { memo } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { BrainCircuit, Info } from 'lucide-react'
import type { SimulationEvent } from '@/simulation/simulationTypes'

interface AIDecisionPanelProps {
  currentEvent?: SimulationEvent
  policy: string
  explainMode?: boolean
}

function AIDecisionPanel({
  currentEvent,
  policy,
  explainMode = false,
}: AIDecisionPanelProps) {
  const shouldReduceMotion = useReducedMotion()

  if (!currentEvent) {
    return (
      <div className="glass-card rounded-2xl p-5 flex flex-col justify-center items-center text-center min-h-[168px] space-y-2">
        <div className="w-9 h-9 rounded-xl bg-[var(--accent-vermilion-subtle)] border border-[var(--accent-vermilion-border)] flex items-center justify-center text-[var(--accent-vermilion-text)]">
          <BrainCircuit className="w-4.5 h-4.5" strokeWidth={1.8} />
        </div>
        <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-[0.06em]">
          AI Decision Engine &bull; Standby
        </h4>
        <span className="text-[11px] text-[var(--text-secondary)] max-w-xs leading-relaxed">
          Run a simulation to inspect Random Forest candidate distance predictions and victim selection.
        </span>
      </div>
    )
  }

  const { request, result, predictions, selectedVictim, evicted } = currentEvent
  const isHit = result === 'HIT'
  const isMLPolicy = policy.includes('ML')
  const predictionEntries = Object.entries(predictions || {})
  const maxVal = predictionEntries.reduce((max, [, val]) => Math.max(max, val), 0) || 1
  const activeVictim = selectedVictim || evicted

  let decisionReason = ''
  if (isHit) {
    decisionReason = 'The requested block is already resident in cache. No eviction necessary.'
  } else if (selectedVictim) {
    if (isMLPolicy) {
      decisionReason = `Block ${selectedVictim} has the largest predicted future-use distance among the current cache candidates.`
    } else if (policy === 'LRU') {
      decisionReason = `Block ${selectedVictim} was selected as the least recently accessed item.`
    } else if (policy === 'FIFO') {
      decisionReason = `Block ${selectedVictim} was selected as the earliest inserted item.`
    } else {
      decisionReason = `Block ${selectedVictim} was selected for eviction by baseline policy.`
    }
  } else {
    decisionReason = 'Cache has available capacity. No block eviction was required.'
  }

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-3.5">
      <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-subtle)] gap-2">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-[var(--accent-vermilion-text)]" strokeWidth={1.85} />
          <h3 className="text-[11px] font-bold text-[var(--text-primary)] tracking-[0.06em] uppercase">
            AI Decision Engine
          </h3>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[var(--accent-sage-subtle)] text-[var(--accent-sage-text)] border border-[var(--accent-sage-border)]">
          {isMLPolicy ? 'Trained Random Forest' : `${policy} Policy`}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-2.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block mb-1">
            Requested Block
          </span>
          <span className="text-xl font-black font-mono text-[var(--text-primary)]">
            {request}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block mb-1">
            Lookup Outcome
          </span>
          <div>
            <span
              className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold font-mono tracking-wider ${
                isHit
                  ? 'bg-[var(--accent-sage-subtle)] text-[var(--accent-sage-text)] border border-[var(--accent-sage-border)]'
                  : 'bg-[var(--accent-vermilion-subtle)] text-[var(--accent-vermilion-text)] border border-[var(--accent-vermilion-border)]'
              }`}
            >
              {result}
            </span>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-[var(--text-secondary)]">
            Predicted Next-Use Distance (higher = evict first)
          </span>
        </div>

        {predictionEntries.length > 0 ? (
          <div className="space-y-2">
            {predictionEntries.map(([blockKey, score]) => {
              const isCandidateVictim = blockKey === activeVictim
              const barPercent = Math.min(100, Math.max(12, (score / maxVal) * 100))

              return (
                <div key={blockKey} className="flex items-center gap-2.5 text-xs">
                  <span
                    className={`w-6 font-mono font-bold text-center ${
                      isCandidateVictim
                        ? 'text-[var(--accent-vermilion-text)]'
                        : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {blockKey}
                  </span>

                  <div className="flex-1 h-2.5 rounded-full bg-[var(--bg-inset)] overflow-hidden border border-[var(--border-subtle)]">
                    <motion.div
                      className={`h-full rounded-full ${
                        isCandidateVictim
                          ? 'bg-[var(--accent-vermilion)]'
                          : 'bg-[var(--brand-sage)] dark:bg-[var(--accent-sage-hit)]'
                      }`}
                      initial={false}
                      animate={{ width: `${barPercent}%` }}
                      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2 }}
                    />
                  </div>

                  <span
                    className={`w-10 text-right font-mono text-[11px] tabular-nums ${
                      isCandidateVictim
                        ? 'font-bold text-[var(--accent-vermilion-text)]'
                        : 'text-[var(--text-secondary)]'
                    }`}
                  >
                    {score.toFixed(1)}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-center text-[11px] text-[var(--text-muted)]">
            {isHit
              ? 'Cache hit. Prediction inference not required.'
              : isMLPolicy
              ? 'Evaluating cache state...'
              : `${policy} policy uses deterministic heuristics without regression inference.`}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] font-bold text-[var(--text-secondary)]">
          Selected Victim
        </span>
        <div>
          {activeVictim ? (
            <span className="inline-flex items-center justify-center min-w-7 h-6 px-2 rounded-full bg-[var(--accent-vermilion)] text-white font-mono font-bold text-xs">
              {activeVictim}
            </span>
          ) : (
            <span className="text-xs font-mono text-[var(--text-muted)]">None</span>
          )}
        </div>
      </div>

      <div className="pt-2 border-t border-[var(--border-subtle)]">
        <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block mb-1">
          Decision Reason
        </span>
        <div className="p-2.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] flex items-start gap-2 text-[var(--text-secondary)] text-[11px]">
          <Info className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0 mt-0.5" />
          <p className="leading-snug">{decisionReason}</p>
        </div>
      </div>

      {explainMode && (
        <div className="p-2.5 rounded-xl bg-[var(--accent-sage-subtle)] border border-[var(--accent-sage-border)] text-[11px] text-[var(--text-secondary)] space-y-1">
          <span className="font-bold uppercase tracking-wider text-[10px] text-[var(--accent-sage-text)] block">
            Belady MIN Optimal Rule
          </span>
          <p className="leading-snug">
            Belady&apos;s algorithm proves that evicting the block that will not be accessed for the longest time yields the lowest miss rate. The Random Forest approximates this future reuse distance dynamically.
          </p>
        </div>
      )}
    </div>
  )
}

export default memo(AIDecisionPanel)
