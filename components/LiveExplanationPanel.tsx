'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  HelpCircle,
  Sparkles,
  BrainCircuit,
  Radio,
  CheckCircle2,
  XCircle,
  Database,
  ArrowRight,
  GraduationCap,
  Info
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

export default function LiveExplanationPanel({
  currentEvent,
  currentStep,
  totalSteps,
  policy,
  capacity,
  explainMode,
  onToggleExplainMode,
}: LiveExplanationPanelProps) {
  if (!currentEvent) {
    return (
      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-5 shadow-xl transition-colors">
        <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]/80">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FF454F]" />
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">
              What Is Happening Right Now?
            </h3>
          </div>
          <span className="text-[10px] font-mono text-[#64748b]">Awaiting Simulation</span>
        </div>
        <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
          <HelpCircle className="w-8 h-8 text-[#64748b] opacity-60" />
          <p className="text-xs text-[#94a3b8] max-w-md">
            Click <strong className="text-white">Run Simulation</strong> or <strong className="text-white">Play</strong> to start interactive step-by-step memory processing. Each access will be explained here in plain English.
          </p>
        </div>
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
  const isMiss = result === 'MISS'
  const hasPrefetch = prefetch?.status === 'PREFETCHED' && !!prefetch.block
  const isMLPolicy = policy.includes('ML')
  const activeVictim = evicted || selectedVictim

  // Determine Current Phase
  let phaseNumber = 1
  let phaseTitle = 'CPU Memory Request'
  if (isHit) {
    phaseNumber = 3
    phaseTitle = 'Cache Hit (Resident Block Located)'
  } else if (activeVictim) {
    phaseNumber = 4
    phaseTitle = 'AI Eviction & Cache Update'
  } else if (hasPrefetch) {
    phaseNumber = 6
    phaseTitle = 'Markov Speculative Prefetch'
  } else {
    phaseNumber = 5
    phaseTitle = 'Cache Allocation'
  }

  // Construct Plain English Explanations based on real event data
  let primaryExplanation = ''
  let lookupExplanation = ''
  let aiExplanation = ''
  let prefetchExplanation = ''

  if (isHit) {
    const slotIdx = cacheBefore.indexOf(request)
    primaryExplanation = `Block ${request} is already present in cache ${slotIdx >= 0 ? `(Slot ${slotIdx})` : ''}. The CPU retrieved it in ~1 cycle without accessing main memory.`
    lookupExplanation = `Search through resident cache [${cacheBefore.join(', ')}] matched block "${request}". Cache hit recorded.`
  } else {
    // Miss
    if (activeVictim) {
      if (isMLPolicy) {
        primaryExplanation = `Block ${request} is not resident in cache (MISS), and all ${capacity} slots are full. The Random Forest model evaluated resident candidates and chose block ${activeVictim} for eviction because it has the largest predicted future-use distance.`
        aiExplanation = `Candidate distance scores: ${Object.entries(predictions)
          .map(([k, v]) => `${k}=${v.toFixed(1)}`)
          .join(', ')}. Block ${activeVictim} had the highest score and was evicted.`
      } else {
        primaryExplanation = `Block ${request} is not resident (MISS), and cache is full. Block ${activeVictim} was selected for eviction according to the ${policy} policy.`
        aiExplanation = `Policy ${policy} selected block ${activeVictim} based on access history.`
      }
    } else {
      primaryExplanation = `Block ${request} is not resident (MISS). The cache had free capacity (${cacheBefore.length}/${capacity} slots used), so block ${request} was inserted without evicting any block.`
      aiExplanation = `No eviction necessary. Free cache slot allocated.`
    }
    lookupExplanation = `Search through resident cache [${cacheBefore.length > 0 ? cacheBefore.join(', ') : 'Empty'}] did not find block "${request}". Memory fetch required.`
  }

  // Prefetch explanation
  if (hasPrefetch) {
    const conf = prefetch?.confidence != null ? `${Math.round(prefetch.confidence * 100)}%` : 'high'
    prefetchExplanation = `The Adaptive Markov Prefetcher observed context [${prefetch?.context?.join(', ')}] and predicted upcoming block "${prefetch?.block}" with ${conf} confidence (≥ 70% threshold). Block "${prefetch?.block}" was loaded into cache.`
  } else if (prefetch?.status === 'THRESHOLD_NOT_MET' || (prefetch?.confidence != null && prefetch.confidence < 0.7)) {
    const conf = prefetch?.confidence != null ? `${Math.round(prefetch.confidence * 100)}%` : 'low'
    prefetchExplanation = `Markov model observed context [${prefetch?.context?.join(', ')}], but confidence was only ${conf} (< 70% threshold). Speculative prefetching skipped to protect cache pollution.`
  } else {
    prefetchExplanation = `No high-confidence Markov transition found for the current access pattern. Prefetching idle.`
  }

  return (
    <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-4 sm:p-5 shadow-xl transition-colors space-y-4">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#1e293b]/80 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#FF454F] to-[#b91c1c] flex items-center justify-center text-white shadow-[0_0_10px_rgba(255,69,79,0.4)]">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide uppercase flex items-center gap-2">
              <span>What Is Happening Right Now?</span>
              <span className="text-[10px] font-mono font-normal text-[#94a3b8]">
                (Access {currentStep + 1} of {totalSteps})
              </span>
            </h3>
          </div>
        </div>

        {/* Phase Pill + Educational Mode Toggle */}
        <div className="flex items-center gap-2">
          {/* Phase Badge */}
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#12CBEA]/10 text-[#12CBEA] border border-[#12CBEA]/30">
            Phase {phaseNumber}: {phaseTitle}
          </span>

          {/* Educational Mode Button */}
          <button
            onClick={onToggleExplainMode}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold transition-all cursor-pointer ${
              explainMode
                ? 'bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/40 shadow-[0_0_8px_rgba(34,197,94,0.3)]'
                : 'bg-[#172235] text-[#94a3b8] border border-[#1e293b] hover:text-white'
            }`}
            title="Toggle in-depth educational architectural explanations"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>{explainMode ? 'Explain Mode: ON' : 'Explain AI'}</span>
          </button>
        </div>
      </div>

      {/* Primary Highlight Explanation Callout */}
      <motion.div
        key={`primary-exp-${currentStep}`}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`p-3.5 rounded-xl border flex items-start gap-3 ${
          isHit
            ? 'bg-[#064e3b]/30 border-[#10b981]/40 text-[#d1fae5]'
            : 'bg-[#7f1d1d]/25 border-[#ef4444]/40 text-[#fee2e2]'
        }`}
      >
        <div className="mt-0.5 flex-shrink-0">
          {isHit ? (
            <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
          ) : (
            <XCircle className="w-5 h-5 text-[#FF454F]" />
          )}
        </div>
        <div className="space-y-1">
          <div className="text-xs sm:text-sm font-semibold leading-relaxed">
            {primaryExplanation}
          </div>
          <div className="text-[11px] opacity-80 leading-normal font-mono">
            Cache Before: [{cacheBefore.join(', ') || 'Empty'}] &rarr; Cache After: [{cacheAfter.join(', ')}]
          </div>
        </div>
      </motion.div>

      {/* 7-Phase Execution Timeline Bar */}
      <div className="pt-1">
        <div className="flex items-center justify-between text-[10px] uppercase font-bold text-[#64748b] mb-2 px-1">
          <span>Simulation Sequence Breakdown</span>
          <span className="font-mono text-[#94a3b8]">Step {currentStep + 1}/{totalSteps}</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-1.5 text-center">
          {/* Phase 1: Request */}
          <div className="p-1.5 rounded-lg bg-[#0c121e] border border-[#1e293b] flex flex-col items-center">
            <span className="text-[9px] text-[#64748b] font-bold">1. Request</span>
            <span className="text-xs font-mono font-bold text-white mt-0.5">CPU [{request}]</span>
          </div>

          {/* Phase 2: Lookup */}
          <div className="p-1.5 rounded-lg bg-[#0c121e] border border-[#1e293b] flex flex-col items-center">
            <span className="text-[9px] text-[#64748b] font-bold">2. Lookup</span>
            <span className="text-xs font-mono font-bold text-[#94a3b8] mt-0.5">Slots 0-{capacity - 1}</span>
          </div>

          {/* Phase 3: Result */}
          <div
            className={`p-1.5 rounded-lg border flex flex-col items-center ${
              isHit
                ? 'bg-[#064e3b]/40 border-[#22c55e]/50 text-[#22c55e]'
                : 'bg-[#7f1d1d]/40 border-[#ef4444]/50 text-[#FF454F]'
            }`}
          >
            <span className="text-[9px] font-bold">3. Result</span>
            <span className="text-xs font-mono font-black mt-0.5">{result}</span>
          </div>

          {/* Phase 4: AI Replacement */}
          <div className="p-1.5 rounded-lg bg-[#0c121e] border border-[#1e293b] flex flex-col items-center">
            <span className="text-[9px] text-[#64748b] font-bold">4. AI Evict</span>
            <span className="text-xs font-mono font-bold text-white mt-0.5">
              {activeVictim ? (
                <span className="text-[#FF454F]">Evict {activeVictim}</span>
              ) : isHit ? (
                <span className="text-[#64748b]">N/A (Hit)</span>
              ) : (
                <span className="text-[#22c55e]">Free Slot</span>
              )}
            </span>
          </div>

          {/* Phase 5: Cache Update */}
          <div className="p-1.5 rounded-lg bg-[#0c121e] border border-[#1e293b] flex flex-col items-center">
            <span className="text-[9px] text-[#64748b] font-bold">5. Update</span>
            <span className="text-xs font-mono font-bold text-[#12CBEA] mt-0.5">
              {cacheAfter.length} / {capacity}
            </span>
          </div>

          {/* Phase 6: Prefetch */}
          <div className="p-1.5 rounded-lg bg-[#0c121e] border border-[#1e293b] flex flex-col items-center">
            <span className="text-[9px] text-[#64748b] font-bold">6. Prefetch</span>
            <span className="text-xs font-mono font-bold mt-0.5">
              {hasPrefetch ? (
                <span className="text-[#12CBEA]">+{prefetch?.block}</span>
              ) : (
                <span className="text-[#64748b]">Idle</span>
              )}
            </span>
          </div>

          {/* Phase 7: Metrics */}
          <div className="p-1.5 rounded-lg bg-[#0c121e] border border-[#1e293b] flex flex-col items-center">
            <span className="text-[9px] text-[#64748b] font-bold">7. Metrics</span>
            <span className="text-xs font-mono font-bold text-[#22c55e] mt-0.5">
              {(((cacheBefore.filter((b) => b === request).length > 0 ? 1 : 0) / 1) * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Educational Deep-Dive Section (Shown when "Explain AI Decisions" is active) */}
      <AnimatePresence>
        {explainMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="pt-3 border-t border-[#1e293b]/80 space-y-2.5 overflow-hidden"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#12CBEA]">
              <GraduationCap className="w-4 h-4" />
              <span>Architectural Insights &amp; Model Decisions:</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Random Forest / Replacement Policy Insight */}
              <div className="p-3 rounded-xl bg-[#0c121e] border border-[#1e293b] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#FF454F] flex items-center gap-1">
                  <BrainCircuit className="w-3.5 h-3.5" />
                  <span>Replacement Decision Logic ({policy})</span>
                </span>
                <p className="text-[#94a3b8] leading-relaxed">
                  {aiExplanation}
                </p>
                {isMLPolicy && (
                  <p className="text-[11px] text-[#64748b] italic">
                    The Random Forest Regressor predicts future reuse distance based on recency, frequency, and locality. It approximates Belady's optimal MIN rule by keeping items with small predicted distances.
                  </p>
                )}
              </div>

              {/* Markov Prefetcher Insight */}
              <div className="p-3 rounded-xl bg-[#0c121e] border border-[#1e293b] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#12CBEA] flex items-center gap-1">
                  <Radio className="w-3.5 h-3.5" />
                  <span>Adaptive Markov Prefetching Logic</span>
                </span>
                <p className="text-[#94a3b8] leading-relaxed">
                  {prefetchExplanation}
                </p>
                <p className="text-[11px] text-[#64748b] italic">
                  Markov chains track 2nd-order transitions (e.g. A &rarr; B &rarr; ?). High confidence indicates a repeated sequential access stream or loop body.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

