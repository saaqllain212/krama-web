'use client'
import FeatureGate from '@/components/dashboard/FeatureGate'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Play, Pause, RotateCcw, ArrowLeft, BarChart3, Maximize2, Minimize2 } from 'lucide-react'
import Link from 'next/link'
import { useAlert } from '@/context/AlertContext'
import { useXP } from '@/context/XPContext'
import { useFocusMode } from '@/context/FocusModeContext'
import CircularProgress from '@/components/dashboard/CircularProgress'

const PRESETS = [15, 25, 45, 60, 90]

// --- Audio notification helper (Web Audio API) ---
function playCompletionSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    
    const ctx = new AudioCtx()
    
    // Play a pleasant two-tone chime
    const playTone = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.connect(gain)
      gain.connect(ctx.destination)
      
      osc.frequency.value = freq
      osc.type = 'sine'
      
      gain.gain.setValueAtTime(0, startTime)
      gain.gain.linearRampToValueAtTime(0.3, startTime + 0.05)
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
      
      osc.start(startTime)
      osc.stop(startTime + duration)
    }
    
    const now = ctx.currentTime
    playTone(523.25, now, 0.3)        // C5
    playTone(659.25, now + 0.15, 0.3) // E5
    playTone(783.99, now + 0.3, 0.5)  // G5 (longer)
    
    // Clean up after sounds finish
    setTimeout(() => ctx.close(), 2000)
  } catch (e) {
    // Silently fail — audio is a nice-to-have, not critical
  }
}

export default function FocusPage() {
  return (
    <FeatureGate flag="feature_focus_enabled" featureName="Focus Mode">
      <FocusPageInner />
    </FeatureGate>
  )
}

