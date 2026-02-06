'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import GrowthGuardianMascot from './GrowthGuardianMascot'
import TimeWraithMascot from './TimeWraithMascot'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  mode?: 'signup' | 'login'
  mascotState?: 'idle' | 'watching' | 'typing-name' | 'typing-email' | 'typing-password' | 'celebrating' | 'success' | 'error'
}

export default function AuthLayout({ 
  children, 
  title, 
  subtitle, 
  mode = 'signup',
  mascotState = 'idle'
}: AuthLayoutProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="flex min-h-screen w-full">
      
      {/* LEFT SIDE: Mascot Panel */}
      <div className="relative hidden w-1/2 flex-col justify-between p-10 lg:flex lg:p-12 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        {/* Floating Gradient Orbs */}
        {mode === 'signup' ? (
          <>
            <div className="absolute top-20 right-20 w-64 h-64 bg-green-500/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse" />
            <div className="absolute bottom-20 left-20 w-72 h-72 bg-emerald-500/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </>
        ) : (
          <>
            <div className="absolute top-20 right-20 w-64 h-64 bg-orange-500/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse" />
            <div className="absolute bottom-20 left-20 w-72 h-72 bg-red-500/20 rounded-full mix-blend-screen filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </>
        )}

        {/* Logo */}
        <Link href="/" className="relative z-10 flex items-center gap-2 group">
          <span className="text-3xl">🌱</span>
          <span className="text-2xl font-black uppercase tracking-tight text-white group-hover:text-white/80 transition-colors">
            Krama
          </span>
        </Link>

        {/* MASCOT - The Star of the Show! */}
        <div className="relative z-10 flex-1 flex flex-col justify-center items-center">
          <div className="w-full max-w-md aspect-square">
            {mode === 'signup' ? (
              <GrowthGuardianMascot state={mascotState as any} />
            ) : (
              <TimeWraithMascot state={mascotState as any} />
            )}
          </div>

          {/* Mascot Description */}
          <div className="mt-8 text-center max-w-md">
            {mode === 'signup' ? (
              <>
                <h2 className="text-2xl font-bold text-white mb-3">
                  Meet Your Growth Guardian 🌳
                </h2>
                <p className="text-white/70 text-sm leading-relaxed">
                  This companion grows stronger with every study session. 
                  Watch it evolve as you build your knowledge tree, one hour at a time.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-white mb-3">
                  The Time Wraith Awaits ⏳
                </h2>
                <p className="text-white/70 text-sm leading-relaxed">
                  Every moment matters. This guardian reminds you that time flows 
                  whether you study or not. Make it count.
                </p>
              </>
            )}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="relative z-10">
          <div className="grid grid-cols-2 gap-6 p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl">
            <div>
              <div className="text-3xl font-bold text-white">14 Days</div>
              <div className="text-sm text-white/60 mt-1">Free Trial</div>
            </div>
            <div>
              <div className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent">
                ₹299
              </div>
              <div className="text-sm text-white/60 mt-1">Lifetime Access</div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: The Form */}
      <div className="flex w-full flex-col bg-gray-50 lg:w-1/2">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between p-6 lg:p-8">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl">🌱</span>
            <span className="text-xl font-black uppercase tracking-tight text-gray-900 group-hover:text-primary-600 transition-colors">
              Krama
            </span>
          </Link>
          
          {/* Trial Badge */}
          {mode === 'signup' && (
            <div className="flex items-center gap-2 bg-success-100 px-4 py-2 rounded-full border border-success-200">
              <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
              <span className="text-xs font-semibold text-success-700 uppercase tracking-wider">
                14-Day Free Trial
              </span>
            </div>
          )}
        </div>

        {/* Form Container */}
        <div className="flex flex-1 items-center justify-center px-6 pb-12 lg:px-12">
          <div className="w-full max-w-md">
            
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">{title}</h1>
              <p className="mt-3 text-lg font-medium text-gray-600">{subtitle}</p>
              
              {/* Fun hint about mascot */}
              {mode === 'login' && (
                <p className="mt-4 text-sm text-gray-500 italic">
                  💡 Psst... watch the hourglass when you type your password
                </p>
              )}
            </div>

            {/* Form Content */}
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center text-xs font-medium text-gray-500 lg:p-8">
          By continuing, you agree to our{' '}
          <Link href="/legal/terms" className="text-primary-600 hover:text-primary-700 underline">Terms</Link>
          {' '}and{' '}
          <Link href="/legal/privacy" className="text-primary-600 hover:text-primary-700 underline">Privacy Policy</Link>
        </div>
      </div>
      
    </div>
  )
}