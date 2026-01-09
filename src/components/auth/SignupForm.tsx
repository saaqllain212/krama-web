'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function SignupForm() {
  const router = useRouter()
  const supabase = createClient()
  
  // 1. State Variables (To hold what the user types)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 2. The Signup Logic
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault() // Stop page refresh
    setLoading(true)
    setError(null)

    try {
      // Send data to Supabase
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

      // If successful, go to dashboard
      if (data.user) {
         router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSignup} className="space-y-6">
      
      {/* Error Message Box (Only shows if there is an error) */}
      {error && (
        <div className="border-2 border-black bg-red-100 p-3 text-sm font-bold text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-bold uppercase tracking-wide">Full Name</label>
        <input 
          type="text" 
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="John Doe"
          className="w-full border-neo bg-[#FBF9F6] px-4 py-3 font-medium placeholder:text-black/30 focus:border-brand focus:outline-none focus:ring-0"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold uppercase tracking-wide">Email</label>
        <input 
          type="email" 
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full border-neo bg-[#FBF9F6] px-4 py-3 font-medium placeholder:text-black/30 focus:border-brand focus:outline-none focus:ring-0"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-bold uppercase tracking-wide">Password</label>
        <input 
          type="password" 
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border-neo bg-[#FBF9F6] px-4 py-3 font-medium focus:border-brand focus:outline-none focus:ring-0"
        />
      </div>

      <button 
        disabled={loading}
        className="group mt-8 flex w-full items-center justify-center gap-2 border-neo bg-black py-4 text-white shadow-neo transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(204,255,0,1)] active:translate-y-0 active:shadow-neo disabled:opacity-70"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <span className="font-bold uppercase tracking-widest">Create Account</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>

      <p className="mt-8 text-center text-sm font-medium text-black/60">
        Already have an account?{' '}
        <Link href="/login" className="font-bold text-black underline decoration-2 underline-offset-4 hover:text-brand-hover">
          Log in
        </Link>
      </p>
    </form>
  )
}