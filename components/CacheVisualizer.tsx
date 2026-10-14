'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDown, Check, Sparkles, AlertCircle, Database } from 'lucide-react'
import type { SimulationEvent } from '@/simulation/simulationTypes'

interface CacheVisualizerProps {
  currentEvent?: SimulationEvent
  step: number
  totalSteps: number
  capacity: number
}

export default function CacheVisualizer({
  currentEvent,
  step,
  totalSteps,
  capacity,
}: CacheVisualizerProps) {
  // If no event is loaded yet
  if (!currentEvent) {
    return (
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-8 flex flex-col items-center justify-center min-h-[380px] text-center">
        <Database className="w-10 h-10 text-[var(--text-muted)] mb-3 animate-pulse" />
        <h3 className="text-sm font-semibold text-[var(--text-primary)]">Ready to Simulate</h3>
        <p className="text-xs text-[var(--text-muted)] max-w-xs mt-1">
          Select your parameters and click &ldquo;Run Simulation&rdquo; to visualize the cache state.
        </p>
      </div>
    )
  }

  const {
    request,
    result,
    cacheBefore,
    cacheAfter,
    selectedVictim,
    evicted,
    inserted,
    prefetch,
  } = currentEvent

  const isHit = result === 'HIT'
  const isMiss = result === 'MISS'
  const hasPrefetch = prefetch?.status === 'PREFETCHED' && !!prefetch.block
  const progressPercent = totalSteps > 0 ? ((step + 1) / totalSteps) * 100 : 0

  // Derive slots to display up to capacity
  // We show current active cache blocks from cacheAfter
  const activeCache = cacheAfter || []
  const slots = Array.from({ length: capacity }, (_, i) => activeCache[i] || null)

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 sm:p-6 shadow-sm flex flex-col justify-between transition-colors">
      {/* Header: Section Title + Step Progress */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-4 rounded-full bg-[var(--accent-crimson)]" />
          <h2 className="text-sm font-bold tracking-tight text-[var(--text-primary)]">
            Live Cache Simulation
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-medium text-[var(--text-muted)]">
            Step <strong className="text-[var(--text-primary)]">{step + 1}</strong> / {totalSteps}
          </span>
          <div className="w-24 sm:w-32 h-2 rounded-full bg-[var(--bg-surface-elevated)] overflow-hidden border border-[var(--border-subtle)]">
            <motion.div
              className="h-full bg-[var(--accent-crimson)] rounded-full"
              initial={false}
              animate={{ width: `${progressPercent}%` }}
              transition={{ ease: 'easeOut', duration: 0.25 }}
            />
          </div>
        </div>
      </div>

      {/* Center Stage: Current CPU Request Box & Arrow */}
      <div className="my-6 flex flex-col items-center justify-center">
        <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)] mb-1.5 flex items-center gap-1.5">
          <span>Current CPU Request</span>
        </div>

        {/* Request Block Card */}
        <motion.div
          key={`req-${step}-${request}`}
          initial={{ scale: 0.85, opacity: 0, y: -6 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl flex flex-col items-center justify-center font-bold text-2xl sm:text-3xl shadow-sm border ${
            isHit
              ? 'bg-[var(--accent-green-subtle)] border-[var(--accent-green-border)] text-[var(--accent-green)]'
              : 'bg-[var(--accent-crimson-subtle)] border-[var(--accent-crimson-border)] text-[var(--accent-crimson)]'
          }`}
        >
          <span>{request}</span>

          {/* Hit / Miss Badge */}
          <span
            className={`absolute -top-2.5 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border shadow-xs ${
              isHit
                ? 'bg-emerald-600 text-white border-emerald-500'
                : 'bg-red-600 text-white border-red-500'
            }`}
          >
            {result}
          </span>
        </motion.div>

        {/* Down Arrow pointing to Cache State */}
        <motion.div
          animate={{ y: [0, 4, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-2 text-[var(--accent-crimson)]"
        >
          <ArrowDown className="w-5 h-5 stroke-[2.5]" />
        </motion.div>
      </div>

      {/* Cache Slots Grid */}
      <div className="w-full">
        <div className="flex items-center justify-between text-[11px] font-medium text-[var(--text-muted)] mb-2 px-1">
          <span>Resident Cache Blocks</span>
          <span>Capacity: {activeCache.length} / {capacity}</span>
        </div>

        <div
          className="grid gap-2.5 sm:gap-3"
          style={{
            gridTemplateColumns: `repeat(${capacity <= 4 ? capacity : capacity <= 8 ? 4 : 4}, minmax(0, 1fr))`,
          }}
        >
          {slots.map((block, idx) => {
            const isResident = !!block
            const isCurrentHit = isHit && block === request
            const isEvictedVictim = isMiss && (block === selectedVictim || block === evicted)
            const isPrefetched = hasPrefetch && block === prefetch.block
            const isNewlyInserted = isMiss && block === inserted

            return (
              <div key={`slot-${idx}`} className="cache-slot-3d flex flex-col items-center">
                <motion.div
                  layout
                  className={`cache-slot-face w-full aspect-square rounded-xl flex flex-col items-center justify-center relative p-2 transition-all ${
                    isCurrentHit
                      ? 'hit'
                      : isEvictedVictim
                      ? 'evicted'
                      : isPrefetched
                      ? 'prefetched'
                      : 'normal'
                  }`}
                  initial={false}
                  animate={
                    isCurrentHit
                      ? { scale: [1, 1.05, 1] }
                      : isEvictedVictim
                      ? { x: [0, -3, 3, 0] }
                      : isNewlyInserted
                      ? { scale: [0.9, 1] }
                      : {}
                  }
                  transition={{ duration: 0.3 }}
                >
                  {/* Slot State Status Badges */}
                  {isCurrentHit && (
                    <span className="absolute top-1.5 right-1.5 text-[var(--accent-green)]">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </span>
                  )}
                  {isPrefetched && (
                    <span className="absolute top-1 left-1 px-1 py-0.2 rounded text-[8px] font-extrabold uppercase bg-[var(--accent-cyan)] text-white">
                      PRE
                    </span>
                  )}

                  {/* Block Letter */}
                  {isResident ? (
                    <span className="text-xl sm:text-2xl font-bold tracking-tight">
                      {block}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-[var(--text-muted)] opacity-40">
                      EMPTY
                    </span>
                  )}

                  {/* Slot Index */}
                  <span className="text-[10px] font-mono text-[var(--text-muted)] mt-1">
                    Slot {idx}
                  </span>
                </motion.div>
              </div>
            )
          })}
        </div>

        {/* Cache Legend Bar */}
        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between text-[11px] text-[var(--text-muted)] gap-2">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[var(--text-muted)]" />
              Resident
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-green)]" />
              Hit
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-crimson)]" />
              Victim / Miss
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-cyan)]" />
              Prefetch
            </span>
          </div>

          {selectedVictim && isMiss && (
            <span className="text-xs font-semibold text-[var(--accent-crimson)]">
              Evicting: Slot with &ldquo;{selectedVictim}&rdquo;
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
