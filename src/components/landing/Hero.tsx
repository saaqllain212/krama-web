'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Play, RotateCcw } from 'lucide-react'
import { useTracker } from '@/analytics/useTracker' 
import { EVENTS } from '@/analytics/events'

export default function Hero() {
  const { track } = useTracker()
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((p) => p - 1), 1000)
    } else if (timeLeft === 0) setIsRunning(false)
    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100

  return (
    <section className="grid min-h-[85vh] grid-cols-1 items-center gap-12 px-6 py-20 md:grid-cols-2 md:gap-16 md:px-12 lg:px-16">
      
      {/* Left Column */}
      <div className="flex flex-col items-start gap-6">
        {/* Small Badge */}
        <div className="inline-flex items-center gap-2 border-2 border-black/10 bg-white px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-black/60">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          Now in Public Beta
        </div>

        <h1 className="text-5xl font-bold leading-[0.95] tracking-tighter md:text-7xl lg:text-8xl">
          Study without <br />
          <span className="text-black/30">the pressure.</span>
        </h1>
        
        <p className="max-w-md text-lg font-medium text-black/60 leading-relaxed md:text-xl">
          Simple tools for students who procrastinate. <br className="hidden md:block"/>
          No subscriptions. No noise. Just focus.
        </p>

        <Link 
          href="/signup" 
          onClick={() => track(EVENTS.AUTH_SIGNUP_CLICKED, { location: 'hero_section' })}
          className="group mt-4 inline-flex items-center gap-3 border-2 border-black bg-white px-8 py-5 text-base font-bold uppercase tracking-wide shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:text-lg"
        >
          Start 14-Day Free Trial
          <ArrowRight className="h-5 w-5 stroke-[2.5px] transition-transform group-hover:translate-x-1" />
        </Link>

        <p className="text-xs font-medium text-black/40 mt-2">
          No credit card required • Cancel anytime
        </p>
      </div>

      {/* Right Column - Timer */}
      <div className="flex justify-center md:justify-end">
        <div className="w-full max-w-md border-2 border-black bg-white p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:p-10">
          
          {/* Timer Header */}
          <div className="mb-8 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">
              Pomodoro Timer
            </span>
            <div className="flex items-center gap-1 text-[10px] font-bold uppercase text-black/40">
              <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-black/20'}`} />
              {isRunning ? 'Running' : 'Paused'}
            </div>
          </div>

          {/* Timer Display */}
          <div className="text-center">
            <div className="text-8xl font-bold tracking-tighter tabular-nums leading-none md:text-9xl">
              {formatTime(timeLeft)}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-8 h-2 w-full bg-black/10 overflow-hidden">
            <div 
              className="h-full bg-brand transition-all duration-1000 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Controls */}
          <div className="mt-8 flex gap-3">
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-black bg-brand py-4 text-sm font-bold uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              <Play size={16} className={isRunning ? 'hidden' : ''} fill="black" />
              {isRunning ? 'Pause' : 'Start'}
            </button>
            
            <button 
              onClick={() => { setIsRunning(false); setTimeLeft(25 * 60); }}
              className="flex items-center justify-center gap-2 border-2 border-black bg-white px-6 py-4 text-sm font-bold uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              title="Reset Timer"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}