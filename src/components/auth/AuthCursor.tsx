'use client'

import { useEffect, useRef, useState } from 'react'

export default function AuthCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const outlineRef = useRef<HTMLDivElement>(null)
  const [isHovering, setIsHovering] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  // 1. Initialize Visibility (Desktop Check)
  useEffect(() => {
    const checkDesktop = () => setIsVisible(window.innerWidth >= 1024)
    checkDesktop()
    
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // 2. Animation Logic
  useEffect(() => {
    if (!isVisible) return

    const dot = dotRef.current
    const outline = outlineRef.current
    
    if (!dot || !outline) return

    // Initialize at center to avoid jump on load
    const initialX = window.innerWidth / 2
    const initialY = window.innerHeight / 2
    
    let mouseX = initialX
    let mouseY = initialY
    let dotX = initialX
    let dotY = initialY
    let outlineX = initialX
    let outlineY = initialY
    let animationId: number

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    const animate = () => {
      // Fast and responsive for auth pages
      const dotSpeed = 0.25
      const outlineSpeed = 0.15

      dotX += (mouseX - dotX) * dotSpeed
      dotY += (mouseY - dotY) * dotSpeed
      outlineX += (mouseX - outlineX) * outlineSpeed
      outlineY += (mouseY - outlineY) * outlineSpeed

      if (dot) {
        dot.style.transform = `translate(${dotX}px, ${dotY}px) translate(-50%, -50%)`
      }
      if (outline) {
        outline.style.transform = `translate(${outlineX}px, ${outlineY}px) translate(-50%, -50%)`
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

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      interactiveElements.forEach((el) => {
        el.removeEventListener('mouseenter', handleMouseEnter)
        el.removeEventListener('mouseleave', handleMouseLeave)
      })
      cancelAnimationFrame(animationId)
    }
  }, [isVisible])

  if (!isVisible) return null

  return (
    <>
      {/* The Dot */}
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
          {/* Glow */}
          <div
            className={`absolute inset-0 rounded-full blur-md transition-all duration-300 ${
              isHovering 
                ? 'bg-primary-400 scale-150 opacity-60' 
                : 'bg-primary-400 scale-100 opacity-40'
            }`}
            style={{ 
              width: '14px', 
              height: '14px', 
              left: '-4px', 
              top: '-4px' 
            }}
          />
          {/* Core */}
          <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
        </div>
      </div>

      {/* The Ring */}
      <div
        ref={outlineRef}
        className={`fixed pointer-events-none z-[9998] transition-all duration-300 ${
          isHovering 
            ? 'scale-150 opacity-70' 
            : 'scale-100 opacity-40'
        }`}
        style={{ 
          left: 0,
          top: 0,
          willChange: 'transform'
        }}
      >
        <div className="w-8 h-8 rounded-full border-2 border-primary-500" />
      </div>
    </>
  )
}