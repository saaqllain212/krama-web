'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Loader2, Lock, AlertTriangle, Mail, User, Eye, EyeOff, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// 1. ADDED THIS INTERFACE
interface SignupFormProps {
  onMascotStateChange?: (state: any) => void
}

// 2. UPDATED COMPONENT TO ACCEPT PROPS
export default function SignupForm({ onMascotStateChange }: SignupFormProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // ERROR & STATUS STATES
  const [error, setError] = useState<string | null>(null)
  const [isCapacityError, setIsCapacityError] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(true)
  
  // SUCCESS STATE
  const [success, setSuccess] = useState(false)

  // PASSWORD STRENGTH
  const passwordStrength = {
    length: password.length >= 6,
    hasLetter: /[a-zA-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  }
  const strengthCount = Object.values(passwordStrength).filter(Boolean).length

  // 1. THE RECEPTIONIST CHECK (Run on Load)
  useEffect(() => {
    const checkGatekeeper = async () => {
      try {
        const { data, error } = await supabase
          .from('app_config')
          .select('signup_active')
          .single()
        
        if (data && data.signup_active === false) {
           setIsCapacityError(true)
           setError('We have reached maximum capacity for this cohort. Registrations are currently paused.')
        }
      } catch (err) {
        console.error('Gatekeeper check failed', err)
      } finally {
        setCheckingStatus(false)
      }
    }
    checkGatekeeper()
  }, [])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isCapacityError) return
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

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
         // 3. ADDED MASCOT CELEBRATION HERE
         onMascotStateChange?.('celebrating') 
      }
    } catch (err: any) {
      const msg = err.message || 'Something went wrong'
      
      if (msg.toLowerCase().includes('database error') || msg.toLowerCase().includes('closed')) {
         setIsCapacityError(true)
         setError('Membership is currently closed. Please try again later.')
      } else if (msg.toLowerCase().includes('already registered')) {
         setError('This email is already registered. Try logging in instead.')
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
        <div className="w-20 h-20 bg-brand/20 border-2 border-brand flex items-center justify-center">
          <Mail className="text-black" size={32} />
        </div>
          
        <div className="space-y-3">
          <h2 className="text-2xl font-black uppercase tracking-tight">Check Your Email</h2>
          <p className="text-sm font-medium text-black/60 max-w-xs mx-auto">
            We sent a verification link to <span className="font-bold text-black">{email}</span>
          </p>
          <p className="text-xs text-black/40">
            Click the link in the email to activate your account. Check spam if you don't see it.
          </p>
        </div>

        <div className="w-full pt-6 border-t border-black/10 space-y-3">
          <Link 
            href="/login" 
            className="flex items-center justify-center gap-2 w-full border-2 border-black bg-black text-white py-3 text-sm font-bold uppercase tracking-wide hover:bg-brand hover:text-black transition-all"
          >
            Go to Login
            <ArrowRight size={16} />
          </Link>
          <button 
            onClick={() => setSuccess(false)}
            className="text-xs font-bold text-black/40 hover:text-black transition-colors"
          >
            Use a different email
          </button>
        </div>
      </div>
    )
  }

  // RENDER FORM
  return (
    <form onSubmit={handleSignup} className="space-y-5">
      
      {/* ERROR BANNER */}
      {error && (
        isCapacityError ? (
          <div className="border-2 border-amber-500 bg-amber-50 p-4 flex gap-3 items-start animate-in slide-in-from-top-2 duration-300">
            <Lock className="text-amber-600 shrink-0 mt-0.5" size={18} />
            <div>
              <h3 className="font-bold text-amber-900 text-sm">Registrations Paused</h3>
              <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                {error}
              </p>
            </div>
          </div>
        ) : (
          <div className="border-2 border-red-200 bg-red-50 p-3 flex items-center gap-2 text-sm font-medium text-red-700 animate-in slide-in-from-top-2 duration-300">
            <AlertTriangle size={16} />
            {error}
          </div>
        )
      )}

      {/* FORM FIELDS */}
      <div className={`space-y-5 transition-all duration-300 ${isCapacityError ? 'opacity-40 pointer-events-none' : ''}`}>
        
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-black/70">Full Name</label>
          <div className="relative">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
            <input 
              type="text" 
              required
              disabled={isCapacityError || checkingStatus}
              value={fullName}
              // 4. ADDED MASCOT TRIGGERS HERE
              onFocus={() => onMascotStateChange?.('typing-name')}
              onBlur={() => onMascotStateChange?.('watching')}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              className="w-full border-2 border-black/10 bg-white pl-11 pr-4 py-3.5 text-sm font-medium placeholder:text-black/30 focus:border-black focus:outline-none transition-colors disabled:cursor-not-allowed disabled:bg-black/5"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-black/70">Email</label>
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
            <input 
              type="email" 
              required
              disabled={isCapacityError || checkingStatus}
              value={email}
              // 4. ADDED MASCOT TRIGGERS HERE
              onFocus={() => onMascotStateChange?.('typing-email')}
              onBlur={() => onMascotStateChange?.('watching')}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border-2 border-black/10 bg-white pl-11 pr-4 py-3.5 text-sm font-medium placeholder:text-black/30 focus:border-black focus:outline-none transition-colors disabled:cursor-not-allowed disabled:bg-black/5"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-black/70">Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
            <input 
              type={showPassword ? 'text' : 'password'}
              required
              disabled={isCapacityError || checkingStatus}
              value={password}
              // 4. ADDED MASCOT TRIGGERS HERE
              onFocus={() => onMascotStateChange?.('typing-password')}
              onBlur={() => onMascotStateChange?.('watching')}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="w-full border-2 border-black/10 bg-white pl-11 pr-12 py-3.5 text-sm font-medium placeholder:text-black/30 focus:border-black focus:outline-none transition-colors disabled:cursor-not-allowed disabled:bg-black/5"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30 hover:text-black transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <div className="flex items-center gap-2 mt-2 animate-in fade-in duration-200">
              <div className="flex gap-1 flex-1">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i}
                    className={`h-1 flex-1 transition-colors ${
                      i <= strengthCount 
                        ? strengthCount === 1 ? 'bg-red-400' : strengthCount === 2 ? 'bg-amber-400' : 'bg-green-500'
                        : 'bg-black/10'
                    }`}
                  />
                ))}
              </div>
              <span className={`text-[10px] font-bold uppercase ${
                strengthCount === 1 ? 'text-red-500' : strengthCount === 2 ? 'text-amber-500' : strengthCount === 3 ? 'text-green-600' : 'text-black/30'
              }`}>
                {strengthCount === 0 && 'Too weak'}
                {strengthCount === 1 && 'Weak'}
                {strengthCount === 2 && 'Good'}
                {strengthCount === 3 && 'Strong'}
              </span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button 
          disabled={loading || isCapacityError || checkingStatus} 
          className="group w-full flex items-center justify-center gap-2 border-2 border-black bg-black text-white py-4 text-sm font-bold uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(204,255,0,1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(204,255,0,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(204,255,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_rgba(204,255,0,1)]"
        >
          {loading || checkingStatus ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              {isCapacityError ? 'Registrations Closed' : 'Create Free Account'}
              {!isCapacityError && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </>
          )}
        </button>
      </div>

      {/* Login Link */}
      <p className="text-center text-sm font-medium text-black/50 pt-4">
        Already have an account?{' '}
        <Link href="/login" className="font-bold text-black hover:text-brand transition-colors">
          Log in
        </Link>
      </p>
    </form>
  )
}