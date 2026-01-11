import { NextResponse } from 'next/server'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import { createClient } from '@supabase/supabase-js' 
import { createClient as createAuthClient } from '@/lib/supabase/server' 

// Initialize Razorpay to fetch true payment details
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: Request) {
  try {
    // 1. Receive IDs (Ignore 'amount' from frontend, it's untrusted)
    const { orderCreationId, razorpayPaymentId, razorpaySignature, couponCode } = await req.json()

    // 2. VERIFY SIGNATURE (Cryptographic Check)
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    shasum.update(`${orderCreationId}|${razorpayPaymentId}`)
    const digest = shasum.digest('hex')

    if (digest !== razorpaySignature) {
      return NextResponse.json({ error: 'Transaction not legit!' }, { status: 400 })
    }

    // 3. FETCH REAL PAYMENT DATA (The Security Fix)
    // We ask Razorpay: "How much was actually paid for this ID?"
    const payment = await razorpay.payments.fetch(razorpayPaymentId)

    if (!payment || payment.status !== 'captured') {
        return NextResponse.json({ error: 'Payment not captured' }, { status: 400 })
    }

    // This is the source of truth (in Paise)
    const actualAmountPaid = payment.amount 

    // 4. GET USER ID
    const authSupabase = await createAuthClient()
    const { data: { user } } = await authSupabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    // 5. CONNECT AS ADMIN (Safe here because we verified payment & user)
    // Note: Initialize this inside the function scope for safety
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 6. EXECUTE UPDATES
    const updates: any[] = [
        // A. Flip user to Premium
        supabaseAdmin
          .from('user_access')
          .update({ is_premium: true })
          .eq('user_id', user.id),

        // B. Create Receipt using ACTUAL AMOUNT
        supabaseAdmin
          .from('payment_history')
          .insert({
            user_id: user.id,
            amount_paid: actualAmountPaid, // ✅ SECURED
            status: 'success',
            order_id: orderCreationId,
            payment_id: razorpayPaymentId,
            coupon_used: couponCode || null
          })
    ]

    // C. Increment Coupon Usage
    if (couponCode) {
        updates.push(
             supabaseAdmin
              .from('coupons')
              .select('times_used')
              .eq('code', couponCode)
              .single()
              .then(({ data }) => {
                 if(data) {
                    return supabaseAdmin
                     .from('coupons')
                     .update({ times_used: data.times_used + 1 })
                     .eq('code', couponCode)
                 }
              })
        )
    }

    await Promise.all(updates)

    return NextResponse.json({ 
      success: true, 
      message: 'Welcome to the Pro Club' 
    })

  } catch (error) {
    console.error('Verification Error:', error)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}