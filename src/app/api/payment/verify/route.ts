import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import Razorpay from 'razorpay'
import { createClient } from '@supabase/supabase-js' 
import { createClient as createAuthClient } from '@/lib/supabase/server' 

import { Guard } from '@/protection/guard'
import { PaymentSchema } from '@/protection/rules'

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

async function verifyPaymentHandler(req: NextRequest, validData: any) {
  try {
    // --- FIELD MAPPING ---
    // CheckoutModal sends: orderId, paymentId, signature, couponCode
    // We normalize to consistent names here
    const orderId = validData.orderId || validData.orderCreationId
    const paymentId = validData.paymentId || validData.razorpayPaymentId
    const signature = validData.signature || validData.razorpaySignature
    const couponCode = validData.couponCode || null

    // Validate required fields
    if (!orderId || !paymentId || !signature) {
      console.error('Missing payment fields:', { orderId: !!orderId, paymentId: !!paymentId, signature: !!signature })
      return NextResponse.json({ error: 'Missing payment verification data' }, { status: 400 })
    }

    // 1. VERIFY SIGNATURE (Cryptographic Check)
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    shasum.update(`${orderId}|${paymentId}`)
    const digest = shasum.digest('hex')

    if (digest !== signature) {
      console.error('Signature mismatch:', { orderId, paymentId })
      return NextResponse.json({ error: 'Transaction not legit!' }, { status: 400 })
    }

    // 2. FETCH REAL PAYMENT DATA (Double Check with Razorpay)
    const payment = await razorpay.payments.fetch(paymentId)

    if (!payment || payment.status !== 'captured') {
      console.error('Payment not captured:', payment?.status)
      return NextResponse.json({ error: 'Payment not captured' }, { status: 400 })
    }

    const actualAmountPaid = payment.amount 

    // 3. GET USER ID
    const authSupabase = await createAuthClient()
    const { data: { user } } = await authSupabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    // 4. CONNECT AS ADMIN
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 5. EXECUTE UPDATES
    const updates: Promise<any>[] = [
      // A. Flip user to Premium
      supabaseAdmin
        .from('user_access')
        .update({ is_premium: true, updated_at: new Date().toISOString() })
        .eq('user_id', user.id),

      // B. Create Receipt
      supabaseAdmin
        .from('payment_history')
        .insert({
          user_id: user.id,
          amount_paid: actualAmountPaid,
          status: 'success',
          order_id: orderId,
          payment_id: paymentId,
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
            if (data) {
              return supabaseAdmin
                .from('coupons')
                .update({ times_used: data.times_used + 1 })
                .eq('code', couponCode)
            }
          })
      )
    }

    const results = await Promise.all(updates)
    
    // Log any DB errors
    results.forEach((r, i) => {
      if (r?.error) console.error(`Update ${i} failed:`, r.error)
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Welcome to the Pro Club' 
    })

  } catch (error) {
    console.error('Verification Error:', error)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}

export const POST = Guard(verifyPaymentHandler, { schema: PaymentSchema })
