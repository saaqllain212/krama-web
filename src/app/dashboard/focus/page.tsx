'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Play, Pause, Save, RotateCcw, ArrowLeft, Pencil, Check } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAlert } from '@/context/AlertContext'

const PRESETS = [15, 25, 45, 60]

export default function FocusPage() {
  const supabase = createClient()
  const { showAlert } = useAlert()

  // --- STATE ---
  const [targetMinutes, setTargetMinutes] = useState(25)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  
  const [topic, setTopic] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  // --- TIMER LOGIC ---
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    } else if (secondsLeft === 0 && isActive) {
      setIsActive(false)
      handleSave() // Auto-save when done
    }
    return () => { if (interval) clearInterval(interval) }
  }, [isActive, secondsLeft])

  // --- ACTIONS ---
  const toggleTimer = () => {
    if (!isActive && !topic.trim()) {
      setTopic("DEEP WORK") 
    }
    setIsActive(!isActive)
  }

  const resetTimer = () => {
    setIsActive(false)
    setSecondsLeft(targetMinutes * 60)
  }

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value) || 0
    if (val > 180) val = 180 // Cap at 3 hours
    setTargetMinutes(val)
    setSecondsLeft(val * 60)
  }

  const handlePreset = (min: number) => {
    if (isActive) return
    setTargetMinutes(min)
    setSecondsLeft(min * 60)
  }

  const handleSave = async () => {
    const duration = Math.floor((targetMinutes * 60 - secondsLeft) / 60)
    
    if (duration < 1) {
      if (!isActive) showAlert("Session too short to record.", "neutral")
      return
    }

    setIsSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const now = new Date().toISOString()

        // 1. Log the Session
        const { error: logError } = await supabase.from('focus_logs').insert({
          user_id: user.id,
          duration_minutes: duration,
          topic: topic || 'Unlabeled Session',
          started_at: now 
        })
        
        if (logError) throw logError

        // Logic Note: We do NOT reset the Sentinel 'last_active_at' here.
        // Completing work increases the score, it doesn't push back the deadline.
        
        showAlert(`Log Saved: ${duration}m on ${topic || 'Task'}`, 'success')
        resetTimer()
      }
    } catch (e) {
      console.error(e)
      showAlert("Failed to save log.", "error")
    } finally {
      setIsSaving(false)
      setIsActive(false)
    }
  }

  // --- CALCULATIONS ---
  const progress = ((targetMinutes * 60 - secondsLeft) / (targetMinutes * 60)) * 100
  
  const formatTime = (s: number) => {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div 
      className={`min-h-screen bg-[#FBF9F6] text-black flex flex-col items-center justify-center overflow-hidden transition-all duration-500
      ${isActive ? 'fixed inset-0 z-50' : 'relative'}`}
    >
      <motion.div 
        animate={{ opacity: isActive ? 0.4 : 0 }}
        transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        className="absolute inset-0 bg-amber-100 pointer-events-none"
      />

      <Link href="/dashboard" className="absolute top-8 left-8 flex items-center gap-2 font-bold uppercase tracking-widest text-xs text-black/40 hover:text-black transition-colors z-20">
        <ArrowLeft size={16} /> {isActive ? 'Exit Zen Mode' : 'Dashboard'}
      </Link>

      <div className="z-10 flex flex-col items-center w-full max-w-xl" suppressHydrationWarning>
        <div className="mb-10 w-full text-center relative group">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30 mb-2 block">
            Current Objective
          </label>
          <input 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="NAME YOUR TASK..."
            disabled={isActive}
            className="w-full bg-transparent text-center text-3xl md:text-4xl font-black text-black placeholder:text-black/10 outline-none border-b-4 border-transparent focus:border-amber-500 transition-all uppercase disabled:opacity-80"
          />
          {!isActive && <Pencil size={14} className="absolute right-0 top-1/2 -translate-y-1/2 text-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />}
        </div>

        <div className="relative mb-12 group">
          <div className="relative w-[300px] h-[300px] md:w-[380px] md:h-[380px] flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 drop-shadow-xl">
              <circle cx="50%" cy="50%" r="48%" fill="none" stroke="#E5E5E5" strokeWidth="12" />
              <motion.circle
                cx="50%" cy="50%" r="48%"
                fill="none"
                stroke="#F59E0B"
                strokeWidth="24"
                strokeLinecap="butt"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: progress / 100 }}
                transition={{ duration: 1, ease: "linear" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              {isEditing ? (
                <div className="flex items-end gap-2 bg-white/90 p-6 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] z-20">
                  <div className="flex flex-col">
                    <label className="text-[10px] font-black uppercase tracking-widest text-black/40">Minutes</label>
                    <input 
                      type="number" 
                      value={targetMinutes}
                      onChange={handleTimeChange}
                      className="w-32 text-6xl font-black text-center bg-transparent border-b-4 border-black outline-none"
                      autoFocus
                    />
                  </div>
                  <button onClick={() => setIsEditing(false)} className="bg-amber-500 p-2 border-2 border-black hover:bg-amber-600">
                    <Check size={24} />
                  </button>
                </div>
              ) : (
                <div 
                  onClick={() => !isActive && setIsEditing(true)}
                  className={`text-center cursor-pointer transition-transform ${isActive ? 'scale-110' : 'hover:scale-105'}`}
                >
                  <div className="text-7xl md:text-9xl font-black tracking-tighter text-black tabular-nums">
                    {formatTime(secondsLeft)}
                  </div>
                  {!isActive && (
                    <div className="text-xs font-bold uppercase tracking-widest text-black/30 mt-2 flex items-center justify-center gap-1">
                      <Pencil size={10} /> Click Time to Edit
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 mb-8">
          <button 
            onClick={resetTimer}
            disabled={isActive}
            className="w-14 h-14 flex items-center justify-center border-2 border-black/10 text-black/40 hover:border-black hover:text-black hover:bg-white rounded-full transition-all disabled:opacity-0"
            title="Reset"
          >
            <RotateCcw size={20} strokeWidth={2.5} />
          </button>
          <button 
            onClick={toggleTimer}
            className={`h-24 w-24 md:h-28 md:w-28 flex items-center justify-center rounded-full border-[6px] border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all active:translate-y-1 active:shadow-none
              ${isActive ? 'bg-white hover:bg-gray-50' : 'bg-black hover:bg-stone-900'}`}
          >
            {isActive ? (
              <Pause size={40} className="fill-black text-black" />
            ) : (
              <Play size={40} className="fill-amber-500 text-amber-500 ml-2" />
            )}
          </button>
          <button 
            onClick={handleSave}
            disabled={isActive || secondsLeft === targetMinutes * 60}
            className="w-14 h-14 flex items-center justify-center border-2 border-black/10 text-black/40 hover:border-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Save Log"
          >
            <Save size={20} strokeWidth={2.5} />
          </button>
        </div>

        {!isActive && (
          <div className="flex gap-3 animate-in fade-in slide-in-from-bottom-4">
             {PRESETS.map(min => (
               <button 
                 key={min}
                 onClick={() => handlePreset(min)}
                 className={`px-4 py-2 border-2 text-xs font-bold uppercase transition-all
                   ${targetMinutes === min 
                     ? 'border-amber-500 bg-amber-100 text-amber-900' 
                     : 'border-black/10 text-black/40 hover:border-black hover:text-black bg-white'}`}
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