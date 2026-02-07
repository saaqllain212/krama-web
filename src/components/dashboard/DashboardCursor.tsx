'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

// Define the available modes for the cursor
type CursorMode = 'default' | 'focus' | 'review' | 'mock' | 'reading'

interface TrailPoint {
  x: number
  y: number
}

interface Ripple {
  x: number
  y: number
  id: number
}

export default function DashboardCursor() {
  // Refs for the DOM elements
  const dotRef = useRef<HTMLDivElement>(null)
  const outlineRef = useRef<HTMLDivElement>(null)
  
  // State management
  const [mode, setMode] = useState<CursorMode>('default')
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [trail, setTrail] = useState<TrailPoint[]>([])
  const [ripples, setRipples] = useState<Ripple[]>([])
  
  const pathname = usePathname()

  // 1. Determine Cursor Mode based on current URL
  useEffect(() => {
    if (!pathname) return
    
    if (pathname.includes('/focus')) {
      setMode('focus')
    } else if (pathname.includes('/review')) {
      setMode('review')
    } else if (pathname.includes('/mocks')) {
      setMode('mock')
    } else if (pathname.includes('/syllabus') || pathname.includes('/mcq')) {
      setMode('reading')
    } else {
      setMode('default')
    }
  }, [pathname])

  // 2. Initialize Visibility (Desktop Check)
  useEffect(() => {
    const checkDesktop = () => setIsVisible(window.innerWidth >= 1024)
    checkDesktop()
    
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // 3. Main Animation Loop
  useEffect(() => {
    // Only run if visible
    if (!isVisible) return

    // Safety check for refs
    const dot = dotRef.current
    const outline = outlineRef.current
    if (!dot || !outline) return

    // Initialize at center to avoid jump on load
    const initialX = window.innerWidth / 2
    const initialY = window.innerHeight / 2

    // Position variables
    let mouseX = initialX
    let mouseY = initialY
    let dotX = initialX
    let dotY = initialY
    let outlineX = initialX
    let outlineY = initialY
    let animationId: number
    let trailInterval: NodeJS.Timeout

    // Track mouse coordinates
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    // Click Ripple Effect (Pro Tip #2)
    const handleClick = (e: MouseEvent) => {
      const newRipple = {
        x: e.clientX,
        y: e.clientY,
        id: Date.now()
      }
      setRipples(prev => [...prev, newRipple])
      
      setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== newRipple.id))
      }, 600)
    }

    // The Animation Frame
    const animate = () => {
      // --- IMPROVED SPEED LOGIC ---
      const isFocus = mode === 'focus'
      
      // Much faster speeds for responsive feel
      // Focus mode: slightly slower but still responsive
      const dotSpeed = isFocus ? 0.18 : 0.25
      const outlineSpeed = isFocus ? 0.12 : 0.15

      // Smooth interpolation (Lerp)
      dotX += (mouseX - dotX) * dotSpeed
      dotY += (mouseY - dotY) * dotSpeed
      outlineX += (mouseX - outlineX) * outlineSpeed
      outlineY += (mouseY - outlineY) * outlineSpeed

      // Update DOM elements using transform for better performance
      if (dot) {
        dot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`
      }
      if (outline) {
        outline.style.transform = `translate(${outlineX}px, ${outlineY}px) translate(-50%, -50%)`
      }

      animationId = requestAnimationFrame(animate)
    }

    // Trail Effect (Pro Tip #1) - only in focus mode
    if (mode === 'focus') {
      trailInterval = setInterval(() => {
        setTrail(prev => {
          const newTrail = [...prev, { x: mouseX, y: mouseY }]
          return newTrail.slice(-8) // Keep last 8 points
        })
      }, 50)
    }

    // Hover Handlers
    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('click', handleClick)
    
    // Attach to interactive elements
    const interactiveElements = document.querySelectorAll(
      'a, button, input, textarea, [role="button"], .hover-cursor'
    )
    
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter)
      el.addEventListener('mouseleave', handleMouseLeave)
    })

    // Start Animation
    animationId = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('click', handleClick)
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter)
        el.removeEventListener('mouseleave', handleMouseLeave)
      })
      cancelAnimationFrame(animationId)
      if (trailInterval) clearInterval(trailInterval)
    }
  }, [isVisible, mode]) // Re-run when mode changes to adjust speed

  // Don't render if not desktop
  if (!isVisible) return null

  // 4. Configuration for Colors & Effects per Mode
  const getCursorStyle = () => {
    switch (mode) {
      case 'focus':
        return {
          dotColor: 'bg-green-500',
          glowColor: 'bg-green-400',
          ringColor: 'border-green-500',
          rippleColor: 'border-green-400',
          glowSize: 'w-3 h-3',
          pulseEnabled: true, // Pulse in focus mode
        }
      case 'review':
        return {
          dotColor: 'bg-blue-500',
          glowColor: 'bg-blue-400',
          ringColor: 'border-blue-500',
          rippleColor: 'border-blue-400',
          glowSize: 'w-2.5 h-2.5',
          pulseEnabled: false,
        }
      case 'mock':
        return {
          dotColor: 'bg-orange-500',
          glowColor: 'bg-orange-400',
          ringColor: 'border-orange-500',
          rippleColor: 'border-orange-400',
          glowSize: 'w-3 h-3',
          pulseEnabled: false,
        }
      case 'reading':
        return {
          dotColor: 'bg-purple-500',
          glowColor: 'bg-purple-400',
          ringColor: 'border-purple-500',
          rippleColor: 'border-purple-400',
          glowSize: 'w-2 h-2',
          pulseEnabled: false,
        }
      default:
        return {
          dotColor: 'bg-primary-500',
          glowColor: 'bg-primary-400',
          ringColor: 'border-primary-500',
          rippleColor: 'border-primary-400',
          glowSize: 'w-2.5 h-2.5',
          pulseEnabled: false,
        }
    }
  }

  const style = getCursorStyle()

  return (
    <>
      {/* --- TRAIL EFFECT (Pro Tip #1) - Only in Focus Mode --- */}
      {mode === 'focus' && trail.map((point, i) => (
        <div
          key={i}
          className="fixed pointer-events-none z-[9996]"
          style={{
            left: point.x,
            top: point.y,
            transform: 'translate(-50%, -50%)',
            opacity: (i / trail.length) * 0.3
          }}
        >
          <div className={`w-1 h-1 ${style.dotColor} rounded-full`} />
        </div>
      ))}

      {/* --- CLICK RIPPLES (Pro Tip #2) --- */}
      {ripples.map(ripple => (
        <div
          key={ripple.id}
          className="fixed pointer-events-none z-[9997]"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className={`w-10 h-10 border-2 ${style.rippleColor} rounded-full animate-ping opacity-60`} />
        </div>
      ))}

      {/* --- LAYER 1: The Dot & Glow --- */}
      <div
        ref={dotRef}
        className={`fixed pointer-events-none z-[9999] transition-transform duration-100 ease-out ${
          isHovering ? 'scale-150' : 'scale-100'
        }`}
        style={{ 
          left: 0,
          top: 0,
          willChange: 'transform'
        }}
      >
        <div className="relative">
          {/* Inner Glow Aura */}
          <div
            className={`absolute inset-0 rounded-full blur-md transition-all duration-300 ${
              style.glowColor
            } ${
              isHovering ? 'scale-150 opacity-60' : 'scale-100 opacity-40'
            } ${
              style.pulseEnabled ? 'animate-pulse' : ''
            }`}
            style={{ 
              width: style.glowSize.includes('w-3') ? '14px' : style.glowSize.includes('w-2.5') ? '12px' : '10px',
              height: style.glowSize.includes('h-3') ? '14px' : style.glowSize.includes('h-2.5') ? '12px' : '10px',
              left: '-4px', 
              top: '-4px' 
            }}
          />
          {/* Core Dot */}
          <div className={`w-1.5 h-1.5 rounded-full ${style.dotColor}`} />
        </div>
      </div>

      {/* --- LAYER 2: The Outline Ring --- */}
      <div
        ref={outlineRef}
        className={`fixed pointer-events-none z-[9998] transition-all duration-300 ${
          isHovering ? 'scale-150 opacity-70' : 'scale-100 opacity-40'
        } ${
          // Pulse the ring too in focus mode
          mode === 'focus' ? 'animate-pulse' : ''
        }`}
        style={{ 
          left: 0,
          top: 0,
          willChange: 'transform'
        }}
      >
        <div className={`w-8 h-8 rounded-full border-2 ${style.ringColor}`} />
      </div>

      {/* --- LAYER 3: The Mode Indicator Badge --- */}
      {/* Shows current mode in bottom right, except for default */}
      {mode !== 'default' && (
        <div
          className="fixed bottom-4 right-4 bg-black/80 text-white px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm z-[9997] transition-all duration-300 animate-fade-in"
          style={{ pointerEvents: 'none' }}
        >
          <span className="flex items-center gap-2">
            <span 
              className={`w-2 h-2 rounded-full ${style.dotColor} ${
                style.pulseEnabled ? 'animate-pulse' : ''
              }`} 
            />
            {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
          </span>
        </div>
      )}
    </>
  )
}