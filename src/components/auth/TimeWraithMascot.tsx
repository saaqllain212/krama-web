'use client'

import { useEffect, useState, useRef } from 'react'

interface TimeWraithProps {
  state?: 'idle' | 'watching' | 'typing-email' | 'typing-password' | 'success' | 'error' | 'nodding'
}

export default function TimeWraithMascot({ state = 'idle' }: TimeWraithProps) {
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
      
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX)
      
      const maxDistance = 12
      const x = 50 + Math.cos(angle) * maxDistance
      const y = 50 + Math.sin(angle) * maxDistance
      
      setMousePos({ x, y })
    }

    if (state === 'watching' || state === 'idle' || state === 'typing-email') {
      window.addEventListener('mousemove', handleMouseMove)
      return () => window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [state])

  // Hover detection
  const handleMouseEnter = () => {
    setIsHovering(true)
    hoverTimeoutRef.current = setTimeout(() => {
      // Trigger nod after 3 seconds
    }, 3000)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
  }

  const getEyePosition = () => {
    if (state === 'typing-password') return { x: 50, y: 50 } // Eyes closed
    if (state === 'typing-email') return { x: 50, y: 65 } // Looking down
    if (state === 'success') return { x: 50, y: 40 } // Looking up happily
    if (state === 'error') return { x: 30, y: 50 } // Looking to side sadly
    return mousePos
  }

  const eyePos = getEyePosition()
  const isEyesClosed = state === 'typing-password'

  // FIX 2: Helper function to center pupils relative to the eye socket
  const getOffset = (val: number) => (val - 50) / 3

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      
      <svg 
        viewBox="0 0 400 500" 
        className={`w-full h-full transition-all duration-500 ${
          state === 'success' ? 'scale-105' : ''
        } ${
          state === 'error' ? 'animate-shake' : ''
        } ${
          state === 'nodding' ? 'animate-nod' : ''
        }`}
      >
        {/* GRADIENT DEFINITIONS */}
        <defs>
          <linearGradient id="hourglassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="50%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>
          <linearGradient id="sandGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
          <radialGradient id="glowGradient">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>
          
          {/* Filter for spooky glow */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* SPOOKY SHADOW BELOW */}
        <ellipse 
          cx="200" 
          cy="480" 
          rx="100" 
          ry="12" 
          fill="#1e293b" 
          opacity="0.3"
          className={state === 'idle' || state === 'watching' ? 'animate-pulse' : ''}
        />

        {/* HOURGLASS STRUCTURE */}
        
        {/* Bottom bulb */}
        <path
          d="M 140 480 Q 140 420, 200 380 Q 260 420, 260 480 L 140 480 Z"
          fill="url(#hourglassGradient)"
          stroke="#c2410c"
          strokeWidth="3"
          opacity="0.9"
        />

        {/* Top bulb */}
        <path
          d="M 140 120 Q 140 180, 200 220 Q 260 180, 260 120 L 140 120 Z"
          fill="url(#hourglassGradient)"
          stroke="#c2410c"
          strokeWidth="3"
          opacity="0.9"
        />

        {/* Wooden frame - top */}
        <rect x="130" y="110" width="140" height="15" rx="3" fill="#78350f" stroke="#57270a" strokeWidth="2" />
        
        {/* Wooden frame - bottom */}
        <rect x="130" y="475" width="140" height="15" rx="3" fill="#78350f" stroke="#57270a" strokeWidth="2" />

        {/* Decorative screws */}
        <circle cx="145" cy="117" r="3" fill="#a16207" />
        <circle cx="255" cy="117" r="3" fill="#a16207" />
        <circle cx="145" cy="482" r="3" fill="#a16207" />
        <circle cx="255" cy="482" r="3" fill="#a16207" />

        {/* SAND - animated falling */}
        <g className={state === 'success' ? '' : 'animate-sand-fall'}>
          {/* Sand in top bulb */}
          <path
            d="M 160 140 Q 165 160, 175 175 Q 180 180, 200 185 Q 220 180, 225 175 Q 235 160, 240 140 Z"
            fill="url(#sandGradient)"
            opacity="0.95"
          />
          
          {/* Falling sand stream */}
          <rect 
            x="197" 
            y="220" 
            width="6" 
            height="160" 
            fill="url(#sandGradient)"
            opacity="0.6"
          />
          
          {/* Sand in bottom bulb */}
          <path
            d="M 145 460 L 255 460 Q 250 450, 240 435 Q 230 420, 220 410 L 180 410 Q 170 420, 160 435 Q 150 450, 145 460 Z"
            fill="url(#sandGradient)"
          />
        </g>

        {/* FACE - appears in the middle section */}
        
        {/* Ghostly aura around face */}
        <circle 
          cx="200" 
          cy="300" 
          r="80" 
          fill="url(#glowGradient)" 
          className={isHovering ? 'animate-pulse' : ''}
        />

        {/* EYES - spooky and hollow */}
        {!isEyesClosed ? (
          <>
            {/* Left Eye */}
            <g filter="url(#glow)">
              {/* Eye socket - darker - Center 175, 295 */}
              <ellipse cx="175" cy="295" rx="16" ry="20" fill="#1e293b" opacity="0.6" />
              {/* Glowing pupil - Centered at 175 + offset */}
              <circle 
                cx={175 + getOffset(eyePos.x)} 
                cy={295 + getOffset(eyePos.y)} 
                r="7" 
                fill="#fb923c"
                className="transition-all duration-200 ease-out"
              />
              {/* Inner glow */}
              <circle 
                cx={175 + getOffset(eyePos.x)} 
                cy={295 + getOffset(eyePos.y)} 
                r="4" 
                fill="#fbbf24"
                className="transition-all duration-200 ease-out"
              />
            </g>

            {/* Right Eye */}
            <g filter="url(#glow)">
              {/* Eye socket - Center 225, 295 */}
              <ellipse cx="225" cy="295" rx="16" ry="20" fill="#1e293b" opacity="0.6" />
              {/* Glowing pupil - Centered at 225 + offset */}
              <circle 
                cx={225 + getOffset(eyePos.x)} 
                cy={295 + getOffset(eyePos.y)} 
                r="7" 
                fill="#fb923c"
                className="transition-all duration-200 ease-out"
              />
              {/* Inner glow */}
              <circle 
                cx={225 + getOffset(eyePos.x)} 
                cy={295 + getOffset(eyePos.y)} 
                r="4" 
                fill="#fbbf24"
                className="transition-all duration-200 ease-out"
              />
            </g>
          </>
        ) : (
          <>
            {/* Closed eyes - peaceful lines */}
            <path
              d="M 162 295 Q 175 300, 188 295"
              stroke="#1e293b"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity="0.8"
            />
            <path
              d="M 212 295 Q 225 300, 238 295"
              stroke="#1e293b"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity="0.8"
            />
          </>
        )}

        {/* MOUTH - changes with state */}
        {state === 'success' ? (
          // Slight upward curve - approval
          <path
            d="M 175 330 Q 200 325, 225 330"
            stroke="#1e293b"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />
        ) : state === 'error' ? (
          // Downward frown - disapproval
          <path
            d="M 175 325 Q 200 335, 225 325"
            stroke="#1e293b"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />
        ) : (
          // Neutral - straight line
          <line
            x1="180"
            y1="328"
            x2="220"
            y2="328"
            stroke="#1e293b"
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.5"
          />
        )}

        {/* ETHEREAL WISPY ARMS - float around */}
        <g opacity="0.4" className="animate-float">
          {/* Left wisp */}
          <path
            d="M 140 300 Q 110 280, 90 290 Q 85 295, 88 300"
            stroke="#f97316"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />
          {/* Right wisp */}
          <path
            d="M 260 300 Q 290 280, 310 290 Q 315 295, 312 300"
            stroke="#f97316"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            opacity="0.6"
          />
        </g>

        {/* HOURGLASS GLASS SHINE */}
        <ellipse 
          cx="165" 
          cy="200" 
          rx="15" 
          ry="35" 
          fill="white" 
          opacity="0.15"
        />
        <ellipse 
          cx="165" 
          cy="400" 
          rx="12" 
          ry="30" 
          fill="white" 
          opacity="0.1"
        />

        {/* ERROR STATE - shake particles */}
        {state === 'error' && (
          <>
            <circle cx="240" cy="280" r="3" fill="#ef4444" className="animate-ping" />
            <circle cx="160" cy="285" r="2" fill="#ef4444" className="animate-ping" style={{ animationDelay: '0.1s' }} />
            <circle cx="200" cy="270" r="2.5" fill="#ef4444" className="animate-ping" style={{ animationDelay: '0.2s' }} />
          </>
        )}

        {/* SUCCESS STATE - approval particles */}
        {state === 'success' && (
          <>
            <circle cx="240" cy="280" r="3" fill="#10b981" className="animate-ping" />
            <circle cx="160" cy="285" r="2" fill="#10b981" className="animate-ping" style={{ animationDelay: '0.1s' }} />
            <circle cx="200" cy="270" r="2.5" fill="#10b981" className="animate-ping" style={{ animationDelay: '0.15s' }} />
          </>
        )}

        {/* TIME REMAINING TEXT (spooky detail) */}
        <text
          x="200"
          y="245"
          textAnchor="middle"
          fill="#1e293b"
          fontSize="10"
          fontFamily="monospace"
          opacity="0.3"
          fontWeight="bold"
        >
          TIME WAITS
        </text>

      </svg>

      {/* Hover glow effect */}
      {isHovering && (
        <div className="absolute inset-0 bg-orange-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      )}

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px) rotate(-2deg); }
          75% { transform: translateX(5px) rotate(2deg); }
        }
        @keyframes nod {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes sand-fall {
          0% { transform: translateY(0); }
          100% { transform: translateY(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out 2;
        }
        .animate-nod {
          animation: nod 0.8s ease-in-out 2;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-sand-fall {
          animation: sand-fall 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}