'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lock, Loader2, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

// CONFIGURATION
const TRIAL_DAYS = 14
const PRICE = 499

export default function TrialGuard({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  
  const [loading, setLoading] = useState(true)
  const [isLocked, setIsLocked] = useState(false)
  const [daysLeft, setDaysLeft] = useState(0)

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 

    // 1. Fetch from the NEW Table (user_access)
    const { data: access } = await supabase
      .from('user_access')
      .select('is_premium, trial_starts_at')
      .eq('user_id', user.id)
      .single()

    // If something went wrong and no row exists (rare), we assume trial based on signup
    if (!access) {
       setLoading(false)
       return
    }

    // 2. Premium Check
    if (access.is_premium) {
      setLoading(false)
      return // UNLOCKED
    }

    // 3. Trial Timer Check
    // We use 'trial_starts_at' from the table, so you can manually reset trials for users
    const startDate = new Date(access.trial_starts_at)
    const today = new Date()
    const diffTime = Math.abs(today.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    const remaining = TRIAL_DAYS - diffDays
    setDaysLeft(remaining)

    if (remaining <= 0) {
      setIsLocked(true) // LOCK THE SCREEN
    }
    
    setLoading(false)
  }

  // --- RENDER 1: LOADING ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center">
        <Loader2 className="animate-spin opacity-20" size={40} />
      </div>
    )
  }

  // --- RENDER 2: LOCKED (PAYWALL) ---
  if (isLocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/90 backdrop-blur-md p-6">
        <div className="max-w-md w-full bg-[#FBF9F6] border-4 border-black shadow-[12px_12px_0_0_#ccff00] p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-6">
            <Lock className="text-white" size={32} />
          </div>
          
          <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">
            Trial Expired
          </h1>
          <p className="text-black/60 font-medium mb-8">
            Your {TRIAL_DAYS}-day free access has ended. <br/>
            Unlock lifetime access to continue your preparation.
          </p>

          <div className="space-y-3 mb-8 text-left bg-white border-2 border-black/5 p-4">
             <div className="flex items-center gap-2 text-sm font-bold">
               <CheckCircle size={16} className="text-green-600"/> Unlimited Focus Logs
             </div>
             <div className="flex items-center gap-2 text-sm font-bold">
               <CheckCircle size={16} className="text-green-600"/> Full Analytics History
             </div>
             <div className="flex items-center gap-2 text-sm font-bold">
               <CheckCircle size={16} className="text-green-600"/> Cloud Sync
             </div>
          </div>

          <button 
            onClick={() => alert("Integrating Razorpay Backend Next...")}
            className="w-full bg-black text-white py-4 font-black uppercase tracking-widest hover:bg-stone-800 hover:-translate-y-1 transition-all shadow-lg"
          >
            Unlock Now • ₹{PRICE}
          </button>
          
          <button 
            onClick={() => router.push('/')}
            className="mt-4 text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  // --- RENDER 3: ACCESS GRANTED ---
  return (
    <>
      {/* Optional Top Bar for Trial Users */}
      {!isLocked && daysLeft <= 3 && daysLeft > 0 && (
         <div className="bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-widest text-center py-1 border-b border-amber-200">
           Trial Ends in {daysLeft} Days
         </div>
      )}
      {children}
    </>
  )
}