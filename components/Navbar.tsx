'use client'

import React, { useState, memo } from 'react'
import {
  BrainCircuit,
  Moon,
  Sun,
  SlidersHorizontal,
  Layers,
  BarChart3,
  Play,
  Menu,
  X
} from 'lucide-react'
import { useTheme } from './ThemeProvider'

interface NavbarProps {
  activeTab: 'simulator' | 'results' | 'how-it-works'
  onTabChange: (tab: 'simulator' | 'results' | 'how-it-works') => void
  backendStatus: 'CONNECTED' | 'OFFLINE' | 'PROCESSING'
  onRetryConnection: () => void
  onOpenSettings: () => void
}

function Navbar({
  activeTab,
  onTabChange,
  backendStatus,
  onRetryConnection,
  onOpenSettings,
}: NavbarProps) {
  const { theme, mounted, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isConnected = backendStatus === 'CONNECTED'

  const handleSelectTab = (tab: 'simulator' | 'results' | 'how-it-works') => {
    onTabChange(tab)
    setMobileMenuOpen(false)
  }

  const navItems: Array<{
    id: 'simulator' | 'results' | 'how-it-works'
    label: string
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  }> = [
    { id: 'simulator', label: 'Simulator', icon: Play },
    { id: 'results', label: 'Results', icon: BarChart3 },
    { id: 'how-it-works', label: 'How It Works', icon: Layers },
  ]

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border-subtle)] bg-[var(--bg-header)] backdrop-blur-md transition-colors">
      <div className="max-w-[1680px] 2xl:max-w-[1840px] mx-auto px-4 sm:px-6 lg:px-8 h-15 sm:h-16 flex items-center justify-between gap-3">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3 select-none flex-shrink-0">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[var(--brand-sage)] border border-[var(--border-strong)] flex items-center justify-center text-[#F1EEE3] shadow-sm">
            <BrainCircuit className="w-5 h-5" strokeWidth={1.8} />
            <span
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--accent-vermilion)] ring-2 ring-[var(--bg-page)]"
              aria-hidden="true"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-sm sm:text-base text-[var(--text-primary)]">
                Adaptive Cache{' '}
                <span className="text-[var(--accent-vermilion-text)]">AI</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent-sage-subtle)] text-[var(--accent-sage-text)] border border-[var(--accent-sage-border)]">
                Research Lab
              </span>
            </div>
            <p className="text-[11px] font-medium text-[var(--text-muted)] hidden md:block">
              Random Forest Regressor &bull; Adaptive Markov Prefetcher
            </p>
          </div>
        </div>

        {/* Center: Primary Navigation Tabs */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center p-1 bg-[var(--bg-surface-secondary)] border border-[var(--border-subtle)] rounded-full shadow-xs"
        >
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold rounded-full cursor-pointer ui-interactive ${
                  isActive
                    ? 'bg-[var(--brand-sage)] text-[#F1EEE3] shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-solid)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" strokeWidth={1.85} />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>

        {/* Right: Telemetry Pills, Theme Switcher, Settings & Mobile Menu */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent-sage-subtle)] border border-[var(--accent-sage-border)] text-[var(--accent-sage-text)] tabular-nums">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-sage-hit)]" />
              <span>FastAPI : 8000</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onRetryConnection}
              className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent-vermilion-subtle)] border border-[var(--accent-vermilion-border)] text-[var(--accent-vermilion-text)] cursor-pointer ui-interactive"
            >
              <span className="w-2 h-2 rounded-full bg-[var(--accent-vermilion)]" />
              <span>{backendStatus === 'PROCESSING' ? 'Connecting...' : 'Offline (Retry)'}</span>
            </button>
          )}

          <div className="hidden xl:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent-amber-subtle)] border border-[var(--accent-amber-border)] text-[var(--accent-amber-text)]">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-amber)]" />
            <span>RF + Markov Loaded</span>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full bg-[var(--bg-surface-solid)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] cursor-pointer shadow-xs ui-interactive"
            title={mounted && theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle color theme"
          >
            {mounted && theme === 'dark' ? (
              <Sun className="w-4 h-4 text-[var(--accent-amber-text)]" strokeWidth={1.85} />
            ) : (
              <Moon className="w-4 h-4 text-[var(--brand-sage)]" strokeWidth={1.85} />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-full bg-[var(--bg-surface-solid)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] cursor-pointer shadow-xs ui-interactive"
            title="Settings & Engine Telemetry"
            aria-label="Open settings"
          >
            <SlidersHorizontal className="w-4 h-4" strokeWidth={1.85} />
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden w-9 h-9 rounded-full bg-[var(--bg-surface-solid)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-primary)] cursor-pointer ui-interactive"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsible Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-surface-solid)] px-4 py-3 space-y-3">
          <nav className="flex flex-col gap-1.5" aria-label="Mobile navigation">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={`mob-${item.id}`}
                  type="button"
                  onClick={() => handleSelectTab(item.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[var(--brand-sage)] text-[#F1EEE3]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-surface-secondary)]'
                  }`}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.85} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>

          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
            {isConnected ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[var(--accent-sage-subtle)] text-[var(--accent-sage-text)] border border-[var(--accent-sage-border)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-sage-hit)]" />
                FastAPI : 8000 Connected
              </span>
            ) : (
              <button
                type="button"
                onClick={onRetryConnection}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[var(--accent-vermilion-subtle)] text-[var(--accent-vermilion-text)] border border-[var(--accent-vermilion-border)] cursor-pointer"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-vermilion)]" />
                Backend Offline (Tap to Retry)
              </button>
            )}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[var(--accent-amber-subtle)] text-[var(--accent-amber-text)] border border-[var(--accent-amber-border)]">
              RF + Markov Loaded
            </span>
          </div>
        </div>
      )}
    </header>
  )
}

export default memo(Navbar)
