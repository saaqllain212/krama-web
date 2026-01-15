'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Shield, ShieldAlert, Zap } from 'lucide-react'
import Link from 'next/link'
import SetupModal from './SetupModal'
import OfflineEntryModal from './OfflineEntryModal'

type SentinelSettings = {
  guardian_name: string
  is_active: boolean
  guardian_chat_id: string 
  offline_quota_used: number
}

export default function ProctorWidget({ onOpenSettings }: { onOpenSettings: () => void }) {
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<SentinelSettings | null>(null)
  
  // Logic State
  const [timeLeft, setTimeLeft] = useState<string>("--:--:--")
  const [status, setStatus] = useState<'safe' | 'warning' | 'danger' | 'inactive'>('inactive')
  const [hoursLogged, setHoursLogged] = useState(0)
  const [targetHours, setTargetHours] = useState(6) 
  
  // Alert State
  const [hasAlerted, setHasAlerted] = useState(false)
  const hasAlertedRef = useRef(false) 
  
  // Modals
  const [showSetup, setShowSetup] = useState(false)
  const [showOffline, setShowOffline] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // 1. Load Settings
      const { data: sData } = await supabase
        .from('sentinel_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()
      
      if (sData) setSettings(sData)

      // 2. Load Target
      const metaTarget = user.user_metadata?.target_hours
      if (metaTarget) setTargetHours(Number(metaTarget))

      // 3. Load Today's Focus Logs
      const startOfDay = new Date(); startOfDay.setHours(0,0,0,0)
      
      const { data: logs } = await supabase
        .from('focus_logs')
        .select('duration_minutes')
        .eq('user_id', user.id)
        .gte('started_at', startOfDay.toISOString())

      if (logs) {
        const totalMinutes = logs.reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0)
        setHoursLogged(totalMinutes / 60)
      }

      setLoading(false)
    }
    load()
  }, []) 

  // --- TIMER LOGIC (Point of No Return) ---
  useEffect(() => {
    if (!settings || !settings.is_active) return

    const timer = setInterval(() => {
      const now = new Date()
      
      // 1. Calculate Midnight (The Hard Deadline)
      const midnight = new Date()
      midnight.setHours(24, 0, 0, 0)
      
      const msUntilMidnight = midnight.getTime() - now.getTime()
      
      // 2. Calculate Work Remaining
      const hoursNeeded = Math.max(0, targetHours - hoursLogged)
      const msNeeded = hoursNeeded * 60 * 60 * 1000

      // 3. The Buffer (Time allowed to slack off)
      const bufferMs = msUntilMidnight - msNeeded
      
      const goalMet = hoursLogged >= targetHours

      if (goalMet) {
        setStatus('safe')
        setTimeLeft("GOAL MET")
      } 
      else if (bufferMs <= 0) {
        // 🚨 POINT OF NO RETURN CROSSED
        setStatus('danger')
        setTimeLeft("00:00:00")
        
        if (!hasAlertedRef.current) {
             triggerFailure(settings, hoursNeeded)
        }
      } 
      else {
        // Countdown matches the BUFFER, not just midnight.
        const h = Math.floor(bufferMs / (1000 * 60 * 60))
        const m = Math.floor((bufferMs % (1000 * 60 * 60)) / (1000 * 60))
        const s = Math.floor((bufferMs % (1000 * 60)) / 1000)
        setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`)

        // Warn if buffer is low (less than 2 hours of "slack" time left)
        if (bufferMs < (2 * 60 * 60 * 1000)) setStatus('warning')
        else setStatus('safe')
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [settings, hoursLogged, targetHours])

  const triggerFailure = async (s: SentinelSettings, missingHours: number) => {
      hasAlertedRef.current = true
      setHasAlerted(true)
      try {
        await fetch('/api/sentinel/alert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                guardianId: s.guardian_chat_id,
                guardianName: s.guardian_name,
                hoursMissed: missingHours.toFixed(1)
            })
        })
      } catch (err) {
          console.error("Failed to fire alert", err)
      }
  }

  if (loading) return <div className="h-48 bg-gray-100 border-2 border-black animate-pulse" />

  const progressPercent = Math.min((hoursLogged / targetHours) * 100, 100)

  const variants = {
    inactive: "bg-white border-black text-gray-500",
    safe: "bg-white border-black text-black",
    warning: "bg-yellow-400 border-black text-black",
    danger: "bg-red-600 border-black text-white"
  }

  return (
    <>
      <div className={`border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 flex flex-col justify-between h-full relative ${variants[status]}`}>
        
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
             {status === 'danger' ? <ShieldAlert size={24} /> : <Shield size={24} />}
             <div>
               <h3 className="font-bold text-sm uppercase leading-none">Protocol Sentinel</h3>
               {settings?.guardian_name && <p className="text-[10px] font-mono opacity-80">Guardian: {settings.guardian_name}</p>}
             </div>
          </div>
          {status !== 'inactive' && (
            <div className="text-right">
              <p className="text-[10px] font-bold uppercase mb-1">Time to Failure</p>
              <p className="text-xl font-black font-mono leading-none tracking-tighter">
                {timeLeft}
              </p>
            </div>
          )}
        </div>

        {status !== 'inactive' && (
          <div className="mb-4">
             <div className="flex justify-between text-xs font-bold uppercase mb-1">
               <span>Daily Progress</span>
               <span>{hoursLogged.toFixed(2)} / {targetHours} Hrs</span>
             </div>
             <div className="w-full h-3 border-2 border-black bg-white/50 relative overflow-hidden">
                <div 
                  className="h-full bg-black transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
             </div>
             {status === 'danger' && (
               <div className="mt-2 text-xs bg-black/20 p-1 font-bold text-center animate-pulse">
                 {hasAlerted ? "⚠️ ALERT SENT." : "⚠️ POINT OF NO RETURN."}
               </div>
             )}
          </div>
        )}

        <div className="mt-auto pt-2 border-t-2 border-current/20 flex gap-2">
          {status === 'inactive' ? (
             <button 
               onClick={() => setShowSetup(true)}
               className="w-full py-2 bg-black text-white font-bold uppercase text-xs hover:bg-gray-800"
             >
               Activate Sentinel
             </button>
          ) : (
             <>
               <Link href="/dashboard/focus" className="flex-1 py-2 bg-black text-white font-bold uppercase text-[10px] flex items-center justify-center gap-1 hover:bg-gray-900">
                  <Zap size={12}/> Focus Mode
               </Link>
               
               <button 
                  onClick={() => setShowOffline(true)}
                  className="flex-1 py-2 border-2 border-current font-bold uppercase text-[10px] hover:bg-black/10"
               >
                  Log Offline
               </button>
             </>
          )}
        </div>
      </div>

      {showSetup && (
        <SetupModal 
          onClose={() => setShowSetup(false)} 
          onOpenSettings={onOpenSettings} 
        />
      )}
      
      {showOffline && settings && (
        <OfflineEntryModal 
           onClose={() => setShowOffline(false)} 
           quotaUsed={settings.offline_quota_used}
        />
      )}
    </>
  )
}