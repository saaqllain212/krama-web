import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@/lib/supabase/server'

// --- 🛡️ SECURITY IMPORTS ---
import { Guard } from '@/protection/guard'
import { PaymentSchema } from '@/protection/rules'

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

// --- THE LOGIC ---
// Note: We now receive 'validData' as the second argument. 
// We no longer need 'await req.json()' because the Guard did it for us.
async function createOrderHandler(req: NextRequest, validData: any) {
  try {
    const { couponCode } = validData // ✅ Safe & Validated

    const supabase = await createClient()
    
    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 2. Fetch Base Price & Coupon Data in Parallel
    const [settingsRes, couponRes] = await Promise.all([
      supabase.from('store_settings').select('base_price').eq('id', 'global').single(),
      couponCode ? supabase.from('coupons').select('*').eq('code', couponCode).single() : Promise.resolve({ data: null })
    ])

    // Default to 299 if DB is empty/error
    let finalPrice = settingsRes.data?.base_price || 299 
    let appliedCoupon = null

    // 3. Apply Coupon Logic
    if (couponCode && couponRes.data) {
      const coupon = couponRes.data
      
      // Check if valid and not overused
      if (coupon.is_active && coupon.times_used < coupon.max_uses) {
         finalPrice = finalPrice - coupon.discount_amount
         appliedCoupon = coupon.code
      }
    }

    // Safety: Price cannot be less than ₹1 (100 paise)
    if (finalPrice < 1) finalPrice = 1

    // 4. Create Razorpay Order
    const amountInPaise = finalPrice * 100
    
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `rcpt_${user.id.slice(0, 5)}_${Date.now()}`,
      notes: {
        userId: user.id,
        coupon: appliedCoupon || 'none'
      }
    })

    return NextResponse.json({ 
      orderId: order.id, 
      amount: amountInPaise, 
      couponApplied: appliedCoupon
    })
    
  } catch (error) {
    console.error('Order Error:', error)
    return NextResponse.json({ error: 'Order creation failed' }, { status: 500 })
  }
}

// --- 🔒 THE GUARD EXPORT ---
// This wraps your function with the Rate Limiter and Validator
export const POST = Guard(createOrderHandler, { schema: PaymentSchema })