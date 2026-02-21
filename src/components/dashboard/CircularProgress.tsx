'use client'

import { useEffect, useState } from 'react'

interface CircularProgressProps {
  percentage: number
  size?: number
  strokeWidth?: number
  color?: string
  backgroundColor?: string
  showText?: boolean
  children?: React.ReactNode
}

export default function CircularProgress({
  percentage,
  size = 120,
  strokeWidth = 8,
  color = '#5B8FF9',
  backgroundColor = '#e5e7eb',
  showText = true,
  children
}: CircularProgressProps) {
  const [animatedPct, setAnimatedPct] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (animatedPct / 100) * circumference

  // Animate from 0 to target on mount / value change
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedPct(percentage), 100)
    return () => clearTimeout(timer)
  }, [percentage])

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {showText && !children && (
          <span className="text-xl sm:text-2xl font-bold text-gray-900">
            {Math.round(animatedPct)}%
          </span>
        )}
        {children}
      </div>
    </div>
  )
}
