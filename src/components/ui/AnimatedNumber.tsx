'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedNumberProps {
  value: number
  duration?: number // ms
  className?: string
  suffix?: string
  prefix?: string
  decimals?: number
}

export default function AnimatedNumber({
  value,
  duration = 800,
  className = '',
  suffix = '',
  prefix = '',
  decimals = 0,
}: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0)
  const prevValue = useRef(0)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    const start = prevValue.current
    const end = value
    const startTime = performance.now()

    // Easing function — ease out cubic
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

    const animate = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOut(progress)

      const current = start + (end - start) * easedProgress
      setDisplay(current)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        setDisplay(end)
        prevValue.current = end
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [value, duration])

  const formatted = decimals > 0 
    ? display.toFixed(decimals) 
    : Math.round(display).toString()

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}{formatted}{suffix}
    </span>
  )
}