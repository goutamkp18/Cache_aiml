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
  SlidersHorizontal,
  Compass,
  Zap,
  Info
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

  // Auto-scroll timeline so current step stays comfortably in view
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
    <div className="bg-[#111827] border border-[#1e293b] rounded-2xl p-4 sm:p-5 shadow-xl transition-colors space-y-3.5">
      {/* Top Header: Title, Access Counter, and Execution Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#1e293b]/80 gap-2">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#FF454F]" />
          <h3 className="text-xs font-bold text-white tracking-wide">
            Interactive Access Timeline
          </h3>
          <span className="text-[11px] font-mono text-[#94a3b8] hidden sm:inline">
            Access <strong className="text-white font-bold">{totalSteps > 0 ? currentStep + 1 : 0}</strong> of {totalSteps}
          </span>
        </div>

        {/* Execution Mode Selector (Step-by-Step vs Auto Playback) */}
        <div className="flex items-center p-0.5 rounded-xl bg-[#0c121e] border border-[#1e293b]">
          <button
            onClick={() => {
              if (isPlaying) onTogglePlay()
              onExecutionModeChange('step')
            }}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-wide transition-all cursor-pointer ${
              executionMode === 'step'
                ? 'bg-gradient-to-r from-[#FF454F] to-[#e11d48] text-white shadow-sm'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Step-by-Step (Manual)
          </button>
          <button
            onClick={() => onExecutionModeChange('auto')}
            className={`px-3 py-1 rounded-lg text-[10px] font-bold tracking-wide transition-all cursor-pointer ${
              executionMode === 'auto'
                ? 'bg-[#12CBEA]/20 text-[#12CBEA] border border-[#12CBEA]/40'
                : 'text-[#94a3b8] hover:text-white'
            }`}
          >
            Auto Playback
          </button>
        </div>
      </div>

      {/* Horizontal Access Tiles Strip with Interactive Tooltip */}
      <div className="relative">
        {totalSteps > 0 ? (
          <div
            ref={timelineScrollRef}
            className="flex items-center gap-2 overflow-x-auto py-3 px-1 scrollbar-thin"
            style={{ scrollbarWidth: 'thin' }}
          >
            {events.map((ev, idx) => {
              const isCurrent = idx === currentStep
              const isPast = idx < currentStep
              const isHit = ev.result === 'HIT'
              const hasPrefetch = ev.prefetch?.status === 'PREFETCHED'
              const hasEviction = !!ev.evicted || !!ev.selectedVictim

              return (
                <div
                  key={`timeline-tile-${idx}`}
                  className="relative flex-shrink-0"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <button
                    data-step={idx}
                    onClick={() => onStepChange(idx)}
                    className={`flex flex-col items-center justify-between w-12 h-16 py-1.5 px-1 rounded-xl transition-all cursor-pointer relative ${
                      isCurrent
                        ? 'bg-[#182338] border-2 border-[#FF454F] shadow-[0_0_14px_rgba(255,69,79,0.5)] scale-105 z-10'
                        : isPast
                        ? 'bg-[#0f1726] border border-[#1e293b] opacity-85 hover:opacity-100 hover:border-[#38bdf8]'
                        : 'bg-[#0a0f18]/60 border border-dashed border-[#1e293b] opacity-40 hover:opacity-75'
                    }`}
                  >
                    {/* Status Pip */}
                    <div className="absolute top-1 right-1 flex items-center gap-0.5">
                      {hasPrefetch && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#12CBEA] shadow-[0_0_4px_#12CBEA]" />
                      )}
                    </div>

                    {/* Block Letter */}
                    <div className="flex items-center justify-center font-mono font-black text-sm text-white relative">
                      <span>{ev.request}</span>
                      {hasPrefetch && (
                        <span className="text-[10px] text-[#12CBEA] font-bold absolute -top-1 -right-2">
                          *
                        </span>
                      )}
                    </div>

                    {/* Sub-Badge: HIT or MISS */}
                    <span
                      className={`text-[9px] font-black tracking-wider uppercase px-1 py-0.5 rounded ${
                        isHit
                          ? 'text-[#22c55e] bg-[#22c55e]/15'
                          : 'text-[#FF454F] bg-[#FF454F]/15'
                      }`}
                    >
                      {ev.result}
                    </span>
                  </button>

                  {/* Rich Floating Tooltip on Hover */}
                  {hoveredIdx === idx && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-48 p-2.5 rounded-xl bg-[#0c121e] border border-[#334155] shadow-2xl text-[11px] font-mono pointer-events-none">
                      <div className="flex items-center justify-between pb-1 border-b border-[#1e293b] font-bold text-white">
                        <span>Access #{idx + 1}</span>
                        <span className={isHit ? 'text-[#22c55e]' : 'text-[#FF454F]'}>
                          {ev.result}
                        </span>
                      </div>
                      <div className="pt-1.5 space-y-0.5 text-[#94a3b8]">
                        <p>Requested: <strong className="text-white">Block {ev.request}</strong></p>
                        {ev.evicted && (
                          <p className="text-[#FF454F]">Evicted: Block {ev.evicted}</p>
                        )}
                        {hasPrefetch && (
                          <p className="text-[#12CBEA]">Prefetched: Block {ev.prefetch?.block}</p>
                        )}
                        <p className="text-[10px] text-[#64748b]">
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
          <div className="py-6 flex items-center justify-center text-center">
            <span className="text-xs font-mono text-[#64748b]">
              Timeline standby. Click Play or Run Simulation to load the event sequence.
            </span>
          </div>
        )}
      </div>

      {/* Control Buttons & Playback Speed Bar */}
      <div className="flex flex-wrap items-center justify-between pt-3 border-t border-[#1e293b]/80 gap-3">
        {/* Playback Navigation Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Jump to Beginning */}
          <button
            onClick={onJumpToStart}
            disabled={totalSteps === 0 || isAtStart || isPlaying}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#172235] hover:bg-[#1e2c44] border border-[#1e293b] text-[#94a3b8] hover:text-white text-xs font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Jump to Beginning"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          {/* Previous Step */}
          <button
            onClick={onStepBackward}
            disabled={totalSteps === 0 || isAtStart || isPlaying}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#172235] hover:bg-[#1e2c44] border border-[#1e293b] text-white text-xs font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Previous Step"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Prev</span>
          </button>

          {/* Play / Pause Primary Button */}
          <button
            onClick={onTogglePlay}
            disabled={totalSteps === 0}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#FF454F] to-[#e11d48] hover:from-[#ff5e67] hover:to-[#f43f5e] text-white text-xs font-bold shadow-[0_0_14px_rgba(255,69,79,0.4)] transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
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

          {/* Next Step */}
          <button
            onClick={onStepForward}
            disabled={totalSteps === 0 || isAtEnd || isPlaying}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#172235] hover:bg-[#1e2c44] border border-[#1e293b] text-white text-xs font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Next Step"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Jump to End */}
          <button
            onClick={onJumpToEnd}
            disabled={totalSteps === 0 || isAtEnd || isPlaying}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#172235] hover:bg-[#1e2c44] border border-[#1e293b] text-[#94a3b8] hover:text-white text-xs font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            title="Jump to End"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            disabled={totalSteps === 0}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#172235] hover:bg-[#1e2c44] border border-[#1e293b] text-[#94a3b8] hover:text-white text-xs font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ml-1"
            title="Reset to Step 0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>

        {/* Playback Speeds with Exact Timing Labels */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#94a3b8] font-medium text-[11px]">Speed:</span>
          <div className="flex items-center p-0.5 rounded-lg bg-[#0c121e] border border-[#1e293b]">
            {speedOptions.map((s) => (
              <button
                key={`speed-${s}`}
                onClick={() => onSpeedChange(s)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold transition-all cursor-pointer ${
                  speed === s
                    ? 'bg-[#FF454F] text-white font-bold shadow-sm'
                    : 'text-[#94a3b8] hover:text-white'
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
