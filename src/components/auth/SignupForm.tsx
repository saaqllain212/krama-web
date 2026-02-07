'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Loader2, Lock, AlertTriangle, Mail, User, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface SignupFormProps {
  onMascotStateChange?: (state: any) => void
}

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

  // Gatekeeper Check (Run on Load)
  useEffect(() => {
    const checkGatekeeper = async () => {
      try {
        const { data } = await supabase
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
      <div className="flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
        <div className="w-20 h-20 bg-primary-100 border border-primary-200 rounded-2xl flex items-center justify-center">
          <Mail className="text-primary-600" size={32} />
        </div>
          
        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900">Check Your Email</h2>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            We sent a verification link to <span className="font-semibold text-gray-900">{email}</span>
          </p>
          <p className="text-xs text-gray-400">
            Click the link in the email to activate your account. Check spam if you don&apos;t see it.
          </p>
        </div>

        <div className="w-full pt-6 border-t border-gray-200 space-y-3">
          <Link 
            href="/login" 
            className="btn btn-primary w-full flex items-center justify-center gap-2"
          >
            Go to Login
            <ArrowRight size={16} />
          </Link>
          <button 
            onClick={() => setSuccess(false)}
            className="text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors"
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
          <div className="border border-warning-200 bg-warning-50 p-4 flex gap-3 items-start rounded-xl animate-slide-down">
            <Lock className="text-warning-600 shrink-0 mt-0.5" size={18} />
            <div>
              <h3 className="font-semibold text-warning-900 text-sm">Registrations Paused</h3>
              <p className="text-xs text-warning-700 mt-1 leading-relaxed">
                {error}
              </p>
            </div>
          </div>
        ) : (
          <div className="border border-danger-200 bg-danger-50 p-3 flex items-center gap-2 text-sm font-medium text-danger-700 rounded-xl animate-slide-down">
            <AlertTriangle size={16} />
            {error}
          </div>
        )
      )}

      {/* FORM FIELDS */}
      <div className={`space-y-5 transition-all duration-300 ${isCapacityError ? 'opacity-40 pointer-events-none' : ''}`}>
        
        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Full Name</label>
          <div className="relative">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              required
              disabled={isCapacityError || checkingStatus}
              value={fullName}
              onFocus={() => onMascotStateChange?.('typing-name')}
              onBlur={() => onMascotStateChange?.('watching')}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your name"
              className="input pl-11"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Email</label>
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="email" 
              required
              disabled={isCapacityError || checkingStatus}
              value={email}
              onFocus={() => onMascotStateChange?.('typing-email')}
              onBlur={() => onMascotStateChange?.('watching')}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input pl-11"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type={showPassword ? 'text' : 'password'}
              required
              disabled={isCapacityError || checkingStatus}
              value={password}
              onFocus={() => onMascotStateChange?.('typing-password')}
              onBlur={() => onMascotStateChange?.('watching')}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 6 characters"
              className="input pl-11 pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <div className="flex items-center gap-2 mt-2 animate-fade-in">
              <div className="flex gap-1 flex-1">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      i <= strengthCount 
                        ? strengthCount === 1 ? 'bg-danger-400' : strengthCount === 2 ? 'bg-warning-400' : 'bg-success-500'
                        : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className={`text-[10px] font-semibold uppercase ${
                strengthCount === 1 ? 'text-danger-500' : strengthCount === 2 ? 'text-warning-500' : strengthCount === 3 ? 'text-success-600' : 'text-gray-300'
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
          className="btn btn-primary w-full group flex items-center justify-center gap-2 py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
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
      <p className="text-center text-sm text-gray-500 pt-4">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
          Log in
        </Link>
      </p>
    </form>
  )
}
