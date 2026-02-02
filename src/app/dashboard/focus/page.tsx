'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Play, Pause, Save, RotateCcw, ArrowLeft, Check, X } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAlert } from '@/context/AlertContext'
import { useXP } from '@/context/XPContext'

const PRESETS = [15, 25, 45, 60, 90]

export default function FocusPage() {
  const supabase = createClient()
  const { showAlert } = useAlert()
  const { recordFocusSession } = useXP()

  // --- STATE ---
  const [targetMinutes, setTargetMinutes] = useState(25)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  
  const [topic, setTopic] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isEditingTime, setIsEditingTime] = useState(false)
  const [tempMinutes, setTempMinutes] = useState('25')

  // --- REFS for accurate timing ---
  const startTimeRef = useRef<number | null>(null)
  const totalSecondsRef = useRef<number>(25 * 60)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // --- ACCURATE TIMER using Date.now() ---
  const updateTimer = useCallback(() => {
    if (!startTimeRef.current) return
    
    const now = Date.now()
    const elapsed = Math.floor((now - startTimeRef.current) / 1000)
    const remaining = Math.max(0, totalSecondsRef.current - elapsed)
    
    setSecondsLeft(remaining)
    
    if (remaining <= 0) {
      setIsActive(false)
      startTimeRef.current = null
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      // Auto-save when complete
      handleSaveOnComplete()
    }
  }, [])

  // Auto-save function when timer completes
  const handleSaveOnComplete = async () => {
    const duration = targetMinutes
    
    if (duration < 1) return

    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const now = new Date().toISOString()

        const { error: logError } = await supabase.from('focus_logs').insert({
          user_id: user.id,
          duration_minutes: duration,
          topic: topic || 'Unlabeled Session',
          started_at: now 
        })
        
        if (logError) throw logError
        
        // Award XP for the focus session
        await recordFocusSession(duration)
        
        showAlert(`Completed: ${duration}m on "${topic || 'Task'}"`, 'success')
        setSecondsLeft(targetMinutes * 60)
        totalSecondsRef.current = targetMinutes * 60
        setTopic('')
      }
    } catch (e) {
      console.error(e)
      showAlert("Failed to save log.", "error")
    } finally {
      setIsSaving(false)
    }
  }

  // Start/stop timer effect
  useEffect(() => {
    if (isActive) {
      // Store the start time and total seconds when starting
      startTimeRef.current = Date.now()
      totalSecondsRef.current = secondsLeft
      
      // Use interval but calculate from Date.now() for accuracy
      intervalRef.current = setInterval(updateTimer, 100) // Check every 100ms for responsiveness
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isActive, updateTimer])

  // Handle visibility change (tab switch, minimize)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive && startTimeRef.current) {
        // Immediately recalculate time when tab becomes visible
        updateTimer()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isActive, updateTimer])

  // --- ACTIONS ---
  const toggleTimer = () => {
    if (!isActive && !topic.trim()) {
      setTopic("Deep Work Session") 
    }
    
    if (isActive) {
      // Pausing - update secondsLeft to current remaining time
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        const remaining = Math.max(0, totalSecondsRef.current - elapsed)
        setSecondsLeft(remaining)
        totalSecondsRef.current = remaining
      }
      startTimeRef.current = null
    }
    
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    startTimeRef.current = null
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    setSecondsLeft(targetMinutes * 60)
    totalSecondsRef.current = targetMinutes * 60
  }

  const handleTimeConfirm = () => {
    let val = parseInt(tempMinutes) || 25
    if (val > 180) val = 180
    if (val < 1) val = 1
    setTargetMinutes(val)
    setSecondsLeft(val * 60)
    totalSecondsRef.current = val * 60
    setIsEditingTime(false)
  }

  const handlePreset = (min: number) => {
    if (isActive) return
    setTargetMinutes(min)
    setSecondsLeft(min * 60)
    totalSecondsRef.current = min * 60
    setTempMinutes(min.toString())
  }

  // Manual save function
  const handleSave = async () => {
    // Calculate actual elapsed time
    let elapsedSeconds = targetMinutes * 60 - secondsLeft
    if (isActive && startTimeRef.current) {
      const now = Date.now()
      elapsedSeconds = Math.floor((now - startTimeRef.current) / 1000)
    }
    
    const duration = Math.floor(elapsedSeconds / 60)
    
    if (duration < 1) {
      showAlert("Session too short to record.", "neutral")
      return
    }

    setIsSaving(true)
    setIsActive(false)
    startTimeRef.current = null
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const now = new Date().toISOString()

        const { error: logError } = await supabase.from('focus_logs').insert({
          user_id: user.id,
          duration_minutes: duration,
          topic: topic || 'Unlabeled Session',
          started_at: now 
        })
        
        if (logError) throw logError
        
        showAlert(`Saved: ${duration}m on "${topic || 'Task'}"`, 'success')
        resetTimer()
        setTopic('')
      }
    } catch (e) {
      console.error(e)
      showAlert("Failed to save log.", "error")
    } finally {
      setIsSaving(false)
    }
  }

  // --- CALCULATIONS ---
  const progress = ((targetMinutes * 60 - secondsLeft) / (targetMinutes * 60)) * 100
  
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const elapsedMinutes = Math.floor((targetMinutes * 60 - secondsLeft) / 60)

  return (
    <div 
      className={`min-h-screen bg-[#FBF9F6] text-black flex flex-col transition-all duration-500
      ${isActive ? 'fixed inset-0 z-50' : 'relative'}`}
    >
      {/* Pulsing background when active */}
      <motion.div 
        animate={{ opacity: isActive ? 0.3 : 0 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 bg-gradient-to-br from-amber-100 to-orange-100 pointer-events-none"
      />

      {/* Header */}
      <div className="relative z-10 p-4 md:p-6">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 font-bold uppercase tracking-wide text-sm text-black/40 hover:text-black transition-colors"
        >
          <ArrowLeft size={18} /> 
          {isActive ? 'Exit Session' : 'Dashboard'}
        </Link>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 pb-12">
        
        {/* Topic Input */}
        <div className="w-full max-w-md mb-8 text-center">
          <label className="text-xs font-black uppercase tracking-[0.2em] text-black/30 mb-3 block">
            What are you working on?
          </label>
          <input 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Name your task..."
            disabled={isActive}
            className="w-full bg-transparent text-center text-xl md:text-2xl font-bold text-black placeholder:text-black/20 outline-none border-b-2 border-black/10 focus:border-black pb-2 transition-all disabled:opacity-70"
          />
        </div>

        {/* Timer Circle */}
        <div className="relative mb-8">
          <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
            {/* Background Circle */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle 
                cx="50%" 
                cy="50%" 
                r="46%" 
                fill="none" 
                stroke="rgba(0,0,0,0.05)" 
                strokeWidth="12" 
              />
              <motion.circle
                cx="50%" 
                cy="50%" 
                r="46%"
                fill="none"
                stroke="#000"
                strokeWidth="12"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: progress / 100 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </svg>
            
            {/* Time Display */}
            <div className="relative flex flex-col items-center justify-center">
              {isEditingTime ? (
                <div className="flex flex-col items-center gap-4 bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#000]">
                  <label className="text-xs font-bold uppercase tracking-widest text-black/40">
                    Set Minutes
                  </label>
                  <input 
                    type="number" 
                    value={tempMinutes}
                    onChange={(e) => setTempMinutes(e.target.value)}
                    className="w-24 text-4xl font-black text-center bg-transparent border-b-2 border-black outline-none"
                    autoFocus
                    min="1"
                    max="180"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={handleTimeConfirm}
                      className="p-2 bg-black text-white hover:bg-stone-800 transition-colors"
                    >
                      <Check size={20} />
                    </button>
                    <button 
                      onClick={() => setIsEditingTime(false)}
                      className="p-2 bg-white border-2 border-black hover:bg-stone-100 transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => !isActive && setIsEditingTime(true)}
                  disabled={isActive}
                  className="text-center disabled:cursor-default"
                >
                  <div className={`text-6xl md:text-7xl font-black tracking-tight tabular-nums transition-transform ${!isActive && 'hover:scale-105'}`}>
                    {formatTime(secondsLeft)}
                  </div>
                  {!isActive && (
                    <div className="text-xs font-bold uppercase tracking-widest text-black/30 mt-2">
                      Tap to edit
                    </div>
                  )}
                  {isActive && elapsedMinutes > 0 && (
                    <div className="text-sm font-bold text-black/40 mt-2">
                      {elapsedMinutes}m elapsed
                    </div>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 md:gap-6 mb-8">
          {/* Reset */}
          <button 
            onClick={resetTimer}
            disabled={isActive || secondsLeft === targetMinutes * 60}
            className="w-14 h-14 flex items-center justify-center bg-white border-2 border-black/20 text-black/40 hover:border-black hover:text-black transition-all disabled:opacity-30 disabled:hover:border-black/20 disabled:hover:text-black/40"
            title="Reset"
          >
            <RotateCcw size={22} strokeWidth={2} />
          </button>
          
          {/* Play/Pause */}
          <button 
            onClick={toggleTimer}
            className={`h-20 w-20 md:h-24 md:w-24 flex items-center justify-center border-2 border-black shadow-[4px_4px_0_0_#000] transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px]
              ${isActive ? 'bg-white hover:bg-stone-50' : 'bg-black hover:bg-stone-900'}`}
          >
            {isActive ? (
              <Pause size={36} className="fill-black text-black" />
            ) : (
              <Play size={36} className="fill-brand text-brand ml-1" />
            )}
          </button>
          
          {/* Save */}
          <button 
            onClick={handleSave}
            disabled={secondsLeft === targetMinutes * 60 || isSaving}
            className="w-14 h-14 flex items-center justify-center bg-white border-2 border-black/20 text-black/40 hover:border-brand hover:text-black hover:bg-brand/10 transition-all disabled:opacity-30 disabled:hover:border-black/20 disabled:hover:text-black/40 disabled:hover:bg-white"
            title="Save Log"
          >
            <Save size={22} strokeWidth={2} />
          </button>
        </div>

        {/* Presets */}
        {!isActive && (
          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {PRESETS.map(min => (
              <button 
                key={min}
                onClick={() => handlePreset(min)}
                className={`px-4 py-2.5 md:px-5 md:py-3 border-2 text-sm font-bold uppercase transition-all
                  ${targetMinutes === min 
                    ? 'border-black bg-black text-white' 
                    : 'border-black/20 text-black/60 hover:border-black hover:text-black bg-white'}`}
              >
                {min}m
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
