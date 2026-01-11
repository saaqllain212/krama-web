'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client' 
// ✅ REMOVED: 'Zap' and 'Infinity' are no longer needed
import { Clock, Edit2, Save, X, Loader2 } from 'lucide-react'

export default function Countdown() {
  const supabase = createClient() 

  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
  const [isEditing, setIsEditing] = useState(false)
  
  const [examName, setExamName] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [loading, setLoading] = useState(true)

  // 1. FETCH FROM DB
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
          .from('syllabus_settings')
          .select('target_date, custom_title')
          .eq('user_id', user.id)
          .single()
        
        if (data) {
          if (data.custom_title) setExamName(data.custom_title)
          if (data.target_date) setTargetDate(data.target_date)
        }
      } catch (error) {
        console.error("Failed to sync timer:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  // 2. TIMER LOGIC
  useEffect(() => {
    // ✅ REMOVED: The check "if (examName?.includes('FOCUS')) return" is gone.
    // Now the timer runs for everyone.
    
    if (!targetDate) return

    const timer = setInterval(() => {
      const now = new Date().getTime()
      const target = new Date(targetDate + 'T00:00:00').getTime() 
      const distance = target - now

      if (distance < 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
      } else {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        })
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate, examName])

  // 3. SAVE TO DB
  const handleSave = async () => {
    setIsEditing(false) 
    
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
        await supabase.from('syllabus_settings').update({
            target_date: targetDate,
            custom_title: examName
        }).eq('user_id', user.id)
    }
  }

  // --- LOADING STATE ---
  if (loading) return <div className="h-[108px] w-full animate-pulse bg-stone-100 md:w-[320px]" />

  // --- WAITING FOR PROTOCOL (Stuck State) ---
  if (!examName && !targetDate) {
     return (
        <div className="group relative w-full border-neo bg-stone-100 p-4 text-stone-400 shadow-neo md:w-auto min-w-[300px] flex items-center justify-center h-[108px]">
           <div className="flex flex-col items-center animate-pulse">
              <Loader2 className="animate-spin mb-2" />
              <div className="text-xs font-black uppercase tracking-widest">Loading Protocol...</div>
           </div>
        </div>
     )
  }

  // ✅ REMOVED: The entire "FOCUS MODE" block (20 lines) was deleted here.
  // This allows the code to flow directly into the "Standard Timer" below.

  // --- EDIT MODE ---
  if (isEditing) {
    return (
      <div className="w-full border-neo bg-white p-6 shadow-neo md:w-auto min-w-[300px]">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-sm font-bold uppercase tracking-widest text-black">Edit Target</span>
          <button onClick={() => setIsEditing(false)} className="rounded-full p-1 hover:bg-black/5">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-black/60">Exam Name</label>
            <input type="text" value={examName} onChange={(e) => setExamName(e.target.value)} className="w-full border-2 border-black bg-gray-50 p-2 text-sm font-bold text-black focus:bg-white focus:outline-none" />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-black/60">Date</label>
            <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} className="w-full border-2 border-black bg-gray-50 p-2 text-sm font-bold text-black focus:bg-white focus:outline-none" />
          </div>
          <button onClick={handleSave} className="flex w-full items-center justify-center gap-2 border-2 border-black bg-brand py-3 text-xs font-bold uppercase tracking-wider text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[1px] hover:shadow-none">
            <Save className="h-3 w-3" /> Save Changes
          </button>
        </div>
      </div>
    )
  }

  // --- STANDARD TIMER ---
  return (
    <div className="group relative w-full border-neo bg-black p-4 text-white shadow-neo transition-transform hover:-translate-y-1 md:w-auto min-w-[300px]">
      <button onClick={() => setIsEditing(true)} className="absolute right-2 top-2 p-2 opacity-0 transition-opacity hover:text-brand group-hover:opacity-100">
        <Edit2 className="h-4 w-4" />
      </button>

      <div className="flex items-center justify-between gap-8">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-brand">
          <Clock className="h-4 w-4" />
          {examName}
        </div>
        <div className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
          Time Remaining
        </div>
      </div>

      <div className="mt-4 flex items-baseline gap-1 font-mono">
        <div className="flex flex-col">
          <span className="text-3xl font-bold tracking-tighter tabular-nums leading-none">{timeLeft.days}</span>
          <span className="text-[10px] text-white/40 uppercase">Days</span>
        </div>
        <span className="text-xl text-white/20">:</span>
        <div className="flex flex-col">
          <span className="text-3xl font-bold tracking-tighter tabular-nums leading-none">{timeLeft.hours.toString().padStart(2, '0')}</span>
          <span className="text-[10px] text-white/40 uppercase">Hr</span>
        </div>
        <span className="text-xl text-white/20">:</span>
        <div className="flex flex-col">
          <span className="text-3xl font-bold tracking-tighter tabular-nums leading-none">{timeLeft.minutes.toString().padStart(2, '0')}</span>
          <span className="text-[10px] text-white/40 uppercase">Min</span>
        </div>
        <span className="text-xl text-white/20">:</span>
        <div className="flex flex-col">
          <span className="text-3xl font-bold tracking-tighter tabular-nums leading-none text-brand">{timeLeft.seconds.toString().padStart(2, '0')}</span>
          <span className="text-[10px] text-brand/60 uppercase">Sec</span>
        </div>
      </div>
    </div>
  )
}