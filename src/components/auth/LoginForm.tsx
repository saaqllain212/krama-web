'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const router = useRouter()
  const supabase = createClient()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Authenticate with Supabase
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) throw authError

      // Redirect to Dashboard on success
      router.push('/dashboard')
      router.refresh() 
    } catch (err: any) {
      setError('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-6">
      {error && (
        <div className="border-2 border-black bg-red-100 p-3 text-sm font-bold text-red-600">
          {error}
        </div>
      )}

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
        <div className="flex justify-between">
          <label className="text-sm font-bold uppercase tracking-wide">Password</label>
          <Link href="#" className="text-xs font-bold text-black/40 hover:text-black">
            Forgot?
          </Link>
        </div>
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
        className="group mt-8 flex w-full items-center justify-center gap-2 border-neo bg-brand py-4 text-black shadow-neo transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-neo disabled:opacity-70"
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <>
            <span className="font-bold uppercase tracking-widest">Log In</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </>
        )}
      </button>

      <p className="mt-8 text-center text-sm font-medium text-black/60">
        Don't have an account?{' '}
        <Link href="/signup" className="font-bold text-black underline decoration-2 underline-offset-4 hover:text-brand-hover">
          Sign up
        </Link>
      </p>
    </form>
  )
}