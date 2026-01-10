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

    // 1. SECURITY CHECK (Again)
    const authClient = await createAuthClient()
    const { data: { user } } = await authClient.auth.getUser()
    if (!user || user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // 2. HANDLE ACTIONS
    switch (action) {
      case 'TOGGLE_SIGNUP':
        // Update App Config
        await supabaseAdmin
          .from('app_config')
          .update({ signup_active: payload.status })
          .eq('id', 1)
        break

      case 'UPDATE_LIMIT':
        // Update Max Users
        await supabaseAdmin
          .from('app_config')
          .update({ max_users: payload.limit })
          .eq('id', 1)
        break

      case 'TOGGLE_PREMIUM':
        // Promote/Demote User
        await supabaseAdmin
          .from('user_access')
          .update({ is_premium: payload.status })
          .eq('user_id', payload.userId)
        break

      case 'DELETE_USER':
        // Delete User entirely
        await supabaseAdmin.auth.admin.deleteUser(payload.userId)
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