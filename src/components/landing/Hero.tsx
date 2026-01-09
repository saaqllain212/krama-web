'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)

  // ... (Timer logic stays the same) ...
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

  return (
    <section className="grid min-h-[80vh] grid-cols-1 items-center gap-16 px-6 py-24 md:grid-cols-2 md:px-16">
      
      {/* Left Column */}
      <div className="flex flex-col items-start gap-8">
        <h1 className="text-6xl font-bold leading-[0.95] tracking-tighter md:text-8xl">
          Study without <br />
          the pressure.
        </h1>
        
        <p className="max-w-md text-xl font-medium text-black/60 leading-relaxed">
          Simple tools for students who procrastinate. <br/>
          No subscriptions. No noise.
        </p>

        {/* THICKER BORDER + SHARP SHADOW */}
        <Link 
          href="/signup" 
          className="group mt-2 inline-flex items-center gap-3 border-neo bg-white px-8 py-5 text-lg font-bold shadow-neo transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-neo"
        >
          Start 14-Day Trial
          <ArrowRight className="h-6 w-6 stroke-[3px] transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Right Column */}
      <div className="flex justify-center md:justify-end">
        <div className="w-full max-w-lg border-neo bg-white p-10 shadow-neo">
          <div className="mb-10 text-center text-xs font-bold uppercase tracking-[0.2em] text-black/40">
            Pomodoro Timer
          </div>

          <div className="text-center text-9xl font-bold tracking-tighter tabular-nums leading-none">
            {formatTime(timeLeft)}
          </div>

          <div className="mt-10 flex gap-4">
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className="w-full border-neo bg-brand py-4 text-base font-bold uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              {isRunning ? 'Pause' : 'Start'}
            </button>
            
            <button 
              onClick={() => { setIsRunning(false); setTimeLeft(25 * 60); }}
              className="w-full border-neo bg-white py-4 text-base font-bold uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}