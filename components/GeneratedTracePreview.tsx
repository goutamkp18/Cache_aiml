'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Copy,
  Check,
  RefreshCw,
  Play,
  CheckCircle2,
  Cpu,
  Layers,
  Workflow,
  Sparkles,
  SlidersHorizontal,
  AlertTriangle
} from 'lucide-react'
import type { WorkloadType, PolicyType } from './ConfigToolbar'
import type { SimulationAppState } from '@/components/cache-simulator'

interface GeneratedTracePreviewProps {
  trace: string[]
  workload: WorkloadType | 'Custom Trace'
  traceLength: number
  cacheSize: number
  policy: PolicyType
  appState: SimulationAppState
  currentStep?: number
  isCustomMode?: boolean
  isCustomValidated?: boolean
  customValidationError?: string | null
  onValidateSequence?: () => void
  onGenerateNewSequence: () => void
  onRunSimulation: () => void
  isComputing?: boolean
}

export default function GeneratedTracePreview({
  trace,
  workload,
  traceLength,
  cacheSize,
  policy,
  appState,
  currentStep = 0,
  isCustomMode = false,
  isCustomValidated = true,
  customValidationError = null,
  onValidateSequence,
  onGenerateNewSequence,
  onRunSimulation,
  isComputing = false,
}: GeneratedTracePreviewProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyTrace = () => {
    if (trace.length === 0) return
    const text = trace.join(', ')
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isReady = appState === 'TRACE_GENERATED'
  const isPostCompute =
    appState === 'READY_FOR_PLAYBACK' ||
    appState === 'PLAYING' ||
    appState === 'PAUSED' ||
    appState === 'COMPLETED'

  const isRunDisabled = isComputing || trace.length === 0 || (isCustomMode && !isCustomValidated)

  return (
    <div className="w-full bg-[#111827] border border-[#1e293b] rounded-2xl p-4 sm:p-5 shadow-xl transition-all space-y-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-1/4 w-80 h-32 bg-[#12CBEA]/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Row: Title, Metadata Badges & Status */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[#1e293b]/80 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#12CBEA] to-[#0284c7] flex items-center justify-center text-white shadow-[0_0_10px_rgba(18,203,234,0.4)]">
            <SlidersHorizontal className="w-4 h-4 text-[#080B12]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase">
                Generated Memory Access Sequence
              </h2>
              <span className="text-[10px] font-mono text-[#94a3b8] hidden sm:inline">
                ({trace.length} Requests)
              </span>
            </div>
            <p className="text-[11px] text-[#94a3b8]">
              Review the exact memory trace before executing cache replacement and prefetching.
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div>
          {isComputing ? (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping-subtle" />
              <span>Computing Simulation...</span>
            </span>
          ) : isCustomMode && customValidationError ? (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/40 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{customValidationError}</span>
            </span>
          ) : isCustomMode && !isCustomValidated ? (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/15 text-amber-400 border border-amber-500/40 flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Custom Trace Modified &bull; Validation Required</span>
            </span>
          ) : isCustomMode && isCustomValidated ? (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/40 flex items-center gap-1.5 shadow-[0_0_10px_rgba(34,197,94,0.25)]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
              <span>Trace Validated &bull; Ready to Execute</span>
            </span>
          ) : isReady ? (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#22c55e]/15 text-[#22c55e] border border-[#22c55e]/40 flex items-center gap-1.5 shadow-[0_0_10px_rgba(34,197,94,0.25)]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
              <span>Trace Generated &bull; Ready to Execute</span>
            </span>
          ) : isPostCompute ? (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#12CBEA]/15 text-[#12CBEA] border border-[#12CBEA]/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#12CBEA]" />
              <span>Simulation Ready for Playback</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#172235] text-[#94a3b8] border border-[#1e293b]">
              Standby
            </span>
          )}
        </div>
      </div>

      {/* Configuration Metadata Strip */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* Workload */}
        <span className="px-2.5 py-1 rounded-lg bg-[#0c121e] border border-[#1e293b] text-[#94a3b8] flex items-center gap-1.5 font-medium">
          <Workflow className="w-3.5 h-3.5 text-[#12CBEA]" />
          <span>Workload:</span>
          <strong className="text-white font-mono">{workload}</strong>
        </span>

        {/* Trace Length */}
        <span className="px-2.5 py-1 rounded-lg bg-[#0c121e] border border-[#1e293b] text-[#94a3b8] flex items-center gap-1.5 font-medium">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#38bdf8]" />
          <span>Trace Length:</span>
          <strong className="text-white font-mono">{trace.length} Blocks</strong>
        </span>

        {/* Cache Capacity */}
        <span className="px-2.5 py-1 rounded-lg bg-[#0c121e] border border-[#1e293b] text-[#94a3b8] flex items-center gap-1.5 font-medium">
          <Layers className="w-3.5 h-3.5 text-[#12CBEA]" />
          <span>Cache Capacity:</span>
          <strong className="text-white font-mono">{cacheSize} Slots</strong>
        </span>

        {/* Policy */}
        <span className="px-2.5 py-1 rounded-lg bg-[#0c121e] border border-[#1e293b] text-[#94a3b8] flex items-center gap-1.5 font-medium">
          <Cpu className="w-3.5 h-3.5 text-[#FF454F]" />
          <span>Policy:</span>
          <strong className="text-white font-mono">{policy}</strong>
        </span>
      </div>

      {/* Visual Memory Blocks Chip Sequence with Arrows */}
      <div className="py-2">
        <div
          className="flex items-center gap-2 overflow-x-auto py-3 px-2 rounded-xl bg-[#0c121e]/90 border border-[#1a263a] scrollbar-thin shadow-inner"
          style={{ scrollbarWidth: 'thin' }}
        >
          {trace.length > 0 ? (
            trace.map((block, idx) => {
              const isFirst = idx === 0
              const isLast = idx === trace.length - 1
              const isCurrent = isPostCompute && idx === currentStep

              return (
                <React.Fragment key={`trace-chip-${idx}-${block}`}>
                  {/* Block Chip */}
                  <div
                    className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[44px] h-12 px-2.5 rounded-xl border text-center transition-all relative ${
                      isCurrent
                        ? 'bg-[#182338] border-2 border-[#12CBEA] shadow-[0_0_12px_rgba(18,203,234,0.5)] scale-105 z-10'
                        : isFirst
                        ? 'bg-[#064e3b]/30 border-[#10b981]/50 text-white shadow-sm'
                        : isLast
                        ? 'bg-[#7f1d1d]/30 border-[#ef4444]/50 text-white shadow-sm'
                        : 'bg-[#111827] border-[#1e293b] text-[#F8FAFC]'
                    }`}
                    title={`Request #${idx + 1}: Block ${block}${isFirst ? ' (Start)' : ''}${isLast ? ' (End)' : ''}`}
                  >
                    {/* First / Last Micro Label */}
                    {isFirst && (
                      <span className="text-[8px] font-bold tracking-widest text-[#22c55e] uppercase">
                        START
                      </span>
                    )}
                    {isLast && (
                      <span className="text-[8px] font-bold tracking-widest text-[#FF454F] uppercase">
                        END
                      </span>
                    )}

                    <span className="font-mono font-black text-sm sm:text-base">
                      {block}
                    </span>

                    <span className="text-[8px] font-mono text-[#64748b]">
                      #{idx + 1}
                    </span>
                  </div>

                  {/* Subtle Arrow pointing to next block */}
                  {!isLast && (
                    <ArrowRight className="w-3.5 h-3.5 text-[#334155] flex-shrink-0" />
                  )}
                </React.Fragment>
              )
            })
          ) : (
            <div className="py-4 px-6 text-center text-xs text-[#64748b] w-full">
              {isCustomMode
                ? 'Enter comma or space separated blocks above to preview sequence...'
                : 'Generating memory trace from workload pattern...'}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[#1e293b]/80 gap-3">
        {/* Left Actions */}
        <div className="flex items-center gap-2">
          {/* Copy Trace Button */}
          <button
            onClick={handleCopyTrace}
            disabled={trace.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#172235] hover:bg-[#1e2c44] border border-[#1e293b] text-[#94a3b8] hover:text-white text-xs font-semibold transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#22c55e]" />
                <span className="text-[#22c55e]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Trace</span>
              </>
            )}
          </button>

          {/* If Custom Mode: Validate Sequence Button */}
          {isCustomMode ? (
            <button
              onClick={onValidateSequence}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all active:scale-95 cursor-pointer ${
                !isCustomValidated
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 font-bold'
                  : 'bg-[#172235] hover:bg-[#1e2c44] border-[#1e293b] text-[#94a3b8] hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
              <span>Validate Sequence</span>
            </button>
          ) : (
            /* Auto Mode: Generate New Sequence Button */
            <button
              onClick={onGenerateNewSequence}
              disabled={isComputing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#172235] hover:bg-[#1e2c44] border border-[#1e293b] text-[#94a3b8] hover:text-[#12CBEA] text-xs font-semibold transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
              title="Generate a different sequence with a new random seed"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Generate New Sequence</span>
            </button>
          )}
        </div>

        {/* Right Primary Action: RUN SIMULATION */}
        <div>
          <button
            onClick={onRunSimulation}
            disabled={isRunDisabled}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#FF454F] to-[#e11d48] hover:from-[#ff5e67] hover:to-[#f43f5e] text-white text-xs font-bold shadow-[0_0_18px_rgba(255,69,79,0.45)] transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isComputing ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Executing Simulation...</span>
              </>
            ) : isCustomMode && !isCustomValidated ? (
              <span>Validate Sequence First</span>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Simulation on This Trace</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
