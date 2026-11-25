'use client'

import React, { useState, memo } from 'react'
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

function GeneratedTracePreview({
  trace,
  workload,
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
    navigator.clipboard.writeText(trace.join(', '))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isReady = appState === 'TRACE_GENERATED'
  const isPostCompute =
    appState === 'READY_FOR_PLAYBACK' ||
    appState === 'PLAYING' ||
    appState === 'PAUSED' ||
    appState === 'COMPLETED'

  const isRunDisabled =
    isComputing || trace.length === 0 || (isCustomMode && !isCustomValidated)

  return (
    <div className="w-full glass-card rounded-2xl p-4 sm:p-5 space-y-3.5">
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[var(--border-subtle)] gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[var(--brand-sage)] flex items-center justify-center text-[#F1EEE3]">
            <SlidersHorizontal className="w-4 h-4" strokeWidth={1.85} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] tracking-[0.04em] uppercase">
                Generated Memory Access Sequence
              </h2>
              <span className="text-[11px] font-mono text-[var(--text-muted)] hidden sm:inline tabular-nums">
                ({trace.length} Requests)
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-secondary)]">
              Review the exact memory trace before executing cache replacement and prefetching.
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div>
          {isComputing ? (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[var(--accent-amber-subtle)] text-[var(--accent-amber-text)] border border-[var(--accent-amber-border)] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-amber)] animate-ping-subtle" />
              <span>Computing Simulation...</span>
            </span>
          ) : isCustomMode && customValidationError ? (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[var(--accent-vermilion-subtle)] text-[var(--accent-vermilion-text)] border border-[var(--accent-vermilion-border)] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{customValidationError}</span>
            </span>
          ) : isCustomMode && !isCustomValidated ? (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[var(--accent-amber-subtle)] text-[var(--accent-amber-text)] border border-[var(--accent-amber-border)] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Custom Trace Modified &bull; Validation Required</span>
            </span>
          ) : (isCustomMode && isCustomValidated) || isReady ? (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[var(--accent-sage-subtle)] text-[var(--accent-sage-text)] border border-[var(--accent-sage-border)] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {isCustomMode ? 'Trace Validated' : 'Trace Generated'} &bull; Ready to Execute
              </span>
            </span>
          ) : isPostCompute ? (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[var(--accent-sage-subtle)] text-[var(--accent-sage-text)] border border-[var(--accent-sage-border)] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulation Ready for Playback</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[var(--bg-surface-secondary)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
              Standby
            </span>
          )}
        </div>
      </div>

      {/* Configuration Metadata Strip */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] flex items-center gap-1.5 font-medium">
          <Workflow className="w-3.5 h-3.5 text-[var(--brand-sage)] dark:text-[var(--accent-sage-text)]" strokeWidth={1.8} />
          <span>Workload:</span>
          <strong className="text-[var(--text-primary)] font-mono">{workload}</strong>
        </span>

        <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] flex items-center gap-1.5 font-medium tabular-nums">
          <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--brand-sage)] dark:text-[var(--accent-sage-text)]" strokeWidth={1.8} />
          <span>Length:</span>
          <strong className="text-[var(--text-primary)] font-mono">{trace.length} Blocks</strong>
        </span>

        <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] flex items-center gap-1.5 font-medium tabular-nums">
          <Layers className="w-3.5 h-3.5 text-[var(--brand-sage)] dark:text-[var(--accent-sage-text)]" strokeWidth={1.8} />
          <span>Capacity:</span>
          <strong className="text-[var(--text-primary)] font-mono">{cacheSize} Slots</strong>
        </span>

        <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] flex items-center gap-1.5 font-medium">
          <Cpu className="w-3.5 h-3.5 text-[var(--accent-vermilion-text)]" strokeWidth={1.8} />
          <span>Policy:</span>
          <strong className="text-[var(--text-primary)] font-mono">{policy}</strong>
        </span>
      </div>

      {/* Visual Memory Blocks Chip Sequence */}
      <div className="flex items-center gap-2 overflow-x-auto py-2.5 px-3 rounded-xl glass-inset">
        {trace.length > 0 ? (
          trace.map((block, idx) => {
            const isFirst = idx === 0
            const isLast = idx === trace.length - 1
            const isCurrent = isPostCompute && idx === currentStep

            return (
              <React.Fragment key={`trace-chip-${idx}-${block}`}>
                <div
                  className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[44px] h-12 px-2.5 rounded-xl text-center transition-transform duration-150 relative ${
                    isCurrent
                      ? 'bg-[var(--brand-sage)] text-[#F1EEE3] border-2 border-[var(--brand-sage)] ring-2 ring-[var(--accent-vermilion)] scale-105 z-10 shadow-sm'
                      : isFirst
                      ? 'bg-[var(--accent-sage-subtle)] border border-[var(--accent-sage-border)] text-[var(--text-primary)]'
                      : isLast
                      ? 'bg-[var(--accent-vermilion-subtle)] border border-[var(--accent-vermilion-border)] text-[var(--text-primary)]'
                      : 'bg-[var(--bg-surface-solid)] border border-[var(--border-subtle)] text-[var(--text-primary)]'
                  }`}
                  title={`Request #${idx + 1}: Block ${block}${isFirst ? ' (Start)' : ''}${isLast ? ' (End)' : ''}`}
                >
                  {isFirst && !isCurrent && (
                    <span className="text-[7.5px] font-bold tracking-widest text-[var(--accent-sage-text)] uppercase leading-none">
                      START
                    </span>
                  )}
                  {isLast && !isCurrent && (
                    <span className="text-[7.5px] font-bold tracking-widest text-[var(--accent-vermilion-text)] uppercase leading-none">
                      END
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-[7.5px] font-bold tracking-widest text-[#F1EEE3] uppercase leading-none">
                      ACTIVE
                    </span>
                  )}

                  <span className="font-mono font-bold text-sm leading-tight mt-0.5">{block}</span>

                  <span
                    className={`text-[8px] font-mono tabular-nums leading-none ${
                      isCurrent ? 'text-[#F1EEE3]/80' : 'text-[var(--text-muted)]'
                    }`}
                  >
                    #{idx + 1}
                  </span>
                </div>

                {!isLast && (
                  <ArrowRight className="w-3.5 h-3.5 text-[var(--text-muted)] opacity-55 flex-shrink-0" />
                )}
              </React.Fragment>
            )
          })
        ) : (
          <div className="py-3 px-6 text-center text-xs text-[var(--text-muted)] w-full">
            {isCustomMode
              ? 'Enter comma or space separated blocks in the sidebar to preview sequence...'
              : 'Generating memory trace from workload pattern...'}
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="flex flex-wrap items-center justify-between pt-2 border-t border-[var(--border-subtle)] gap-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleCopyTrace}
            disabled={trace.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold cursor-pointer ui-interactive disabled:opacity-45"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[var(--accent-sage-text)]" />
                <span className="text-[var(--accent-sage-text)]">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" strokeWidth={1.8} />
                <span>Copy Trace</span>
              </>
            )}
          </button>

          {isCustomMode ? (
            <button
              type="button"
              onClick={onValidateSequence}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer ui-interactive ${
                !isCustomValidated
                  ? 'bg-[var(--accent-amber-subtle)] border-[var(--accent-amber-border)] text-[var(--accent-amber-text)] font-bold'
                  : 'bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-surface-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-sage-text)]" strokeWidth={1.8} />
              <span>Validate Sequence</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onGenerateNewSequence}
              disabled={isComputing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-surface-secondary)] hover:bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold cursor-pointer ui-interactive disabled:opacity-45"
              title="Generate a different sequence with a new random seed"
            >
              <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.8} />
              <span>Generate New Sequence</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={onRunSimulation}
          disabled={isRunDisabled}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent-vermilion)] hover:bg-[var(--accent-vermilion-hover)] text-white text-xs font-bold shadow-sm cursor-pointer ui-interactive disabled:opacity-45 disabled:cursor-not-allowed"
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
  )
}

export default memo(GeneratedTracePreview)
