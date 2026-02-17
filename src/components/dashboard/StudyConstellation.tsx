'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

type Star = {
  x: number
  y: number
  size: number
  opacity: number
  delay: number
}

// Generate deterministic star position from session index
function generateStar(index: number, total: number): Star {
  // Use golden angle for even distribution
  const goldenAngle = Math.PI * (3 - Math.sqrt(5))
  const theta = index * goldenAngle
  const r = Math.sqrt(index / total) * 42 // 42% of viewbox radius
  
  const x = 50 + r * Math.cos(theta)
  const y = 50 + r * Math.sin(theta)
  
  // Larger sessions = bigger stars
  const size = 1 + (index % 3) * 0.5
  const opacity = 0.6 + (index % 4) * 0.1

  return { x, y, size, opacity, delay: index * 0.05 }
}

// Generate constellation lines (connect nearby stars)
function generateLines(stars: Star[]): { x1: number, y1: number, x2: number, y2: number }[] {
  if (stars.length < 2) return []
  const lines: { x1: number, y1: number, x2: number, y2: number }[] = []
  
  for (let i = 1; i < stars.length && i < 60; i++) {
    // Connect each star to the previous one if close enough
    const prev = stars[i - 1]
    const curr = stars[i]
    const dist = Math.sqrt((curr.x - prev.x) ** 2 + (curr.y - prev.y) ** 2)
    if (dist < 25) {
      lines.push({ x1: prev.x, y1: prev.y, x2: curr.x, y2: curr.y })
    }
  }
  return lines
}

export default function StudyConstellation({ compact = false }: { compact?: boolean }) {
  const supabase = useMemo(() => createClient(), [])
  const [sessionCount, setSessionCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSessions = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      
      const { count } = await supabase
        .from('focus_logs')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
      
      setSessionCount(count || 0)
      setLoading(false)
    }
    fetchSessions()
  }, [supabase])

  const stars = useMemo(() => {
    const total = Math.min(sessionCount, 100) // Cap at 100 visible stars
    return Array.from({ length: total }, (_, i) => generateStar(i, Math.max(total, 1)))
  }, [sessionCount])

  const lines = useMemo(() => generateLines(stars), [stars])

  if (loading) return null
  if (sessionCount === 0) return null

  const size = compact ? 120 : 200

  return (
    <div className="flex flex-col items-center">
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="drop-shadow-lg"
      >
        {/* Background glow */}
        <defs>
          <radialGradient id="galaxyGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.15" />
            <stop offset="70%" stopColor="#3B82F6" stopOpacity="0.05" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <filter id="starGlow">
            <feGaussianBlur stdDeviation="0.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        
        <circle cx="50" cy="50" r="48" fill="url(#galaxyGlow)" />

        {/* Constellation lines */}
        {lines.map((line, i) => (
          <line
            key={`line-${i}`}
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke="#8B5CF6"
            strokeOpacity="0.2"
            strokeWidth="0.3"
          >
            <animate
              attributeName="stroke-opacity"
              values="0;0.2"
              dur="1s"
              begin={`${i * 0.03}s`}
              fill="freeze"
            />
          </line>
        ))}

        {/* Stars */}
        {stars.map((star, i) => (
          <circle
            key={`star-${i}`}
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill="#E0E7FF"
            opacity="0"
            filter="url(#starGlow)"
          >
            <animate
              attributeName="opacity"
              values={`0;${star.opacity}`}
              dur="0.6s"
              begin={`${star.delay}s`}
              fill="freeze"
            />
            {/* Twinkle animation for every 5th star */}
            {i % 5 === 0 && (
              <animate
                attributeName="opacity"
                values={`${star.opacity};${star.opacity * 0.5};${star.opacity}`}
                dur={`${2 + (i % 3)}s`}
                begin={`${star.delay + 1}s`}
                repeatCount="indefinite"
              />
            )}
          </circle>
        ))}

        {/* Center glow - gets brighter with more sessions */}
        <circle
          cx="50"
          cy="50"
          r={3 + Math.min(sessionCount / 10, 5)}
          fill="#A78BFA"
          opacity={Math.min(0.1 + sessionCount * 0.005, 0.4)}
          filter="url(#starGlow)"
        />
      </svg>
      
      {!compact && (
        <div className="text-center mt-3">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Your Study Galaxy</div>
          <div className="text-sm font-semibold text-purple-600">{sessionCount} {sessionCount === 1 ? 'star' : 'stars'} earned</div>
        </div>
      )}
    </div>
  )
}
