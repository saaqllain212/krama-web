'use client'

import { useState } from 'react'
import { Clock, Plus, Loader2, Check, Infinity } from 'lucide-react'

interface TimekeeperProps {
  userId: string
  currentTrialEnd?: string | null
  onUpdate: () => void 
  adminEmail: string
  isPremium: boolean // <--- 1. NEW PROP
}

export default function Timekeeper({ userId, currentTrialEnd, onUpdate, adminEmail, isPremium }: TimekeeperProps) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  // 2. NEW LOGIC: If Premium, don't show buttons
  if (isPremium) {
    return (
        <div className="flex items-center gap-2 text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200 w-fit">
            <Infinity size={14} /> LIFETIME
        </div>
    )
  }

  const extendTrial = async (days: number) => {
    if (!confirm(`Add ${days} days to this user?`)) return

    setLoading(true)
    try {
      const res = await fetch('/api/admin/extend-trial', {
        method: 'POST',
        body: JSON.stringify({ userId, days, adminEmail })
      })
      
      if (!res.ok) throw new Error('Failed to extend')
      
      setSuccess(true)
      onUpdate() 
      setTimeout(() => setSuccess(false), 2000)
    } catch (e) {
      alert('Error extending trial')
    } finally {
      setLoading(false)
    }
  }

  // Calculate days remaining
  const daysLeft = currentTrialEnd 
    ? Math.ceil((new Date(currentTrialEnd).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return (
    <div className="flex items-center gap-4 bg-gray-50 p-2 rounded-lg border border-gray-200 w-fit">
      
      {/* STATUS DISPLAY */}
      <div className="flex items-center gap-2 text-xs font-mono w-20">
        <Clock size={14} className={daysLeft > 0 ? "text-blue-600" : "text-gray-400"} />
        <span>
          {daysLeft > 0 ? `${daysLeft}d left` : 'Expired'}
        </span>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-1">
        <button 
          onClick={() => extendTrial(7)}
          disabled={loading}
          className="px-2 py-1 bg-white border hover:bg-blue-50 text-[10px] font-bold uppercase rounded flex items-center gap-1 transition-colors"
          title="Add 7 Days"
        >
          <Plus size={10} /> 7d
        </button>
        <button 
          onClick={() => extendTrial(30)}
          disabled={loading}
          className="px-2 py-1 bg-white border hover:bg-purple-50 text-[10px] font-bold uppercase rounded flex items-center gap-1 transition-colors"
          title="Add 30 Days"
        >
          <Plus size={10} /> 30d
        </button>
      </div>

      {/* FEEDBACK ICON */}
      <div className="w-4">
        {loading && <Loader2 size={14} className="animate-spin text-blue-600" />}
        {success && <Check size={14} className="text-green-600 animate-in zoom-in" />}
      </div>
    </div>
  )
}