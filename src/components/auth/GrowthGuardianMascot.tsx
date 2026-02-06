'use client'

import { useEffect, useState, useRef } from 'react'

interface GrowthGuardianProps {
  state?: 'idle' | 'watching' | 'typing-name' | 'typing-email' | 'typing-password' | 'celebrating' | 'waving'
}

export default function GrowthGuardianMascot({ state = 'idle' }: GrowthGuardianProps) {
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const [isHovering, setIsHovering] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // FIX 1: Correctly initialized Type
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Track mouse for eye following
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      
      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      // Calculate angle from center to mouse
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX)
      
      // Convert to percentage position within eye bounds
      const maxDistance = 15 // Max pixels eyes can move
      const x = 50 + Math.cos(angle) * maxDistance
      const y = 50 + Math.sin(angle) * maxDistance
      
      setMousePos({ x, y })
    }

    if (state === 'watching' || state === 'idle') {
      window.addEventListener('mousemove', handleMouseMove)
      return () => window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [state])

  // Hover detection for waving
  const handleMouseEnter = () => {
    setIsHovering(true)
    hoverTimeoutRef.current = setTimeout(() => {
      // Trigger wave after 3 seconds of hover
      if (state === 'idle' || state === 'watching') {
        // Parent component should handle state change
      }
    }, 3000)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
  }

  // Eye position based on state
  const getEyePosition = () => {
    if (state === 'typing-password') return { x: 50, y: 50 } // Closed eyes, doesn't matter
    if (state === 'typing-name' || state === 'typing-email') return { x: 50, y: 70 } // Looking down at form
    if (state === 'celebrating') return { x: 50, y: 30 } // Looking up in joy
    return mousePos // Normal tracking
  }

  const eyePos = getEyePosition()
  const isEyesClosed = state === 'typing-password'

  // FIX 2: Helper function to center pupils relative to the eye socket
  // (val - 50) converts 0-100 range to -50 to +50 range
  // dividing by 3 makes the movement subtle enough to stay inside the white part
  const getOffset = (val: number) => (val - 50) / 3

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      
      {/* TREE TRUNK */}
      <svg 
        viewBox="0 0 400 500" 
        className={`w-full h-full transition-transform duration-500 ${
          state === 'celebrating' ? 'scale-110' : ''
        } ${
          state === 'waving' ? 'animate-bounce' : ''
        }`}
      >
        {/* Ground/Roots */}
        <ellipse 
          cx="200" 
          cy="480" 
          rx="120" 
          ry="15" 
          fill="#10b981" 
          opacity="0.3"
        />
        
        {/* Main Trunk - Gradient */}
        <defs>
          <linearGradient id="trunkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <linearGradient id="foliageGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
        </defs>

        {/* Trunk */}
        <path
          d="M 160 480 Q 165 400, 170 300 Q 175 200, 180 150 L 220 150 Q 225 200, 230 300 Q 235 400, 240 480 Z"
          fill="url(#trunkGradient)"
          stroke="#78350f"
          strokeWidth="2"
        />

        {/* Trunk texture lines */}
        <path d="M 175 250 Q 180 250, 180 255" stroke="#57270a" strokeWidth="1" opacity="0.5" />
        <path d="M 220 280 Q 215 280, 215 285" stroke="#57270a" strokeWidth="1" opacity="0.5" />
        <path d="M 190 350 Q 195 350, 195 355" stroke="#57270a" strokeWidth="1" opacity="0.5" />

        {/* FOLIAGE - Multiple layers for depth */}
        
        {/* Back layer */}
        <circle cx="140" cy="140" r="45" fill="url(#foliageGradient)" opacity="0.7" />
        <circle cx="260" cy="140" r="45" fill="url(#foliageGradient)" opacity="0.7" />
        
        {/* Middle layer */}
        <circle cx="120" cy="110" r="50" fill="url(#foliageGradient)" opacity="0.85" />
        <circle cx="200" cy="90" r="55" fill="url(#foliageGradient)" opacity="0.85" />
        <circle cx="280" cy="110" r="50" fill="url(#foliageGradient)" opacity="0.85" />
        
        {/* Front layer - brightest */}
        <circle cx="170" cy="100" r="48" fill="url(#foliageGradient)" />
        <circle cx="230" cy="100" r="48" fill="url(#foliageGradient)" />
        <circle cx="200" cy="70" r="50" fill="url(#foliageGradient)" />

        {/* FACE ON TRUNK */}
        
        {/* Face background - wood knot */}
        <ellipse 
          cx="200" 
          cy="220" 
          rx="60" 
          ry="70" 
          fill="#a16207" 
          opacity="0.3"
        />

        {/* EYES */}
        {!isEyesClosed ? (
          <>
            {/* Left Eye */}
            <g>
              {/* Eye white - Center is 175, 210 */}
              <ellipse cx="175" cy="210" rx="18" ry="22" fill="white" />
              {/* Pupil - Centered using 175 + offset */}
              <circle 
                cx={175 + getOffset(eyePos.x)} 
                cy={210 + getOffset(eyePos.y)} 
                r="8" 
                fill="#1e293b"
                className="transition-all duration-150 ease-out"
              />
              {/* Shine */}
              <circle 
                cx={177 + getOffset(eyePos.x)} 
                cy={208 + getOffset(eyePos.y)} 
                r="3" 
                fill="white"
                className="transition-all duration-150 ease-out"
              />
            </g>

            {/* Right Eye */}
            <g>
              {/* Eye white - Center is 225, 210 */}
              <ellipse cx="225" cy="210" rx="18" ry="22" fill="white" />
              {/* Pupil - Centered using 225 + offset */}
              <circle 
                cx={225 + getOffset(eyePos.x)} 
                cy={210 + getOffset(eyePos.y)} 
                r="8" 
                fill="#1e293b"
                className="transition-all duration-150 ease-out"
              />
              {/* Shine */}
              <circle 
                cx={227 + getOffset(eyePos.x)} 
                cy={208 + getOffset(eyePos.y)} 
                r="3" 
                fill="white"
                className="transition-all duration-150 ease-out"
              />
            </g>
          </>
        ) : (
          <>
            {/* Closed eyes - curved lines */}
            <path
              d="M 160 210 Q 175 218, 190 210"
              stroke="#78350f"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 210 210 Q 225 218, 240 210"
              stroke="#78350f"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </>
        )}

        {/* MOUTH - changes with state */}
        {state === 'celebrating' ? (
          // Big smile
          <path
            d="M 170 245 Q 200 260, 230 245"
            stroke="#78350f"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        ) : state === 'typing-name' || state === 'typing-email' ? (
          // Interested smile
          <path
            d="M 175 245 Q 200 252, 225 245"
            stroke="#78350f"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        ) : (
          // Neutral gentle smile
          <path
            d="M 180 250 Q 200 255, 220 250"
            stroke="#78350f"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        )}

        {/* BRANCHES/ARMS - animate when waving */}
        <g className={state === 'waving' ? 'animate-wave' : ''}>
          {/* Left branch */}
          <path
            d="M 170 180 Q 130 160, 100 170"
            stroke="#92400e"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          {/* Leaves on left branch */}
          <circle cx="105" cy="165" r="12" fill="#10b981" />
          <circle cx="95" cy="172" r="10" fill="#059669" />
          
          {/* Right branch */}
          <path
            d="M 230 180 Q 270 160, 300 170"
            stroke="#92400e"
            strokeWidth="6"
            strokeLinecap="round"
            fill="none"
          />
          {/* Leaves on right branch */}
          <circle cx="295" cy="165" r="12" fill="#10b981" />
          <circle cx="305" cy="172" r="10" fill="#059669" />
        </g>

        {/* CELEBRATION SPARKLES */}
        {state === 'celebrating' && (
          <>
            <circle cx="140" cy="80" r="4" fill="#fbbf24" className="animate-ping" />
            <circle cx="260" cy="90" r="3" fill="#fbbf24" className="animate-ping" style={{ animationDelay: '0.2s' }} />
            <circle cx="200" cy="50" r="5" fill="#fbbf24" className="animate-ping" style={{ animationDelay: '0.1s' }} />
            <circle cx="100" cy="120" r="3" fill="#34d399" className="animate-ping" style={{ animationDelay: '0.3s' }} />
            <circle cx="300" cy="130" r="4" fill="#34d399" className="animate-ping" style={{ animationDelay: '0.15s' }} />
          </>
        )}

        {/* GROWTH RINGS (subtle detail) */}
        <path 
          d="M 185 400 Q 190 395, 195 400" 
          stroke="#57270a" 
          strokeWidth="1.5" 
          fill="none" 
          opacity="0.4"
        />
        <path 
          d="M 205 400 Q 210 395, 215 400" 
          stroke="#57270a" 
          strokeWidth="1.5" 
          fill="none" 
          opacity="0.4"
        />

      </svg>

      {/* Hover glow effect */}
      {isHovering && (
        <div className="absolute inset-0 bg-green-400/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      )}

      <style jsx>{`
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        .animate-wave {
          animation: wave 0.6s ease-in-out 3;
          transform-origin: center;
        }
      `}</style>
    </div>
  )
}