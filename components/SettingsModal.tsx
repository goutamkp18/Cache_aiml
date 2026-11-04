'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  Server,
  Database,
  BrainCircuit,
  CheckCircle2,
  FileText,
  Moon,
  Sun,
  Sliders,
  Settings as SettingsIcon
} from 'lucide-react'
import type { HealthStatus } from '@/simulation/simulationTypes'
import { getApiBaseUrl } from '@/lib/api'

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
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const active = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
      setTheme(active)
    }
  }, [isOpen])

  if (!isOpen) return null

  const isConnected = backendStatus === 'CONNECTED'

  const handleSelectTheme = (newTheme: 'dark' | 'light') => {
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    try {
      localStorage.setItem('adaptive-cache-theme', newTheme)
    } catch (e) {}
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-2xl w-full max-w-lg p-5 sm:p-6 transition-all text-left">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[var(--accent-crimson)]" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Command Center Settings &amp; Engine Telemetry
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 my-4 text-xs">
          {/* Theme Preference Toggle */}
          <div className="p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[var(--text-primary)] uppercase text-[10px] tracking-wider">
                Theme Preference
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">
                Default: Dark Command Center
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleSelectTheme('dark')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-[var(--bg-page)] border-[var(--accent-crimson)] text-[var(--accent-crimson)] shadow-sm font-bold'
                    : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Dark Theme</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTheme('light')}
                className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-[var(--bg-page)] border-[var(--accent-crimson)] text-[var(--accent-crimson)] shadow-sm font-bold'
                    : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light Theme</span>
              </button>
            </div>
          </div>

          {/* Endpoint Info */}
          <div className="p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-[var(--text-muted)] uppercase text-[10px]">
                API Base Endpoint
              </span>
              <span
                className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                  isConnected
                    ? 'bg-[var(--accent-green-subtle)] text-[var(--accent-green)] border border-[var(--accent-green-border)]'
                    : 'bg-red-500/10 text-red-500 border border-red-500/20'
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
            <span className="font-bold text-[var(--text-muted)] uppercase text-[10px] block">
              Active Artifact Files (Loaded in Python Backend)
            </span>

            <div className="p-2.5 rounded-lg border border-[var(--border-subtle)] flex items-start gap-2.5 bg-[var(--bg-surface-elevated)]">
              <BrainCircuit className="w-4 h-4 text-[var(--accent-crimson)] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-mono font-semibold text-[var(--text-primary)] block">
                  replacement_regression_v3.pkl
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Scikit-learn RandomForestRegressor predicting reuse distance (55MB)
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg border border-[var(--border-subtle)] flex items-start gap-2.5 bg-[var(--bg-surface-elevated)]">
              <Database className="w-4 h-4 text-[var(--accent-cyan)] flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-mono font-semibold text-[var(--text-primary)] block">
                  prefetch_markov_model.pkl
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Adaptive Markov Model with exponential decay (0.90) &amp; threshold (0.70)
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg border border-[var(--border-subtle)] flex items-start gap-2.5 bg-[var(--bg-surface-elevated)]">
              <FileText className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
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
            <div className="p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
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
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[var(--accent-crimson)] hover:bg-[var(--accent-crimson-hover)] text-white font-semibold text-xs transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
