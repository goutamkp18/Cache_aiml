'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Copy, Check, ArrowRight, Layers } from 'lucide-react'

interface ActiveTraceDisplayProps {
  trace: string[]
  currentStep: number
  traceMode: 'auto' | 'manual'
}

export default function ActiveTraceDisplay({
  trace,
  currentStep,
  traceMode,
}: ActiveTraceDisplayProps) {
  const [copied, setCopied] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleCopy = async () => {
    if (!trace || trace.length === 0) return
    try {
      await navigator.clipboard.writeText(trace.join(', '))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      // Fallback
    }
  }

  // Auto-scroll to active request chip
  useEffect(() => {
    if (!scrollRef.current) return
    const activeChip = scrollRef.current.querySelector(
      `[data-trace-idx="${currentStep}"]`
    ) as HTMLElement
    if (activeChip) {
      activeChip.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      })
    }
  }, [currentStep])

  if (!trace || trace.length === 0) {
    return null
  }

  return (
    <div className="w-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 sm:p-4 shadow-sm transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)] mb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[var(--accent-crimson)]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            {traceMode === 'manual' ? 'Custom Memory Trace' : 'Generated Memory Trace'}
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-surface-elevated)] text-[var(--text-muted)] font-mono">
            {trace.length} blocks
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[var(--text-muted)] hidden sm:inline">
            Request <strong className="text-[var(--text-primary)]">{Math.min(currentStep + 1, trace.length)}</strong> of {trace.length}
          </span>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-colors active:scale-95"
            title="Copy entire trace to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[var(--accent-green)]" />
                <span className="text-[var(--accent-green)] font-semibold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Trace</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Chips Stream */}
      <div
        ref={scrollRef}
        className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-thin px-1"
      >
        {trace.map((block, idx) => {
          const isCurrent = idx === currentStep
          const isPast = idx < currentStep

          return (
            <React.Fragment key={`active-block-${idx}`}>
              <div
                data-trace-idx={idx}
                className={`flex-shrink-0 px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-all ${
                  isCurrent
                    ? 'bg-[var(--accent-crimson)] text-white ring-2 ring-[var(--accent-crimson)]/30 scale-105 shadow-sm'
                    : isPast
                    ? 'bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] opacity-75'
                    : 'bg-[var(--bg-surface-elevated)]/50 border border-[var(--border-subtle)]/60 text-[var(--text-muted)]'
                }`}
                title={`Request #${idx + 1}: Block ${block}`}
              >
                {block}
              </div>

              {idx < trace.length - 1 && (
                <ArrowRight className="w-3 h-3 text-[var(--text-muted)] opacity-40 flex-shrink-0" />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
