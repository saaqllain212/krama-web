'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Shield, ShieldAlert, Zap } from 'lucide-react'
import SetupModal from './SetupModal'
import OfflineEntryModal from './OfflineEntryModal'

type SentinelSettings = {
  guardian_name: string
  check_in_interval_hours: number
  last_active_at: string
  is_active: boolean
  offline_quota_used: number
  last_quota_reset_at: string
}

export default function ProctorWidget({ onOpenSettings }: { onOpenSettings: () => void }) {
  const [loading, setLoading] = useState(true)
  const [settings, setSettings] = useState<SentinelSettings | null>(null)
  
  // Logic State
  const [timeLeft, setTimeLeft] = useState<string>("--:--:--")
  const [status, setStatus] = useState<'safe' | 'warning' | 'danger' | 'inactive'>('inactive')
  const [hoursLogged, setHoursLogged] = useState(0)
  const [targetHours, setTargetHours] = useState(6) 
  
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
      
      if (sData) {
        setSettings(sData)
        // Check for Weekly Quota Reset
        const lastReset = new Date(sData.last_quota_reset_at).getTime()
        const now = new Date().getTime()
        if (now - lastReset > (7 * 24 * 60 * 60 * 1000)) {
           await supabase.from('sentinel_settings').update({
             offline_quota_used: 0,
             last_quota_reset_at: new Date().toISOString()
           }).eq('user_id', user.id)
           sData.offline_quota_used = 0
        }
      }

      // 2. Load Target (From Metadata)
      const metaTarget = user.user_metadata?.target_hours
      if (metaTarget) setTargetHours(Number(metaTarget))

      // 3. Load Today's Focus Logs
      const startOfDay = new Date(); startOfDay.setHours(0,0,0,0)
      
      const { data: logs } = await supabase
        .from('focus_logs')
        .select('duration_minutes') // ✅ FIXED: Read the correct column
        .eq('user_id', user.id)
        .gte('started_at', startOfDay.toISOString())

      if (logs) {
        // ✅ FIXED: Sum minutes, then convert to hours
        const totalMinutes = logs.reduce((acc, curr) => acc + (curr.duration_minutes || 0), 0)
        setHoursLogged(totalMinutes / 60)
      }

      setLoading(false)
    }
    load()
  }, []) 

  // Timer Logic
  useEffect(() => {
    if (!settings || !settings.is_active) return

    const timer = setInterval(() => {
      const lastActive = new Date(settings.last_active_at).getTime()
      const intervalMs = settings.check_in_interval_hours * 60 * 60 * 1000
      const deadline = lastActive + intervalMs
      const now = new Date().getTime()
      const diff = deadline - now

      // Logic: If goal met, SAFE.
      const goalMet = hoursLogged >= targetHours

      if (goalMet) {
        setStatus('safe')
        setTimeLeft("GOAL MET")
      } else if (diff <= 0) {
        setStatus('danger')
        setTimeLeft("00:00:00")
      } else {
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const s = Math.floor((diff % (1000 * 60)) / 1000)
        setTimeLeft(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`)

        if (diff < (3 * 60 * 60 * 1000)) setStatus('warning')
        else setStatus('safe')
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [settings, hoursLogged, targetHours])

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
               {/* Show decimal if target is small (Test Mode support) */}
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
                 ⚠️ ALERTING GUARDIAN...
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
               <button className="flex-1 py-2 bg-black text-white font-bold uppercase text-[10px] flex items-center justify-center gap-1 hover:bg-gray-900">
                  <Zap size={12}/> Focus Mode
               </button>
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