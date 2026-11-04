'use client'

import React, { useState, useMemo } from 'react'
import {
  Activity,
  Database,
  Cpu,
  FileText,
  Play,
  RotateCw,
  Shuffle,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  Sparkles,
  Edit3
} from 'lucide-react'

export type WorkloadType = 'Dynamic' | 'Looping' | 'Random' | 'Sequential'
export type PolicyType = 'ML + Prefetch' | 'ML Replacement' | 'LRU' | 'FIFO' | 'Random'

interface ConfigToolbarProps {
  traceMode: 'auto' | 'manual'
  onTraceModeChange: (mode: 'auto' | 'manual') => void
  workload: WorkloadType
  onWorkloadChange: (w: WorkloadType) => void
  cacheSize: number
  onCacheSizeChange: (size: number) => void
  policy: PolicyType
  onPolicyChange: (p: PolicyType) => void
  traceLength: number
  onTraceLengthChange: (len: number) => void
  customTraceInput: string
  onCustomTraceInputChange: (val: string) => void
  onRunSimulation: () => void
  onGenerateNewSequence: () => void
  onReset?: () => void
  isLoading: boolean
}

export default function ConfigToolbar({
  traceMode,
  onTraceModeChange,
  workload,
  onWorkloadChange,
  cacheSize,
  onCacheSizeChange,
  policy,
  onPolicyChange,
  traceLength,
  onTraceLengthChange,
  customTraceInput,
  onCustomTraceInputChange,
  onRunSimulation,
  onGenerateNewSequence,
  onReset,
  isLoading,
}: ConfigToolbarProps) {
  const [isCustomLength, setIsCustomLength] = useState(
    ![10, 15, 30, 60, 100].includes(traceLength)
  )
  const [customLengthVal, setCustomLengthVal] = useState(String(traceLength))
  const [validationError, setValidationError] = useState<string | null>(null)
  const [validationSuccess, setValidationSuccess] = useState<boolean>(false)

  // Parse custom trace string safely handling spaces, commas, tabs, newlines
  const parsedCustomTokens = useMemo(() => {
    if (!customTraceInput.trim()) return []
    return customTraceInput
      .split(/[, \t\r\n]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0)
  }, [customTraceInput])

  // Validation function
  const validateCustomTrace = () => {
    setValidationSuccess(false)
    if (!customTraceInput.trim()) {
      setValidationError('Please enter a sequence of memory blocks.')
      return false
    }

    if (parsedCustomTokens.length === 0) {
      setValidationError('No valid block identifiers found. Please provide memory blocks.')
      return false
    }

    if (parsedCustomTokens.length < 2) {
      setValidationError('Sequence too short. Please provide at least 2 memory block requests.')
      return false
    }

    if (parsedCustomTokens.length > 200) {
      setValidationError(`Sequence exceeds limit (${parsedCustomTokens.length} requests). Maximum supported is 200 requests.`)
      return false
    }

    setValidationError(null)
    setValidationSuccess(true)
    return true
  }

  const handleRunManual = () => {
    if (validateCustomTrace()) {
      onRunSimulation()
    }
  }

  const handleClearManual = () => {
    onCustomTraceInputChange('')
    setValidationError(null)
    setValidationSuccess(false)
  }

  const handlePresetLengthSelect = (val: string) => {
    if (val === 'custom') {
      setIsCustomLength(true)
    } else {
      setIsCustomLength(false)
      const num = Number(val)
      onTraceLengthChange(num)
      setCustomLengthVal(val)
    }
  }

  const handleCustomLengthSubmit = (val: string) => {
    setCustomLengthVal(val)
    const num = parseInt(val, 10)
    if (!isNaN(num) && num >= 5 && num <= 200) {
      onTraceLengthChange(num)
    }
  }

  return (
    <div className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 sm:p-5 shadow-sm transition-colors space-y-4">
      {/* Top Header Row: Trace Mode Selector & Universal Cache Settings */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
        {/* Memory Access Sequence Mode Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">
            Memory Access Sequence:
          </span>
          <div className="inline-flex p-1 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => onTraceModeChange('auto')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                traceMode === 'auto'
                  ? 'bg-[var(--bg-surface)] text-[var(--accent-crimson)] shadow-xs font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Auto Generate
            </button>
            <button
              type="button"
              onClick={() => onTraceModeChange('manual')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                traceMode === 'manual'
                  ? 'bg-[var(--bg-surface)] text-[var(--accent-crimson)] shadow-xs font-bold'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Manual Sequence
            </button>
          </div>
        </div>

        {/* Preserved Hardware Cache Settings: Cache Size & Policy */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Cache Capacity */}
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-[var(--accent-crimson)]" />
            <label htmlFor="cache-size-select" className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
              Cache:
            </label>
            <select
              id="cache-size-select"
              value={cacheSize}
              onChange={(e) => onCacheSizeChange(Number(e.target.value))}
              className="text-xs font-semibold bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-md px-2 py-1 text-[var(--text-primary)] cursor-pointer focus:outline-none"
            >
              <option value="2">2 Slots</option>
              <option value="4">4 Slots</option>
              <option value="8">8 Slots</option>
              <option value="16">16 Slots</option>
            </select>
          </div>

          {/* Replacement Policy */}
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-[var(--accent-crimson)]" />
            <label htmlFor="policy-select" className="text-[10px] uppercase font-bold text-[var(--text-muted)]">
              Policy:
            </label>
            <select
              id="policy-select"
              value={policy}
              onChange={(e) => onPolicyChange(e.target.value as PolicyType)}
              className="text-xs font-semibold bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-md px-2 py-1 text-[var(--text-primary)] cursor-pointer focus:outline-none"
            >
              <option value="ML + Prefetch">ML + Prefetch</option>
              <option value="ML Replacement">ML Replacement</option>
              <option value="LRU">LRU</option>
              <option value="FIFO">FIFO</option>
              <option value="Random">Random</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mode 1: Auto-Generated Sequences Panel */}
      {traceMode === 'auto' && (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          {/* Workload Pattern */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-crimson-subtle)] border border-[var(--accent-crimson-border)] flex items-center justify-center text-[var(--accent-crimson)] flex-shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <label htmlFor="workload-pattern-select" className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
                Workload Pattern
              </label>
              <select
                id="workload-pattern-select"
                value={workload}
                onChange={(e) => onWorkloadChange(e.target.value as WorkloadType)}
                className="text-xs font-semibold bg-transparent text-[var(--text-primary)] border-none outline-none cursor-pointer p-0"
              >
                <option value="Dynamic">Dynamic (Phased Transitions)</option>
                <option value="Looping">Looping (Cyclic Loop)</option>
                <option value="Random">Random (Uniform Choice)</option>
                <option value="Sequential">Sequential (Streaming Scan)</option>
              </select>
            </div>
          </div>

          <div className="hidden lg:block w-[1px] h-8 bg-[var(--border-subtle)]" />

          {/* Trace Length */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-crimson-subtle)] border border-[var(--accent-crimson-border)] flex items-center justify-center text-[var(--accent-crimson)] flex-shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <label htmlFor="trace-length-select" className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">
                Trace Length
              </label>
              <div className="flex items-center gap-2">
                <select
                  id="trace-length-select"
                  value={isCustomLength ? 'custom' : traceLength}
                  onChange={(e) => handlePresetLengthSelect(e.target.value)}
                  className="text-xs font-semibold bg-transparent text-[var(--text-primary)] border-none outline-none cursor-pointer p-0"
                >
                  <option value="10">10 requests</option>
                  <option value="15">15 requests (Standard)</option>
                  <option value="30">30 requests</option>
                  <option value="60">60 requests (Benchmark)</option>
                  <option value="100">100 requests</option>
                  <option value="custom">Custom Length...</option>
                </select>

                {isCustomLength && (
                  <input
                    type="number"
                    min="5"
                    max="200"
                    value={customLengthVal}
                    onChange={(e) => handleCustomLengthSubmit(e.target.value)}
                    className="w-16 px-1.5 py-0.5 text-xs font-mono font-bold rounded bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)]"
                    placeholder="5-200"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Auto Actions */}
          <div className="flex items-center gap-2 ml-auto w-full sm:w-auto justify-end">
            {/* Generate New Sequence Button */}
            <button
              type="button"
              onClick={onGenerateNewSequence}
              disabled={isLoading}
              className="px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-semibold flex items-center gap-1.5 transition-colors active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Generate a fresh sequence from Python backend workload generator"
            >
              <Shuffle className="w-3.5 h-3.5 text-[var(--accent-cyan)]" />
              <span>Generate New Sequence</span>
            </button>

            {/* Reset Button */}
            {onReset && (
              <button
                type="button"
                onClick={onReset}
                disabled={isLoading}
                className="px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-semibold flex items-center gap-1.5 transition-colors active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Reset simulation step counter to 0"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            {/* Run Simulation Button */}
            <button
              type="button"
              onClick={onRunSimulation}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg bg-[var(--accent-crimson)] hover:bg-[var(--accent-crimson-hover)] text-white font-semibold text-xs uppercase tracking-wide flex items-center gap-2 shadow-xs transition-all active:scale-95 disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Simulating...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Simulation</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Mode 2: Manual Sequence Builder Panel */}
      {traceMode === 'manual' && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit3 className="w-4 h-4 text-[var(--accent-crimson)]" />
              <h3 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Create Your Own Memory Trace
              </h3>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] font-mono">
              Tokens: <strong>{parsedCustomTokens.length}</strong> (Max: 200)
            </span>
          </div>

          {/* Sequence Input Area */}
          <div className="relative">
            <textarea
              rows={2}
              value={customTraceInput}
              onChange={(e) => {
                onCustomTraceInputChange(e.target.value)
                setValidationError(null)
                setValidationSuccess(false)
              }}
              placeholder="e.g. A, B, C, A, B, D, A, C, E, B   or   P1 P2 P3 P1 P4 P2   or   101, 205, 101, 310, 205"
              className="w-full px-3 py-2 text-xs font-mono font-medium rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-cyan)] focus:ring-1 focus:ring-[var(--accent-cyan)]"
            />
          </div>

          <p className="text-[11px] text-[var(--text-muted)]">
            <strong>Supported Formats:</strong> Comma or space-separated letters (<code>A, B, C</code>), process labels (<code>P1, P2, P3</code>), or memory block addresses (<code>101, 205, 310</code>).
          </p>

          {/* Validation Feedback & Token Preview */}
          {validationError && (
            <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {parsedCustomTokens.length > 0 && !validationError && (
            <div className="p-2.5 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-1.5">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-[var(--text-muted)]">
                <span className="flex items-center gap-1.5 text-[var(--accent-green)]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Parsed Sequence ({parsedCustomTokens.length} requests)</span>
                </span>
                <span>Ready to execute</span>
              </div>

              {/* Parsed Sequence Chips Preview */}
              <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-thin">
                {parsedCustomTokens.map((tok, idx) => (
                  <React.Fragment key={`parsed-${idx}`}>
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] flex-shrink-0">
                      {tok}
                    </span>
                    {idx < parsedCustomTokens.length - 1 && (
                      <ArrowRight className="w-3 h-3 text-[var(--text-muted)] opacity-40 flex-shrink-0" />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons for Manual Mode */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={validateCustomTrace}
                className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-green)]" />
                <span>Validate Sequence</span>
              </button>

              <button
                type="button"
                onClick={handleClearManual}
                className="px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] text-xs font-medium flex items-center gap-1 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleRunManual}
              disabled={isLoading || parsedCustomTokens.length === 0}
              className="px-4 py-2 rounded-lg bg-[var(--accent-crimson)] hover:bg-[var(--accent-crimson-hover)] text-white font-semibold text-xs uppercase tracking-wide flex items-center gap-2 shadow-xs transition-all active:scale-95 disabled:opacity-50 ml-auto"
            >
              {isLoading ? (
                <>
                  <RotateCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Simulating...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Custom Simulation</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
