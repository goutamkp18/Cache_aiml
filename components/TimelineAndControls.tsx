'use client'

import React, { useRef, useEffect, useState } from 'react'
import {
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  SlidersHorizontal
} from 'lucide-react'
import type { SimulationEvent } from '@/simulation/simulationTypes'

export type PlaybackSpeed = 0.25 | 0.5 | 1 | 1.5 | 2 | 4

export const SPEED_DELAYS: Record<PlaybackSpeed, number> = {
  0.25: 4000,
  0.5: 2500,
  1: 1500,
  1.5: 1000,
  2: 600,
  4: 300,
}

interface TimelineAndControlsProps {
  events: SimulationEvent[]
  currentStep: number
  onStepChange: (step: number) => void
  isPlaying: boolean
  onTogglePlay: () => void
  onStepForward: () => void
  onStepBackward: () => void
  onJumpToStart: () => void
  onJumpToEnd: () => void
  onReset: () => void
  speed: PlaybackSpeed
  onSpeedChange: (speed: PlaybackSpeed) => void
  executionMode: 'step' | 'auto'
  onExecutionModeChange: (mode: 'step' | 'auto') => void
}

export default function TimelineAndControls({
  events,
  currentStep,
  onStepChange,
  isPlaying,
  onTogglePlay,
  onStepForward,
  onStepBackward,
  onJumpToStart,
  onJumpToEnd,
  onReset,
  speed,
  onSpeedChange,
  executionMode,
  onExecutionModeChange,
}: TimelineAndControlsProps) {
  const timelineScrollRef = useRef<HTMLDivElement>(null)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  useEffect(() => {
    if (!timelineScrollRef.current) return
    const activeEl = timelineScrollRef.current.querySelector(
      `[data-step="${currentStep}"]`
    ) as HTMLElement
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [currentStep])

  const totalSteps = events.length
  const isAtStart = currentStep === 0
  const isAtEnd = currentStep >= totalSteps - 1
  const speedOptions: PlaybackSpeed[] = [0.25, 0.5, 1, 1.5, 2, 4]

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-3.5">
      {/* Header & Execution Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[var(--border-subtle)] gap-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[var(--accent-vermilion-text)]" />
          <h3 className="text-xs font-bold text-[var(--text-primary)] tracking-wide uppercase">
            Interactive Access Timeline
          </h3>
          <span className="text-[11px] font-mono text-[var(--text-muted)] hidden sm:inline">
            Access <strong className="text-[var(--text-primary)] font-bold">{totalSteps > 0 ? currentStep + 1 : 0}</strong> of {totalSteps}
          </span>
        </div>

        <div className="flex items-center p-0.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={() => {
              if (isPlaying) onTogglePlay()
              onExecutionModeChange('step')
            }}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-wide cursor-pointer ui-interactive ${
              executionMode === 'step'
                ? 'bg-[var(--brand-sage)] text-[#F1EEE3]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Step-by-Step (Manual)
          </button>
          <button
            type="button"
            onClick={() => onExecutionModeChange('auto')}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-wide cursor-pointer ui-interactive ${
              executionMode === 'auto'
                ? 'bg-[var(--brand-sage)] text-[#F1EEE3]'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Auto Playback
          </button>
        </div>
      </div>

      {/* Horizontal Access Tiles Strip */}
      <div className="relative">
        {totalSteps > 0 ? (
          <div
            ref={timelineScrollRef}
            className="flex items-center gap-2 overflow-x-auto py-3 px-1"
          >
            {events.map((ev, idx) => {
              const isCurrent = idx === currentStep
              const isPast = idx < currentStep
              const isHit = ev.result === 'HIT'
              const hasPrefetch = ev.prefetch?.status === 'PREFETCHED'

              return (
                <div
                  key={`timeline-tile-${idx}`}
                  className="relative flex-shrink-0"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <button
                    type="button"
                    data-step={idx}
                    onClick={() => onStepChange(idx)}
                    className={`flex flex-col items-center justify-between w-12 h-16 py-1.5 px-1 rounded-xl transition-transform cursor-pointer relative ${
                      isCurrent
                        ? 'bg-[var(--bg-surface-solid)] border-2 border-[var(--brand-sage)] ring-2 ring-[var(--accent-vermilion)] scale-105 z-10 shadow-sm'
                        : isPast
                        ? 'bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] hover:border-[var(--brand-sage)]'
                        : 'bg-[var(--bg-inset)] border border-dashed border-[var(--border-subtle)] opacity-60 hover:opacity-90'
                    }`}
                  >
                    {/* Prefetch Pip */}
                    {hasPrefetch && (
                      <span
                        className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[var(--accent-amber)]"
                        title="Prefetch triggered"
                      />
                    )}

                    <span className="font-mono font-black text-sm text-[var(--text-primary)]">
                      {ev.request}
                    </span>

                    <span
                      className={`text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded ${
                        isHit
                          ? 'text-[var(--accent-sage-text)] bg-[var(--accent-sage-subtle)]'
                          : 'text-[var(--accent-vermilion-text)] bg-[var(--accent-vermilion-subtle)]'
                      }`}
                    >
                      {ev.result}
                    </span>
                  </button>

                  {hoveredIdx === idx && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-48 p-2.5 rounded-xl bg-[var(--bg-surface-solid)] border border-[var(--border-strong)] shadow-lg text-[11px] font-mono pointer-events-none">
                      <div className="flex items-center justify-between pb-1 border-b border-[var(--border-subtle)] font-bold text-[var(--text-primary)]">
                        <span>Access #{idx + 1}</span>
                        <span
                          className={
                            isHit
                              ? 'text-[var(--accent-sage-text)]'
                              : 'text-[var(--accent-vermilion-text)]'
                          }
                        >
                          {ev.result}
                        </span>
                      </div>
                      <div className="pt-1.5 space-y-0.5 text-[var(--text-secondary)]">
                        <p>
                          Requested: <strong className="text-[var(--text-primary)]">Block {ev.request}</strong>
                        </p>
                        {ev.evicted && (
                          <p className="text-[var(--accent-vermilion-text)]">
                            Evicted: Block {ev.evicted}
                          </p>
                        )}
                        {hasPrefetch && (
                          <p className="text-[var(--accent-amber-text)]">
                            Prefetched: Block {ev.prefetch?.block}
                          </p>
                        )}
                        <p className="text-[10px] text-[var(--text-muted)]">
                          Resident: [{ev.cacheAfter?.join(', ')}]
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-5 flex items-center justify-center text-center">
            <span className="text-xs font-mono text-[var(--text-muted)]">
              Timeline standby. Click Play or Run Simulation to load the access sequence.
            </span>
          </div>
        )}
      </div>

      {/* Control Buttons & Speed Bar */}
      <div className="flex flex-wrap items-center justify-between pt-3 border-t border-[var(--border-subtle)] gap-3">
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onJumpToStart}
            disabled={totalSteps === 0 || isAtStart || isPlaying}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Jump to Beginning"
            aria-label="Jump to Beginning"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onStepBackward}
            disabled={totalSteps === 0 || isAtStart || isPlaying}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          <button
            type="button"
            onClick={onTogglePlay}
            disabled={totalSteps === 0}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[var(--accent-vermilion)] hover:bg-[var(--accent-vermilion-hover)] text-white text-xs font-bold shadow-xs ui-interactive disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isAtEnd ? 'Replay' : 'Play'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onStepForward}
            disabled={totalSteps === 0 || isAtEnd || isPlaying}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Next Step"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onJumpToEnd}
            disabled={totalSteps === 0 || isAtEnd || isPlaying}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Jump to End"
            aria-label="Jump to End"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onReset}
            disabled={totalSteps === 0}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Reset to Step 0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[var(--text-muted)] font-medium text-[11px]">Speed:</span>
          <div className="flex items-center p-0.5 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]">
            {speedOptions.map((s) => (
              <button
                key={`speed-${s}`}
                type="button"
                onClick={() => onSpeedChange(s)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-colors cursor-pointer ${
                  speed === s
                    ? 'bg-[var(--brand-sage)] text-[#F1EEE3] font-bold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
                title={`Playback delay: ${SPEED_DELAYS[s]} ms per access`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
