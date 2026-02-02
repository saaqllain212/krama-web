'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const supabase = createClient()
  
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setStatus('error')
      setMessage('Please enter your email address')
      return
    }

    setLoading(true)
    setStatus('idle')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      setStatus('success')
      setMessage('Check your email! We sent you a password reset link.')
    } catch (err: any) {
      console.error('Reset password error:', err)
      setStatus('error')
      
      if (err.message?.includes('rate limit')) {
        setMessage('Too many requests. Please try again in a few minutes.')
      } else {
        setMessage('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FBF9F6] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        
        {/* BACK LINK */}
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-sm font-bold text-black/40 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to Login
        </Link>

        {/* CARD */}
        <div className="bg-white border-2 border-black p-8 shadow-[6px_6px_0_0_#000]">
          
          {status === 'success' ? (
            // SUCCESS STATE
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h1 className="text-2xl font-black mb-3">Check Your Email</h1>
              <p className="text-black/60 mb-6">
                We sent a password reset link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-black/40 mb-6">
                Didn't receive the email? Check your spam folder or try again.
              </p>
              <button 
                onClick={() => { setStatus('idle'); setEmail('') }}
                className="text-sm font-bold text-black/50 hover:text-black"
              >
                Try a different email
              </button>
            </div>
          ) : (
            // FORM STATE
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-black mb-2">Forgot Password?</h1>
                <p className="text-black/50">
                  Enter your email and we'll send you a reset link
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

                {/* EMAIL FIELD */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-black/70">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full border-2 border-black/10 bg-white pl-11 pr-4 py-3.5 text-sm font-medium placeholder:text-black/30 focus:border-black focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 border-2 border-black bg-brand text-black py-4 text-sm font-bold uppercase tracking-wide shadow-[4px_4px_0_0_#000] hover:-translate-y-0.5 hover:shadow-[5px_5px_0_0_#000] active:translate-y-0 active:shadow-[2px_2px_0_0_#000] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              {/* SIGNUP LINK */}
              <p className="text-center text-sm font-medium text-black/50 mt-6">
                Remember your password?{' '}
                <Link href="/login" className="font-bold text-black hover:text-brand transition-colors">
                  Log in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
