'use client'

import Link from 'next/link'
import { Shield, Clock, Target, Zap, Sparkles, Brain } from 'lucide-react'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
  mode?: 'signup' | 'login'
}

const BENEFITS = [
  { icon: <Target size={20} />, text: 'Visual syllabus tracking for every topic' },
  { icon: <Clock size={20} />, text: 'Pomodoro timer for deep focus sessions' },
  { icon: <Sparkles size={20} />, text: 'AI MCQ generator from your PDFs' },
  { icon: <Brain size={20} />, text: 'Dual companions that evolve with you' },
]

export default function AuthLayout({ children, title, subtitle, mode = 'signup' }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      
      {/* LEFT SIDE: Gradient Brand Panel */}
      <div className="relative hidden w-1/2 flex-col justify-between p-10 lg:flex lg:p-12 overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-purple-700">
        
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        {/* Floating Orbs */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Logo */}
        <Link href="/" className="relative z-10 text-3xl font-black uppercase tracking-tight text-white hover:text-white/80 transition-colors">
          Krama
        </Link>

        {/* Main Content */}
        <div className="relative z-10 flex-1 flex flex-col justify-center max-w-md">
          
          {/* Headline */}
          <h2 className="text-4xl font-bold tracking-tight text-white leading-tight mb-4">
            Your study companion,
            <span className="block text-white/70 mt-2">powered by AI.</span>
          </h2>

          <p className="text-white/80 text-lg mb-10">
            Join students who are studying smarter with AI-generated practice questions and intelligent tracking.
          </p>

          {/* Benefits */}
          <div className="space-y-4">
            {BENEFITS.map((benefit, i) => (
              <div 
                key={i}
                className="flex items-center gap-4 text-white/90 group"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl flex items-center justify-center group-hover:bg-white/20 group-hover:scale-110 transition-all">
                  {benefit.icon}
                </div>
                <span className="text-sm font-medium">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="mt-12 pt-8 border-t border-white/20">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-3xl font-bold text-white">14 Days</div>
                <div className="text-sm text-white/60">Free Trial</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">₹299</div>
                <div className="text-sm text-white/60">Lifetime Access</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Quote */}
        <div className="relative z-10">
          <blockquote className="text-white/70 text-sm font-medium italic">
            "Finally, a study tracker that actually helps instead of overwhelming me."
          </blockquote>
          <p className="mt-2 text-xs font-semibold text-white/50 uppercase tracking-wider">
            — JEE Aspirant, Mumbai
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: The Form */}
      <div className="flex w-full flex-col bg-gray-50 lg:w-1/2">
        
        {/* Top Bar */}
        <div className="flex items-center justify-between p-6 lg:p-8">
          <Link href="/" className="text-2xl font-black uppercase tracking-tight text-gray-900 lg:text-gray-400 hover:text-gray-900 transition-colors">
            Krama
          </Link>
          
          {/* Trial Badge */}
          {mode === 'signup' && (
            <div className="flex items-center gap-2 bg-success-100 px-3 py-1.5 rounded-full">
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