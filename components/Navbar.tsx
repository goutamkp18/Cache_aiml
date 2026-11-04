'use client'

import React, { useEffect, useState } from 'react'
import {
  BrainCircuit,
  Moon,
  Sun,
  SlidersHorizontal,
  Cpu,
  Layers,
  BarChart3,
  Play
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
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const currentTheme =
      document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'
    setTheme(currentTheme)
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
    try {
      localStorage.setItem('adaptive-cache-theme', nextTheme)
    } catch (e) {}
  }

  const isConnected = backendStatus === 'CONNECTED'

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#1e293b] bg-[#0c111b]/95 backdrop-blur-md transition-colors shadow-md">
      <div className="max-w-[1560px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand / Logo */}
        <div className="flex items-center gap-3 select-none flex-shrink-0">
          {/* Red glowing square microchip badge */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF454F] to-[#b91c1c] flex items-center justify-center text-white shadow-[0_0_15px_rgba(255,69,79,0.4)]">
            <BrainCircuit className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-base text-white">
                Adaptive Cache <span className="text-[#FF454F]">AI</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#12CBEA]/10 text-[#12CBEA] border border-[#12CBEA]/40">
                SIMULATOR
              </span>
            </div>
            <p className="text-[11px] font-medium text-[#94a3b8] hidden sm:block">
              Random Forest Regressor &bull; Markov Prefetcher
            </p>
          </div>
        </div>

        {/* Center: Navigation Pill Tabs */}
        <nav className="flex items-center p-1 bg-[#111827] border border-[#1e293b] rounded-full">
          {/* Simulator */}
          <button
            onClick={() => onTabChange('simulator')}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-gradient-to-r from-[#FF454F] to-[#e11d48] text-white shadow-[0_0_12px_rgba(255,69,79,0.4)]'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#172235]'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Simulator</span>
          </button>

          {/* Results */}
          <button
            onClick={() => onTabChange('results')}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
              activeTab === 'results'
                ? 'bg-gradient-to-r from-[#FF454F] to-[#e11d48] text-white shadow-[0_0_12px_rgba(255,69,79,0.4)]'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#172235]'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Results</span>
          </button>

          {/* How It Works */}
          <button
            onClick={() => onTabChange('how-it-works')}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-full transition-all cursor-pointer ${
              activeTab === 'how-it-works'
                ? 'bg-gradient-to-r from-[#FF454F] to-[#e11d48] text-white shadow-[0_0_12px_rgba(255,69,79,0.4)]'
                : 'text-[#94a3b8] hover:text-white hover:bg-[#172235]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>How It Works</span>
          </button>
        </nav>

        {/* Right Status & Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* FastAPI : 8000 Status Pill */}
          {isConnected ? (
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#064e3b]/80 border border-[#10b981]/50 text-[#34d399] shadow-[0_0_8px_rgba(16,185,129,0.2)]">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span>FastAPI : 8000</span>
            </div>
          ) : (
            <button
              onClick={onRetryConnection}
              className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#7f1d1d]/80 border border-[#ef4444]/50 text-[#fca5a5] cursor-pointer"
            >
              <span className="w-2 h-2 rounded-full bg-[#ef4444]" />
              <span>Offline (Retry)</span>
            </button>
          )}

          {/* RF + Markov Loaded Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-[#0c2d48]/80 border border-[#0284c7]/50 text-[#38bdf8] shadow-[0_0_8px_rgba(18,203,234,0.2)]">
            <span className="w-2 h-2 rounded-full bg-[#12CBEA]" />
            <span>RF + Markov Loaded</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-9 h-9 rounded-full bg-[#111827] border border-[#1e293b] flex items-center justify-center text-[#94a3b8] hover:text-white hover:bg-[#172235] transition-all cursor-pointer"
            title="Toggle theme"
          >
            {mounted && theme === 'light' ? (
              <Moon className="w-4 h-4 text-[#FF454F]" />
            ) : (
              <Sun className="w-4 h-4 text-[#f59e0b]" />
            )}
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="w-9 h-9 rounded-full bg-[#111827] border border-[#1e293b] flex items-center justify-center text-[#94a3b8] hover:text-white hover:bg-[#172235] transition-all cursor-pointer"
            title="Settings"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
