import { createClient } from '@supabase/supabase-js'
import { createClient as createAuthClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Helper: verify admin session (used by all handlers)
async function verifyAdmin() {
  const authClient = await createAuthClient()
  const { data: { user } } = await authClient.auth.getUser()
  
  if (!user || user.email !== process.env.ADMIN_EMAIL) {
    return null
  }
  return user
}

// Helper: get admin supabase client (only call after verifyAdmin succeeds)
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET: Fetch all announcements for the Admin List
export async function GET() {
  const admin = await verifyAdmin()
  if (!admin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseAdmin = getAdminClient()

  const { data, error } = await supabaseAdmin
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST: Create a new announcement
export async function POST(req: Request) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, type } = await req.json()
    const supabaseAdmin = getAdminClient()

    const { error } = await supabaseAdmin
      .from('announcements')
      .insert({ message, type, is_active: true })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PATCH: Toggle Active Status
export async function PATCH(req: Request) {
  try {
    const admin = await verifyAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, is_active } = await req.json()
    const supabaseAdmin = getAdminClient()

    // If activating one, deactivate all others
    if (is_active) {
      await supabaseAdmin.from('announcements').update({ is_active: false }).neq('id', id)
    }

    const { error } = await supabaseAdmin
      .from('announcements')
      .update({ is_active })
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}