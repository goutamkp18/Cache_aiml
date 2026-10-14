'use client'

import React from 'react'
import { AlertCircle, RefreshCw, Terminal, ExternalLink } from 'lucide-react'

interface BackendOfflineModalProps {
  onRetry: () => void
  isRetrying: boolean
  errorMessage?: string | null
}

export default function BackendOfflineModal({
  onRetry,
  isRetrying,
  errorMessage,
}: BackendOfflineModalProps) {
  return (
    <div className="w-full bg-[var(--accent-crimson-subtle)] border border-[var(--accent-crimson-border)] rounded-xl p-5 my-4 transition-colors">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-[var(--accent-crimson)] text-white mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--accent-crimson)]">
              FastAPI ML Backend Disconnected
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              {errorMessage || 'Unable to reach the simulation API at http://localhost:8000.'} Real model inferences require the active Python server.
            </p>

            <div className="mt-2.5 flex items-center gap-2 text-xs font-mono bg-[var(--bg-surface)] px-3 py-1.5 rounded-md border border-[var(--border-subtle)] text-[var(--text-primary)]">
              <Terminal className="w-3.5 h-3.5 text-[var(--text-muted)] flex-shrink-0" />
              <code>.\.venv\Scripts\python.exe -m uvicorn backend.main:app --port 8000</code>
            </div>
          </div>
        </div>

        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="px-4 py-2 rounded-lg bg-[var(--accent-crimson)] hover:bg-[var(--accent-crimson-hover)] text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors self-end sm:self-center disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
          <span>{isRetrying ? 'Checking API...' : 'Retry Connection'}</span>
        </button>
      </div>
    </div>
  )
}
