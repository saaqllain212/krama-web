import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createClient as createAuthClient } from '@/lib/supabase/server'

import { Guard } from '@/protection/guard'
import { AdminActionSchema } from '@/protection/rules'

async function adminActionHandler(req: NextRequest, validData: any) {
  try {
    const { action, payload } = validData

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

    // 2. HANDLE ACTIONS
    switch (action) {
      // --- EXISTING USER & APP ACTIONS ---
      case 'TOGGLE_SIGNUP':
        await supabaseAdmin.from('app_config').update({ signup_active: payload.status }).eq('id', 1)
        break
      case 'UPDATE_LIMIT':
        await supabaseAdmin.from('app_config').update({ max_users: payload.limit }).eq('id', 1)
        break
      case 'TOGGLE_PREMIUM':
        await supabaseAdmin.from('user_access').update({ is_premium: payload.status }).eq('user_id', payload.userId)
        break
      case 'DELETE_USER':
        await supabaseAdmin.auth.admin.deleteUser(payload.userId)
        break

      // --- EXISTING STORE ACTIONS ---
      case 'UPDATE_PRICE':
        await supabaseAdmin.from('store_settings').update({ base_price: payload.price }).eq('id', 'global')
        break
      case 'CREATE_COUPON':
        await supabaseAdmin.from('coupons').insert({
          code: payload.code.toUpperCase(),
          discount_amount: payload.discount,
          max_uses: payload.maxUses
        })
        break
      case 'TOGGLE_COUPON':
        await supabaseAdmin.from('coupons').update({ is_active: payload.status }).eq('id', payload.id)
        break

      // === NEW: FEATURE FLAGS ===
      case 'UPDATE_FEATURE_FLAG':
        await supabaseAdmin.from('app_config').update({ [payload.flag]: payload.value }).eq('id', 1)
        break

      // === NEW: MAINTENANCE MODE ===
      case 'TOGGLE_MAINTENANCE':
        await supabaseAdmin.from('app_config').update({ 
          maintenance_mode: payload.enabled,
          ...(payload.message ? { maintenance_message: payload.message } : {})
        }).eq('id', 1)
        break

      // === NEW: TRIAL DAYS DEFAULT ===
      case 'UPDATE_TRIAL_DAYS':
        await supabaseAdmin.from('app_config').update({ trial_days: payload.days }).eq('id', 1)
        break

      // === NEW: DEFAULT DAILY GOAL ===
      case 'UPDATE_DEFAULT_GOAL':
        await supabaseAdmin.from('app_config').update({ default_daily_goal_hours: payload.hours }).eq('id', 1)
        break

      // === NEW: XP MULTIPLIER ===
      case 'UPDATE_XP_MULTIPLIER':
        await supabaseAdmin.from('app_config').update({ xp_multiplier: payload.multiplier }).eq('id', 1)
        break

      // === NEW: EDIT USER STATS ===
      case 'UPDATE_USER_STATS': {
        const updates: Record<string, any> = {}
        if (payload.xp !== undefined) updates.xp = payload.xp
        if (payload.current_streak !== undefined) updates.current_streak = payload.current_streak
        if (payload.longest_streak !== undefined) updates.longest_streak = payload.longest_streak
        if (payload.total_focus_minutes !== undefined) updates.total_focus_minutes = payload.total_focus_minutes
        if (payload.last_active_date !== undefined) updates.last_active_date = payload.last_active_date || null
        
        if (Object.keys(updates).length > 0) {
          await supabaseAdmin.from('user_stats').update(updates).eq('user_id', payload.userId)
        }
        break
      }

      // === NEW: RESET USER STREAK ===
      case 'RESET_USER_STREAK':
        await supabaseAdmin.from('user_stats').update({ 
          current_streak: 0, 
          last_active_date: null 
        }).eq('user_id', payload.userId)
        break

      // === NEW: BULK EXTEND TRIALS ===
      case 'BULK_EXTEND_TRIALS': {
        const { data: freeUsers } = await supabaseAdmin
          .from('user_access')
          .select('user_id, trial_ends_at')
          .eq('is_premium', false)
        
        if (freeUsers) {
          for (const u of freeUsers) {
            const currentEnd = u.trial_ends_at ? new Date(u.trial_ends_at) : new Date()
            const newEnd = new Date(currentEnd)
            newEnd.setDate(newEnd.getDate() + payload.days)
            
            await supabaseAdmin
              .from('user_access')
              .update({ trial_ends_at: newEnd.toISOString() })
              .eq('user_id', u.user_id)
          }
        }
        break
      }

      default:
        return NextResponse.json({ error: 'Invalid Action' }, { status: 400 })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Admin Action Error:', error)
    return NextResponse.json({ error: 'Action failed' }, { status: 500 })
  }
}

export const POST = Guard(adminActionHandler, { schema: AdminActionSchema })
