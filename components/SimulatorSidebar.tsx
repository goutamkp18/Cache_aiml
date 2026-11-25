'use client'

import React, { useState, memo } from 'react'
import {
  Play,
  Shuffle,
  CheckCircle2,
  RotateCcw,
  Cpu,
  Workflow,
  SlidersHorizontal,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Layers
} from 'lucide-react'
import type { WorkloadType, PolicyType } from './ConfigToolbar'

interface SimulatorSidebarProps {
  workload: WorkloadType
  onWorkloadChange: (w: WorkloadType) => void
  cacheSize: number
  onCacheSizeChange: (s: number) => void
  policy: PolicyType
  onPolicyChange: (p: PolicyType) => void
  traceLength: number
  onTraceLengthChange: (l: number) => void
  traceMode: 'auto' | 'manual'
  onTraceModeChange: (m: 'auto' | 'manual') => void
  customTraceInput: string
  onCustomTraceInputChange: (v: string) => void
  isCustomValidated?: boolean
  customValidationError?: string | null
  parsedCustomCount?: number
  onGenerateSequence: () => void
  onValidateSequence: () => void
  onClear: () => void
  onRunSimulation: () => void
  isLoading?: boolean
}

function SimulatorSidebar({
  workload,
  onWorkloadChange,
  cacheSize,
  onCacheSizeChange,
  policy,
  onPolicyChange,
  traceLength,
  onTraceLengthChange,
  traceMode,
  onTraceModeChange,
  customTraceInput,
  onCustomTraceInputChange,
  isCustomValidated = true,
  customValidationError = null,
  parsedCustomCount = 0,
  onGenerateSequence,
  onValidateSequence,
  onClear,
  onRunSimulation,
  isLoading = false,
}: SimulatorSidebarProps) {
  const [mobileExpanded, setMobileExpanded] = useState(true)

  const isRunDisabled =
    isLoading || (traceMode === 'manual' && (!isCustomValidated || parsedCustomCount === 0))

  const activeWorkloadLabel = traceMode === 'manual' ? 'Custom Trace' : workload

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 lg:sticky lg:top-20 rounded-2xl bg-[var(--bg-sidebar)] text-[var(--text-sidebar)] border border-[var(--border-sidebar)] shadow-[var(--shadow-elevated)] p-4 sm:p-5 flex flex-col gap-4 select-none transition-colors">
      {/* Desktop Header */}
      <div className="hidden lg:flex items-center justify-between pb-2.5 border-b border-[var(--border-sidebar)]">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#F1EEE3]" strokeWidth={1.9} />
          <span className="text-[11px] font-bold tracking-[0.08em] uppercase text-[#F1EEE3]">
            Experiment Config
          </span>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[var(--bg-sidebar-surface)] border border-[var(--border-sidebar)] text-[#F1EEE3] tabular-nums">
          {cacheSize} Slots
        </span>
      </div>

      {/* Mobile / Tablet Collapsible Header */}
      <div className="flex lg:hidden items-center justify-between gap-2 pb-2.5 border-b border-[var(--border-sidebar)]">
        <div className="min-w-0">
          <span className="text-[10px] uppercase tracking-[0.08em] font-bold text-[var(--text-sidebar-muted)] block">
            Experiment Config
          </span>
          <p className="text-xs font-semibold text-[#F1EEE3] truncate">
            {activeWorkloadLabel} &bull; {cacheSize} Slots &bull; {policy}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMobileExpanded((prev) => !prev)}
          className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-sidebar-surface)] border border-[var(--border-sidebar)] text-xs font-semibold text-[#F1EEE3] flex items-center gap-1 cursor-pointer ui-interactive"
          aria-expanded={mobileExpanded}
        >
          <span>{mobileExpanded ? 'Collapse' : 'Configure'}</span>
          {mobileExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      <div className={`${mobileExpanded ? 'flex' : 'hidden'} lg:flex flex-col gap-3.5`}>
        {/* Workload Selector */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="sidebar-workload-select"
            className="text-[11px] font-medium text-[var(--text-sidebar-muted)] flex items-center gap-1.5 px-0.5"
          >
            <Workflow className="w-3.5 h-3.5 text-[#F1EEE3]" strokeWidth={1.8} />
            <span>Workload Pattern</span>
          </label>
          <div className="relative group">
            <select
              id="sidebar-workload-select"
              value={traceMode === 'manual' ? 'Custom Trace' : workload}
              onChange={(e) => {
                const val = e.target.value
                if (val === 'Custom Trace') {
                  onTraceModeChange('manual')
                } else {
                  onTraceModeChange('auto')
                  onWorkloadChange(val as WorkloadType)
                }
              }}
              className="w-full appearance-none px-3 py-2.5 pr-8 rounded-xl bg-[var(--bg-sidebar-surface-strong)] hover:bg-black/25 border border-[var(--border-sidebar)] text-[#F1EEE3] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#F1EEE3]/35 cursor-pointer transition-colors"
            >
              <option value="Dynamic" className="bg-[#29352D] text-[#F1EEE3]">
                Dynamic
              </option>
              <option value="Sequential" className="bg-[#29352D] text-[#F1EEE3]">
                Sequential
              </option>
              <option value="Looping" className="bg-[#29352D] text-[#F1EEE3]">
                Looping
              </option>
              <option value="Random" className="bg-[#29352D] text-[#F1EEE3]">
                Random
              </option>
              <option value="Custom Trace" className="bg-[#29352D] text-[#F1EEE3]">
                Custom Trace
              </option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-sidebar-muted)] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transition-transform group-hover:translate-y-[-40%]" />
          </div>
        </div>

        {/* Controlled Custom Trace Input */}
        {traceMode === 'manual' && (
          <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-[var(--bg-sidebar-surface-strong)] border border-[var(--border-sidebar)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-sidebar-muted)]">
                Custom Trace
              </span>
              <span className="text-[10px] font-mono text-[#F1EEE3] font-bold tabular-nums">
                {parsedCustomCount} Blocks
              </span>
            </div>

            <textarea
              value={customTraceInput}
              onChange={(e) => onCustomTraceInputChange(e.target.value)}
              placeholder="e.g. S, B, C, D, A, B, C, D"
              rows={3}
              aria-label="Custom memory trace sequence"
              className="w-full px-2.5 py-2 rounded-lg bg-[#1C2420]/70 border border-[var(--border-sidebar)] text-xs font-mono text-[#F1EEE3] placeholder:text-[#F1EEE3]/40 focus:outline-none focus:ring-2 focus:ring-[#F1EEE3]/35 resize-none leading-relaxed"
            />

            {customValidationError ? (
              <span className="text-[10px] text-[#FFD0D0] font-semibold flex items-center gap-1 mt-0.5">
                <AlertTriangle className="w-3 h-3 flex-shrink-0 text-[#FF6666]" />
                <span>{customValidationError}</span>
              </span>
            ) : isCustomValidated ? (
              <span className="text-[10px] text-[#C8E6D0] font-semibold flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                <span>TRACE VALIDATED — READY</span>
              </span>
            ) : (
              <span className="text-[10px] text-[#F4D19B] font-semibold flex items-center gap-1 mt-0.5">
                <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                <span>MODIFIED — VALIDATE TRACE</span>
              </span>
            )}
          </div>
        )}

        {/* Trace Length Slider (Auto Mode) */}
        {traceMode === 'auto' && (
          <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[var(--bg-sidebar-surface-strong)] border border-[var(--border-sidebar)]">
            <label
              htmlFor="sidebar-trace-length"
              className="text-[11px] font-medium text-[var(--text-sidebar-muted)] flex items-center justify-between"
            >
              <span>Trace Length</span>
              <span className="font-mono text-[#F1EEE3] text-xs font-bold tabular-nums">
                {traceLength} Blocks
              </span>
            </label>
            <input
              id="sidebar-trace-length"
              type="range"
              min={4}
              max={30}
              step={1}
              value={traceLength}
              onChange={(e) => onTraceLengthChange(Number(e.target.value))}
              className="w-full accent-[#F20B0B] cursor-pointer mt-1"
            />
          </div>
        )}

        {/* Cache Capacity Selector */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="sidebar-capacity-select"
            className="text-[11px] font-medium text-[var(--text-sidebar-muted)] flex items-center gap-1.5 px-0.5"
          >
            <Layers className="w-3.5 h-3.5 text-[#F1EEE3]" strokeWidth={1.8} />
            <span>Cache Capacity</span>
          </label>
          <div className="relative group">
            <select
              id="sidebar-capacity-select"
              value={cacheSize}
              onChange={(e) => onCacheSizeChange(Number(e.target.value))}
              className="w-full appearance-none px-3 py-2.5 pr-8 rounded-xl bg-[var(--bg-sidebar-surface-strong)] hover:bg-black/25 border border-[var(--border-sidebar)] text-[#F1EEE3] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#F1EEE3]/35 cursor-pointer transition-colors"
            >
              <option value={2} className="bg-[#29352D] text-[#F1EEE3]">
                2 Slots
              </option>
              <option value={4} className="bg-[#29352D] text-[#F1EEE3]">
                4 Slots
              </option>
              <option value={8} className="bg-[#29352D] text-[#F1EEE3]">
                8 Slots
              </option>
              <option value={16} className="bg-[#29352D] text-[#F1EEE3]">
                16 Slots
              </option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-sidebar-muted)] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transition-transform group-hover:translate-y-[-40%]" />
          </div>
        </div>

        {/* Replacement Policy Selector */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="sidebar-policy-select"
            className="text-[11px] font-medium text-[var(--text-sidebar-muted)] flex items-center gap-1.5 px-0.5"
          >
            <Cpu className="w-3.5 h-3.5 text-[#F1EEE3]" strokeWidth={1.8} />
            <span>Replacement Policy</span>
          </label>
          <div className="relative group">
            <select
              id="sidebar-policy-select"
              value={policy}
              onChange={(e) => onPolicyChange(e.target.value as PolicyType)}
              className="w-full appearance-none px-3 py-2.5 pr-8 rounded-xl bg-[var(--bg-sidebar-surface-strong)] hover:bg-black/25 border border-[var(--border-sidebar)] text-[#F1EEE3] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#F1EEE3]/35 cursor-pointer transition-colors"
            >
              <option value="ML + Prefetch" className="bg-[#29352D] text-[#F1EEE3]">
                ML + Prefetch
              </option>
              <option value="ML Replacement" className="bg-[#29352D] text-[#F1EEE3]">
                ML Replacement
              </option>
              <option value="LRU" className="bg-[#29352D] text-[#F1EEE3]">
                LRU
              </option>
              <option value="FIFO" className="bg-[#29352D] text-[#F1EEE3]">
                FIFO
              </option>
              <option value="Random" className="bg-[#29352D] text-[#F1EEE3]">
                Random
              </option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-sidebar-muted)] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transition-transform group-hover:translate-y-[-40%]" />
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex flex-col gap-2 pt-3 mt-1 border-t border-[var(--border-sidebar)]">
          <span className="text-[10px] font-bold tracking-[0.08em] text-[var(--text-sidebar-muted)] uppercase px-0.5">
            Controls
          </span>

          {traceMode === 'auto' && (
            <button
              type="button"
              onClick={onGenerateSequence}
              disabled={isLoading}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-sidebar-surface)] hover:bg-[var(--bg-sidebar-surface-strong)] border border-[var(--border-sidebar)] text-[#F1EEE3] text-xs font-semibold cursor-pointer ui-interactive disabled:opacity-45"
              title="Generate a new trace sequence from backend generator"
            >
              <Shuffle className="w-3.5 h-3.5 text-[#F1EEE3]" strokeWidth={1.8} />
              <span>Generate Sequence</span>
            </button>
          )}

          <button
            type="button"
            onClick={onValidateSequence}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer ui-interactive ${
              traceMode === 'manual' && !isCustomValidated
                ? 'bg-[#E8B55D]/20 border-[#E8B55D] text-[#F1EEE3]'
                : 'bg-[var(--bg-sidebar-surface)] hover:bg-[var(--bg-sidebar-surface-strong)] border-[var(--border-sidebar)] text-[#F1EEE3]'
            }`}
            title="Validate trace block syntax and sequence length"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#C8E6D0]" strokeWidth={1.8} />
            <span>Validate Sequence</span>
          </button>

          <button
            type="button"
            onClick={onClear}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--bg-sidebar-surface)] hover:bg-[var(--bg-sidebar-surface-strong)] border border-[var(--border-sidebar)] text-[var(--text-sidebar-muted)] hover:text-[#F1EEE3] text-xs font-semibold cursor-pointer ui-interactive"
          >
            <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.8} />
            <span>Reset Simulation</span>
          </button>

          {/* Primary Vermilion CTA */}
          <button
            type="button"
            onClick={onRunSimulation}
            disabled={isRunDisabled}
            className="w-full mt-1.5 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent-vermilion)] hover:bg-[var(--accent-vermilion-hover)] text-white text-xs font-bold shadow-sm cursor-pointer ui-interactive disabled:opacity-45 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Simulating...</span>
              </>
            ) : traceMode === 'manual' && !isCustomValidated ? (
              <span>Validate Sequence First</span>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Simulation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  )
}

export default memo(SimulatorSidebar)
