import { createClient } from '@supabase/supabase-js'
import { createClient as createAuthClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { userId, days } = await req.json()

    // SECURITY FIX: Verify admin identity via session, not client-sent email
    const authClient = await createAuthClient()
    const { data: { user } } = await authClient.auth.getUser()

    if (!user || user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Initialize SUPER ADMIN Client only after auth passes
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Fetch current access
    const { data: currentAccess, error: fetchError } = await supabaseAdmin
      .from('user_access')
      .select('trial_ends_at')
      .eq('user_id', userId)
      .single()
    
    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError
    }

    const today = new Date()
    const baseDate = (currentAccess?.trial_ends_at && new Date(currentAccess.trial_ends_at) > today)
      ? new Date(currentAccess.trial_ends_at)
      : today

    baseDate.setDate(baseDate.getDate() + days)
    const newDateStr = baseDate.toISOString()

    // 2. Perform the Update
    const { error: updateError } = await supabaseAdmin
      .from('user_access')
      .upsert({ 
        user_id: userId, 
        trial_ends_at: newDateStr,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })

    if (updateError) throw updateError

    return NextResponse.json({ success: true, newDate: newDateStr })

  } catch (error: any) {
    console.error('SERVER ERROR:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}