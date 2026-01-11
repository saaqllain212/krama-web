import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function DELETE(request: Request) {
  const cookieStore = await cookies() 

  // 1. Verify the User (Standard Client)
  // We use the standard client to verify the session cookie
  const supabaseUser = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
             // No need to set cookies for a delete request
        },
      },
    }
  )

  const { data: { user }, error } = await supabaseUser.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. SECURE INITIALIZATION (The Fix)
  // Only create the "Grim Reaper" client AFTER auth check passes
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
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