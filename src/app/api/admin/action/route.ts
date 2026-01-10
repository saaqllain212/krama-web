import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createAuthClient } from '@/lib/supabase/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { action, payload } = await req.json()

    // 1. SECURITY CHECK
    const authClient = await createAuthClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // 2. HANDLE ACTIONS
    switch (action) {
      // --- USER & APP ACTIONS ---
      case 'TOGGLE_SIGNUP':
        await supabaseAdmin.from('app_config').update({ signup_active: payload.status }).eq('id', 1)
        break
      case 'UPDATE_LIMIT':
        await supabaseAdmin.from('app_config').update({ max_users: payload.limit }).eq('id', 1)
        break
      case 'TOGGLE_PREMIUM':
        await supabaseAdmin.from('user_access').update({ is_premium: payload.status }).eq('user_id', payload.userId)
        break
      case 'DELETE_USER':
        await supabaseAdmin.auth.admin.deleteUser(payload.userId)
        break

      // --- STORE ACTIONS (NEW) ---
      case 'UPDATE_PRICE':
        await supabaseAdmin.from('store_settings').update({ base_price: payload.price }).eq('id', 'global')
        break
      
      case 'CREATE_COUPON':
        await supabaseAdmin.from('coupons').insert({
          code: payload.code.toUpperCase(),
          discount_amount: payload.discount,
          max_uses: payload.maxUses
        })
        break
        
      case 'TOGGLE_COUPON':
        await supabaseAdmin.from('coupons').update({ is_active: payload.status }).eq('id', payload.id)
        break

      default:
        return NextResponse.json({ error: 'Invalid Action' }, { status: 400 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Admin Action Error:', error)
    return NextResponse.json({ error: 'Action failed' }, { status: 500 })
  }
}