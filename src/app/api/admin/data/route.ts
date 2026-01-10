import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createAuthClient } from '@/lib/supabase/server'

// 1. Setup Admin Client (The Master Key)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    // 2. SECURITY CHECK: Are you the Admin?
    const authClient = await createAuthClient()
    const { data: { user } } = await authClient.auth.getUser()

    if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized: Admins Only' }, { status: 403 })
    }

    // 3. FETCH EVERYTHING
    
    // A. Get App Settings
    const { data: config } = await supabaseAdmin
      .from('app_config')
      .select('*')
      .single()

    // B. Get All Users (from Auth System)
    // Note: listUsers defaults to 50 users. For more, we need pagination (kept simple for now)
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    
    if (usersError) throw usersError

    // C. Get Access Status (Premium vs Free) for everyone
    const { data: accessData } = await supabaseAdmin
      .from('user_access')
      .select('user_id, is_premium, trial_starts_at')

    // 4. COMBINE DATA
    // We merge the Auth User (Email) with the Access Data (Premium Status)
    const combinedUsers = users.map(u => {
      const access = accessData?.find(a => a.user_id === u.id)
      return {
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        is_premium: access?.is_premium || false,
        trial_start: access?.trial_starts_at
      }
    })

    return NextResponse.json({
      config: config || { signup_active: true, max_users: 100 },
      users: combinedUsers
    })

  } catch (error) {
    console.error('Admin API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 })
  }
}