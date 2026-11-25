'use client'

import React from 'react'
import RobotMascot from './RobotMascot'
import { Sparkles, CheckCircle2 } from 'lucide-react'

interface HeroSectionProps {
  backendConnected: boolean
}

export default function HeroSection({ backendConnected }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border-subtle)] bg-[var(--bg-surface-secondary)] py-4 sm:py-5 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-6">
          <div className="flex-1 text-center lg:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase bg-[var(--accent-vermilion-subtle)] border border-[var(--accent-vermilion-border)] text-[var(--accent-vermilion-text)] mb-2">
              <Sparkles className="w-3 h-3" />
              <span>AI Command Center &bull; Research Architecture</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Adaptive Cache <span className="text-[var(--accent-vermilion-text)]">AI Simulator</span>
            </h1>

            <p className="mt-1 text-xs sm:text-sm font-semibold text-[var(--text-secondary)] leading-relaxed">
              Machine-learning-powered cache replacement and adaptive prefetching for dynamic memory workloads.
            </p>

            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Predict future memory use. Make smarter eviction decisions. Prefetch likely upcoming blocks.
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[var(--bg-surface-solid)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-vermilion)]" />
                Random Forest Regressor (8 Features)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[var(--bg-surface-solid)] border border-[var(--border-subtle)] text-[var(--text-secondary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-amber)]" />
                Adaptive Markov Prefetcher (Context 2 &bull; 70% Thresh)
              </span>
              {backendConnected && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-[var(--accent-sage-subtle)] border border-[var(--accent-sage-border)] text-[var(--accent-sage-text)]">
                  <CheckCircle2 className="w-3 h-3" />
                  FastAPI Synchronized
                </span>
              )}
            </div>
          </div>

          <div className="flex-shrink-0 flex items-center justify-center">
            <RobotMascot />
          </div>
        </div>
      </div>
    </section>
  )
}
