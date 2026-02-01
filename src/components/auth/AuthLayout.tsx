'use client'

import Link from 'next/link'
import { Shield, Clock, Target, Zap } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  mode?: 'signup' | 'login'
}

const BENEFITS = [
  { icon: <Target size={18} />, text: 'Track your entire syllabus visually' },
  { icon: <Clock size={18} />, text: 'Pomodoro timer for deep focus' },
  { icon: <Zap size={18} />, text: 'Spaced repetition so you never forget' },
  { icon: <Shield size={18} />, text: 'Your data stays private, always' },
]

export default function AuthLayout({ children, title, subtitle, mode = 'signup' }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      
      {/* LEFT SIDE: Brand & Value Props (Hidden on mobile) */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-black p-10 lg:flex lg:p-12">
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255,255,255,0.1) 10px,
            rgba(255,255,255,0.1) 20px
          )`
        }} />

        {/* Logo */}
        <Link href="/" className="relative z-10 text-2xl font-black uppercase tracking-tight text-white hover:text-brand transition-colors">
          Krama
        </Link>

        {/* Main Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-md">
          
          {/* Headline */}
          <h2 className="text-4xl font-bold tracking-tight text-white leading-tight">
            Stop studying randomly.
            <span className="block text-white/40 mt-1">Start studying smart.</span>
          </h2>

          {/* Benefits */}
          <div className="mt-10 space-y-4">
            {BENEFITS.map((benefit, i) => (
              <div 
                key={i}
                className="flex items-center gap-4 text-white/70 group"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-white/10 border border-white/10 flex items-center justify-center text-brand group-hover:bg-brand group-hover:text-black transition-all">
                  {benefit.icon}
                </div>
                <span className="text-sm font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* Social Proof */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex items-center gap-4">
              {/* Avatar Stack */}
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-brand to-green-400 border-2 border-black flex items-center justify-center text-[10px] font-bold text-black"
                  >
                    {['A', 'R', 'S', 'P'][i-1]}
                  </div>
                ))}
              </div>
              <div className="text-sm">
                <span className="text-white font-bold">50+ students</span>
                <span className="text-white/50"> already tracking</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Quote */}
        <div className="relative z-10">
          <blockquote className="text-white/60 text-sm font-medium italic">
            "Finally, a tool that doesn't try to do everything. Just works."
          </blockquote>
          <p className="mt-2 text-xs font-bold text-white/40 uppercase tracking-wider">
            — UPSC Aspirant, Delhi
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: The Form */}
      <div className="flex w-full flex-col bg-[#FBF9F6] lg:w-1/2">
        
        {/* Top Bar (Mobile Logo + Desktop subtle branding) */}
        <div className="flex items-center justify-between p-6 lg:p-8">
          <Link href="/" className="text-xl font-black uppercase tracking-tight lg:text-black/20 hover:text-black transition-colors">
            Krama
          </Link>
          
          {/* Trial Badge */}
          {mode === 'signup' && (
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black/40">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              14-Day Free Trial
            </div>
          )}
        </div>

        {/* Form Container */}
        <div className="flex flex-1 items-center justify-center px-6 pb-12 lg:px-12">
          <div className="w-full max-w-md">
            
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold tracking-tight text-black md:text-4xl">{title}</h1>
              <p className="mt-2 text-base font-medium text-black/50">{subtitle}</p>
            </div>

            {/* Form Content */}
            {children}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 text-center text-[11px] font-medium text-black/30 lg:p-8">
          By continuing, you agree to our{' '}
          <Link href="/legal/terms" className="underline hover:text-black">Terms</Link>
          {' '}and{' '}
          <Link href="/legal/privacy" className="underline hover:text-black">Privacy Policy</Link>
        </div>
      </div>
      
    </div>
  )
}