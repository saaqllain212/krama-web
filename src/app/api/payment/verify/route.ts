import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js' // <--- CHANGED IMPORT
import { createClient as createAuthClient } from '@/lib/supabase/server' // For getting the logged-in user

export async function POST(req: Request) {
  try {
    const { orderCreationId, razorpayPaymentId, razorpaySignature } = await req.json()

    // 1. VERIFY SIGNATURE (Security Check)
    const shasum = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    shasum.update(`${orderCreationId}|${razorpayPaymentId}`)
    const digest = shasum.digest('hex')

    if (digest !== razorpaySignature) {
      return NextResponse.json({ error: 'Transaction not legit!' }, { status: 400 })
    }

    // 2. GET USER ID (Who is paying?)
    // We use the auth client just to get the Session User
    const authSupabase = await createAuthClient()
    const { data: { user } } = await authSupabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    // 3. THE FIX: CONNECT AS ADMIN
    // Use the Service Role Key to bypass RLS and force the update
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 4. UPDATE DATABASE (Flip to Premium)
    const { error } = await supabaseAdmin
      .from('user_access')
      .update({ 
        is_premium: true,
        // Optional: track the payment ID if you added that column
        // payment_id: razorpayPaymentId 
      })
      .eq('user_id', user.id)

    if (error) {
      console.error('Database Update Failed:', error)
      return NextResponse.json({ error: 'Database update failed' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Welcome to the Pro Club' 
    })

  } catch (error) {
    console.error('Verification Error:', error)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}