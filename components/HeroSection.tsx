'use client'

import React from 'react'
import RobotMascot from './RobotMascot'
import { Sparkles, CheckCircle2 } from 'lucide-react'

interface HeroSectionProps {
  backendConnected: boolean
}

export default function HeroSection({ backendConnected }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden border-b border-[var(--border-subtle)] bg-[var(--bg-surface)] py-4 sm:py-6 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-8">
          {/* Left Text Column */}
          <div className="flex-1 text-center lg:text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide uppercase bg-[var(--accent-crimson-subtle)] border border-[var(--accent-crimson-border)] text-[var(--accent-crimson)] mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Machine Learning Powered Memory System</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[var(--text-primary)]">
              Adaptive Cache <span className="text-[var(--accent-crimson)]">AI Simulator</span>
            </h1>

            <p className="mt-1.5 text-sm sm:text-base font-medium text-[var(--text-secondary)] leading-relaxed">
              Machine-learning-based cache replacement and adaptive prefetching for dynamic memory workloads.
            </p>

            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Predict future memory use. Make smarter eviction decisions. Prefetch likely upcoming blocks.
            </p>

            {/* Understated Status Badge */}
            {backendConnected && (
              <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[var(--accent-green)]">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span className="tracking-wide uppercase text-[10px] font-bold">
                  Backend Connected (FastAPI &bull; Port 8000)
                </span>
              </div>
            )}
          </div>

          {/* Right Mascot Column */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <RobotMascot />
          </div>
        </div>
      </div>
    </section>
  )
}
