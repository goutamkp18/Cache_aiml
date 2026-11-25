'use client'

import React, { memo } from 'react'
import { motion } from 'framer-motion'
import {
  CheckCircle2,
  XCircle,
  Trash2,
  Database,
  Play,
  ArrowRight
} from 'lucide-react'
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

function CacheVisualizer({
  currentEvent,
  step,
  totalSteps,
  capacity,
  onStartSimulation,
  isRunning = false,
  isCompleted = false,
}: CacheVisualizerProps) {
  if (!currentEvent) {
    return (
      <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center min-h-[260px] text-center space-y-3.5">
        <div className="w-12 h-12 rounded-2xl bg-[var(--accent-sage-subtle)] border border-[var(--accent-sage-border)] flex items-center justify-center text-[var(--brand-sage)] dark:text-[var(--accent-sage-text)]">
          <Database className="w-6 h-6" strokeWidth={1.8} />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] block">
            Cache Hardware Standby
          </span>
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight">
            NO EXPERIMENT RUN
          </h3>
          <p className="text-xs text-[var(--text-secondary)] max-w-sm leading-relaxed">
            Configure your workload and run a simulation to visualize 3D cache blocks, hits, evictions, and prefetches step by step.
          </p>
        </div>
        {onStartSimulation && (
          <button
            type="button"
            onClick={onStartSimulation}
            className="px-5 py-2.5 rounded-xl bg-[var(--accent-vermilion)] hover:bg-[var(--accent-vermilion-hover)] text-white text-xs font-bold inline-flex items-center gap-2 shadow-sm cursor-pointer ui-interactive mt-1"
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
    cacheAfter = [],
    selectedVictim,
    evicted,
    prefetch,
  } = currentEvent

  const isHit = result === 'HIT'
  const hasPrefetch = prefetch?.status === 'PREFETCHED' && !!prefetch.block
  const activeVictim = evicted || selectedVictim
  const progressPercent =
    totalSteps > 0 ? Math.min(100, Math.round(((step + 1) / totalSteps) * 100)) : 0
  const remainingSteps = Math.max(0, totalSteps - (step + 1))

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

  const activeCache = cacheAfter || []
  const slots = Array.from({ length: capacity }, (_, i) => activeCache[i] || null)
  const cubeSize = capacity > 8 ? 'compact' : 'normal'

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[var(--border-subtle)] gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[180px]">
          <span className="text-[11px] font-bold tracking-[0.06em] text-[var(--text-secondary)] uppercase flex-shrink-0">
            Simulation Progress
          </span>

          <div className="flex-1 h-2 rounded-full bg-[var(--bg-surface-secondary)] overflow-hidden border border-[var(--border-subtle)]">
            <motion.div
              className="h-full bg-[var(--brand-sage)] rounded-full"
              initial={false}
              animate={{ width: `${progressPercent}%` }}
              transition={{ ease: 'easeOut', duration: 0.2 }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hidden md:inline">
            {phaseName}
          </span>

          <span className="text-xs font-mono font-medium text-[var(--text-secondary)] tabular-nums">
            Access <strong className="text-[var(--text-primary)] font-bold">{step + 1}</strong> / {totalSteps}
          </span>

          {isRunning ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[var(--accent-amber-subtle)] text-[var(--accent-amber-text)] border border-[var(--accent-amber-border)] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-amber)] animate-ping-subtle" />
              <span>Running</span>
            </span>
          ) : isCompleted || step >= totalSteps - 1 ? (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[var(--accent-sage-subtle)] text-[var(--accent-sage-text)] border border-[var(--accent-sage-border)] flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3" />
              <span>Completed</span>
            </span>
          ) : (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[var(--bg-surface-secondary)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">
              Paused
            </span>
          )}
        </div>
      </div>

      {/* Sub-counter details */}
      <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)] pt-2 tabular-nums">
        <span>
          Completed: <strong className="text-[var(--text-primary)]">{step + 1}</strong> accesses
        </span>
        <span>
          Remaining: <strong className="text-[var(--text-primary)]">{remainingSteps}</strong> accesses
        </span>
      </div>

      {/* Center 3D Hardware Simulation Stage */}
      <div className="my-3.5 py-4 px-3 sm:px-5 rounded-xl glass-inset flex flex-col md:flex-row items-center justify-between gap-5 relative">
        {/* Left: Current CPU Request */}
        <div className="flex flex-col items-center flex-shrink-0">
          <span className="text-[10px] font-bold tracking-[0.06em] text-[var(--text-secondary)] mb-2.5 uppercase">
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

          <div className="mt-2.5">
            {isHit ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--accent-sage-subtle)] text-[var(--accent-sage-text)] border border-[var(--accent-sage-border)]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CACHE HIT</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[var(--accent-vermilion-subtle)] text-[var(--accent-vermilion-text)] border border-[var(--accent-vermilion-border)]">
                <XCircle className="w-3.5 h-3.5" />
                <span>CACHE MISS</span>
              </span>
            )}
          </div>
        </div>

        {/* Center Directional Indicator */}
        <div className="flex items-center justify-center py-1 md:py-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[var(--bg-surface-solid)] border border-[var(--border-subtle)] shadow-xs">
            <ArrowRight className="w-4 h-4 rotate-90 md:rotate-0 text-[var(--accent-vermilion)]" />
          </div>
        </div>

        {/* Right: Resident Cache Podium */}
        <div className="flex flex-col items-center flex-1 w-full min-w-0">
          <span className="text-[10px] font-bold tracking-[0.06em] text-[var(--text-secondary)] mb-2.5 uppercase">
            Resident Cache ({capacity} Slots)
          </span>

          <div className="relative w-full py-4 px-3 sm:px-4 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--border-subtle)] shadow-xs">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 relative z-10">
              {slots.map((blk, idx) => {
                const isVictim = blk !== null && (blk === evicted || blk === selectedVictim)
                const isPref = blk !== null && blk === prefetch?.block && hasPrefetch
                const isActiveRes = blk !== null && blk === request && !isVictim && !isPref

                return (
                  <CacheCube3D
                    key={`slot-${idx}-${blk || 'empty'}`}
                    block={blk}
                    slotIndex={idx}
                    isVictim={isVictim}
                    isPrefetched={isPref}
                    isActiveResident={isActiveRes}
                    isEmpty={!blk}
                    size={cubeSize}
                  />
                )
              })}
            </div>

            <div className="mt-3 h-[2px] w-full rounded-full bg-gradient-to-r from-transparent via-[var(--brand-sage)] to-transparent opacity-45" />
          </div>
        </div>
      </div>

      {/* Bottom Legend & Eviction Notice */}
      <div className="flex flex-wrap items-center justify-between pt-2.5 border-t border-[var(--border-subtle)] gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3.5 text-[var(--text-secondary)] text-[11px] font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#4B5A50] border border-[#667B6D]" />
            <span>Resident</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#3D6B4F] border border-[#6EA380]" />
            <span>Hit</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#F20B0B] border border-[#FF6B6B]" />
            <span>Miss / Eviction</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-xs bg-[#B47418] border border-[#E8B55D]" />
            <span>Prefetch</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {activeVictim ? (
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-[var(--accent-vermilion-text)] bg-[var(--accent-vermilion-subtle)] px-2.5 py-1 rounded-lg border border-[var(--accent-vermilion-border)]">
              <Trash2 className="w-3.5 h-3.5" />
              <span>Evicting: Slot with &quot;{activeVictim}&quot;</span>
            </span>
          ) : (
            <span className="text-[11px] text-[var(--text-muted)]">
              No eviction required
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export default memo(CacheVisualizer)
