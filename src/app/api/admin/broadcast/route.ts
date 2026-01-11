import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialize SUPER ADMIN Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET: Fetch all announcements for the Admin List
export async function GET() {
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
    const { message, type, adminEmail } = await req.json()

    // Security Check
    if (adminEmail !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Insert
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
    const { id, is_active, adminEmail } = await req.json()

    if (adminEmail !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // If activating one, deactivate all others (Optional rule, usually good for banners)
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