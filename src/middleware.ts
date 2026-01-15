import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  // 1. Create an unmodified response object
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Create the Supabase client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
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

  // 3. Analyze the Path FIRST (Moved up for performance)
  const path = request.nextUrl.pathname
  const isDashboard = path.startsWith('/dashboard')
  const isAdmin = path.startsWith('/admin')
  const isAuthPage = path === '/login' || path === '/signup'

  // 4. Smart Auth Check (The Optimization)
  // We only check the database if we actually need to know who the user is.
  // This saves resources on the Landing Page and Public Syllabus.
  let user = null
  
  if (isDashboard || isAdmin || isAuthPage) {
    const { data } = await supabase.auth.getUser()
    user = data.user
  }

  // 5. Apply Rules (Your Exact Logic Preserved)

  // SCENARIO A: The Intruder (Dashboard Protection)
  if (isDashboard && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // SCENARIO B: The Imposter (Admin Protection)
  if (isAdmin) {
    // We use your secure environment variable check
    if (!user || user.email !== process.env.ADMIN_EMAIL) {
       const url = request.nextUrl.clone()
       // If they are logged in but not admin, send to dashboard. Otherwise login.
       url.pathname = user ? '/dashboard' : '/login'
       return NextResponse.redirect(url)
    }
  }

  // SCENARIO C: The Confused Member (Already logged in)
  if (isAuthPage && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // SCENARIO D: The Guest (Landing Page / Public Syllabus)
  // We did not run getUser(), so this response is instant.
  return response
}

// 6. Configure the Matcher
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images (svg, png, etc.)
     * - robots.txt & sitemap.xml (SEO files - NEW EXCLUSION)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}