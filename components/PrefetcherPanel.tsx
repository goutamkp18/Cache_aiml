'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Radio } from 'lucide-react'
import type { SimulationEvent } from '@/simulation/simulationTypes'

interface PrefetcherPanelProps {
  currentEvent?: SimulationEvent
  policy: string
  explainMode?: boolean
}

export default function PrefetcherPanel({ currentEvent, policy, explainMode = false }: PrefetcherPanelProps) {
  if (!currentEvent) {
    return (
      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6 flex flex-col justify-center items-center text-center min-h-[160px] space-y-2 shadow-xl">
        <Radio className="w-8 h-8 text-[#12CBEA] opacity-70" />
        <span className="text-[10px] uppercase font-bold tracking-widest text-[#94a3b8]">
          PREFETCHER STANDBY
        </span>
        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Adaptive Prefetcher</h4>
        <span className="text-[11px] text-[#94a3b8] max-w-xs">
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
    <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-4 sm:p-5 shadow-xl transition-colors space-y-3.5 relative overflow-hidden">
      {/* Dynamic Animated Cyan Energy Sweep on actual Prefetch */}
      {isPrefetched && (
        <motion.div
          key={`prefetch-anim-${currentEvent.index}`}
          initial={{ x: '-100%', opacity: 0 }}
          animate={{ x: '100%', opacity: [0, 0.9, 0] }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#12CBEA] to-transparent pointer-events-none"
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1e293b]/80">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-[#12CBEA]" />
          <h3 className="text-xs font-bold text-white tracking-wide">
            Adaptive Prefetcher
          </h3>
        </div>

        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-[#12CBEA]/10 text-[#12CBEA] border border-[#12CBEA]/30">
          {hasPrefetchPolicy ? 'Markov Predictor' : 'Inactive'}
        </span>
      </div>

      {/* 3 Metric Boxes in 1 Row */}
      <div className="grid grid-cols-3 gap-2">
        {/* 1. Predicted Next Block */}
        <div className="p-2 rounded-xl bg-[#0c121e] border border-[#1e293b] flex flex-col justify-between items-center text-center">
          <span className="text-[9px] uppercase font-bold text-[#94a3b8] block mb-1">
            Predicted Next Block
          </span>
          <span
            className={`text-lg font-mono font-bold ${
              isPrefetched ? 'text-[#12CBEA]' : 'text-[#64748b]'
            }`}
          >
            {prefetch?.block || '—'}
          </span>
        </div>

        {/* 2. Model Confidence */}
        <div className="p-2 rounded-xl bg-[#0c121e] border border-[#1e293b] flex flex-col justify-between items-center text-center">
          <span className="text-[9px] uppercase font-bold text-[#94a3b8] block mb-1">
            Model Confidence
          </span>
          <span
            className={`text-lg font-mono font-bold ${
              confidencePercent != null ? 'text-white' : 'text-[#64748b]'
            }`}
          >
            {confidencePercent != null ? `${confidencePercent}%` : '—'}
          </span>
        </div>

        {/* 3. Action Status */}
        <div className="p-2 rounded-xl bg-[#0c121e] border border-[#1e293b] flex flex-col justify-between items-center text-center">
          <span className="text-[9px] uppercase font-bold text-[#94a3b8] block mb-1">
            Action Status
          </span>
          <div>
            <span
              className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                isPrefetched
                  ? 'bg-[#12CBEA]/15 text-[#12CBEA] border border-[#12CBEA]/30'
                  : 'bg-[#172235] text-[#94a3b8]'
              }`}
            >
              {isPrefetched ? 'Prefetched' : 'No Prefetch'}
            </span>
          </div>
        </div>
      </div>

      {/* Footer: Context and Threshold */}
      <div className="pt-2 border-t border-[#1e293b]/80 flex items-center justify-between text-xs text-[#94a3b8]">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-medium text-[#94a3b8]">Context:</span>
          <span className="font-mono text-xs font-bold text-white">
            {prefetch?.context && prefetch.context.length > 0
              ? `[ ${prefetch.context.join(' , ')} ]`
              : '[ — ]'}
          </span>
        </div>

        <span className="text-[11px] font-mono text-[#94a3b8]">
          Threshold &ge; 70%
        </span>
      </div>

      {/* Educational Mode Callout */}
      {explainMode && (
        <div className="p-2 rounded-xl bg-[#0369a1]/20 border border-[#0284c7]/30 text-[10px] text-[#bae6fd] space-y-1">
          <span className="font-bold uppercase tracking-wider text-[#38bdf8] block">
            Adaptive Markov Speculation
          </span>
          <p className="leading-snug">
            Speculative prefetching loads predicted memory blocks ahead of CPU requests. High confidence (&ge; 70%) prevents cache thrashing by ensuring only blocks with strong transition probabilities are fetched.
          </p>
        </div>
      )}
    </div>
  )
}
