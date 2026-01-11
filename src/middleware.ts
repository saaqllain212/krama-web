import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // 1. Create an unmodified response object
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Create the Supabase client (The "Bouncer")
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // This updates the response with new cookies (e.g. refreshing session)
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // 3. Check the User ID (The "ID Check")
  // malicious users can fake cookies, so we always call getUser() to verify on the server
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 4. Define Your Rules (The "List")
  const path = request.nextUrl.pathname
  const isDashboard = path.startsWith('/dashboard')
  const isAdmin = path.startsWith('/admin')
  const isAuthPage = path === '/login' || path === '/signup'

  // SCENARIO A: The Intruder
  // Trying to access dashboard without a user session
  if (isDashboard && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // SCENARIO B: The Imposter (Admin Protection) - NEW SECURITY FIX
  // Only allow access if the email matches the secure server-side variable
  if (isAdmin) {
    if (!user || user.email !== process.env.ADMIN_EMAIL) {
       const url = request.nextUrl.clone()
       // If they are logged in but not admin, send to dashboard. Otherwise login.
       url.pathname = user ? '/dashboard' : '/login'
       return NextResponse.redirect(url)
    }
  }

  // SCENARIO C: The Confused Member
  // Trying to login when already logged in
  if (isAuthPage && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // SCENARIO D: The Guest (Landing Page)
  // Allow them to proceed
  return response
}

// 5. Configure the Matcher
// This tells Next.js which pages to ignore (like images, static files, etc.)
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}