function FocusPageInner() {
  const supabase = createClient()
  const { showAlert } = useAlert()
  const { recordFocusSession } = useXP()
  const { isFocusMode, setFocusMode } = useFocusMode()

  // --- STATE ---
  const [targetMinutes, setTargetMinutes] = useState(25)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [topic, setTopic] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [todaySessions, setTodaySessions] = useState(0)
  const [todayMinutes, setTodayMinutes] = useState(0)
  const [customTime, setCustomTime] = useState('')

  // --- REFS for accurate timing ---
  const startTimeRef = useRef<number | null>(null)
  const totalSecondsRef = useRef<number>(25 * 60)
  const rafRef = useRef<number | null>(null)
  const sessionStartRef = useRef<number | null>(null)

  // --- ACCURATE TIMER using requestAnimationFrame + Date.now() ---
  const updateTimer = useCallback(() => {
    if (!startTimeRef.current) return
    
    const now = Date.now()
    const elapsed = Math.floor((now - startTimeRef.current) / 1000)
    const remaining = Math.max(0, totalSecondsRef.current - elapsed)
    
    setSecondsLeft(remaining)
    
    if (remaining <= 0) {
      setIsActive(false)
      startTimeRef.current = null
      
      // Play completion sound
      playCompletionSound()
      
      // Auto-save when complete
      handleSaveSession(targetMinutes)
      return
    }
    
    rafRef.current = requestAnimationFrame(updateTimer)
  }, [targetMinutes])

  // Handle tab visibility change - recalculate on return
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && isActive && startTimeRef.current) {
        const now = Date.now()
        const elapsed = Math.floor((now - startTimeRef.current) / 1000)
        const remaining = Math.max(0, totalSecondsRef.current - elapsed)
        
        setSecondsLeft(remaining)
        
        if (remaining <= 0) {
          setIsActive(false)
          startTimeRef.current = null
          playCompletionSound()
          handleSaveSession(targetMinutes)
        }
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [isActive, targetMinutes])

  // Save session helper
  const handleSaveSession = async (duration: number) => {
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
        
        await recordFocusSession(duration)
        
        showAlert(`Completed: ${duration}m on "${topic || 'Task'}"`, 'success')
        
        fetchTodayData()
        
        setSecondsLeft(targetMinutes * 60)
        totalSecondsRef.current = targetMinutes * 60
        sessionStartRef.current = null
        setTopic('')
      }
    } catch (err) {
      console.error('Failed to save:', err)
      showAlert('Failed to save session', 'error')
    }
    setIsSaving(false)
  }

  // Fetch today's sessions
  const fetchTodayData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const today = new Date().toISOString().split('T')[0]
    const { data } = await supabase
      .from('focus_logs')
      .select('duration_minutes')
      .eq('user_id', user.id)
      .gte('started_at', `${today}T00:00:00`)

    if (data) {
      setTodaySessions(data.length)
      setTodayMinutes(data.reduce((sum, s) => sum + s.duration_minutes, 0))
    }
  }

  useEffect(() => {
    fetchTodayData()
  }, [])

  // RAF-based timer loop
  useEffect(() => {
    if (isActive) {
      rafRef.current = requestAnimationFrame(updateTimer)
    } else {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [isActive, updateTimer])

  // FIX: Use React context instead of DOM querySelector
  // Activate focus mode when timer is running AND user toggled it
  useEffect(() => {
    if (isFocusMode && !isActive) {
      // If timer stops/pauses while in focus mode, exit focus mode
      setFocusMode(false)
    }
  }, [isActive]) // eslint-disable-line react-hooks/exhaustive-deps

  // Clean up focus mode when leaving the page
  useEffect(() => {
    return () => {
      setFocusMode(false)
    }
  }, [setFocusMode])

  const toggleFocusMode = () => {
    if (!isFocusMode && isActive) {
      setFocusMode(true)
    } else {
      setFocusMode(false)
    }
  }

  const toggleTimer = () => {
    if (!isActive) {
      // START
      startTimeRef.current = Date.now()
      totalSecondsRef.current = secondsLeft
      sessionStartRef.current = Date.now()
      setIsActive(true)
    } else {
      // PAUSE — save the remaining seconds accurately
      if (startTimeRef.current) {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        const remaining = Math.max(0, totalSecondsRef.current - elapsed)
        setSecondsLeft(remaining)
        totalSecondsRef.current = remaining
      }
      setIsActive(false)
      startTimeRef.current = null
    }
  }

  const resetTimer = () => {
    setIsActive(false)
    setFocusMode(false)
    setSecondsLeft(targetMinutes * 60)
    totalSecondsRef.current = targetMinutes * 60
    startTimeRef.current = null
    sessionStartRef.current = null
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }

  const changePreset = (minutes: number) => {
    if (!isActive) {
      setTargetMinutes(minutes)
      setSecondsLeft(minutes * 60)
      totalSecondsRef.current = minutes * 60
      setCustomTime('')
    }
  }

  const handleCustomTime = () => {
    const mins = parseInt(customTime)
    if (mins && mins >= 1 && mins <= 300) {
      setTargetMinutes(mins)
      setSecondsLeft(mins * 60)
      totalSecondsRef.current = mins * 60
      setCustomTime('')
    }
  }

  // Manual save (for when user wants to stop early and save)
  const handleEarlySave = () => {
    if (!sessionStartRef.current) return
    
    const elapsedMs = Date.now() - sessionStartRef.current
    const actualMinutes = Math.max(1, Math.round(elapsedMs / 60000))
    
    setIsActive(false)
    setFocusMode(false)
    startTimeRef.current = null
    
    handleSaveSession(actualMinutes)
  }

  // Format time display
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  // Calculate progress percentage
  const progress = ((targetMinutes * 60 - secondsLeft) / (targetMinutes * 60)) * 100

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-8">
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-3">
          {/* Focus Insights Link */}
          <Link 
            href="/dashboard/focus/insights"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg transition-all"
          >
            <BarChart3 className="w-4 h-4" />
            Focus Insights
          </Link>

          {/* Fullscreen toggle — only works when timer is active */}
          <button
            onClick={toggleFocusMode}
            disabled={!isActive && !isFocusMode}
            className={`p-2 rounded-lg transition-all ${
              !isActive && !isFocusMode 
                ? 'text-gray-300 bg-gray-50 cursor-not-allowed' 
                : 'text-gray-500 hover:text-gray-800 bg-gray-100 hover:bg-gray-200'
            }`}
            title={isFocusMode ? 'Exit focus mode' : isActive ? 'Enter focus mode' : 'Start timer first'}
          >
            {isFocusMode ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </div>

      {/* Main Content - Centered */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full">
        
        {/* Timer Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Focus Mode</h1>
          <p className="text-gray-600">
            {topic || 'Select a task to begin'}
          </p>
        </div>

        {/* Circular Timer */}
        <div className="mb-12">
          <CircularProgress
            percentage={progress}
            size={280}
            strokeWidth={12}
            color={isActive ? '#5B8FF9' : '#e5e7eb'}
            showText={false}
          >
            <div className="text-center">
              <div className="text-7xl font-bold text-gray-900 tabular-nums mb-2">
                {timeDisplay}
              </div>
              <div className="text-sm font-medium text-gray-500">
                {isActive ? 'Focus Time' : 'Paused'}
              </div>
            </div>
          </CircularProgress>
        </div>

        {/* Task Input */}
        {!isActive && (
          <div className="w-full max-w-md mb-8">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What are you working on?"
              className="input text-center"
              disabled={isActive}
            />
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-4 mb-12">
          <button
            onClick={toggleTimer}
            disabled={isSaving}
            className="btn btn-primary w-32 flex items-center justify-center gap-2"
          >
            {isActive ? (
              <>
                <Pause size={20} fill="white" />
                Pause
              </>
            ) : (
              <>
                <Play size={20} fill="white" />
                Start
              </>
            )}
          </button>

          {/* Early save button - only show when timer is active */}
          {isActive && (
            <button
              onClick={handleEarlySave}
              disabled={isSaving}
              className="btn btn-secondary px-6 text-sm"
              title="Stop & save elapsed time"
            >
              Stop & Save
            </button>
          )}

          <button
            onClick={resetTimer}
            disabled={isActive || isSaving}
            className="btn btn-secondary px-6"
            title="Reset Timer"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        {/* Time Presets + Custom */}
        {!isActive && (
          <div className="mb-12 space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => changePreset(preset)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${targetMinutes === preset && !customTime
                      ? 'bg-primary-500 text-white shadow-soft'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-primary-300 hover:shadow-soft'
                    }`}
                >
                  {preset}m
                </button>
              ))}
            </div>

            {/* Custom time input */}
            <div className="flex items-center justify-center gap-2">
              <input
                type="number"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                placeholder="Custom (min)"
                min={1}
                max={300}
                className="input w-36 text-center text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleCustomTime()}
              />
              <button
                onClick={handleCustomTime}
                disabled={!customTime || parseInt(customTime) < 1}
                className="btn btn-secondary text-sm px-4 disabled:opacity-40"
              >
                Set
              </button>
            </div>
          </div>
        )}

        {/* Today's Stats */}
        <div className="card w-full max-w-md bg-gradient-to-br from-gray-50 to-white">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Today's Progress</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{todaySessions}</div>
              <div className="text-sm text-gray-600">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m
              </div>
              <div className="text-sm text-gray-600">Total Time</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}