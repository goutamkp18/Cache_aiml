'use client'

import React from 'react'
import {
  X,
  Database,
  BrainCircuit,
  FileText,
  Moon,
  Sun,
  Sliders
} from 'lucide-react'
import type { HealthStatus } from '@/simulation/simulationTypes'
import { getApiBaseUrl } from '@/lib/api'
import { useTheme } from './ThemeProvider'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  healthData?: HealthStatus
  backendStatus: string
}

export default function SettingsModal({
  isOpen,
  onClose,
  healthData,
  backendStatus,
}: SettingsModalProps) {
  const { theme, setTheme } = useTheme()

  if (!isOpen) return null

  const isConnected = backendStatus === 'CONNECTED'

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1C2420]/60 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
    >
      <div className="glass-card rounded-2xl w-full max-w-lg p-5 sm:p-6 transition-all text-left bg-[var(--bg-surface-solid)]">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[var(--accent-vermilion-text)]" />
            <h3
              id="settings-modal-title"
              className="text-sm font-bold text-[var(--text-primary)]"
            >
              Research Settings &amp; Engine Telemetry
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer"
            aria-label="Close settings modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 my-4 text-xs">
          {/* Theme Preference Toggle */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[var(--text-primary)] uppercase text-[10px] tracking-wider">
                Interface Theme
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">
                Persisted in localStorage
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-[var(--brand-sage)] border-[var(--brand-sage)] text-[#F1EEE3] shadow-xs'
                    : 'bg-[var(--bg-surface-solid)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Light (Warm Ivory)</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[var(--brand-sage)] border-[var(--brand-sage)] text-[#F1EEE3] shadow-xs'
                    : 'bg-[var(--bg-surface-solid)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark (Deep Sage)</span>
              </button>
            </div>
          </div>

          {/* Endpoint Info */}
          <div className="p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-[var(--text-muted)] uppercase text-[10px]">
                API Base Endpoint
              </span>
              <span
                className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                  isConnected
                    ? 'bg-[var(--accent-sage-subtle)] text-[var(--accent-sage-text)] border border-[var(--accent-sage-border)]'
                    : 'bg-[var(--accent-vermilion-subtle)] text-[var(--accent-vermilion-text)] border border-[var(--accent-vermilion-border)]'
                }`}
              >
                {backendStatus}
              </span>
            </div>
            <code className="font-mono text-xs text-[var(--text-primary)]">
              {getApiBaseUrl()}
            </code>
          </div>

          {/* Model Artifacts */}
          <div className="space-y-2">
            <span className="font-bold text-[var(--text-muted)] uppercase text-[10px] block px-0.5">
              Active Artifact Files (Loaded in Python Backend)
            </span>

            <div className="p-2.5 rounded-xl border border-[var(--border-subtle)] flex items-start gap-2.5 bg-[var(--bg-surface-secondary)]">
              <BrainCircuit className="w-4 h-4 text-[var(--accent-vermilion-text)] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-mono font-semibold text-[var(--text-primary)] block">
                  replacement_regression_v3.pkl
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Scikit-learn RandomForestRegressor predicting reuse distance (55MB)
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl border border-[var(--border-subtle)] flex items-start gap-2.5 bg-[var(--bg-surface-secondary)]">
              <Database className="w-4 h-4 text-[var(--accent-amber-text)] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-mono font-semibold text-[var(--text-primary)] block">
                  prefetch_markov_model.pkl
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Adaptive Markov Model with exponential decay (0.90) &amp; threshold (0.70)
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl border border-[var(--border-subtle)] flex items-start gap-2.5 bg-[var(--bg-surface-secondary)]">
              <FileText className="w-4 h-4 text-[var(--accent-sage-text)] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-mono font-semibold text-[var(--text-primary)] block">
                  AIML_PBL_Phase3_Replacement_Model.ipynb
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Original research notebook with empirical methodology
                </span>
              </div>
            </div>
          </div>

          {/* Hyperparameters from backend */}
          {healthData?.config && (
            <div className="p-3.5 rounded-xl bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)]">
              <span className="font-bold text-[var(--text-muted)] uppercase text-[10px] block mb-1.5">
                Runtime Hyperparameters
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[var(--text-muted)]">Context Size: </span>
                  <strong className="text-[var(--text-primary)] font-mono">
                    {healthData.config.context_size ?? 2}
                  </strong>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Confidence Threshold: </span>
                  <strong className="text-[var(--text-primary)] font-mono">
                    {healthData.config.confidence_threshold ?? 0.7}
                  </strong>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Decay Rate: </span>
                  <strong className="text-[var(--text-primary)] font-mono">
                    {healthData.config.decay ?? 0.9}
                  </strong>
                </div>
                <div>
                  <span className="text-[var(--text-muted)]">Active Features: </span>
                  <strong className="text-[var(--text-primary)] font-mono">
                    {healthData.config.replacement_features?.length ?? 8}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-[var(--accent-vermilion)] hover:bg-[var(--accent-vermilion-hover)] text-white font-semibold text-xs transition-colors cursor-pointer shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
