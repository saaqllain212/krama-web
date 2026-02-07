'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import confetti from 'canvas-confetti'
import { Shield, Zap } from 'lucide-react'
import { motion } from 'framer-motion'

export default function InitiationModal() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [show, setShow] = useState(false)

  useEffect(() => {
    // Check if the URL has ?initiation=true
    if (searchParams.get('initiation') === 'true') {
      setShow(true)
      triggerCelebration()
    }
  }, [searchParams])

  const triggerCelebration = () => {
    // Fire cinematic confetti for 3 seconds
    const duration = 3 * 1000
    const end = Date.now() + duration

    const frame = () => {
      // Launch from Left
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#6366f1', '#8b5cf6', '#a855f7', '#3b82f6'] // Krama Brand Colors
      })
      // Launch from Right
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#6366f1', '#8b5cf6', '#a855f7', '#3b82f6']
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    frame()
  }

  const handleEnter = () => {
    // Clear the URL param without reloading the page
    router.replace('/dashboard')
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 text-white backdrop-blur-md animate-in fade-in duration-500">
      <div className="max-w-lg w-full p-8 text-center relative overflow-hidden">
        
        {/* Background Glow Effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-500 blur-[120px] opacity-10 pointer-events-none" />

        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-10 space-y-8"
        >
          {/* Badge Icon */}
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary-500 to-purple-500 text-white rounded-full flex items-center justify-center border-4 border-white shadow-lg">
            <Shield size={48} strokeWidth={3} />
          </div>

          {/* Main Text */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tighter italic leading-none">
              Protocol <br/> <span className="text-primary-400">Unlocked</span>
            </h1>
            <p className="text-lg font-medium text-white/60 tracking-widest uppercase">
              Welcome to the 1% Club
            </p>
          </div>

          {/* Status Chip */}
          <div className="inline-flex items-center gap-2 border border-white/20 bg-white/5 px-4 py-2 rounded-full backdrop-blur-sm">
             <Zap size={16} className="text-primary-400" />
             <span className="text-xs font-bold uppercase tracking-widest">Lifetime Access Granted</span>
          </div>

          {/* Action Button */}
          <button 
            onClick={handleEnter}
            className="w-full bg-white text-black py-4 font-bold uppercase tracking-widest hover:bg-primary-400 transition-colors shadow-lg hover:shadow-xl"
          >
            Enter War Room
          </button>
        </motion.div>

      </div>
    </div>
  )
}