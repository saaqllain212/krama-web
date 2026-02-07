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
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md">
        
        {/* BACK LINK */}
        <Link 
          href="/login" 
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to Login
        </Link>

        {/* CARD */}
        <div className="card p-8">
          
          {status === 'success' ? (
            // SUCCESS STATE
            <div className="text-center">
              <div className="w-16 h-16 bg-success-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-success-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-3">Check Your Email</h1>
              <p className="text-gray-500 mb-6">
                We sent a password reset link to <strong className="text-gray-900">{email}</strong>
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Didn&apos;t receive the email? Check your spam folder or try again.
              </p>
              <button 
                onClick={() => { setStatus('idle'); setEmail('') }}
                className="text-sm font-medium text-gray-400 hover:text-primary-600 transition-colors"
              >
                Try a different email
              </button>
            </div>
          ) : (
            // FORM STATE
            <>
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot Password?</h1>
                <p className="text-gray-500">
                  Enter your email and we&apos;ll send you a reset link
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* ERROR BANNER */}
                {status === 'error' && (
                  <div className="border border-danger-200 bg-danger-50 p-3 flex items-center gap-3 text-sm font-medium text-danger-700 rounded-xl">
                    <AlertCircle size={18} className="shrink-0" />
                    <span>{message}</span>
                  </div>
                )}

                {/* EMAIL FIELD */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="email" 
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="input pl-11"
                    />
                  </div>
                </div>

                {/* SUBMIT BUTTON */}
                <button 
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full flex items-center justify-center gap-2 py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>

              {/* LOGIN LINK */}
              <p className="text-center text-sm text-gray-500 mt-6">
                Remember your password?{' '}
                <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
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
