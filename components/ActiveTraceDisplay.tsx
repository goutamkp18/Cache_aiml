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
    } catch {
      // Clipboard unsupported
    }
  }

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
    <div className="w-full glass-card rounded-2xl p-3 sm:p-4">
      <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)] mb-2.5">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[var(--accent-vermilion-text)]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-primary)]">
            {traceMode === 'manual' ? 'Custom Memory Trace' : 'Generated Memory Trace'}
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--bg-surface-secondary)] text-[var(--text-muted)] font-mono border border-[var(--border-subtle)]">
            {trace.length} blocks
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-[var(--text-muted)] hidden sm:inline">
            Request <strong className="text-[var(--text-primary)]">{Math.min(currentStep + 1, trace.length)}</strong> of {trace.length}
          </span>

          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-md bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
            title="Copy entire trace to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[var(--accent-sage-text)]" />
                <span className="text-[var(--accent-sage-text)] font-semibold">Copied!</span>
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

      <div ref={scrollRef} className="flex items-center gap-1.5 overflow-x-auto py-1 px-1">
        {trace.map((block, idx) => {
          const isCurrent = idx === currentStep
          const isPast = idx < currentStep

          return (
            <React.Fragment key={`active-block-${idx}`}>
              <div
                data-trace-idx={idx}
                className={`flex-shrink-0 px-2.5 py-1 rounded-md text-xs font-mono font-bold transition-transform ${
                  isCurrent
                    ? 'bg-[var(--brand-sage)] text-[#F1EEE3] ring-2 ring-[var(--accent-vermilion)] scale-105 shadow-xs'
                    : isPast
                    ? 'bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] text-[var(--text-secondary)]'
                    : 'bg-[var(--bg-inset)] border border-[var(--border-subtle)] text-[var(--text-muted)]'
                }`}
                title={`Request #${idx + 1}: Block ${block}`}
              >
                {block}
              </div>

              {idx < trace.length - 1 && (
                <ArrowRight className="w-3 h-3 text-[var(--text-muted)] opacity-50 flex-shrink-0" />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
