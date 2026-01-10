'use client'

import { useState } from 'react'
import { X, Loader2, Tag } from 'lucide-react' 
import Script from 'next/script'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail: string
  userName: string
}

export default function CheckoutModal({ isOpen, onClose, userEmail, userName }: CheckoutModalProps) {
  const [loading, setLoading] = useState(false)
  const [coupon, setCoupon] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [statusMsg, setStatusMsg] = useState('')

  if (!isOpen) return null

  const handlePayment = async () => {
    setLoading(true)
    setStatus('idle')
    
    try {
      // 1. Create Order (Pass the coupon)
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        body: JSON.stringify({ couponCode: coupon }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to create order')

      // 2. Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount, // Dynamic Amount from Backend
        currency: 'INR',
        name: 'Krama Systems',
        description: data.couponApplied ? `License (Coupon: ${data.couponApplied})` : 'Lifetime License',
        order_id: data.orderId,
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: { color: '#000000' },
        handler: async function (response: any) {
          // 3. Verify Payment
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            body: JSON.stringify({
              orderCreationId: data.orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              couponCode: data.couponApplied, // Send this so we can count usage
              amount: data.amount // ✅ CRITICAL FIX: Send amount so DB records revenue correctly
            }),
          })
          
          if (verifyRes.ok) {
             // ✅ TRIGGER CEREMONY: Redirect to dashboard with special flag
             window.location.href = '/dashboard?initiation=true'
          } else {
             alert('Payment verification failed. Contact support.')
          }
        },
      }

      // @ts-ignore
      const rzp1 = new window.Razorpay(options)
      rzp1.open()

    } catch (err: any) {
      console.error(err)
      setStatus('error')
      setStatusMsg(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md border-2 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-black uppercase tracking-tight">Upgrade to Pro</h2>
            <button onClick={onClose}><X /></button>
          </div>

          <div className="space-y-4">
             {/* Plan Details */}
             <div className="bg-stone-100 p-4 text-sm font-medium border-2 border-transparent">
               <p className="mb-2 font-bold uppercase text-black/40">Selected Plan</p>
               <div className="flex justify-between text-lg font-bold">
                 <span>Lifetime Access</span>
                 <span>₹299</span>
               </div>
               <p className="mt-1 text-xs text-stone-500">One-time payment. Forever.</p>
             </div>

             {/* Coupon Input */}
             <div>
               <label className="mb-1 flex items-center gap-2 text-xs font-bold uppercase text-black/60">
                 <Tag size={12} /> Have a Code?
               </label>
               <div className="flex gap-2">
                 <input 
                   type="text" 
                   value={coupon}
                   onChange={(e) => setCoupon(e.target.value.toUpperCase().trim())}
                   placeholder="ENTER COUPON"
                   className="w-full border-2 border-black px-3 py-2 text-sm font-bold uppercase focus:outline-none focus:ring-2 focus:ring-yellow-400"
                 />
               </div>
               {status === 'error' && <p className="mt-1 text-xs font-bold text-red-600">{statusMsg}</p>}
             </div>

             <button 
               onClick={handlePayment}
               disabled={loading}
               className="flex w-full items-center justify-center gap-2 border-2 border-black bg-yellow-400 py-4 text-sm font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform active:translate-y-[2px] active:shadow-none disabled:opacity-50 hover:bg-yellow-300"
             >
               {loading ? <Loader2 className="animate-spin" /> : 'Pay Now'}
             </button>

             <p className="text-center text-[10px] font-bold uppercase text-stone-400">
               Secured by Razorpay
             </p>
          </div>
        </div>
      </div>
    </>
  )
}