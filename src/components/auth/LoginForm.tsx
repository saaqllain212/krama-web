'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Loader2, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface LoginFormProps {
  onMascotStateChange?: (state: any) => void
}

export default function LoginForm({ onMascotStateChange }: LoginFormProps) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  
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

      onMascotStateChange?.('success')

      router.push('/dashboard')
      router.refresh() 
    } catch (err: any) {
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
        <div className="border border-danger-200 bg-danger-50 p-3 flex items-center gap-3 text-sm font-medium text-danger-700 rounded-xl animate-slide-down">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Email Field */}
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Email</label>
        <div className="relative">
          <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="email" 
            required
            value={email}
            onFocus={() => onMascotStateChange?.('typing-email')}
            onBlur={() => onMascotStateChange?.('watching')}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="input pl-11"
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-gray-700">Password</label>
          <Link 
            href="/forgot-password" 
            className="text-xs font-medium text-gray-400 hover:text-primary-600 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onFocus={() => onMascotStateChange?.('typing-password')}
            onBlur={() => onMascotStateChange?.('watching')}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
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
      </div>

      {/* Submit Button */}
      <button 
        disabled={loading}
        className="btn btn-primary w-full group flex items-center justify-center gap-2 py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
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
      <p className="text-center text-sm text-gray-500 pt-4">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
          Sign up free
        </Link>
      </p>
    </form>
  )
}
