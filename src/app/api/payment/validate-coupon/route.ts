import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const { couponCode } = await req.json()
    
    if (!couponCode) {
      return NextResponse.json({ valid: false, error: 'No coupon code provided' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ valid: false, error: 'Please log in first' }, { status: 401 })
    }

    // Fetch coupon
    const { data: coupon, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.toUpperCase())
      .single()

    if (error || !coupon) {
      return NextResponse.json({ valid: false, error: 'Coupon not found' }, { status: 404 })
    }

    // Check if coupon is active
    if (!coupon.is_active) {
      return NextResponse.json({ valid: false, error: 'This coupon is no longer active' })
    }

    // Check if coupon has uses left
    if (coupon.times_used >= coupon.max_uses) {
      return NextResponse.json({ valid: false, error: 'This coupon has reached its usage limit' })
    }

    // Coupon is valid
    return NextResponse.json({ 
      valid: true, 
      discount: coupon.discount_amount,
      code: coupon.code
    })

  } catch (error) {
    console.error('Coupon validation error:', error)
    return NextResponse.json({ valid: false, error: 'Failed to validate coupon' }, { status: 500 })
  }
}
