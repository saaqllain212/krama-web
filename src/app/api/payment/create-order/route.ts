import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { createClient } from '@/lib/supabase/server' // Make sure this path matches your utils

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    
    // 1. Check if user is logged in
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Create an Order on Razorpay Server
    // Amount is in PAISE (499 * 100 = 49900 paise)
    const order = await razorpay.orders.create({
      amount: 19900, 
      currency: 'INR',
      receipt: `receipt_${user.id.slice(0, 10)}`, // Short ID for reference
      notes: {
        userId: user.id, // Store who is paying
        plan: 'lifetime'
      }
    })

    // 3. Send the Order ID back to the frontend
    return NextResponse.json({ orderId: order.id })
    
  } catch (error) {
    console.error('Razorpay Error:', error)
    return NextResponse.json(
      { error: 'Could not create order' }, 
      { status: 500 }
    )
  }
}