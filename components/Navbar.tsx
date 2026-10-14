'use client'

import React, { useEffect, useState } from 'react'
import {
  BrainCircuit,
  Moon,
  Sun,
  Server,
  RefreshCw,
  Info,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal
} from 'lucide-react'

interface NavbarProps {
  activeTab: 'simulator' | 'results' | 'how-it-works'
  onTabChange: (tab: 'simulator' | 'results' | 'how-it-works') => void
  backendStatus: 'CONNECTED' | 'OFFLINE' | 'PROCESSING'
  onRetryConnection: () => void
  onOpenSettings: () => void
}

export default function Navbar({
  activeTab,
  onTabChange,
  backendStatus,
  onRetryConnection,
  onOpenSettings,
}: NavbarProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const currentTheme =
      document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
    setTheme(currentTheme)
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
    try {
      localStorage.setItem('adaptive-cache-theme', nextTheme)
    } catch (e) {}
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]/85 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 select-none">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-crimson-subtle)] border border-[var(--accent-crimson-border)] flex items-center justify-center text-[var(--accent-crimson)]">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight text-base text-[var(--text-primary)]">
                Adaptive Cache <span className="text-[var(--accent-crimson)]">AI</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[var(--accent-cyan-subtle)] text-[var(--accent-cyan)] border border-[var(--accent-cyan-border)]">
                Simulator
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)] hidden sm:block">
              Random Forest Regressor &bull; Markov Prefetcher
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="flex items-center p-1 bg-[var(--bg-surface-elevated)] border border-[var(--border-subtle)] rounded-lg">
          <button
            onClick={() => onTabChange('simulator')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'simulator'
                ? 'bg-[var(--bg-surface)] text-[var(--accent-crimson)] shadow-sm font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Simulator
          </button>
          <button
            onClick={() => onTabChange('results')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'results'
                ? 'bg-[var(--bg-surface)] text-[var(--accent-crimson)] shadow-sm font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            Results
          </button>
          <button
            onClick={() => onTabChange('how-it-works')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'how-it-works'
                ? 'bg-[var(--bg-surface)] text-[var(--accent-crimson)] shadow-sm font-semibold'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            How It Works
          </button>
        </nav>

        {/* Right Side Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Backend Status Pill */}
          {backendStatus === 'CONNECTED' ? (
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--accent-green-subtle)] border border-[var(--accent-green-border)] text-[var(--accent-green)]">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-green)] relative flex items-center justify-center">
                <span className="absolute w-2.5 h-2.5 rounded-full bg-[var(--accent-green)] animate-ping-subtle" />
              </span>
              <span>FastAPI &bull; Models Loaded</span>
            </div>
          ) : backendStatus === 'PROCESSING' ? (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span className="hidden sm:inline">Connecting...</span>
            </div>
          ) : (
            <button
              onClick={onRetryConnection}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--accent-crimson-subtle)] border border-[var(--accent-crimson-border)] text-[var(--accent-crimson)] hover:bg-red-500/20 transition-colors"
              title="Click to retry backend connection"
            >
              <AlertCircle className="w-3 h-3" />
              <span>Offline &bull; Retry</span>
            </button>
          )}

          {/* Settings / Info Modal Trigger */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
            title="Simulation & API Settings"
            aria-label="Simulation Settings"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>

          {/* Theme Toggle Button */}
          {mounted && (
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-elevated)] transition-colors"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
