'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AlertTriangle, BookOpen, Check, Loader2, Lock, XCircle } from 'lucide-react'

export default function OfflineEntryModal({ 
  onClose, 
  quotaUsed 
}: { 
  onClose: () => void, 
  quotaUsed: number 
}) {
  const [loading, setLoading] = useState(false)
  const [hours, setHours] = useState<string>('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  
  const supabase = createClient()
  const MAX_QUOTA = 4

  const handleLog = async () => {
    setErrorMsg(null)

    if (!hours || isNaN(Number(hours)) || Number(hours) <= 0) {
      setErrorMsg("Please enter a valid number of hours.")
      return
    }
    
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No user found")

      // 1. Check Quota Logic
      if (quotaUsed >= MAX_QUOTA) {
        setErrorMsg("Weekly offline quota exceeded.")
        setLoading(false)
        return
      }

      // 2. Insert into focus_logs
      const minutes = Math.round(Number(hours) * 60)
      
      const { error: logError } = await supabase.from('focus_logs').insert({
        user_id: user.id,
        duration_minutes: minutes,
        started_at: new Date().toISOString(),
        // ❌ REMOVED: ended_at (Does not exist in your database)
        topic: 'Offline Study' // ✅ ADDED: Uses the existing 'topic' column for clarity
      })
      
      if (logError) throw logError

      // 3. Update the Quota Usage
      const { error: quotaError } = await supabase.from('sentinel_settings')
        .update({ offline_quota_used: quotaUsed + 1 })
        .eq('user_id', user.id)

      if (quotaError) throw quotaError

      window.location.reload()

    } catch (err: any) {
      console.error("Logging Error:", err)
      setErrorMsg(err.message || "Failed to log session. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 relative">
        <button onClick={onClose} className="absolute top-2 right-2 p-1 hover:bg-gray-100">✕</button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-black text-white border-2 border-black">
            <BookOpen size={20} />
          </div>
          <div>
            <h3 className="font-bold uppercase tracking-tight">Log Offline Study</h3>
            <p className="text-xs font-mono text-gray-500">Manual Check-in</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 bg-red-100 border-2 border-red-600 p-3 flex items-start gap-2">
            <XCircle className="text-red-600 shrink-0" size={16} />
            <p className="text-xs font-bold text-red-700 leading-tight">{errorMsg}</p>
          </div>
        )}

        {quotaUsed >= MAX_QUOTA ? (
          <div className="bg-red-50 p-4 border-2 border-red-500 text-red-700 text-sm mb-4 flex gap-2">
            <Lock className="shrink-0" />
            <div>
              <p className="font-bold uppercase">Quota Exceeded</p>
              <p className="text-xs mt-1">You have used 4/4 manual logs this week. Use the Digital Timer.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase mb-1">Hours Studied</label>
              <input 
                type="number" 
                autoFocus
                placeholder="e.g. 2.5"
                className="w-full p-3 border-2 border-black font-mono text-lg focus:ring-2 focus:ring-yellow-400 outline-none"
                value={hours}
                onChange={e => setHours(e.target.value)}
              />
            </div>

            <div className="flex justify-between items-center text-xs font-mono text-gray-500 mb-6">
              <span>Weekly Quota:</span>
              <span className="font-bold text-black">{quotaUsed} / {MAX_QUOTA} Used</span>
            </div>

            <button
              onClick={handleLog}
              disabled={loading}
              className="w-full py-3 bg-black text-white font-bold uppercase border-2 border-black hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Check />}
              Verify & Log
            </button>
          </>
        )}
      </div>
    </div>
  )
}