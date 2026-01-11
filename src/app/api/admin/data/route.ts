import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createAuthClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    // 1. SECURITY CHECK
    const authClient = await createAuthClient()
    const { data: { user } } = await authClient.auth.getUser()

    // SECURITY FIX: Using ADMIN_EMAIL (Server-side only)
    if (!user || user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // SECURITY FIX: Initialize "God Mode" client ONLY after authorization passes
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 2. FETCH DATA (Parallel for speed)
    const [configRes, usersRes, accessRes, paymentsRes, couponsRes, settingsRes] = await Promise.all([
      // A. App Config
      supabaseAdmin.from('app_config').select('*').single(),
      // B. Auth Users
      supabaseAdmin.auth.admin.listUsers(),
      // C. User Access (Premium Status)
      supabaseAdmin.from('user_access').select('user_id, is_premium, trial_starts_at'),
      // D. Payment History
      supabaseAdmin.from('payment_history').select('*').order('created_at', { ascending: false }),
      // E. Coupons
      supabaseAdmin.from('coupons').select('*').order('created_at', { ascending: false }),
      // F. Store Settings
      supabaseAdmin.from('store_settings').select('*').single()
    ])

    // 3. COMBINE USERS
    // (Safe because usersRes.data is strictly typed from the admin client)
    const usersList = usersRes.data.users || []
    
    const combinedUsers = usersList.map(u => {
      const access = accessRes.data?.find(a => a.user_id === u.id)
      return {
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        is_premium: access?.is_premium || false,
        trial_start: access?.trial_starts_at
      }
    })

    return NextResponse.json({
      config: configRes.data || { signup_active: true, max_users: 100 },
      users: combinedUsers,
      payments: paymentsRes.data || [],
      coupons: couponsRes.data || [],
      storeSettings: settingsRes.data || { base_price: 299 }
    })

  } catch (error) {
    console.error('Admin API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 })
  }
}