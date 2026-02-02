'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Lock, Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function ResetPasswordPage() {
  const supabase = createClient()
  const router = useRouter()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [isValidSession, setIsValidSession] = useState(false)
  const [checkingSession, setCheckingSession] = useState(true)

  // Check if user has a valid recovery session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        setIsValidSession(true)
      } else {
        setIsValidSession(false)
        setStatus('error')
        setMessage('Invalid or expired reset link. Please request a new one.')
      }
      setCheckingSession(false)
    }
    
    checkSession()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (password.length < 6) {
      setStatus('error')
      setMessage('Password must be at least 6 characters')
      return
    }

    if (password !== confirmPassword) {
      setStatus('error')
      setMessage('Passwords do not match')
      return
    }

    setLoading(true)
    setStatus('idle')

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setStatus('success')
      setMessage('Password updated successfully!')
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login')
      }, 2000)
      
    } catch (err: any) {
      console.error('Reset password error:', err)
      setStatus('error')
      setMessage(err.message || 'Failed to update password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Loading state
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-bold text-black/50">Verifying...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FBF9F6] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* CARD */}
        <div className="bg-white border-2 border-black p-8 shadow-[6px_6px_0_0_#000]">
          
          {status === 'success' ? (
            // SUCCESS STATE
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h1 className="text-2xl font-black mb-3">Password Updated!</h1>
              <p className="text-black/60 mb-6">
                Your password has been changed. Redirecting to login...
              </p>
              <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : !isValidSession ? (
            // INVALID SESSION STATE
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={32} className="text-red-600" />
              </div>
              <h1 className="text-2xl font-black mb-3">Link Expired</h1>
              <p className="text-black/60 mb-6">
                This password reset link is invalid or has expired.
              </p>
              <Link 
                href="/forgot-password"
                className="inline-block bg-black text-white px-6 py-3 font-bold text-sm uppercase"
              >
                Request New Link
              </Link>
            </div>
          ) : (
            // FORM STATE
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-black mb-2">Set New Password</h1>
                <p className="text-black/50">
                  Enter your new password below
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* ERROR BANNER */}
                {status === 'error' && (
                  <div className="border-2 border-red-200 bg-red-50 p-3 flex items-center gap-3 text-sm font-medium text-red-700">
                    <AlertCircle size={18} className="shrink-0" />
                    <span>{message}</span>
                  </div>
                )}

                {/* NEW PASSWORD FIELD */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-black/70">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
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

                {/* CONFIRM PASSWORD FIELD */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-black/70">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className={`w-full border-2 bg-white pl-11 pr-4 py-3.5 text-sm font-medium placeholder:text-black/30 focus:outline-none transition-colors ${
                        confirmPassword && password !== confirmPassword 
                          ? 'border-red-300 focus:border-red-500' 
                          : 'border-black/10 focus:border-black'
                      }`}
                    />
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs font-bold text-red-500">Passwords do not match</p>
                  )}
                </div>

                {/* SUBMIT BUTTON */}
                <button 
                  type="submit"
                  disabled={loading || password !== confirmPassword}
                  className="w-full flex items-center justify-center gap-2 border-2 border-black bg-brand text-black py-4 text-sm font-bold uppercase tracking-wide shadow-[4px_4px_0_0_#000] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#000] active:translate-y-0 active:shadow-[2px_2px_0_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Update Password'
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
