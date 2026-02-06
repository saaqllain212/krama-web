'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, Play, RotateCcw, Sparkles, Brain } from 'lucide-react'
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
    <section className="relative min-h-[90vh] px-6 py-20 md:px-12 lg:px-16 overflow-hidden">
      
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-purple-50 opacity-60" />
      
      {/* Animated Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.05) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(0,0,0,0.05) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 grid min-h-[85vh] grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
        
        {/* Left Column */}
        <div className="flex flex-col items-start gap-8">
          
          {/* Badge with new features */}
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-primary-200 shadow-soft">
            <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-gray-700">Now in Public Beta</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-6xl lg:text-7xl">
            Study without <br />
            <span className="text-gradient">the overwhelm.</span>
          </h1>
          
          {/* Subheadline */}
          <p className="max-w-lg text-lg font-medium text-gray-600 leading-relaxed md:text-xl">
            AI-powered MCQs. Dual personality companions. Smart tracking.
            <br className="hidden md:block"/>
            Everything you need to ace competitive exams.
          </p>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-primary-200 shadow-soft">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-medium text-gray-700">AI MCQ Generator</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-success-200 shadow-soft">
              <Brain className="w-4 h-4 text-success-500" />
              <span className="text-sm font-medium text-gray-700">Dual Companions</span>
            </div>
          </div>

          {/* CTA Button */}
          <Link 
            href="/signup" 
            onClick={() => track(EVENTS.AUTH_SIGNUP_CLICKED, { location: 'hero_section' })}
            className="btn btn-primary group mt-4 inline-flex items-center gap-3 text-base md:text-lg"
          >
            Start 14-Day Free Trial
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>

          <p className="text-sm font-medium text-gray-500">
            No credit card required • Cancel anytime
          </p>
        </div>

        {/* Right Column - Interactive Timer */}
        <div className="flex justify-center md:justify-end">
          <div className="card w-full max-w-md p-8 md:p-10 animate-fade-in">
            
            {/* Timer Header */}
            <div className="mb-8 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Pomodoro Timer
              </span>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
                <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-success-500 animate-pulse' : 'bg-gray-300'}`} />
                {isRunning ? 'Running' : 'Paused'}
              </div>
            </div>

            {/* Timer Display */}
            <div className="text-center">
              <div className="text-8xl font-bold tracking-tighter tabular-nums text-gray-900 md:text-9xl">
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-8 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-1000 ease-linear rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Controls */}
            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setIsRunning(!isRunning)}
                className="btn btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Play size={16} className={isRunning ? 'hidden' : ''} fill="white" />
                {isRunning ? 'Pause' : 'Start'}
              </button>
              
              <button 
                onClick={() => { setIsRunning(false); setTimeLeft(25 * 60); }}
                className="btn btn-secondary flex items-center justify-center gap-2 px-6"
                title="Reset Timer"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}