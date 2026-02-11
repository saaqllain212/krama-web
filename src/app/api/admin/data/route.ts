import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createAuthClient } from '@/lib/supabase/server'

import { Guard } from '@/protection/guard'

async function adminDataHandler(req: NextRequest) {
  try {
    // 1. SECURITY CHECK
    const authClient = await createAuthClient()
    const { data: { user } } = await authClient.auth.getUser()

    if (!user || user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 2. FETCH DATA (Parallel)
    const [configRes, usersRes, accessRes, paymentsRes, couponsRes, settingsRes, userStatsRes, companionRes, focusRes, syllabusRes] = await Promise.all([
      supabaseAdmin.from('app_config').select('*').single(),
      supabaseAdmin.auth.admin.listUsers(),
      supabaseAdmin.from('user_access').select('user_id, is_premium, trial_starts_at, trial_ends_at'),
      supabaseAdmin.from('payment_history').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('coupons').select('*').order('created_at', { ascending: false }),
      supabaseAdmin.from('store_settings').select('*').single(),
      // NEW: Fetch all user stats for admin detail view
      supabaseAdmin.from('user_stats').select('user_id, xp, level, title, current_streak, longest_streak, last_active_date, total_focus_minutes, total_reviews, total_mocks'),
      // NEW: Fetch companion states
      supabaseAdmin.from('companion_states').select('user_id, guardian_stage, guardian_health, guardian_total_hours, wraith_days_idle'),
      // NEW: Fetch focus logs for analytics (last 30 days)
      supabaseAdmin.from('focus_logs').select('user_id, duration_minutes, started_at').gte('started_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()),
      // NEW: Fetch syllabus settings for exam distribution
      supabaseAdmin.from('syllabus_settings').select('user_id, active_exam_id, daily_goal_hours'),
    ])

    // 3. COMBINE USERS with enriched data
    const usersList = usersRes.data.users || []
    const statsMap = new Map((userStatsRes.data || []).map(s => [s.user_id, s]))
    const companionMap = new Map((companionRes.data || []).map(c => [c.user_id, c]))
    const syllabusMap = new Map((syllabusRes.data || []).map(s => [s.user_id, s]))
    
    const combinedUsers = usersList.map(u => {
      const access = accessRes.data?.find(a => a.user_id === u.id)
      const stats = statsMap.get(u.id)
      const companion = companionMap.get(u.id)
      const syllabus = syllabusMap.get(u.id)
      
      return {
        id: u.id,
        email: u.email,
        created_at: u.created_at,
        is_premium: access?.is_premium || false,
        trial_starts_at: access?.trial_starts_at || u.created_at,
        trial_ends_at: access?.trial_ends_at || null,
        // Enriched data
        xp: stats?.xp || 0,
        level: stats?.level || 1,
        title: stats?.title || 'Beginner',
        current_streak: stats?.current_streak || 0,
        longest_streak: stats?.longest_streak || 0,
        last_active_date: stats?.last_active_date || null,
        total_focus_minutes: stats?.total_focus_minutes || 0,
        total_reviews: stats?.total_reviews || 0,
        total_mocks: stats?.total_mocks || 0,
        guardian_health: companion?.guardian_health || 50,
        guardian_stage: companion?.guardian_stage || 0,
        active_exam: syllabus?.active_exam_id || null,
        daily_goal_hours: syllabus?.daily_goal_hours || 6,
      }
    })

    // 4. ANALYTICS DATA
    const focusLogs = focusRes.data || []
    
    // Daily active users & focus time (last 30 days)
    const dailyAnalytics: Record<string, { users: Set<string>, minutes: number }> = {}
    focusLogs.forEach(log => {
      const date = new Date(log.started_at).toISOString().split('T')[0]
      if (!dailyAnalytics[date]) {
        dailyAnalytics[date] = { users: new Set(), minutes: 0 }
      }
      dailyAnalytics[date].users.add(log.user_id)
      dailyAnalytics[date].minutes += log.duration_minutes || 0
    })

    const analyticsArray = Object.entries(dailyAnalytics)
      .map(([date, data]) => ({
        date,
        activeUsers: data.users.size,
        totalMinutes: data.minutes
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Exam distribution
    const examDistribution: Record<string, number> = {}
    ;(syllabusRes.data || []).forEach(s => {
      const exam = s.active_exam_id || 'none'
      examDistribution[exam] = (examDistribution[exam] || 0) + 1
    })

    // Users active in last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const activeUsers7d = combinedUsers.filter(u => 
      u.last_active_date && new Date(u.last_active_date) >= sevenDaysAgo
    ).length

    return NextResponse.json({
      config: configRes.data || { signup_active: true, max_users: 100 },
      users: combinedUsers,
      payments: paymentsRes.data || [],
      coupons: couponsRes.data || [],
      storeSettings: settingsRes.data || { base_price: 299 },
      // NEW: Analytics payload
      analytics: {
        daily: analyticsArray,
        examDistribution,
        activeUsers7d,
        totalFocusMinutes: focusLogs.reduce((sum, l) => sum + (l.duration_minutes || 0), 0),
      }
    })

  } catch (error) {
    console.error('Admin API Error:', error)
    return NextResponse.json({ error: 'Failed to fetch admin data' }, { status: 500 })
  }
}

export const POST = Guard(adminDataHandler)
