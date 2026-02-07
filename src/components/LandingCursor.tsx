'use client'

import { useEffect, useRef, useState } from 'react'

export default function LandingCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const outlineRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // 1. Initialize Visibility (Desktop Check)
  useEffect(() => {
    // Only show on desktop (>= 1024px)
    const checkDesktop = () => setIsVisible(window.innerWidth >= 1024)
    checkDesktop()
    
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // 2. Animation Logic
  useEffect(() => {
    // If not desktop, don't run animation loop
    if (!isVisible) return

    const dot = dotRef.current
    const outline = outlineRef.current
    
    // Safety check: if refs aren't ready, skip
    if (!dot || !outline) return

    let mouseX = 0
    let mouseY = 0
    let dotX = 0
    let dotY = 0
    let outlineX = 0
    let outlineY = 0
    let animationId: number

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const animate = () => {
      // --- SPEED CONFIGURATION ---
      // Dot: 0.9 = Snappy, almost instant
      // Ring: 0.3 = Smooth but tight follow (no huge gap)
      const dotSpeed = 0.9
      const outlineSpeed = 0.3

      // Smooth interpolation
      dotX += (mouseX - dotX) * dotSpeed
      dotY += (mouseY - dotY) * dotSpeed
      outlineX += (mouseX - outlineX) * outlineSpeed
      outlineY += (mouseY - outlineY) * outlineSpeed

      // Apply positions
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

    // Hover Event Listeners
    const handleMouseEnter = () => setIsHovering(true)
    const handleMouseLeave = () => setIsHovering(false)

    window.addEventListener('mousemove', handleMouseMove)

    // Attach listeners to all interactive elements
    const interactiveElements = document.querySelectorAll(
      'a, button, input, textarea, [role="button"], .hover-cursor'
    )
    
    interactiveElements.forEach((el) => {
      el.addEventListener('mouseenter', handleMouseEnter)
      el.addEventListener('mouseleave', handleMouseLeave)
    })

    // Start the loop
    animationId = requestAnimationFrame(animate)

    // Cleanup function
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter)
        el.removeEventListener('mouseleave', handleMouseLeave)
      })
      cancelAnimationFrame(animationId)
    }
  }, [isVisible])

  // Don't render anything if not desktop
  if (!isVisible) return null

  return (
    <>
      {/* --- LAYER 1: The Dot Group (High Z-Index) --- */}
      <div
        ref={dotRef}
        className={`fixed pointer-events-none z-[9999] transition-transform duration-100 ease-out ${
          isHovering ? 'scale-150' : 'scale-100'
        }`}
        style={{ 
          left: -100, top: -100, // Start off-screen
          transform: 'translate(-50%, -50%)',
          willChange: 'transform'
        }}
      >
        <div className="relative">
          {/* A. The Glow Aura (Blurred background) */}
          <div
            className={`absolute inset-0 rounded-full blur-md transition-all duration-300 ${
              isHovering 
                ? 'bg-purple-400 scale-150 opacity-60' 
                : 'bg-primary-400 scale-100 opacity-40'
            }`}
            style={{ 
              width: '12px', 
              height: '12px', 
              left: '-3px', 
              top: '-3px' 
            }}
          />
          {/* B. The Solid Core Dot */}
          <div
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
              isHovering ? 'bg-purple-500' : 'bg-primary-500'
            }`}
          />
        </div>
      </div>

      {/* --- LAYER 2: The Outline Ring (Lower Z-Index) --- */}
      <div
        ref={outlineRef}
        className={`fixed pointer-events-none z-[9998] transition-all duration-300 ${
          isHovering 
            ? 'scale-150 opacity-70 border-purple-500' 
            : 'scale-100 opacity-30 border-primary-500'
        }`}
        style={{ 
          left: -100, top: -100,
          transform: 'translate(-50%, -50%)',
          willChange: 'transform'
        }}
      >
        <div className="w-8 h-8 rounded-full border-2" />
      </div>
    </>
  )
}