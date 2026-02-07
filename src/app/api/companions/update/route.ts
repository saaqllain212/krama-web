// src/app/api/companions/update/route.ts
// API endpoint to update companion state after study sessions

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { updateCompanionAfterStudy } from '@/lib/companions/companionLogic'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { sessionDurationMinutes, currentStreak } = body

    if (!sessionDurationMinutes || sessionDurationMinutes <= 0) {
      return NextResponse.json({ error: 'Invalid session duration' }, { status: 400 })
    }

    // Update companion state
    const result = await updateCompanionAfterStudy(
      supabase,
      user.id,
      sessionDurationMinutes,
      currentStreak || 1
    )

    return NextResponse.json({
      success: result.success,
      evolved: result.evolved,
      newStage: result.newStage,
    })

  } catch (error: any) {
    console.error('Error updating companions:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update companions' },
      { status: 500 }
    )
  }
}