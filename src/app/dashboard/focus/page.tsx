'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Play, Pause, RotateCcw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useAlert } from '@/context/AlertContext'
import { useXP } from '@/context/XPContext'
import CircularProgress from '@/components/dashboard/CircularProgress'

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
  const [todaySessions, setTodaySessions] = useState(0)
  const [todayMinutes, setTodayMinutes] = useState(0)

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
        
        // Refresh today's data
        fetchTodayData()
        
        // Reset timer
        setSecondsLeft(targetMinutes * 60)
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

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(updateTimer, 100)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActive, updateTimer])

  const toggleTimer = () => {
    if (!isActive) {
      // START
      startTimeRef.current = Date.now()
      totalSecondsRef.current = secondsLeft
      setIsActive(true)
    } else {
      // PAUSE
      setIsActive(false)
      startTimeRef.current = null
    }
  }

  const resetTimer = () => {
    setIsActive(false)
    setSecondsLeft(targetMinutes * 60)
    startTimeRef.current = null
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const changePreset = (minutes: number) => {
    if (!isActive) {
      setTargetMinutes(minutes)
      setSecondsLeft(minutes * 60)
      totalSecondsRef.current = minutes * 60
    }
  }

  // Format time display
  const minutes = Math.floor(secondsLeft / 60)
  const seconds = secondsLeft % 60
  const timeDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`

  // Calculate progress percentage
  const progress = ((targetMinutes * 60 - secondsLeft) / (targetMinutes * 60)) * 100

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col">
      {/* Back Button */}
      <Link 
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

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

          <button
            onClick={resetTimer}
            disabled={isActive || isSaving}
            className="btn btn-secondary px-6"
            title="Reset Timer"
          >
            <RotateCcw size={20} />
          </button>
        </div>

        {/* Time Presets */}
        {!isActive && (
          <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
            {PRESETS.map((preset) => (
              <button
                key={preset}
                onClick={() => changePreset(preset)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${targetMinutes === preset
                    ? 'bg-primary-500 text-white shadow-soft'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-primary-300 hover:shadow-soft'
                  }`}
              >
                {preset}m
              </button>
            ))}
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