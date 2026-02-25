'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Crown, Sparkles, TrendingUp, RotateCw, LineChart, Users } from 'lucide-react'
import { useAppConfig } from '@/context/AppConfigContext'

interface PremiumGateProps {
  featureName: string
  children: React.ReactNode
}

/**
 * PremiumGate: Wraps Pro-only features.
 * 
 * If user is premium OR trial is active → shows children
 * If trial expired AND not premium → shows upgrade prompt
 * 
 * FREE features (Focus, Syllabus, MCQ) should NOT use this.
 * PRO features (Review, Mocks, Companions, Insights) should.
 */
export default function PremiumGate({ featureName, children }: PremiumGateProps) {
  const supabase = useMemo(() => createClient(), [])
  const { config } = useAppConfig()
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: access } = await supabase
        .from('user_access')
        .select('is_premium, trial_starts_at, trial_ends_at')
        .eq('user_id', user.id)
        .single()

      if (!access) { setLoading(false); return }

      // Premium users always have access
      if (access.is_premium) {
        setHasAccess(true)
        setLoading(false)
        return
      }

      // Check trial
      const now = new Date()
      let endDate: Date
      if (access.trial_ends_at) {
        endDate = new Date(access.trial_ends_at)
      } else {
        const start = new Date(access.trial_starts_at)
        endDate = new Date(start)
        endDate.setDate(endDate.getDate() + config.trial_days)
      }

      setHasAccess(now < endDate)
      setLoading(false)
    }
    check()
  }, [supabase, config.trial_days])

  if (loading) return null

  if (hasAccess) return <>{children}</>

  // Upgrade prompt for expired trial / free users
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="max-w-md w-full">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full mb-6 shadow-glow-primary">
          <Crown className="text-white" size={36} />
        </div>

        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Unlock {featureName}
        </h2>
        <p className="text-gray-500 font-medium mb-8 leading-relaxed">
          {featureName} is a Pro feature. Upgrade once, use forever — no subscriptions.
        </p>

        {/* What you get */}
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-6 mb-8 text-left">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
            Everything in Pro
          </p>
          <div className="space-y-3">
            {[
              { icon: RotateCw, label: 'Spaced Review System', desc: 'Never forget what you studied' },
              { icon: LineChart, label: 'Mock Test Analysis', desc: 'Find silly mistakes vs concept gaps' },
              { icon: Sparkles, label: 'Dual Companions', desc: 'Growth Guardian + Time Wraith' },
              { icon: TrendingUp, label: 'Full Analytics', desc: 'Study patterns and insights' },
              { icon: Users, label: 'Weekly Leaderboard', desc: 'Compete with other aspirants' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon size={16} className="text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                  <p className="text-xs text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-4xl font-bold text-gray-900">₹{config.base_price}</span>
            <span className="text-lg text-gray-400 line-through">₹299</span>
            <span className="text-sm font-semibold text-success-600 bg-success-50 px-2 py-0.5 rounded-full">
              Save ₹{299 - config.base_price}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">One-time payment · Lifetime access</p>
        </div>

        {/* CTA - triggers checkout modal */}
        <button
          onClick={() => {
            // Dispatch a custom event that the dashboard page listens for
            window.dispatchEvent(new CustomEvent('open-checkout'))
          }}
          className="w-full btn btn-primary text-lg py-4"
        >
          Upgrade to Pro — ₹{config.base_price}
        </button>

        <p className="text-xs text-gray-400 mt-4">
          Your study data is safe. Upgrade anytime.
        </p>
      </div>
    </div>
  )
}
