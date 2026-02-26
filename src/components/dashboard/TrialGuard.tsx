'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import { useAppConfig } from '@/context/AppConfigContext'

function getTrialBannerStyle(daysLeft: number, trialDays: number) {
  if (daysLeft <= 0) {
    return {
      bg: 'bg-gradient-to-r from-primary-500 to-purple-500', text: 'text-white',
      message: '✨ Upgrade to Pro for Spaced Review, Mock Analysis & more — ₹149 lifetime'
    }
  }
  if (daysLeft <= 3) {
    return {
      bg: 'bg-amber-100', text: 'text-amber-900',
      message: `⚡ ${daysLeft} day${daysLeft === 1 ? '' : 's'} left to try Pro features free — Upgrade for ₹149 lifetime`
    }
  }
  if (daysLeft <= 7) {
    return {
      bg: 'bg-amber-50', text: 'text-amber-800',
      message: `Pro trial ends in ${daysLeft} days — Enjoying Review & Mocks? Keep them forever for ₹149`
    }
  }
  if (daysLeft <= trialDays) {
    return {
      bg: 'bg-primary-50', text: 'text-primary-800',
      message: `${daysLeft} days left to try all Pro features free`
    }
  }
  return null
}

export default function TrialGuard({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), [])
  const { config } = useAppConfig()
  
  const [loading, setLoading] = useState(true)
  const [daysLeft, setDaysLeft] = useState(0)
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    checkStatus()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }

    const { data: access } = await supabase
      .from('user_access')
      .select('is_premium, trial_starts_at, trial_ends_at')
      .eq('user_id', user.id)
      .single()

    if (!access) { setLoading(false); return }

    if (access.is_premium) {
      setIsPremium(true)
      setLoading(false)
      return
    }

    const today = new Date()
    let endDate: Date

    if (access.trial_ends_at) {
      endDate = new Date(access.trial_ends_at)
    } else {
      const startDate = new Date(access.trial_starts_at)
      endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + config.trial_days)
    }

    const diffTime = endDate.getTime() - today.getTime()
    const daysLeftCalc = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    setDaysLeft(daysLeftCalc)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin opacity-20" size={40} />
      </div>
    )
  }

  // FREEMIUM MODEL: Never hard-lock the entire dashboard.
  // Free users get permanent access to: Focus Timer, Syllabus, AI MCQ.
  // Pro features (Review, Mocks, Insights) are gated by PremiumGate per-page.
  // TrialGuard only shows upgrade banners now.
  const bannerStyle = (!isPremium) ? getTrialBannerStyle(daysLeft, config.trial_days) : null

  return (
    <>
      {bannerStyle && (
        <button
          onClick={() => window.dispatchEvent(new CustomEvent('open-checkout'))}
          className={`${bannerStyle.bg} ${bannerStyle.text} text-[10px] font-bold uppercase tracking-widest text-center py-1.5 -mx-6 lg:-mx-8 -mt-6 lg:-mt-8 mb-6 lg:mb-8 w-[calc(100%+3rem)] lg:w-[calc(100%+4rem)] block hover:opacity-90 transition-opacity cursor-pointer`}
        >
          {bannerStyle.message}
        </button>
      )}
      {children}
    </>
  )
}
