'use client'

import { useState } from 'react'
import { X, Loader2, Tag, Check, Zap, Shield, Clock } from 'lucide-react' 
import Script from 'next/script'
import { motion, AnimatePresence } from 'framer-motion'
import { useAlert } from '@/context/AlertContext'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
  userEmail: string
  userName: string
}

const FEATURES = [
  { icon: Zap, text: 'Unlimited Focus Sessions' },
  { icon: Shield, text: 'Full Syllabus Tracking' },
  { icon: Clock, text: 'Spaced Repetition System' },
]

export default function CheckoutModal({ isOpen, onClose, userEmail, userName }: CheckoutModalProps) {
  const { showAlert } = useAlert()
  const [loading, setLoading] = useState(false)
  const [coupon, setCoupon] = useState('')
  const [couponStatus, setCouponStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')
  const [discountAmount, setDiscountAmount] = useState(0)

  const basePrice = 299
  const finalPrice = basePrice - discountAmount

  if (!isOpen) return null

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) {
      showAlert('Please enter a coupon code', 'neutral')
      return
    }

    setCouponStatus('checking')
    
    try {
      // Validate coupon with backend
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        body: JSON.stringify({ couponCode: coupon, validateOnly: true }),
      })
      const data = await res.json()

      if (res.ok && data.discount) {
        setDiscountAmount(data.discount)
        setCouponStatus('valid')
        showAlert(`Coupon applied! ₹${data.discount} off`, 'success')
      } else {
        setCouponStatus('invalid')
        setDiscountAmount(0)
        showAlert(data.error || 'Invalid coupon', 'error')
      }
    } catch (err) {
      setCouponStatus('invalid')
      showAlert('Failed to validate coupon', 'error')
    }
  }

  const handlePayment = async () => {
    setLoading(true)
    
    try {
      // Create Order
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        body: JSON.stringify({ couponCode: couponStatus === 'valid' ? coupon : '' }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to create order')

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: 'INR',
        name: 'Krama',
        description: data.couponApplied ? `License (Code: ${data.couponApplied})` : 'Lifetime License',
        order_id: data.orderId,
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: { color: '#000000' },
        handler: async function (response: any) {
          // Verify Payment
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            body: JSON.stringify({
              orderCreationId: data.orderId,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              couponCode: data.couponApplied,
              amount: data.amount
            }),
          })
          
          if (verifyRes.ok) {
            showAlert('Payment successful! Upgrading...', 'success')
            setTimeout(() => {
              window.location.href = '/dashboard?initiation=true'
            }, 1000)
          } else {
            showAlert('Payment verification failed. Please contact support.', 'error')
          }
        },
        modal: {
          ondismiss: function() {
            setLoading(false)
          }
        }
      }

      // @ts-ignore
      const rzp1 = new window.Razorpay(options)
      rzp1.open()

    } catch (err: any) {
      console.error(err)
      showAlert(err.message || 'Payment failed', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-white border-2 border-black shadow-[8px_8px_0_0_#000] overflow-hidden"
          >
            
            {/* HEADER */}
            <div className="bg-black text-white p-5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black">Upgrade to Pro</h2>
                <p className="text-xs font-bold text-white/50">Unlock all features</p>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-white/10 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* FEATURES */}
              <div className="space-y-3">
                {FEATURES.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="bg-brand p-1.5">
                      <feature.icon size={16} className="text-black" />
                    </div>
                    <span className="font-bold text-sm">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* PRICE CARD */}
              <div className="bg-stone-50 border-2 border-black p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs font-bold uppercase text-black/40 mb-1">Lifetime Access</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black">₹{finalPrice}</span>
                      {discountAmount > 0 && (
                        <span className="text-lg text-black/40 line-through">₹{basePrice}</span>
                      )}
                    </div>
                  </div>
                  {discountAmount > 0 && (
                    <div className="bg-green-100 text-green-700 px-3 py-1 text-xs font-black uppercase">
                      Save ₹{discountAmount}
                    </div>
                  )}
                </div>
                <p className="text-xs text-black/50">One-time payment. No subscriptions. Forever yours.</p>
              </div>

              {/* COUPON INPUT */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase text-black/50 mb-2">
                  <Tag size={14} /> Have a coupon?
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      value={coupon}
                      onChange={(e) => {
                        setCoupon(e.target.value.toUpperCase())
                        if (couponStatus !== 'idle') setCouponStatus('idle')
                      }}
                      placeholder="ENTER CODE"
                      disabled={couponStatus === 'valid'}
                      className={`w-full border-2 px-4 py-3 text-sm font-bold uppercase focus:outline-none transition-colors ${
                        couponStatus === 'valid' 
                          ? 'border-green-500 bg-green-50' 
                          : couponStatus === 'invalid'
                            ? 'border-red-500 bg-red-50'
                            : 'border-black focus:shadow-[3px_3px_0_0_#000]'
                      }`}
                    />
                    {couponStatus === 'valid' && (
                      <Check size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600" />
                    )}
                  </div>
                  <button 
                    onClick={handleApplyCoupon}
                    disabled={couponStatus === 'checking' || couponStatus === 'valid' || !coupon.trim()}
                    className="px-5 py-3 bg-black text-white font-bold text-sm uppercase disabled:opacity-30 hover:bg-stone-800 transition-colors"
                  >
                    {couponStatus === 'checking' ? <Loader2 size={18} className="animate-spin" /> : 'Apply'}
                  </button>
                </div>
                {couponStatus === 'valid' && (
                  <button 
                    onClick={() => { setCoupon(''); setCouponStatus('idle'); setDiscountAmount(0) }}
                    className="mt-2 text-xs font-bold text-red-500 hover:text-red-700"
                  >
                    Remove coupon
                  </button>
                )}
              </div>

              {/* PAY BUTTON */}
              <button 
                onClick={handlePayment}
                disabled={loading}
                className="w-full bg-brand text-black border-2 border-black py-4 font-black uppercase tracking-wide shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>Pay ₹{finalPrice}</>
                )}
              </button>

              {/* SECURITY NOTE */}
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-black/30">
                <Shield size={14} />
                <span>Secured by Razorpay</span>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </>
  )
}
