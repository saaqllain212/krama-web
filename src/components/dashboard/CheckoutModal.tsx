'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Loader2, Tag, Check, Zap, Shield, Clock } from 'lucide-react' 
import { motion, AnimatePresence } from 'framer-motion'
import { useAlert } from '@/context/AlertContext'
import { useAppConfig } from '@/context/AppConfigContext'

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
  const { config } = useAppConfig()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [coupon, setCoupon] = useState('')
  const [couponStatus, setCouponStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')
  const [discountAmount, setDiscountAmount] = useState(0)

  // FIX: Read price from AppConfigContext (which loads from store_settings.base_price)
  const basePrice = config.base_price
  const finalPrice = basePrice - discountAmount

  if (!isOpen) return null

  const handleApplyCoupon = async () => {
    if (!coupon.trim()) { showAlert('Please enter a coupon code', 'neutral'); return }
    setCouponStatus('checking')
    try {
      const res = await fetch('/api/payment/validate-coupon', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode: coupon }),
      })
      const data = await res.json()
      if (res.ok && data.valid) {
        setDiscountAmount(data.discount)
        setCouponStatus('valid')
        showAlert(`Coupon applied! ₹${data.discount} off`, 'success')
      } else {
        setCouponStatus('invalid'); setDiscountAmount(0)
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
      const res = await fetch('/api/payment/create-order', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ couponCode: couponStatus === 'valid' ? coupon : null }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to create order')
      if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        throw new Error('Payment not configured. Please contact support.')
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amount, currency: 'INR', name: 'Krama',
        description: data.couponApplied ? `License (Code: ${data.couponApplied})` : 'Lifetime License',
        order_id: data.orderId,
        prefill: { name: userName, email: userEmail },
        theme: { color: '#6366f1' },
        handler: async function (response: any) {
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              couponCode: data.couponApplied,
            }),
          })
          const verifyData = await verifyRes.json()
          if (verifyRes.ok && verifyData.success) {
            showAlert('Payment successful! Welcome to Pro!', 'success')
            setTimeout(() => router.refresh(), 1500)
          } else {
            showAlert('Verification failed. Contact support.', 'error')
          }
        },
        modal: { ondismiss: () => setLoading(false) }
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (err: any) {
      showAlert(err.message || 'Payment failed', 'error')
      setLoading(false)
    }
  }

  return (
    <>
      {/* Razorpay script already loaded in root layout — no duplicate needed */}
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* HEADER */}
            <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white p-5 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold">Upgrade to Pro</h2>
                <p className="text-sm text-white/70">Unlock all features</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* FEATURES */}
              <div className="space-y-3">
                {FEATURES.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="bg-primary-100 p-2 rounded-lg">
                      <feature.icon size={16} className="text-primary-600" />
                    </div>
                    <span className="font-semibold text-sm text-gray-800">{feature.text}</span>
                  </div>
                ))}
              </div>

              {/* PRICE CARD */}
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">Lifetime Access</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold text-gray-900">₹{finalPrice}</span>
                      {discountAmount > 0 && (
                        <span className="text-lg text-gray-400 line-through">₹{basePrice}</span>
                      )}
                    </div>
                  </div>
                  {discountAmount > 0 && (
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                      Save ₹{discountAmount}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">One-time payment. No subscriptions. Forever yours.</p>
              </div>

              {/* COUPON INPUT */}
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-2">
                  <Tag size={14} /> Have a coupon?
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input type="text" value={coupon}
                      onChange={(e) => { setCoupon(e.target.value.toUpperCase()); if (couponStatus !== 'idle') setCouponStatus('idle') }}
                      placeholder="ENTER CODE" disabled={couponStatus === 'valid'}
                      className={`w-full border rounded-lg px-4 py-3 text-sm font-semibold uppercase focus:outline-none transition-colors ${
                        couponStatus === 'valid' ? 'border-green-400 bg-green-50' 
                          : couponStatus === 'invalid' ? 'border-red-400 bg-red-50'
                          : 'border-gray-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400'
                      }`} />
                    {couponStatus === 'valid' && <Check size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600" />}
                  </div>
                  <button onClick={handleApplyCoupon}
                    disabled={couponStatus === 'checking' || couponStatus === 'valid' || !coupon.trim()}
                    className="px-5 py-3 bg-gray-900 text-white rounded-lg font-semibold text-sm disabled:opacity-30 hover:bg-gray-800 transition-colors">
                    {couponStatus === 'checking' ? <Loader2 size={18} className="animate-spin" /> : 'Apply'}
                  </button>
                </div>
                {couponStatus === 'valid' && (
                  <button onClick={() => { setCoupon(''); setCouponStatus('idle'); setDiscountAmount(0) }}
                    className="mt-2 text-xs font-semibold text-red-500 hover:text-red-700">Remove coupon</button>
                )}
              </div>

              {/* PAY BUTTON */}
              <button onClick={handlePayment} disabled={loading}
                className="w-full bg-primary-500 text-white py-4 rounded-xl font-bold text-base shadow-md hover:bg-primary-600 hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {loading ? <Loader2 className="animate-spin" size={20} /> : <>Pay ₹{finalPrice}</>}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs font-medium text-gray-400">
                <Shield size={14} /><span>Secured by Razorpay</span>
              </div>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    </>
  )
}
