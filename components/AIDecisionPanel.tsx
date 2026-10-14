'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BrainCircuit, Cpu, Info, CheckCircle2, AlertTriangle } from 'lucide-react'
import type { SimulationEvent } from '@/simulation/simulationTypes'

interface AIDecisionPanelProps {
  currentEvent?: SimulationEvent
  policy: string
}

export default function AIDecisionPanel({ currentEvent, policy }: AIDecisionPanelProps) {
  if (!currentEvent) {
    return (
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 sm:p-5 flex flex-col justify-center items-center text-center min-h-[220px]">
        <BrainCircuit className="w-8 h-8 text-[var(--text-muted)] mb-2" />
        <span className="text-xs font-semibold text-[var(--text-primary)]">AI Decision Engine</span>
        <span className="text-[11px] text-[var(--text-muted)]">Awaiting simulation data</span>
      </div>
    )
  }

  const { request, result, predictions, selectedVictim, evicted } = currentEvent
  const isHit = result === 'HIT'
  const isMLPolicy = policy.includes('ML')
  const predictionEntries = Object.entries(predictions || {})

  // Find max predicted value for scaling bars
  const maxVal = predictionEntries.reduce((max, [, val]) => Math.max(max, val), 0) || 1

  // Dynamic explanation according to backend decision
  let decisionReason = ''
  if (isHit) {
    decisionReason = 'The requested block is already present in the cache.'
  } else if (selectedVictim) {
    if (isMLPolicy) {
      decisionReason = `Block ${selectedVictim} has the largest predicted future-use distance among the current cache candidates.`
    } else if (policy === 'LRU') {
      decisionReason = `Block ${selectedVictim} was selected as the least recently accessed item.`
    } else if (policy === 'FIFO') {
      decisionReason = `Block ${selectedVictim} was selected as the earliest inserted item.`
    } else {
      decisionReason = `Block ${selectedVictim} was selected for eviction by policy baseline.`
    }
  } else {
    decisionReason = 'Cache has available capacity. No block eviction was required.'
  }

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 sm:p-5 shadow-sm transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-[var(--accent-crimson)]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            AI Decision Engine
          </h3>
        </div>

        <span
          className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase ${
            isMLPolicy
              ? 'bg-[var(--accent-cyan-subtle)] text-[var(--accent-cyan)] border border-[var(--accent-cyan-border)]'
              : 'bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
          }`}
        >
          {isMLPolicy ? 'Trained Random Forest' : `${policy} Policy`}
        </span>
      </div>

      {/* Request & Result Summary Row */}
      <div className="grid grid-cols-2 gap-2 my-3">
        <div className="p-2 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
            Requested Block
          </span>
          <span className="text-base font-bold text-[var(--text-primary)]">
            {request}
          </span>
        </div>

        <div className="p-2 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
            Lookup Outcome
          </span>
          <span
            className={`text-base font-bold ${
              isHit ? 'text-[var(--accent-green)]' : 'text-[var(--accent-crimson)]'
            }`}
          >
            {result}
          </span>
        </div>
      </div>

      {/* Model Predictions Section */}
      <div className="my-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            Predicted Next-Use Distance
          </span>
          {isMLPolicy && (
            <span className="text-[9px] text-[var(--text-muted)]">
              Higher = Evict First (Belady MIN)
            </span>
          )}
        </div>

        {predictionEntries.length > 0 ? (
          <div className="space-y-1.5">
            {predictionEntries.map(([blockKey, score]) => {
              const isCandidateVictim = blockKey === selectedVictim || blockKey === evicted
              const barPercent = Math.min(100, Math.max(10, (score / maxVal) * 100))

              return (
                <div key={blockKey} className="flex items-center gap-2 text-xs">
                  <span
                    className={`w-5 font-bold font-mono ${
                      isCandidateVictim ? 'text-[var(--accent-crimson)]' : 'text-[var(--text-primary)]'
                    }`}
                  >
                    {blockKey}
                  </span>

                  {/* Horizontal Bar */}
                  <div className="flex-1 h-2 rounded bg-[var(--bg-surface-elevated)] overflow-hidden border border-[var(--border-subtle)]">
                    <motion.div
                      className={`h-full rounded ${
                        isCandidateVictim
                          ? 'bg-[var(--accent-crimson)]'
                          : 'bg-[var(--accent-cyan)] opacity-70'
                      }`}
                      initial={false}
                      animate={{ width: `${barPercent}%` }}
                      transition={{ duration: 0.25 }}
                    />
                  </div>

                  <span
                    className={`w-10 text-right font-mono text-[11px] ${
                      isCandidateVictim
                        ? 'font-bold text-[var(--accent-crimson)]'
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
          <div className="p-2.5 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-center text-[11px] text-[var(--text-muted)]">
            {isHit
              ? 'Cache hit. Prediction inference not needed.'
              : isMLPolicy
              ? 'Evaluating cache state...'
              : `${policy} uses deterministic rules without machine learning regression scores.`}
          </div>
        )}
      </div>

      {/* Selected Victim & Reason Section */}
      <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
            Selected Victim:
          </span>
          <span
            className={`font-bold font-mono text-sm ${
              selectedVictim ? 'text-[var(--accent-crimson)]' : 'text-[var(--text-muted)]'
            }`}
          >
            {selectedVictim || 'None'}
          </span>
        </div>

        <div className="mt-1.5 p-2 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
          <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] block mb-0.5">
            Decision Reason:
          </span>
          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
            {decisionReason}
          </p>
        </div>
      </div>
    </div>
  )
}
