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
      // A. App Config (Check if your table is named 'config' or 'app_config')
      supabaseAdmin.from('config').select('*').single(),
      
      // B. Auth Users (List all users from Supabase Auth)
      supabaseAdmin.auth.admin.listUsers(),
      
      // C. User Access (Premium Status & Trial Data)
      // ✅ FIX: Added 'trial_ends_at' so the Admin Panel sees the extension
      supabaseAdmin.from('user_access').select('user_id, is_premium, trial_starts_at, trial_ends_at'),
      
      // D. Payment History
      supabaseAdmin.from('payment_history').select('*').order('created_at', { ascending: false }),
      
      // E. Coupons
      supabaseAdmin.from('coupons').select('*').order('created_at', { ascending: false }),
      
      // F. Store Settings
      supabaseAdmin.from('store_settings').select('*').single()
    ])

    // 3. COMBINE USERS
    // We map the Auth Users and attach the "Access" data to them
    const usersList = usersRes.data.users || []
    
    const combinedUsers = usersList.map(u => {
      // Find the matching row in user_access
      const access = accessRes.data?.find(a => a.user_id === u.id)
      
      return {
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        
        // ✅ CRITICAL FIX: Merge the database values correctly
        is_premium: access?.is_premium || false,
        trial_starts_at: access?.trial_starts_at || u.created_at,
        trial_ends_at: access?.trial_ends_at || null // <--- This fixes the Timekeeper
      }
    })

    return NextResponse.json({
      config: configRes.data || { signup_active: true, max_users: 100 },
      users: combinedUsers, // Sending the merged list
      payments: paymentsRes.data || [],
      coupons: couponsRes.data || [],
      storeSettings: settingsRes.data || { base_price: 299 }
    })

  } catch (error) {
    console.error('Admin API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 })
  }
}