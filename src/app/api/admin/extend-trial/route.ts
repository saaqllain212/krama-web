import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Initialize SUPER ADMIN Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { userId, days, adminEmail } = await req.json()

    // SECURITY CHECK
    if (adminEmail !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Check if user_access table exists, if not, create entry or handle error
    const { data: currentAccess, error: fetchError } = await supabaseAdmin
      .from('user_access')
      .select('trial_ends_at')
      .eq('user_id', userId)
      .single()
    
    // If the user has no row in user_access, we will create one.
    // If the error is anything other than "Row not found", throw it.
    if (fetchError && fetchError.code !== 'PGRST116') {
         throw fetchError
    }

    const today = new Date()
    // Calculate new date
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
    console.error('SERVER ERROR:', error) // <--- CHECK YOUR TERMINAL FOR THIS
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}