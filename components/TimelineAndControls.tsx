'use client'

import React, { useRef, useEffect } from 'react'
import { Play, Pause, SkipForward, RotateCcw } from 'lucide-react'
import type { SimulationEvent } from '@/simulation/simulationTypes'

interface TimelineAndControlsProps {
  events: SimulationEvent[]
  currentStep: number
  onStepChange: (step: number) => void
  isPlaying: boolean
  onTogglePlay: () => void
  onStepForward: () => void
  onReset: () => void
  speed: number
  onSpeedChange: (speed: number) => void
}

export default function TimelineAndControls({
  events,
  currentStep,
  onStepChange,
  isPlaying,
  onTogglePlay,
  onStepForward,
  onReset,
  speed,
  onSpeedChange,
}: TimelineAndControlsProps) {
  const timelineScrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll timeline to keep current event in view
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

  return (
    <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm transition-colors mt-4">
      {/* Timeline Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-muted)] mb-2 px-1">
          <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-crimson)]" />
            Simulation Timeline
          </span>
          <span className="text-[11px] font-mono">
            Access {events.length > 0 ? currentStep + 1 : 0} of {events.length}
          </span>
        </div>

        {/* Scrollable Event Chips Strip */}
        <div
          ref={timelineScrollRef}
          className="flex items-center gap-1.5 overflow-x-auto pb-2 pt-1 px-1 scrollbar-thin"
        >
          {events.map((ev, idx) => {
            const isCurrent = idx === currentStep
            const isPast = idx < currentStep
            const isHit = ev.result === 'HIT'

            return (
              <button
                key={`timeline-chip-${idx}`}
                data-step={idx}
                onClick={() => onStepChange(idx)}
                className={`flex-shrink-0 flex flex-col items-center justify-center w-12 sm:w-14 py-1.5 px-1 rounded-lg border text-center transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-[var(--accent-crimson-subtle)] border-[var(--accent-crimson)] ring-2 ring-[var(--accent-crimson)]/30 font-bold scale-105'
                    : isPast
                    ? 'bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] opacity-90 hover:opacity-100 hover:border-[var(--text-muted)]'
                    : 'bg-transparent border-[var(--border-subtle)] opacity-50 hover:opacity-80'
                }`}
                title={`Jump to step ${idx + 1}: Block ${ev.request} (${ev.result})`}
              >
                <span
                  className={`text-sm sm:text-base font-bold font-mono ${
                    isCurrent
                      ? 'text-[var(--accent-crimson)]'
                      : 'text-[var(--text-primary)]'
                  }`}
                >
                  {ev.request}
                </span>

                <span
                  className={`text-[9px] font-extrabold uppercase mt-0.5 tracking-tight ${
                    isPast || isCurrent
                      ? isHit
                        ? 'text-[var(--accent-green)]'
                        : 'text-[var(--accent-crimson)]'
                      : 'text-[var(--text-muted)]'
                  }`}
                >
                  {isPast || isCurrent ? ev.result : '...'}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Controls Bar: Playback Actions & Speed Toggle */}
      <div className="pt-3 border-t border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3">
        {/* Playback Buttons */}
        <div className="flex items-center gap-2">
          {/* Play / Pause Toggle Button */}
          <button
            onClick={onTogglePlay}
            className="px-4 py-2 rounded-lg bg-[var(--accent-crimson)] hover:bg-[var(--accent-crimson-hover)] text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
            title={isPlaying ? 'Pause simulation' : 'Play simulation'}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Play</span>
              </>
            )}
          </button>

          {/* Step Button */}
          <button
            onClick={onStepForward}
            disabled={isPlaying || currentStep >= events.length - 1}
            className="px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-40 active:scale-95"
            title="Advance one step"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span>Step</span>
          </button>

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-elevated)] text-[var(--text-primary)] text-xs font-medium flex items-center gap-1.5 transition-colors active:scale-95"
            title="Reset to step 1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Playback Speed Toggles */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] mr-1">
            Speed:
          </span>
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              onClick={() => onSpeedChange(s)}
              className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-all ${
                speed === s
                  ? 'bg-[var(--accent-crimson-subtle)] text-[var(--accent-crimson)] border border-[var(--accent-crimson-border)] font-bold shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] border border-transparent'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
