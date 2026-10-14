'use client'

import React, { useState } from 'react'
import {
  Activity,
  Database,
  Cpu,
  FileText,
  Play,
  RotateCw,
  Edit3,
  Check
} from 'lucide-react'

export type WorkloadType = 'Dynamic' | 'Looping' | 'Random' | 'Sequential'
export type PolicyType = 'ML + Prefetch' | 'ML Replacement' | 'LRU' | 'FIFO' | 'Random'

interface ConfigToolbarProps {
  workload: WorkloadType
  onWorkloadChange: (w: WorkloadType) => void
  cacheSize: number
  onCacheSizeChange: (size: number) => void
  policy: PolicyType
  onPolicyChange: (p: PolicyType) => void
  traceLength: number
  onTraceLengthChange: (len: number) => void
  customTrace: string
  onCustomTraceChange: (trace: string) => void
  onRunSimulation: () => void
  isLoading: boolean
}

export default function ConfigToolbar({
  workload,
  onWorkloadChange,
  cacheSize,
  onCacheSizeChange,
  policy,
  onPolicyChange,
  traceLength,
  onTraceLengthChange,
  customTrace,
  onCustomTraceChange,
  onRunSimulation,
  isLoading,
}: ConfigToolbarProps) {
  const [showCustomInput, setShowCustomInput] = useState(false)

  return (
    <div className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 sm:p-4 shadow-sm transition-colors">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Workload Type */}
        <div className="flex items-center gap-2.5 min-w-[150px] flex-1 sm:flex-initial">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-crimson-subtle)] border border-[var(--accent-crimson-border)] flex items-center justify-center text-[var(--accent-crimson)] flex-shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="select-workload" className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
              Workload Type
            </label>
            <select
              id="select-workload"
              value={workload}
              onChange={(e) => onWorkloadChange(e.target.value as WorkloadType)}
              className="mt-0.5 text-xs font-semibold bg-transparent text-[var(--text-primary)] border-none outline-none cursor-pointer focus:ring-0 p-0"
            >
              <option value="Dynamic">Dynamic (Phased)</option>
              <option value="Looping">Looping (Cyclic)</option>
              <option value="Random">Random (Uniform)</option>
              <option value="Sequential">Sequential (Streaming)</option>
            </select>
          </div>
        </div>

        <div className="hidden sm:block w-[1px] h-8 bg-[var(--border-subtle)]" />

        {/* Cache Size */}
        <div className="flex items-center gap-2.5 min-w-[120px] flex-1 sm:flex-initial">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-crimson-subtle)] border border-[var(--accent-crimson-border)] flex items-center justify-center text-[var(--accent-crimson)] flex-shrink-0">
            <Database className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="select-cache-size" className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
              Cache Size
            </label>
            <select
              id="select-cache-size"
              value={cacheSize}
              onChange={(e) => onCacheSizeChange(Number(e.target.value))}
              className="mt-0.5 text-xs font-semibold bg-transparent text-[var(--text-primary)] border-none outline-none cursor-pointer focus:ring-0 p-0"
            >
              <option value="2">2 Slots</option>
              <option value="4">4 Slots (Default)</option>
              <option value="8">8 Slots</option>
              <option value="16">16 Slots</option>
            </select>
          </div>
        </div>

        <div className="hidden sm:block w-[1px] h-8 bg-[var(--border-subtle)]" />

        {/* Replacement Policy */}
        <div className="flex items-center gap-2.5 min-w-[170px] flex-1 sm:flex-initial">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-crimson-subtle)] border border-[var(--accent-crimson-border)] flex items-center justify-center text-[var(--accent-crimson)] flex-shrink-0">
            <Cpu className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="select-policy" className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
              Replacement Policy
            </label>
            <select
              id="select-policy"
              value={policy}
              onChange={(e) => onPolicyChange(e.target.value as PolicyType)}
              className="mt-0.5 text-xs font-semibold bg-transparent text-[var(--text-primary)] border-none outline-none cursor-pointer focus:ring-0 p-0"
            >
              <option value="ML + Prefetch">ML + Prefetch (Full AI)</option>
              <option value="ML Replacement">ML Replacement (RF)</option>
              <option value="LRU">LRU (Least Recently Used)</option>
              <option value="FIFO">FIFO (First In First Out)</option>
              <option value="Random">Random (Baseline)</option>
            </select>
          </div>
        </div>

        <div className="hidden sm:block w-[1px] h-8 bg-[var(--border-subtle)]" />

        {/* Trace Length */}
        <div className="flex items-center gap-2.5 min-w-[120px] flex-1 sm:flex-initial">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-crimson-subtle)] border border-[var(--accent-crimson-border)] flex items-center justify-center text-[var(--accent-crimson)] flex-shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <label htmlFor="select-trace-length" className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
              Trace Length
            </label>
            <select
              id="select-trace-length"
              value={traceLength}
              onChange={(e) => onTraceLengthChange(Number(e.target.value))}
              className="mt-0.5 text-xs font-semibold bg-transparent text-[var(--text-primary)] border-none outline-none cursor-pointer focus:ring-0 p-0"
            >
              <option value="10">10 Accesses</option>
              <option value="15">15 Accesses</option>
              <option value="20">20 Accesses</option>
              <option value="30">30 Accesses</option>
            </select>
          </div>
        </div>

        {/* Custom Trace Toggle */}
        <button
          type="button"
          onClick={() => setShowCustomInput(!showCustomInput)}
          className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
            customTrace.trim().length > 0 || showCustomInput
              ? 'bg-[var(--accent-cyan-subtle)] border-[var(--accent-cyan-border)] text-[var(--accent-cyan)] font-semibold'
              : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)]'
          }`}
          title="Provide custom sequence of memory addresses"
        >
          <Edit3 className="w-3.5 h-3.5" />
          <span>Custom Trace</span>
        </button>

        {/* Primary Run Simulation Action */}
        <button
          type="button"
          onClick={onRunSimulation}
          disabled={isLoading}
          className="ml-auto w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[var(--accent-crimson)] hover:bg-[var(--accent-crimson-hover)] text-white font-semibold text-xs tracking-wide uppercase flex items-center justify-center gap-2 shadow-sm transition-all duration-150 disabled:opacity-60 active:scale-95"
        >
          {isLoading ? (
            <>
              <RotateCw className="w-4 h-4 animate-spin" />
              <span>Simulating...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run Simulation</span>
            </>
          )}
        </button>
      </div>

      {/* Collapsible Custom Trace Input Box */}
      {showCustomInput && (
        <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-center gap-2">
          <div className="flex-1 w-full">
            <label htmlFor="custom-trace-input" className="block text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">
              Custom Memory Block Sequence (Space or comma separated, e.g.: A B C D E A B C D)
            </label>
            <input
              id="custom-trace-input"
              type="text"
              placeholder="e.g. A B C D E F A B C D"
              value={customTrace}
              onChange={(e) => onCustomTraceChange(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-cyan)] font-mono"
            />
          </div>
          {customTrace.trim().length > 0 && (
            <button
              onClick={() => onCustomTraceChange('')}
              className="mt-auto text-[11px] text-[var(--accent-crimson)] hover:underline whitespace-nowrap self-end sm:self-center"
            >
              Clear Custom Trace
            </button>
          )}
        </div>
      )}
    </div>
  )
}
