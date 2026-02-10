'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Lock, Loader2, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAlert } from '@/context/AlertContext' 

// CONFIGURATION
const TRIAL_DAYS = 14
const PRICE = 299

// Helper Type for Razorpay
interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  handler: (response: any) => void
  theme: {
    color: string
  }
}

// Extend Window interface so TS doesn't complain
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => any
  }
}

// Progressive urgency helper — returns banner style based on days left
function getTrialBannerStyle(daysLeft: number) {
  if (daysLeft <= 3) {
    return {
      bg: 'bg-red-500',
      text: 'text-white',
      message: daysLeft === 1 
        ? '⚠️ Last day of trial — Upgrade now to keep your data' 
        : daysLeft <= 0
          ? '⚠️ Trial expired'
          : `⚠️ Trial ends in ${daysLeft} days`
    }
  }
  if (daysLeft <= 7) {
    return {
      bg: 'bg-amber-100',
      text: 'text-amber-900',
      message: `Trial ends in ${daysLeft} days — Upgrade for lifetime access`
    }
  }
  if (daysLeft <= 14) {
    return {
      bg: 'bg-primary-50',
      text: 'text-primary-800',
      message: `${daysLeft} days left in your free trial`
    }
  }
  return null // Don't show banner for > 14 days (extended trials)
}

export default function TrialGuard({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const router = useRouter()
  const { showAlert } = useAlert()
  
  const [loading, setLoading] = useState(true)
  const [paymentProcessing, setPaymentProcessing] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [daysLeft, setDaysLeft] = useState(0)
  // FIX: Track premium status so banner doesn't show for pro users
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    checkStatus()
  }, [])

  const checkStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return 

    const { data: access } = await supabase
      .from('user_access')
      .select('is_premium, trial_starts_at, trial_ends_at')
      .eq('user_id', user.id)
      .single()

    if (!access) {
       setLoading(false)
       return
    }

    // Premium Check
    if (access.is_premium) {
      setIsPremium(true) // FIX: Set premium flag
      setLoading(false)
      return // UNLOCKED — no banner, no lock
    }

    // Trial Timer Check
    const today = new Date()
    let endDate: Date

    if (access.trial_ends_at) {
        endDate = new Date(access.trial_ends_at)
    } else {
        const startDate = new Date(access.trial_starts_at)
        endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + TRIAL_DAYS)
    }

    const diffTime = endDate.getTime() - today.getTime()
    const daysLeftCalc = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    setDaysLeft(daysLeftCalc)

    if (daysLeftCalc <= 0) {
      setIsLocked(true) 
    }
    
    setLoading(false)
  }

  // --- HANDLE PAYMENT LOGIC ---
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
            setTimeout(() => {
                window.location.reload()
            }, 1500)
          } else {
            showAlert('Payment Verification Failed.', 'error')
          }
        },
        theme: {
          color: '#000000',
        },
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

  // --- RENDER 1: LOADING ---
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin opacity-20" size={40} />
      </div>
    )
  }

  // --- RENDER 2: LOCKED (PAYWALL) ---
  if (isLocked) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/90 backdrop-blur-md p-6">
        <div className="max-w-md w-full bg-gray-50 border border-gray-200 rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-full mb-6">
            <Lock className="text-white" size={32} />
          </div>
          
          <h1 className="text-3xl font-bold uppercase tracking-tighter mb-2">
            Trial Expired
          </h1>
          <p className="text-black/60 font-medium mb-8">
            Your {TRIAL_DAYS}-day free access has ended. <br/>
            Unlock lifetime access to continue your preparation.
          </p>

          <div className="space-y-3 mb-8 text-left bg-white border border-gray-200/5 p-4">
             <div className="flex items-center gap-2 text-sm font-bold">
               <CheckCircle size={16} className="text-green-600"/> Unlimited Focus Logs
             </div>
             <div className="flex items-center gap-2 text-sm font-bold">
               <CheckCircle size={16} className="text-green-600"/> Full Analytics History
             </div>
             <div className="flex items-center gap-2 text-sm font-bold">
               <CheckCircle size={16} className="text-green-600"/> Cloud Sync
             </div>
          </div>

          <button 
            onClick={handlePayment}
            disabled={paymentProcessing}
            className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest hover:bg-stone-800 hover:-translate-y-1 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {paymentProcessing ? <Loader2 className="animate-spin" size={20}/> : `Unlock Now • ₹${PRICE}`}
          </button>
          
          <button 
            onClick={() => router.push('/')}
            className="mt-4 text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  // --- RENDER 3: ACCESS GRANTED ---
  // FIX: Only show trial banner for non-premium users who are still in trial
  const bannerStyle = (!isPremium && !isLocked) ? getTrialBannerStyle(daysLeft) : null

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