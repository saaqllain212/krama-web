import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js' 
import { createClient as createAuthClient } from '@/lib/supabase/server' 

export async function POST(req: Request) {
  try {
    // ✅ 1. Receive 'amount' from frontend
    const { orderCreationId, razorpayPaymentId, razorpaySignature, couponCode, amount } = await req.json()

    // 2. VERIFY SIGNATURE
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    shasum.update(`${orderCreationId}|${razorpayPaymentId}`)
    const digest = shasum.digest('hex')

    if (digest !== razorpaySignature) {
      return NextResponse.json({ error: 'Transaction not legit!' }, { status: 400 })
    }

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
    const updates: any[] = [
        // A. Flip user to Premium
        supabaseAdmin
          .from('user_access')
          .update({ is_premium: true })
          .eq('user_id', user.id),

        // B. Create Receipt (Payment History)
        supabaseAdmin
          .from('payment_history')
          .insert({
            user_id: user.id,
            amount_paid: amount || 0, // ✅ SAVE ACTUAL AMOUNT (in Paise)
            status: 'success',
            order_id: orderCreationId,
            payment_id: razorpayPaymentId,
            coupon_used: couponCode || null
          })
    ]

    // C. Increment Coupon Usage (If one was used)
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