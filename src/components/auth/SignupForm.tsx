'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Loader2, Lock, AlertTriangle, Mail } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SignupForm() {
  const router = useRouter()
  const supabase = createClient()
  
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  
  // ERROR & STATUS STATES
  const [error, setError] = useState<string | null>(null)
  const [isCapacityError, setIsCapacityError] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true) // New loading state for the check
  
  // SUCCESS STATE
  const [success, setSuccess] = useState(false)

  // 1. THE RECEPTIONIST CHECK (Run on Load)
  useEffect(() => {
    const checkGatekeeper = async () => {
      try {
        // We ask the database configuration directly
        const { data, error } = await supabase
          .from('app_config')
          .select('signup_active')
          .single()
        
        // If config exists AND signup is set to false
        if (data && data.signup_active === false) {
           setIsCapacityError(true)
           setError('We have reached maximum capacity for this cohort. Registrations are currently paused.')
        }
      } catch (err) {
        // Silent fail: If check fails, we assume open (or let the submit fail later)
        console.error('Gatekeeper check failed', err)
      } finally {
        setCheckingStatus(false)
      }
    }
    checkGatekeeper()
  }, [])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Double protection: Don't submit if we already know it's closed
    if (isCapacityError) return

    setLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (authError) throw authError

      if (data.user) {
         setSuccess(true)
      }
    } catch (err: any) {
      const msg = err.message || 'Something went wrong'
      
      // If we somehow missed the pre-check and hit the DB trigger
      if (msg.toLowerCase().includes('database error') || msg.toLowerCase().includes('closed')) {
         setIsCapacityError(true)
         setError('Membership is currently closed. Please try again later.')
      } else {
         setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  // RENDER SUCCESS
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
         <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center border-2 border-green-200">
            <Mail className="text-green-600" size={32} />
         </div>
         
         <div className="space-y-2">
           <h2 className="text-2xl font-black uppercase tracking-tight">Verify Your Email</h2>
           <p className="text-sm font-medium text-black/60 max-w-xs mx-auto">
             We have sent a verification link to <span className="font-bold text-black">{email}</span>.
           </p>
           <p className="text-xs text-black/40">
             Please check your inbox (and spam folder) to activate your account.
           </p>
         </div>

         <div className="w-full pt-4 border-t-2 border-dashed border-black/10">
            <Link 
              href="/login" 
              className="block w-full border-2 border-black bg-white py-3 text-sm font-bold uppercase hover:bg-black hover:text-white transition-all"
            >
              Proceed to Login
            </Link>
         </div>
      </div>
    )
  }

  // RENDER FORM
  return (
    <form onSubmit={handleSignup} className="space-y-6">
      
      {/* 2. SHOW ERROR BANNER (If Closed or Failed) */}
      {error && (
        isCapacityError ? (
          <div className="border-2 border-amber-600 bg-amber-50 p-4 flex gap-3 items-start animate-in zoom-in-95 duration-200">
             <Lock className="text-amber-600 shrink-0" size={20} />
             <div>
               <h3 className="font-black uppercase text-amber-900 text-sm">Access Denied</h3>
               <p className="text-xs font-bold text-amber-800 mt-1 leading-relaxed">
                 {error}
               </p>
             </div>
          </div>
        ) : (
          <div className="border-2 border-black bg-red-100 p-3 flex gap-2 text-sm font-bold text-red-600">
            <AlertTriangle size={18} />
            {error}
          </div>
        )
      )}

      {/* Inputs (Disabled if Closed) */}
      <div className={`space-y-6 transition-opacity duration-500 ${isCapacityError ? 'opacity-50 pointer-events-none grayscale' : 'opacity-100'}`}>
          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wide">Full Name</label>
            <input 
              type="text" 
              required
              disabled={isCapacityError || checkingStatus}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="w-full border-neo bg-[#FBF9F6] px-4 py-3 font-medium placeholder:text-black/30 focus:border-brand focus:outline-none focus:ring-0 disabled:cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wide">Email</label>
            <input 
              type="email" 
              required
              disabled={isCapacityError || checkingStatus}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border-neo bg-[#FBF9F6] px-4 py-3 font-medium placeholder:text-black/30 focus:border-brand focus:outline-none focus:ring-0 disabled:cursor-not-allowed"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold uppercase tracking-wide">Password</label>
            <input 
              type="password" 
              required
              disabled={isCapacityError || checkingStatus}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-neo bg-[#FBF9F6] px-4 py-3 font-medium focus:border-brand focus:outline-none focus:ring-0 disabled:cursor-not-allowed"
            />
          </div>

          <button 
            disabled={loading || isCapacityError || checkingStatus} 
            className="group mt-8 flex w-full items-center justify-center gap-2 border-neo bg-black py-4 text-white shadow-neo transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(204,255,0,1)] active:translate-y-0 active:shadow-neo disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-neo"
          >
            {loading || checkingStatus ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span className="font-bold uppercase tracking-widest">{isCapacityError ? 'Sold Out' : 'Create Account'}</span>
                {!isCapacityError && <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />}
              </>
            )}
          </button>
      </div>

      <p className="mt-8 text-center text-sm font-medium text-black/60">
        Already have an account?{' '}
        <Link href="/login" className="font-bold text-black underline decoration-2 underline-offset-4 hover:text-brand-hover">
          Log in
        </Link>
      </p>
    </form>
  )
}