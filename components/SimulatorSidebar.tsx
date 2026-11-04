'use client'

import React from 'react'
import {
  Play,
  BarChart3,
  Layers,
  Settings,
  Shuffle,
  CheckCircle2,
  Trash2,
  Cpu,
  Workflow,
  Sparkles,
  SlidersHorizontal,
  AlertTriangle
} from 'lucide-react'
import type { WorkloadType, PolicyType } from './ConfigToolbar'

interface SimulatorSidebarProps {
  activeTab: 'simulator' | 'results' | 'how-it-works'
  onTabChange: (tab: 'simulator' | 'results' | 'how-it-works') => void
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

export default function SimulatorSidebar({
  activeTab,
  onTabChange,
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
  const isRunDisabled = isLoading || (traceMode === 'manual' && (!isCustomValidated || parsedCustomCount === 0))

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 flex flex-col gap-5 select-none">
      {/* Top Sidebar Navigation Tabs */}
      <div className="flex flex-col gap-1.5 p-1 rounded-xl bg-[#0c121e] border border-[#1e293b]">
        {/* Simulation */}
        <button
          onClick={() => onTabChange('simulator')}
          className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'simulator'
              ? 'bg-gradient-to-r from-[#FF454F] to-[#e11d48] text-white shadow-[0_0_12px_rgba(255,69,79,0.35)]'
              : 'text-[#94a3b8] hover:text-white hover:bg-[#172235]'
          }`}
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Simulation</span>
        </button>

        {/* Results */}
        <button
          onClick={() => onTabChange('results')}
          className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'results'
              ? 'bg-gradient-to-r from-[#FF454F] to-[#e11d48] text-white shadow-[0_0_12px_rgba(255,69,79,0.35)]'
              : 'text-[#94a3b8] hover:text-white hover:bg-[#172235]'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Results</span>
        </button>

        {/* How It Works */}
        <button
          onClick={() => onTabChange('how-it-works')}
          className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'how-it-works'
              ? 'bg-gradient-to-r from-[#FF454F] to-[#e11d48] text-white shadow-[0_0_12px_rgba(255,69,79,0.35)]'
              : 'text-[#94a3b8] hover:text-white hover:bg-[#172235]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>How It Works</span>
        </button>
      </div>

      {/* Section 1: EXPERIMENT CONFIG */}
      <div className="flex flex-col gap-3">
        <span className="text-[10px] font-bold tracking-wider text-[#64748b] uppercase px-1">
          EXPERIMENT CONFIG
        </span>

        {/* Workload Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-[#94a3b8] flex items-center gap-1.5 px-1">
            <Workflow className="w-3.5 h-3.5 text-[#12CBEA]" />
            <span>Workload</span>
          </label>
          <div className="relative">
            <select
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
              className="w-full appearance-none px-3 py-2 rounded-xl bg-[#111827] border border-[#1e293b] text-white text-xs font-semibold focus:outline-none focus:border-[#12CBEA] cursor-pointer"
            >
              <option value="Dynamic">Dynamic</option>
              <option value="Sequential">Sequential</option>
              <option value="Looping">Looping</option>
              <option value="Random">Random</option>
              <option value="Custom Trace">Custom Trace</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#94a3b8] pointer-events-none">
              ▾
            </span>
          </div>
        </div>

        {/* Controlled Custom Trace Input */}
        {traceMode === 'manual' && (
          <div className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-[#0c121e] border border-[#1e293b]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-[#94a3b8]">
                Custom Trace (CSV / Space)
              </span>
              <span className="text-[10px] font-mono text-[#38bdf8] font-bold">
                {parsedCustomCount} Blocks
              </span>
            </div>

            <textarea
              value={customTraceInput}
              onChange={(e) => onCustomTraceInputChange(e.target.value)}
              placeholder="e.g. S, B, C, D, A, B, C, D, H, E, K, B, F, G, A"
              rows={3}
              className="w-full px-2.5 py-1.5 rounded-lg bg-[#111827] border border-[#1e293b] text-xs font-mono text-white focus:outline-none focus:border-[#12CBEA] resize-none leading-relaxed"
            />

            {/* Validation Feedback Status Badge */}
            {customValidationError ? (
              <span className="text-[10px] text-[#ef4444] font-semibold flex items-center gap-1 mt-0.5">
                <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                <span>{customValidationError}</span>
              </span>
            ) : isCustomValidated ? (
              <span className="text-[10px] text-[#22c55e] font-bold flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                <span>TRACE VALIDATED — READY TO EXECUTE</span>
              </span>
            ) : (
              <span className="text-[10px] text-amber-400 font-bold flex items-center gap-1 mt-0.5">
                <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                <span>CUSTOM TRACE MODIFIED — VALIDATION REQUIRED</span>
              </span>
            )}
          </div>
        )}

        {/* Trace Length Slider (for Auto Mode) */}
        {traceMode === 'auto' && (
          <div className="flex flex-col gap-1.5 p-2 rounded-xl bg-[#0c121e] border border-[#1e293b]">
            <label className="text-[11px] font-semibold text-[#94a3b8] flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#38bdf8]" />
                <span>Trace Length</span>
              </span>
              <span className="font-mono text-white text-xs font-bold">{traceLength} Blocks</span>
            </label>
            <input
              type="range"
              min={4}
              max={30}
              step={1}
              value={traceLength}
              onChange={(e) => onTraceLengthChange(Number(e.target.value))}
              className="w-full accent-[#12CBEA] cursor-pointer mt-1"
            />
          </div>
        )}

        {/* Cache Capacity Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-[#94a3b8] flex items-center gap-1.5 px-1">
            <Layers className="w-3.5 h-3.5 text-[#12CBEA]" />
            <span>Cache Capacity</span>
          </label>
          <div className="relative">
            <select
              value={cacheSize}
              onChange={(e) => onCacheSizeChange(Number(e.target.value))}
              className="w-full appearance-none px-3 py-2 rounded-xl bg-[#111827] border border-[#1e293b] text-white text-xs font-semibold focus:outline-none focus:border-[#12CBEA] cursor-pointer"
            >
              <option value={2}>2 Slots</option>
              <option value={4}>4 Slots</option>
              <option value={8}>8 Slots</option>
              <option value={16}>16 Slots</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#94a3b8] pointer-events-none">
              ▾
            </span>
          </div>
        </div>

        {/* Replacement Policy Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-semibold text-[#94a3b8] flex items-center gap-1.5 px-1">
            <Cpu className="w-3.5 h-3.5 text-[#FF454F]" />
            <span>Replacement Policy</span>
          </label>
          <div className="relative">
            <select
              value={policy}
              onChange={(e) => onPolicyChange(e.target.value as PolicyType)}
              className="w-full appearance-none px-3 py-2 rounded-xl bg-[#111827] border border-[#1e293b] text-white text-xs font-semibold focus:outline-none focus:border-[#FF454F] cursor-pointer"
            >
              <option value="ML + Prefetch">ML + Prefetch</option>
              <option value="ML Replacement">ML Replacement</option>
              <option value="LRU">LRU</option>
              <option value="FIFO">FIFO</option>
              <option value="Random">Random</option>
            </select>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#94a3b8] pointer-events-none">
              ▾
            </span>
          </div>
        </div>
      </div>

      {/* Section 2: QUICK ACTIONS */}
      <div className="flex flex-col gap-2.5">
        <span className="text-[10px] font-bold tracking-wider text-[#64748b] uppercase px-1">
          QUICK ACTIONS
        </span>

        {/* Generate Sequence (for Auto Mode) */}
        {traceMode === 'auto' && (
          <button
            onClick={onGenerateSequence}
            disabled={isLoading}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111827] hover:bg-[#172235] border border-[#1e293b] text-white text-xs font-semibold transition-all cursor-pointer active:scale-98 disabled:opacity-40"
            title="Generate a new trace sequence from backend generator"
          >
            <Shuffle className="w-3.5 h-3.5 text-[#12CBEA]" />
            <span>Generate Sequence</span>
          </button>
        )}

        {/* Validate Sequence Button */}
        <button
          onClick={onValidateSequence}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer active:scale-98 ${
            traceMode === 'manual' && !isCustomValidated
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 animate-pulse'
              : 'bg-[#111827] hover:bg-[#172235] border-[#1e293b] text-white'
          }`}
          title="Validate trace block syntax and sequence length"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]" />
          <span>Validate Sequence</span>
        </button>

        {/* Clear */}
        <button
          onClick={onClear}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-[#111827] hover:bg-[#172235] border border-[#1e293b] text-[#94a3b8] hover:text-[#FF454F] text-xs font-semibold transition-all cursor-pointer active:scale-98"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear</span>
        </button>

        {/* Primary Run Button */}
        <button
          onClick={onRunSimulation}
          disabled={isRunDisabled}
          className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF454F] to-[#e11d48] hover:from-[#ff5e67] hover:to-[#f43f5e] text-white text-xs font-bold shadow-[0_0_16px_rgba(255,69,79,0.4)] transition-all cursor-pointer active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
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
    </aside>
  )
}
