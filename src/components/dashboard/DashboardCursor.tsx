'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

// Define the available modes for the cursor
type CursorMode = 'default' | 'focus' | 'review' | 'mock' | 'reading'

export default function DashboardCursor() {
  // Refs for the DOM elements
  const dotRef = useRef<HTMLDivElement>(null)
  const outlineRef = useRef<HTMLDivElement>(null)
  
  // State management
  const [mode, setMode] = useState<CursorMode>('default')
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  
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

    // Position variables
    let mouseX = 0
    let mouseY = 0
    let dotX = 0
    let dotY = 0
    let outlineX = 0
    let outlineY = 0
    let animationId: number

    // Track mouse coordinates
    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    // The Animation Frame
    const animate = () => {
      // --- SPEED LOGIC ---
      // If in Focus Mode: We slow it down slightly to be "calmer" and less distracting
      // If in Default/Other: We keep it snappy (0.9/0.3) like the landing page
      const isFocus = mode === 'focus'
      
      const dotSpeed = isFocus ? 0.2 : 0.9
      const outlineSpeed = isFocus ? 0.1 : 0.3

      // Smooth interpolation (Lerp)
      dotX += (mouseX - dotX) * dotSpeed
      dotY += (mouseY - dotY) * dotSpeed
      outlineX += (mouseX - outlineX) * outlineSpeed
      outlineY += (mouseY - outlineY) * outlineSpeed

      // Update DOM elements
      if (dot) {
        dot.style.left = `${dotX}px`
        dot.style.top = `${dotY}px`
      }
      if (outline) {
        outline.style.left = `${outlineX}px`
        outline.style.top = `${outlineY}px`
      }

      animationId = requestAnimationFrame(animate)
    }

    // Hover Handlers
    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    window.addEventListener('mousemove', handleMouseMove)
    
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
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter)
        el.removeEventListener('mouseleave', handleMouseLeave)
      })
      cancelAnimationFrame(animationId)
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
          glowSize: 'w-3 h-3',
          pulseEnabled: true, // Pulse in focus mode
        }
      case 'review':
        return {
          dotColor: 'bg-blue-500',
          glowColor: 'bg-blue-400',
          ringColor: 'border-blue-500',
          glowSize: 'w-2.5 h-2.5',
          pulseEnabled: false,
        }
      case 'mock':
        return {
          dotColor: 'bg-orange-500',
          glowColor: 'bg-orange-400',
          ringColor: 'border-orange-500',
          glowSize: 'w-3 h-3',
          pulseEnabled: false,
        }
      case 'reading':
        return {
          dotColor: 'bg-purple-500',
          glowColor: 'bg-purple-400',
          ringColor: 'border-purple-500',
          glowSize: 'w-2 h-2',
          pulseEnabled: false,
        }
      default:
        return {
          dotColor: 'bg-primary-500',
          glowColor: 'bg-primary-400',
          ringColor: 'border-primary-500',
          glowSize: 'w-2.5 h-2.5',
          pulseEnabled: false,
        }
    }
  }

  const style = getCursorStyle()

  return (
    <>
      {/* --- LAYER 1: The Dot & Glow --- */}
      <div
        ref={dotRef}
        className={`fixed pointer-events-none z-[9999] transition-transform duration-100 ease-out ${
          isHovering ? 'scale-150' : 'scale-100'
        }`}
        style={{ 
          left: -100, top: -100,
          transform: 'translate(-50%, -50%)',
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
              width: style.glowSize.includes('w-3') ? '12px' : '8px',
              height: style.glowSize.includes('h-3') ? '12px' : '8px',
              left: '-2px', 
              top: '-2px' 
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
          isHovering ? 'scale-150 opacity-70' : 'scale-100 opacity-30'
        } ${
          // Pulse the ring too in focus mode
          mode === 'focus' ? 'animate-pulse' : ''
        }`}
        style={{ 
          left: -100, top: -100,
          transform: 'translate(-50%, -50%)',
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