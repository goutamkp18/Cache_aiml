'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BrainCircuit, Info } from 'lucide-react'
import type { SimulationEvent } from '@/simulation/simulationTypes'

interface AIDecisionPanelProps {
  currentEvent?: SimulationEvent
  policy: string
  explainMode?: boolean
}

export default function AIDecisionPanel({ currentEvent, policy, explainMode = false }: AIDecisionPanelProps) {
  if (!currentEvent) {
    return (
      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6 flex flex-col justify-center items-center text-center min-h-[220px] space-y-3 shadow-xl">
        <BrainCircuit className="w-8 h-8 text-[#FF454F] opacity-70" />
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#94a3b8]">
          AI HARDWARE STANDBY
        </span>
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">AI Decision Engine</h4>
        <span className="text-[11px] text-[#94a3b8] max-w-xs">
          Run a simulation to observe real-time candidate distance predictions and victim selection.
        </span>
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

  const activeVictim = selectedVictim || evicted

  return (
    <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-4 sm:p-5 shadow-xl transition-colors space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]/80">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-4 h-4 text-[#FF454F]" />
          <h3 className="text-xs font-bold text-white tracking-wide">
            AI Decision Engine
          </h3>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#12CBEA]/10 text-[#12CBEA] border border-[#12CBEA]/30">
          {isMLPolicy ? 'Trained Random Forest' : `${policy} Policy`}
        </span>
      </div>

      {/* Requested Block & Lookup Outcome Boxes */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-2.5 rounded-xl bg-[#0c121e] border border-[#1e293b] flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-[#94a3b8] block mb-1">
            Requested Block
          </span>
          <span className="text-xl font-black font-mono text-white">
            {request}
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#0c121e] border border-[#1e293b] flex flex-col justify-between">
          <span className="text-[10px] uppercase font-bold text-[#94a3b8] block mb-1">
            Lookup Outcome
          </span>
          <div>
            <span
              className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold font-mono tracking-wider ${
                isHit
                  ? 'bg-[#22c55e]/15 text-[#22c55e]'
                  : 'bg-[#FF454F]/15 text-[#FF454F]'
              }`}
            >
              {result}
            </span>
          </div>
        </div>
      </div>

      {/* Model Predictions Section */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-[#94a3b8]">
            Predicted Next-Use Distance (higher = evict first)
          </span>
        </div>

        {predictionEntries.length > 0 ? (
          <div className="space-y-1.5">
            {predictionEntries.map(([blockKey, score]) => {
              const isCandidateVictim = blockKey === activeVictim
              const barPercent = Math.min(100, Math.max(12, (score / maxVal) * 100))

              return (
                <div key={blockKey} className="flex items-center gap-2 text-xs">
                  <span
                    className={`w-4 font-mono font-bold text-center ${
                      isCandidateVictim ? 'text-[#FF454F]' : 'text-[#94a3b8]'
                    }`}
                  >
                    {blockKey}
                  </span>

                  {/* Horizontal Bar */}
                  <div className="flex-1 h-2 rounded-full bg-[#0c121e] overflow-hidden border border-[#1e293b]">
                    <motion.div
                      className={`h-full rounded-full ${
                        isCandidateVictim
                          ? 'bg-[#FF454F] shadow-[0_0_8px_rgba(255,69,79,0.5)]'
                          : 'bg-[#12CBEA] shadow-[0_0_8px_rgba(18,203,234,0.4)]'
                      }`}
                      initial={false}
                      animate={{ width: `${barPercent}%` }}
                      transition={{ duration: 0.25 }}
                    />
                  </div>

                  {/* Distance Value */}
                  <span
                    className={`w-9 text-right font-mono text-[11px] ${
                      isCandidateVictim
                        ? 'font-bold text-[#FF454F]'
                        : 'text-[#94a3b8]'
                    }`}
                  >
                    {score.toFixed(1)}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-[#0c121e] border border-[#1e293b] text-center text-[11px] text-[#64748b]">
            {isHit
              ? 'Cache hit. Prediction inference not required.'
              : isMLPolicy
              ? 'Evaluating cache state...'
              : `${policy} policy uses deterministic heuristics without regression inference.`}
          </div>
        )}
      </div>

      {/* Selected Victim Row */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] font-bold text-[#94a3b8]">
          Selected Victim
        </span>
        <div className="flex items-center gap-2">
          {activeVictim ? (
            <span className="w-6 h-6 rounded-full bg-[#FF454F] text-white font-mono font-bold text-xs flex items-center justify-center shadow-[0_0_8px_rgba(255,69,79,0.5)]">
              {activeVictim}
            </span>
          ) : (
            <span className="text-xs font-mono text-[#64748b]">None</span>
          )}
        </div>
      </div>

      {/* Decision Reason Callout */}
      <div className="pt-2 border-t border-[#1e293b]/80">
        <span className="text-[10px] uppercase font-bold text-[#94a3b8] block mb-1">
          Decision Reason
        </span>
        <div className="p-2 rounded-xl bg-[#0c121e] border border-[#1e293b] flex items-start gap-1.5 text-[#94a3b8] text-[11px]">
          <Info className="w-3.5 h-3.5 text-[#94a3b8] flex-shrink-0 mt-0.5" />
          <p className="leading-snug">{decisionReason}</p>
        </div>
      </div>

      {/* Educational Mode Callout */}
      {explainMode && (
        <div className="p-2 rounded-xl bg-[#064e3b]/20 border border-[#10b981]/30 text-[10px] text-[#a7f3d0] space-y-1">
          <span className="font-bold uppercase tracking-wider text-[#34d399] block">
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
