'use client'

import React from 'react'
import { X, Server, Database, BrainCircuit, CheckCircle2, FileText } from 'lucide-react'
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
  if (!isOpen) return null

  const isConnected = backendStatus === 'CONNECTED'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-xl w-full max-w-lg p-5 sm:p-6 transition-all text-left">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[var(--accent-crimson)]" />
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Simulation Engine &amp; API Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 my-4 text-xs">
          {/* Endpoint Info */}
          <div className="p-3 rounded-lg bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-[var(--text-muted)] uppercase text-[10px]">
                API Base Endpoint
              </span>
              <span
                className={`font-semibold px-2 py-0.2 rounded text-[10px] ${
                  isConnected
                    ? 'bg-[var(--accent-green-subtle)] text-[var(--accent-green)]'
                    : 'bg-red-500/10 text-red-500'
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

            <div className="p-2.5 rounded-lg border border-[var(--border-subtle)] flex items-start gap-2.5">
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

            <div className="p-2.5 rounded-lg border border-[var(--border-subtle)] flex items-start gap-2.5">
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

            <div className="p-2.5 rounded-lg border border-[var(--border-subtle)] flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-mono font-semibold text-[var(--text-primary)] block">
                  AIML_PBL_Phase3_Replacement_Model.ipynb
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Original Colab training notebook containing research methodologies
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
            className="px-4 py-1.5 rounded-lg bg-[var(--bg-surface-elevated)] hover:bg-[var(--border-subtle)] text-[var(--text-primary)] font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
