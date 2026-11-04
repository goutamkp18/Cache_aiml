'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, Trash2, Database, Play, Sparkles, ChevronRight, Activity } from 'lucide-react'
import type { SimulationEvent } from '@/simulation/simulationTypes'
import CacheCube3D from './CacheCube3D'

interface CacheVisualizerProps {
  currentEvent?: SimulationEvent
  step: number
  totalSteps: number
  capacity: number
  onStartSimulation?: () => void
  isRunning?: boolean
  isCompleted?: boolean
}

export default function CacheVisualizer({
  currentEvent,
  step,
  totalSteps,
  capacity,
  onStartSimulation,
  isRunning = false,
  isCompleted = false,
}: CacheVisualizerProps) {
  // Standby state when no event has been run yet
  if (!currentEvent) {
    return (
      <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center min-h-[380px] text-center space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-[#172235] border border-[#1e293b] flex items-center justify-center text-[#FF454F] shadow-inner">
          <Database className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#94a3b8] block">
            CACHE HARDWARE STANDBY
          </span>
          <h3 className="text-lg font-bold text-white tracking-tight">
            NO EXPERIMENT RUN
          </h3>
          <p className="text-xs text-[#94a3b8] max-w-sm">
            Configure your workload and run a simulation to generate performance analytics and visualize real-time 3D cache state.
          </p>
        </div>
        {onStartSimulation && (
          <button
            onClick={onStartSimulation}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF454F] to-[#e11d48] hover:from-[#ff5e67] hover:to-[#f43f5e] text-white text-xs font-semibold inline-flex items-center gap-2 shadow-[0_0_15px_rgba(255,69,79,0.35)] transition-all active:scale-95 cursor-pointer mt-2"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Simulation</span>
          </button>
        )}
      </div>
    )
  }

  const {
    request,
    result,
    cacheBefore = [],
    cacheAfter = [],
    selectedVictim,
    evicted,
    inserted,
    prefetch,
  } = currentEvent

  const isHit = result === 'HIT'
  const isMiss = result === 'MISS'
  const hasPrefetch = prefetch?.status === 'PREFETCHED' && !!prefetch.block
  const activeVictim = evicted || selectedVictim
  const progressPercent = totalSteps > 0 ? Math.min(100, Math.round(((step + 1) / totalSteps) * 100)) : 0
  const remainingSteps = Math.max(0, totalSteps - (step + 1))

  // Derive active phase name
  let phaseName = 'Phase 1: Memory Request'
  if (isHit) {
    phaseName = 'Phase 3: Cache Hit'
  } else if (activeVictim) {
    phaseName = `Phase 4: Evicting [${activeVictim}]`
  } else if (hasPrefetch) {
    phaseName = `Phase 6: Prefetching [${prefetch.block}]`
  } else {
    phaseName = 'Phase 5: Cache Allocation'
  }

  // Slots to display
  const activeCache = cacheAfter || []
  const slots = Array.from({ length: capacity }, (_, i) => activeCache[i] || null)

  return (
    <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-5 sm:p-6 shadow-xl flex flex-col justify-between transition-colors relative overflow-hidden">
      {/* Subtle background circuit ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#12CBEA]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FF454F]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Row inside Card: Simulation Progress & Phase */}
      <div className="flex flex-wrap items-center justify-between pb-4 border-b border-[#1e293b]/80 gap-3">
        {/* Progress Bar with Title */}
        <div className="flex items-center gap-3 flex-1 min-w-[220px]">
          <span className="text-[11px] font-bold tracking-wider text-[#94a3b8] flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[#12CBEA] font-bold text-xs">✦</span>
            <span>Simulation Progress</span>
          </span>

          <div className="flex-1 h-2 rounded-full bg-[#172235] overflow-hidden border border-[#1e293b] relative">
            <motion.div
              className="h-full bg-gradient-to-r from-[#12CBEA] via-[#818cf8] to-[#c084fc] rounded-full shadow-[0_0_10px_rgba(18,203,234,0.5)]"
              initial={false}
              animate={{ width: `${progressPercent}%` }}
              transition={{ ease: 'easeOut', duration: 0.25 }}
            />
          </div>
        </div>

        {/* Step Indicator, Phase Badge, and Status Badge */}
        <div className="flex items-center gap-2.5">
          {/* Phase Badge */}
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#0c121e] border border-[#1e293b] text-[#38bdf8] hidden md:inline">
            {phaseName}
          </span>

          <span className="text-xs font-mono font-medium text-[#94a3b8]">
            Access <strong className="text-white font-bold">{step + 1}</strong> of {totalSteps}
          </span>

          {/* Status Badge */}
          {isRunning ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping-subtle" />
              <span>Running</span>
            </span>
          ) : isCompleted || step >= totalSteps - 1 ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/30 flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-[#22c55e]" />
              <span>Completed</span>
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#172235] text-[#94a3b8] border border-[#1e293b]">
              Paused
            </span>
          )}
        </div>
      </div>

      {/* Sub-counter details: Completed vs Remaining */}
      <div className="flex items-center justify-between text-[10px] font-mono text-[#64748b] pt-1">
        <span>Completed: <strong className="text-[#94a3b8]">{step + 1}</strong> accesses</span>
        <span>Remaining: <strong className="text-[#94a3b8]">{remainingSteps}</strong> accesses</span>
      </div>

      {/* Center 3D Hardware Simulation Stage */}
      <div className="my-5 py-4 px-3 sm:px-6 rounded-xl bg-[#0c121e]/80 border border-[#1a263a] flex flex-col md:flex-row items-center justify-between gap-6 relative shadow-inner">
        {/* Left: Current CPU Request Box */}
        <div className="flex flex-col items-center flex-shrink-0">
          <span className="text-[11px] font-bold tracking-wider text-[#94a3b8] mb-3 uppercase">
            Current CPU Request
          </span>

          <div className="my-1">
            <CacheCube3D
              block={request}
              isRequest={true}
              result={result}
              size="large"
            />
          </div>

          {/* Outcome Pill Badge */}
          <div className="mt-3">
            {isHit ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/40 shadow-[0_0_12px_rgba(34,197,94,0.3)]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>HIT</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#FF454F]/15 text-[#FF454F] border border-[#FF454F]/40 shadow-[0_0_12px_rgba(255,69,79,0.35)]">
                <XCircle className="w-3.5 h-3.5" />
                <span>MISS</span>
              </span>
            )}
          </div>
        </div>

        {/* Center: Triple Glowing Chevrons pointing to Resident Cache */}
        <div className="flex items-center justify-center text-[#FF454F] py-2 md:py-0">
          <motion.div
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex items-center tracking-tighter font-mono font-black text-xl text-[#FF454F] opacity-90 drop-shadow-[0_0_8px_rgba(255,69,79,0.7)]"
          >
            <span>&gt;&gt;&gt;</span>
          </motion.div>
        </div>

        {/* Right: Resident Cache Podium with Cyan Shelf */}
        <div className="flex flex-col items-center flex-1 w-full max-w-lg">
          <span className="text-[11px] font-bold tracking-wider text-[#94a3b8] mb-3 uppercase">
            Resident Cache (Capacity: {capacity} Slots)
          </span>

          {/* The Glowing Cyan Platform Shelf */}
          <div className="relative w-full py-4 px-2 sm:px-4 rounded-xl bg-gradient-to-b from-[#101928]/60 to-[#0a101b] border-t border-x border-[#1e2f46]">
            {/* The 3D Cache Cubes Row */}
            <div className="flex items-center justify-around gap-2 sm:gap-4 relative z-10">
              {slots.map((blk, idx) => {
                const isVictim = blk === evicted || blk === selectedVictim
                const isPref = blk === prefetch?.block && hasPrefetch

                return (
                  <CacheCube3D
                    key={`slot-${idx}-${blk || 'empty'}`}
                    block={blk}
                    slotIndex={idx}
                    isVictim={isVictim}
                    isPrefetched={isPref}
                    isEmpty={!blk}
                    size="normal"
                  />
                )
              })}
            </div>

            {/* Glowing Cyan LED Light Strip Rail on the Shelf Bottom */}
            <div className="absolute -bottom-1 left-2 right-2 h-[3px] bg-gradient-to-r from-transparent via-[#12CBEA] to-transparent shadow-[0_0_14px_#12CBEA]" />
          </div>
        </div>
      </div>

      {/* Bottom Bar: Legend on Left, Eviction Indicator on Right */}
      <div className="flex flex-wrap items-center justify-between pt-3 border-t border-[#1e293b]/80 gap-3 text-xs">
        {/* Legend */}
        <div className="flex items-center gap-4 text-[#94a3b8] text-[11px] font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#1e4976] border border-[#2a649e]" />
            <span>Resident</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#22c55e] border border-[#4ade80]" />
            <span>Hit</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#ef4444] border border-[#f87171]" />
            <span>Miss</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#12CBEA] border border-[#38bdf8]" />
            <span>Prefetch</span>
          </span>
        </div>

        {/* Eviction Notice */}
        <div className="flex items-center gap-1.5">
          {activeVictim ? (
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[#FF454F] bg-[#FF454F]/10 px-2.5 py-1 rounded-lg border border-[#FF454F]/20">
              <Trash2 className="w-3.5 h-3.5 text-[#FF454F]" />
              <span>Evicting: Slot with &quot;{activeVictim}&quot;</span>
            </span>
          ) : (
            <span className="text-[11px] text-[#64748b]">
              No eviction required
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
