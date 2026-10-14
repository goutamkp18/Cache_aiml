'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import Image from 'next/image'

export default function RobotMascot() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [parallax, setParallax] = useState({ x: 0, y: 0 })
  const shouldReduceMotion = useReducedMotion()

  // Track cursor position for subtle parallax reaction
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 12
    setParallax({ x, y })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setParallax({ x: 0, y: 0 })
  }

  // Energy cursor orbital path state
  const [time, setTime] = useState(0)

  useEffect(() => {
    if (shouldReduceMotion) return
    let animId: number
    let lastT = performance.now()

    const loop = (now: number) => {
      const dt = (now - lastT) / 1000
      lastT = now
      // Speed up slightly on hover
      const speed = isHovered ? 1.6 : 1.0
      setTime((prev) => (prev + dt * speed) % (Math.PI * 2))
      animId = requestAnimationFrame(loop)
    }

    animId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animId)
  }, [isHovered, shouldReduceMotion])

  // Center & radii for ellipse path (width: 280, height: 180)
  const cx = 140
  const cy = 95
  const rx = 105
  const ry = 62
  const tiltAngle = -0.18 // slight tilt

  // Parametric coordinates for points on the ellipse
  const getPoint = (angleOffset: number) => {
    const a = time - angleOffset
    const unrotatedX = rx * Math.cos(a)
    const unrotatedY = ry * Math.sin(a)
    const x = cx + unrotatedX * Math.cos(tiltAngle) - unrotatedY * Math.sin(tiltAngle)
    const y = cy + unrotatedX * Math.sin(tiltAngle) + unrotatedY * Math.cos(tiltAngle)
    return { x, y }
  }

  const lead = getPoint(0)
  const trail1 = getPoint(0.12)
  const trail2 = getPoint(0.24)
  const trail3 = getPoint(0.38)
  const trail4 = getPoint(0.52)
  const trail5 = getPoint(0.68)

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex items-center justify-center p-3 select-none"
      style={{ width: '310px', height: '210px' }}
      aria-label="Adaptive Cache AI mascot"
    >
      {/* Background ambient glow behind mascot */}
      <div
        className="absolute w-44 h-44 rounded-full blur-2xl pointer-events-none transition-opacity duration-500"
        style={{
          background: isHovered
            ? 'radial-gradient(circle, rgba(6,182,212,0.28) 0%, rgba(220,38,38,0.15) 60%, transparent 80%)'
            : 'radial-gradient(circle, rgba(6,182,212,0.16) 0%, rgba(220,38,38,0.06) 65%, transparent 80%)',
          top: '25px',
          left: '60px',
        }}
      />

      {/* SVG Orbital Track & Energy Trail */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
        viewBox="0 0 280 190"
        fill="none"
      >
        {/* Faint static orbital guide ellipse */}
        <ellipse
          cx={cx}
          cy={cy}
          rx={rx}
          ry={ry}
          transform={`rotate(-10 ${cx} ${cy})`}
          stroke={isHovered ? 'rgba(6,182,212,0.35)' : 'rgba(6,182,212,0.18)'}
          strokeWidth="1.2"
          strokeDasharray="4 6"
        />

        {/* Dynamic Trail Segments fading behind the cursor */}
        {!shouldReduceMotion && (
          <>
            {/* Trail tail 5 */}
            <circle
              cx={trail5.x}
              cy={trail5.y}
              r="1.2"
              fill="#ef4444"
              opacity={isHovered ? 0.35 : 0.2}
            />
            {/* Trail tail 4 */}
            <circle
              cx={trail4.x}
              cy={trail4.y}
              r="1.8"
              fill="#f87171"
              opacity={isHovered ? 0.5 : 0.3}
            />
            {/* Trail tail 3 */}
            <circle
              cx={trail3.x}
              cy={trail3.y}
              r="2.2"
              fill="#06b6d4"
              opacity={isHovered ? 0.6 : 0.4}
            />
            {/* Trail tail 2 */}
            <circle
              cx={trail2.x}
              cy={trail2.y}
              r="2.8"
              fill="#22d3ee"
              opacity={isHovered ? 0.75 : 0.55}
            />
            {/* Trail tail 1 */}
            <circle
              cx={trail1.x}
              cy={trail1.y}
              r="3.4"
              fill="#67e8f9"
              opacity={isHovered ? 0.9 : 0.75}
            />
            {/* Leading Energy Cursor Point */}
            <circle
              cx={lead.x}
              cy={lead.y}
              r={isHovered ? 4.8 : 4.0}
              fill="#ffffff"
              stroke="#06b6d4"
              strokeWidth="2"
            />
            {/* Outer Cyan Halo for Energy Point */}
            <circle
              cx={lead.x}
              cy={lead.y}
              r={isHovered ? 9.5 : 7.5}
              fill="#22d3ee"
              opacity={isHovered ? 0.45 : 0.3}
            />
          </>
        )}
      </svg>

      {/* Floating Robot Mascot Container with Parallax Response */}
      <motion.div
        animate={{
          x: parallax.x,
          y: parallax.y,
        }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
        className="relative z-20 flex flex-col items-center cursor-default"
      >
        {/* Gentle Floating Motion */}
        <motion.div
          animate={
            shouldReduceMotion
              ? {}
              : {
                  y: [0, -6, 0],
                  rotate: [-0.5, 0.5, -0.5],
                }
          }
          transition={{
            duration: 4.2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative"
        >
          {/* Mascot Image */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 drop-shadow-md transition-transform duration-300">
            <Image
              src="/robot-mascot.png"
              alt="Adaptive AI Cache Mascot"
              fill
              sizes="128px"
              priority
              className="object-contain"
            />
          </div>

          {/* Eye Glow Pulse Accent Overlay */}
          <div
            className={`absolute top-[28px] left-[38px] w-12 h-6 pointer-events-none rounded-full transition-all duration-700 ${
              isHovered ? 'opacity-90' : 'opacity-60'
            }`}
            style={{
              background: 'radial-gradient(circle, rgba(34,211,238,0.4) 0%, transparent 75%)',
              filter: 'blur(3px)',
            }}
          />
        </motion.div>
      </motion.div>

      {/* Sleek Floating Quote Badge */}
      <div className="absolute right-0 bottom-1 hidden xl:flex flex-col items-start bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-sm px-3 py-1.5 rounded-lg text-left pointer-events-none max-w-[170px] z-20">
        <p className="text-[11px] font-medium leading-tight text-[var(--text-secondary)]">
          &ldquo;Smarter Caching for a Faster Tomorrow.&rdquo;
        </p>
        <span className="w-5 h-[2px] bg-[var(--accent-crimson)] rounded mt-1" />
      </div>
    </div>
  )
}
