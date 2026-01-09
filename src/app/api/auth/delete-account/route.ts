import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js' // You might need to install this if not present
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  const cookieStore = await cookies() // ✅ New way (Asynchronous)

  // 1. Verify the User (Are they really logged in?)
  const supabaseUser = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
             // We don't need to set cookies for a delete request
        },
      },
    }
  )

  const { data: { user }, error } = await supabaseUser.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. The "Grim Reaper" (Admin Client)
  // This client uses the SERVICE_ROLE_KEY to bypass all rules
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // Make sure this is in your .env.local
  )

  // 3. Delete the User from Auth
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
    user.id
  )

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}