'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lock, Loader2, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAlert } from '@/context/AlertContext'
import { useAppConfig } from '@/context/AppConfigContext'

// Razorpay types
interface RazorpayOptions {
  key: string; amount: number; currency: string; name: string;
  description: string; order_id: string; handler: (response: any) => void;
  theme: { color: string }
}
declare global { interface Window { Razorpay: new (options: RazorpayOptions) => any } }

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
  const router = useRouter()
  const { showAlert } = useAlert()
  const { config } = useAppConfig()
  
  const [loading, setLoading] = useState(true)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [daysLeft, setDaysLeft] = useState(0)
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    checkStatus()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const checkStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 

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
      // FIX: Use config.trial_days from AppConfigContext instead of hardcoded 14
      const startDate = new Date(access.trial_starts_at)
      endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + config.trial_days)
    }

    const diffTime = endDate.getTime() - today.getTime()
    const daysLeftCalc = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    setDaysLeft(daysLeftCalc)
    if (daysLeftCalc <= 0) setIsLocked(true)
    setLoading(false)
  }

  const handlePayment = async () => {
    setPaymentProcessing(true)
    
    try {
      const res = await fetch('/api/payment/create-order', { method: 'POST' })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Could not create order')

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: data.amount,
        currency: 'INR',
        name: 'Krama App',
        description: 'Lifetime Membership',
        order_id: data.orderId,
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            body: JSON.stringify({
              orderCreationId: data.orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          })
          const verifyData = await verifyRes.json()
          if (verifyData.success) {
            showAlert('Payment Successful! Welcome to Pro.', 'success')
            setTimeout(() => window.location.reload(), 1500)
          } else {
            showAlert('Payment Verification Failed.', 'error')
          }
        },
        theme: { color: '#000000' },
      }

      const paymentObject = new window.Razorpay(options)
      paymentObject.open()
    } catch (error) {
      console.error(error)
      showAlert('Something went wrong. Please try again.', 'error')
    } finally {
      setPaymentProcessing(false)
    }
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
  
  // ACCESS GRANTED — show banner if in trial or trial expired
  const bannerStyle = (!isPremium) ? getTrialBannerStyle(daysLeft, config.trial_days) : null

  return (
    <>
      {bannerStyle && (
        <div className={`${bannerStyle.bg} ${bannerStyle.text} text-[10px] font-bold uppercase tracking-widest text-center py-1.5 -mx-6 lg:-mx-8 -mt-6 lg:-mt-8 mb-6 lg:mb-8`}>
          {bannerStyle.message}
        </div>
      )}
      {children}
    </>
  )
}
