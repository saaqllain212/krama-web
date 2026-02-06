'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Loader2, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// 1. ADDED INTERFACE
interface LoginFormProps {
  onMascotStateChange?: (state: any) => void
}

// 2. UPDATED COMPONENT TO ACCEPT PROPS
export default function LoginForm({ onMascotStateChange }: LoginFormProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      // 3. ADDED SUCCESS TRIGGER
      onMascotStateChange?.('success')

      router.push('/dashboard')
      router.refresh() 
    } catch (err: any) {
      // 4. ADDED ERROR TRIGGER
      onMascotStateChange?.('error')

      const msg = err.message || ''
      
      if (msg.toLowerCase().includes('invalid')) {
        setError('Invalid email or password. Please try again.')
      } else if (msg.toLowerCase().includes('email not confirmed')) {
        setError('Please verify your email before logging in. Check your inbox.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-5">
      
      {/* Error Banner */}
      {error && (
        <div className="border-2 border-red-200 bg-red-50 p-3 flex items-center gap-3 text-sm font-medium text-red-700 animate-in slide-in-from-top-2 duration-300">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-black/70">Email</label>
        <div className="relative">
          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
          <input 
            type="email" 
            required
            value={email}
            // 5. ADDED MASCOT TRIGGERS
            onFocus={() => onMascotStateChange?.('typing-email')}
            onBlur={() => onMascotStateChange?.('watching')}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full border-2 border-black/10 bg-white pl-11 pr-4 py-3.5 text-sm font-medium placeholder:text-black/30 focus:border-black focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-xs font-bold uppercase tracking-wider text-black/70">Password</label>
          <Link 
            href="/forgot-password" 
            className="text-xs font-bold text-black/40 hover:text-black transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
          <input 
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            // 5. ADDED MASCOT TRIGGERS
            onFocus={() => onMascotStateChange?.('typing-password')}
            onBlur={() => onMascotStateChange?.('watching')}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            className="w-full border-2 border-black/10 bg-white pl-11 pr-12 py-3.5 text-sm font-medium placeholder:text-black/30 focus:border-black focus:outline-none transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30 hover:text-black transition-colors"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <button 
        disabled={loading}
        className="group w-full flex items-center justify-center gap-2 border-2 border-black bg-brand text-black py-4 text-sm font-bold uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            Log In
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>

      {/* Signup Link */}
      <p className="text-center text-sm font-medium text-black/50 pt-4">
        Don't have an account?{' '}
        <Link href="/signup" className="font-bold text-black hover:text-brand transition-colors">
          Sign up free
        </Link>
      </p>
    </form>
  )
}