'use client'
import FeatureGate from '@/components/dashboard/FeatureGate'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Play, Pause, RotateCcw, ArrowLeft, BarChart3, Maximize2, Minimize2 } from 'lucide-react'
import Link from 'next/link'
import { useAlert } from '@/context/AlertContext'
import { useXP } from '@/context/XPContext'
import { useFocusMode } from '@/context/FocusModeContext'
import CircularProgress from '@/components/dashboard/CircularProgress'
import { FocusThemeProvider, useFocusTheme, FocusThemePicker, THEME_STYLES } from '@/components/dashboard/FocusTheme'

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
      <FocusThemeProvider>
        <FocusPageInner />
      </FocusThemeProvider>
    </FeatureGate>
  )
}

function FocusPageInner() {
  const supabase = useMemo(() => createClient(), [])
  const { showAlert } = useAlert()
  const { recordFocusSession } = useXP()
  const { stats: xpStats } = useXP()
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

  // --- TAB SWITCH TRACKING (silent during session, reviewed at end) ---
  const [tabSwitches, setTabSwitches] = useState<{ leftAt: number; returnedAt: number; duration: number }[]>([])
  const [totalAwaySeconds, setTotalAwaySeconds] = useState(0)
  const [showAwayAlert, setShowAwayAlert] = useState(false)  // only for 5+ min absences
  const [lastAwayDuration, setLastAwayDuration] = useState(0)
  const [showSessionReview, setShowSessionReview] = useState(false)
  const tabLeftAtRef = useRef<number | null>(null)
  // Refs mirror state so handleSaveSession always reads current values
  const tabSwitchCountRef = useRef(0)
  const totalAwaySecondsRef = useRef(0)

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

  // Handle tab visibility change — silent tracking + alert only for long absences
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden' && isActive) {
        tabLeftAtRef.current = Date.now()
      }
      
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
          return
        }

        // Log the tab switch silently
        if (tabLeftAtRef.current) {
          const awayMs = now - tabLeftAtRef.current
          const awaySecs = Math.floor(awayMs / 1000)
          const leftAt = tabLeftAtRef.current
          tabLeftAtRef.current = null
          
          // Only log if away > 3 seconds (ignore accidental swipes)
          if (awaySecs >= 3) {
            setTabSwitches(prev => [...prev, { leftAt, returnedAt: now, duration: awaySecs }])
            setTotalAwaySeconds(prev => prev + awaySecs)
            tabSwitchCountRef.current += 1
            totalAwaySecondsRef.current += awaySecs
            
            // Only show real-time alert for VERY long absences (5+ minutes)
            // Short absences are silently logged for end-of-session review
            if (awaySecs >= 300) {
              setLastAwayDuration(awaySecs)
              setShowAwayAlert(true)
              setTimeout(() => setShowAwayAlert(false), 5000)
            }
          }
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
        
        // Request notification permission after first successful session
        // This is the best moment — user just experienced value
        import('@/components/dashboard/StudyReminder').then(mod => {
          mod.requestNotificationPermission()
        })
        
        showAlert(`Completed: ${duration}m on "${topic || 'Task'}"`, 'success')
        
        fetchTodayData()
        
        setSecondsLeft(targetMinutes * 60)
        totalSecondsRef.current = targetMinutes * 60
        sessionStartRef.current = null
        setTopic('')
        
        // Show session review if there were tab switches (read from ref, not stale state)
        if (tabSwitchCountRef.current > 0) {
          setShowSessionReview(true)
        }
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
      // Reset tab switch tracking for new session
      setTabSwitches([])
      setTotalAwaySeconds(0)
      setShowAwayAlert(false)
      setShowSessionReview(false)
      tabLeftAtRef.current = null
      tabSwitchCountRef.current = 0
      totalAwaySecondsRef.current = 0
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

  // Format away time for display
  const formatAwayTime = (secs: number) => {
    if (secs < 60) return `${secs}s`
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return s > 0 ? `${m}m ${s}s` : `${m}m`
  }

  // Calculate progress percentage
  const progress = ((targetMinutes * 60 - secondsLeft) / (targetMinutes * 60)) * 100

  const { theme } = useFocusTheme()
  const themeStyle = THEME_STYLES[theme]

  return (
    <div className={`min-h-[calc(100vh-8rem)] flex flex-col rounded-2xl -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8 transition-colors duration-300 ${themeStyle.bg}`}>
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <Link 
          href="/dashboard"
          className={`inline-flex items-center gap-2 text-sm font-medium ${themeStyle.subtext} hover:opacity-80 transition-colors`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="flex items-center gap-3">
          {/* Theme Picker */}
          <FocusThemePicker />

          {/* Focus Insights Link */}
          <Link 
            href="/dashboard/focus/insights"
            className={`inline-flex items-center gap-2 text-sm font-medium ${themeStyle.accent} bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-all`}
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
        <div className="text-center mb-8 sm:mb-12">
          <h1 className={`text-2xl sm:text-3xl font-bold ${themeStyle.text} mb-2`}>Focus Mode</h1>
          <p className={themeStyle.subtext}>
            {topic || 'Select a task to begin'}
          </p>
        </div>

        {/* Circular Timer */}
        <div className="mb-8 sm:mb-12">
          {/* Mobile: 200px, Desktop: 280px */}
          <div className="block sm:hidden">
            <CircularProgress
              percentage={progress}
              size={200}
              strokeWidth={8}
              color={isActive ? themeStyle.timerColor : (theme === 'dark' || theme === 'warm' ? '#444' : '#e5e7eb')}
              showText={false}
            >
              <div className="text-center">
                <div className={`text-5xl font-bold ${themeStyle.text} tabular-nums mb-1`}>
                {timeDisplay}
              </div>
              <div className={`text-xs font-medium ${themeStyle.subtext}`}>
                {isActive ? 'Focus Time' : secondsLeft === targetMinutes * 60 ? 'Ready' : 'Paused'}
              </div>
            </div>
          </CircularProgress>
          </div>
          {/* Desktop timer */}
          <div className="hidden sm:block">
            <CircularProgress
              percentage={progress}
              size={280}
              strokeWidth={10}
              color={isActive ? themeStyle.timerColor : (theme === 'dark' || theme === 'warm' ? '#444' : '#e5e7eb')}
              showText={false}
            >
              <div className="text-center">
                <div className={`text-7xl font-bold ${themeStyle.text} tabular-nums mb-2`}>
                {timeDisplay}
              </div>
              <div className={`text-sm font-medium ${themeStyle.subtext}`}>
                {isActive ? 'Focus Time' : secondsLeft === targetMinutes * 60 ? 'Ready' : 'Paused'}
              </div>
            </div>
          </CircularProgress>
          </div>
        </div>

        {/* Long absence alert (5+ minutes only) — gentle nudge, not accusation */}
        {showAwayAlert && isActive && (
          <div className="w-full max-w-md mb-4 animate-in slide-in-from-top duration-300">
            <div className="rounded-xl px-4 py-3 flex items-center gap-3 bg-amber-500/15 border border-amber-500/30">
              <span className="text-2xl">👋</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-amber-700">
                  Welcome back! You were away for {Math.floor(lastAwayDuration / 60)}m {lastAwayDuration % 60}s
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Your timer kept running — keep going! 💪
                </p>
              </div>
              <button 
                onClick={() => setShowAwayAlert(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Subtle tab-switch counter during session (non-judgmental) */}
        {isActive && tabSwitches.length > 0 && !showAwayAlert && (
          <div className="w-full max-w-md mb-4">
            <div className="rounded-lg px-3 py-2 text-center text-xs font-medium bg-gray-100 text-gray-500">
              📊 {tabSwitches.length} tab switch{tabSwitches.length > 1 ? 'es' : ''} · {formatAwayTime(totalAwaySeconds)} away — reviewed at session end
            </div>
          </div>
        )}

        {/* SESSION REVIEW MODAL — shown after timer completes if there were tab switches */}
        {showSessionReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-6">
            <div className="max-w-sm w-full bg-white rounded-2xl shadow-xl p-6 animate-in slide-in-from-top duration-300">
              <div className="text-center mb-5">
                <div className="text-4xl mb-3">📊</div>
                <h3 className="text-xl font-bold text-gray-900">Session Review</h3>
                <p className="text-sm text-gray-500 mt-1">
                  You switched tabs {tabSwitches.length} time{tabSwitches.length > 1 ? 's' : ''}, totaling {formatAwayTime(totalAwaySeconds)} away
                </p>
              </div>

              <p className="text-sm font-semibold text-gray-700 text-center mb-4">
                Was this time spent studying?
              </p>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setShowSessionReview(false)
                    setTabSwitches([])
                    setTotalAwaySeconds(0)
                    showAlert('Great focus session! 🎯', 'success')
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-green-200 bg-green-50 hover:bg-green-100 transition-colors"
                >
                  <span className="text-xl">📚</span>
                  <div className="text-left">
                    <p className="text-sm font-bold text-green-800">Yes, I was studying</p>
                    <p className="text-xs text-green-600">Reading notes, watching lectures, etc.</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowSessionReview(false)
                    setTabSwitches([])
                    setTotalAwaySeconds(0)
                    showAlert('Honest tracking builds real discipline 💪', 'success')
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-amber-200 bg-amber-50 hover:bg-amber-100 transition-colors"
                >
                  <span className="text-xl">📱</span>
                  <div className="text-left">
                    <p className="text-sm font-bold text-amber-800">Mix of both</p>
                    <p className="text-xs text-amber-600">Some study, some distractions</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setShowSessionReview(false)
                    setTabSwitches([])
                    setTotalAwaySeconds(0)
                    showAlert(`${formatAwayTime(totalAwaySeconds)} lost — you'll do better next time!`, 'success')
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-red-200 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  <span className="text-xl">🎯</span>
                  <div className="text-left">
                    <p className="text-sm font-bold text-red-800">Mostly distracted</p>
                    <p className="text-xs text-red-600">Social media, random browsing</p>
                  </div>
                </button>
              </div>

              <button
                onClick={() => {
                  setShowSessionReview(false)
                  setTabSwitches([])
                  setTotalAwaySeconds(0)
                }}
                className="w-full text-center text-xs text-gray-400 hover:text-gray-600 mt-4 py-2"
              >
                Skip
              </button>
            </div>
          </div>
        )}

        {/* Task Input */}
        {!isActive && (
          <div className="w-full max-w-md mb-8">
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="What are you working on?"
              className={`input text-center ${themeStyle.input}`}
              disabled={isActive}
            />
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center gap-3 sm:gap-4 mb-8 sm:mb-12">
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
          <div className="mb-8 sm:mb-12 space-y-4">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
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
        <div className={`card w-full max-w-md ${theme === 'default' ? 'bg-gradient-to-br from-gray-50 to-white' : themeStyle.card}`}>
          <h3 className={`text-sm font-semibold ${themeStyle.subtext} mb-4`}>Today&apos;s Progress</h3>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="text-center">
              <div className={`text-2xl sm:text-3xl font-bold ${themeStyle.text}`}>{todaySessions}</div>
              <div className={`text-xs sm:text-sm ${themeStyle.subtext}`}>Sessions</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl sm:text-3xl font-bold ${themeStyle.text}`}>
                {Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m
              </div>
              <div className={`text-xs sm:text-sm ${themeStyle.subtext}`}>Total Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* === FOCUS MODE FLOATING STATS OVERLAY === */}
      {/* Only visible during fullscreen focus mode when timer is active */}
      {isFocusMode && isActive && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
          <div className={`flex items-center gap-4 px-5 py-2.5 rounded-full backdrop-blur-md shadow-lg ${
            theme === 'dark' || theme === 'warm' 
              ? 'bg-white/10 text-white/70' 
              : 'bg-black/5 text-gray-500'
          }`}>
            <span className="text-xs font-semibold tabular-nums">
              Today: {Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m
            </span>
            <span className="w-px h-3 bg-current opacity-30" />
            <span className="text-xs font-semibold">
              Session {todaySessions + 1}
            </span>
            {xpStats && xpStats.current_streak > 0 && (
              <>
                <span className="w-px h-3 bg-current opacity-30" />
                <span className="text-xs font-semibold">
                  🔥 {xpStats.current_streak}
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}