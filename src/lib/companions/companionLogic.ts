// src/lib/companions/companionLogic.ts
// Core logic for calculating companion states

import { SupabaseClient } from '@supabase/supabase-js'

// ============================================
// TYPES
// ============================================

export type GuardianStage = 0 | 1 | 2 | 3 | 4
export type WraithStage = 0 | 1 | 2 | 3 | 4
export type StudyTime = 'morning' | 'afternoon' | 'evening' | 'night'
export type ExamUrgency = 'none' | 'low' | 'moderate' | 'high' | 'critical'

export interface CompanionState {
  // Growth Guardian
  guardianStage: GuardianStage
  guardianHealth: number // 0-100
  guardianTotalHours: number
  guardianLastFed: string | null
  
  // Time Wraith
  wraithStage: WraithStage
  wraithDaysIdle: number
  wraithExamName: string | null
  wraithExamDate: string | null
  wraithWastedDays: number
  wraithLastActive: string | null
  
  // Analytics
  bestStudyTime: StudyTime | null
  averageSessionMinutes: number
  longestStreak: number
  
  // Message history
  guardianMessages: CompanionMessage[]
  wraithMessages: CompanionMessage[]
}

export interface CompanionMessage {
  id: string
  text: string
  timestamp: string
  context: string // 'greeting', 'milestone', 'warning', etc.
}

// ============================================
// CONSTANTS
// ============================================

// Guardian evolution thresholds (in hours)
export const GUARDIAN_STAGE_HOURS: Record<GuardianStage, number> = {
  0: 0,    // Dormant Seed: 0-50 hours
  1: 50,    // Sprout: 50-200 hours
  2: 200,   // Sapling: 200-500 hours
  3: 500,  // Young Tree: 500-1000 hours
  4: 1000,  // Ancient Guardian: 1000+ hours
}

// Guardian health changes
export const GUARDIAN_HEALTH = {
  GAIN_PER_HOUR: 10,           // +10 health per hour studied
  LOSS_MISSED_GOAL: 20,        // -20 for missing daily goal
  LOSS_BROKEN_STREAK: 30,      // -30 for breaking streak
  LOSS_PER_IDLE_DAY: 10,       // -10 per day idle (after 3 days)
  BOOST_EVOLUTION: 25,         // +25 when evolving to next stage
  MIN: 0,
  MAX: 100,
}

// Wraith decay thresholds (days idle)
export const WRAITH_STAGE_DAYS: Record<WraithStage, number> = {
  0: 0,    // Vigilant: 0 days idle
  1: 1,    // Watchful: 1-2 days idle
  2: 3,    // Fading: 3-5 days idle
  3: 6,    // Shadow: 6-10 days idle
  4: 11,   // Void: 11+ days idle
}

// Exam urgency multipliers
export const EXAM_URGENCY_MULTIPLIER: Record<ExamUrgency, number> = {
  none: 1,
  low: 1,        // 90+ days
  moderate: 1.5, // 60-89 days
  high: 2,       // 30-59 days
  critical: 3,   // 1-29 days
}

// ============================================
// CORE CALCULATION FUNCTIONS
// ============================================

/**
 * Calculate Guardian stage based on total study hours
 */
export function calculateGuardianStage(totalHours: number): GuardianStage {
  if (totalHours >= GUARDIAN_STAGE_HOURS[4]) return 4 // Ancient Guardian
  if (totalHours >= GUARDIAN_STAGE_HOURS[3]) return 3 // Young Tree
  if (totalHours >= GUARDIAN_STAGE_HOURS[2]) return 2 // Sapling
  if (totalHours >= GUARDIAN_STAGE_HOURS[1]) return 1 // Sprout
  return 0 // Dormant Seed
}

/**
 * Calculate Guardian health based on recent activity
 */
export function calculateGuardianHealth(
  currentHealth: number,
  hoursStudiedToday: number,
  daysIdle: number,
  missedDailyGoal: boolean,
  brokeStreak: boolean
): number {
  let newHealth = currentHealth

  // Gain health from studying
  newHealth += hoursStudiedToday * GUARDIAN_HEALTH.GAIN_PER_HOUR

  // Lose health from inactivity (after 3 days)
  if (daysIdle >= 3) {
    newHealth -= (daysIdle - 2) * GUARDIAN_HEALTH.LOSS_PER_IDLE_DAY
  }

  // Penalty for missing daily goal
  if (missedDailyGoal) {
    newHealth -= GUARDIAN_HEALTH.LOSS_MISSED_GOAL
  }

  // Penalty for breaking streak
  if (brokeStreak) {
    newHealth -= GUARDIAN_HEALTH.LOSS_BROKEN_STREAK
  }

  // Clamp to 0-100
  return Math.max(GUARDIAN_HEALTH.MIN, Math.min(GUARDIAN_HEALTH.MAX, newHealth))
}

/**
 * Calculate Wraith stage based on days idle
 */
export function calculateWraithStage(daysIdle: number): WraithStage {
  if (daysIdle >= WRAITH_STAGE_DAYS[4]) return 4 // Void
  if (daysIdle >= WRAITH_STAGE_DAYS[3]) return 3 // Shadow
  if (daysIdle >= WRAITH_STAGE_DAYS[2]) return 2 // Fading
  if (daysIdle >= WRAITH_STAGE_DAYS[1]) return 1 // Watchful
  return 0 // Vigilant
}

/**
 * Calculate exam urgency level
 */
export function calculateExamUrgency(daysUntilExam: number | null): ExamUrgency {
  if (daysUntilExam === null) return 'none'
  if (daysUntilExam >= 90) return 'low'
  if (daysUntilExam >= 60) return 'moderate'
  if (daysUntilExam >= 30) return 'high'
  return 'critical'
}

/**
 * Calculate "wasted days" with urgency multiplier
 */
export function calculateWastedDays(daysIdle: number, examUrgency: ExamUrgency): number {
  const multiplier = EXAM_URGENCY_MULTIPLIER[examUrgency]
  return daysIdle * multiplier
}

/**
 * Determine best study time based on session data
 */
export function determineBestStudyTime(sessions: { hour: number; duration: number }[]): StudyTime | null {
  if (sessions.length === 0) return null

  const timeBlocks = {
    morning: 0,   // 5-11 AM
    afternoon: 0, // 12-4 PM
    evening: 0,   // 5-8 PM
    night: 0,     // 9 PM-4 AM
  }

  sessions.forEach((session) => {
    const hour = session.hour
    if (hour >= 5 && hour < 12) timeBlocks.morning += session.duration
    else if (hour >= 12 && hour < 17) timeBlocks.afternoon += session.duration
    else if (hour >= 17 && hour < 21) timeBlocks.evening += session.duration
    else timeBlocks.night += session.duration
  })

  // Find the time block with most study time
  const bestTime = Object.entries(timeBlocks).reduce((a, b) => 
    b[1] > a[1] ? b : a
  )[0] as StudyTime

  return bestTime
}

/**
 * Calculate days idle (consecutive days without study)
 */
export function calculateDaysIdle(lastActiveDate: string | null): number {
  if (!lastActiveDate) return 0

  const now = new Date()
  const lastActive = new Date(lastActiveDate)
  
  // Reset to midnight for day comparison
  now.setHours(0, 0, 0, 0)
  lastActive.setHours(0, 0, 0, 0)
  
  const diffTime = now.getTime() - lastActive.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  return Math.max(0, diffDays)
}

/**
 * Get time of day
 */
export function getTimeOfDay(): StudyTime {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'afternoon'
  if (hour >= 17 && hour < 21) return 'evening'
  return 'night'
}

/**
 * Check if Guardian evolved to new stage
 */
export function checkGuardianEvolution(
  oldStage: GuardianStage,
  newStage: GuardianStage
): boolean {
  return newStage > oldStage
}

/**
 * Get progress to next Guardian stage
 */
export function getGuardianProgress(totalHours: number, currentStage: GuardianStage): {
  current: number
  needed: number
  percentage: number
  nextStage: GuardianStage | null
} {
  if (currentStage === 4) {
    return { current: totalHours, needed: 0, percentage: 100, nextStage: null }
  }

  const nextStage = (currentStage + 1) as GuardianStage
  const currentStageHours = GUARDIAN_STAGE_HOURS[currentStage]
  const nextStageHours = GUARDIAN_STAGE_HOURS[nextStage]
  
  const hoursIntoStage = totalHours - currentStageHours
  const hoursNeeded = nextStageHours - currentStageHours
  const percentage = Math.min(100, Math.round((hoursIntoStage / hoursNeeded) * 100))

  return {
    current: totalHours,
    needed: nextStageHours - totalHours,
    percentage,
    nextStage,
  }
}

// ============================================
// DATABASE OPERATIONS
// ============================================

/**
 * Fetch companion state from database
 */
export async function getCompanionState(
  supabase: SupabaseClient,
  userId: string
): Promise<CompanionState | null> {
  const { data, error } = await supabase
    .from('companion_states')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null

  return {
    guardianStage: data.guardian_stage,
    guardianHealth: data.guardian_health,
    guardianTotalHours: parseFloat(data.guardian_total_hours || 0),
    guardianLastFed: data.guardian_last_fed,
    
    wraithStage: data.wraith_stage,
    wraithDaysIdle: data.wraith_days_idle,
    wraithExamName: data.wraith_exam_name,
    wraithExamDate: data.wraith_exam_date,
    wraithWastedDays: parseFloat(data.wraith_wasted_days || 0),
    wraithLastActive: data.wraith_last_active,
    
    bestStudyTime: data.best_study_time,
    averageSessionMinutes: data.average_session_minutes,
    longestStreak: data.longest_streak,
    
    guardianMessages: data.guardian_messages || [],
    wraithMessages: data.wraith_messages || [],
  }
}

/**
 * Update companion state after study session
 */
export async function updateCompanionAfterStudy(
  supabase: SupabaseClient,
  userId: string,
  sessionDurationMinutes: number,
  currentStreak: number
): Promise<{ success: boolean; evolved: boolean; newStage?: GuardianStage }> {
  try {
    const hoursStudied = sessionDurationMinutes / 60

    // Get current state
    const currentState = await getCompanionState(supabase, userId)
    if (!currentState) {
      throw new Error('Companion state not found')
    }

    // Calculate new values
    const newTotalHours = currentState.guardianTotalHours + hoursStudied
    const newStage = calculateGuardianStage(newTotalHours)
    const evolved = checkGuardianEvolution(currentState.guardianStage, newStage)
    
    // Update guardian health (gains health from study)
    let newHealth = currentState.guardianHealth + (hoursStudied * GUARDIAN_HEALTH.GAIN_PER_HOUR)
    
    // Bonus health for evolution
    if (evolved) {
      newHealth += GUARDIAN_HEALTH.BOOST_EVOLUTION
    }
    
    newHealth = Math.min(GUARDIAN_HEALTH.MAX, newHealth)

    // Reset wraith (studied today, so not idle)
    const daysIdle = 0
    const newWraithStage = calculateWraithStage(daysIdle)

    // Update longest streak if needed
    const newLongestStreak = Math.max(currentState.longestStreak, currentStreak)

    // Update database
    const { error } = await supabase
      .from('companion_states')
      .update({
        guardian_stage: newStage,
        guardian_health: Math.round(newHealth),
        guardian_total_hours: newTotalHours,
        guardian_last_fed: new Date().toISOString(),
        guardian_evolution_unlocked: evolved ? false : currentState.guardianStage, // Reset to show ceremony
        
        wraith_stage: newWraithStage,
        wraith_days_idle: daysIdle,
        wraith_last_active: new Date().toISOString(),
        wraith_wasted_days: 0, // Reset wasted days
        
        longest_streak: newLongestStreak,
      })
      .eq('user_id', userId)

    if (error) throw error

    return { success: true, evolved, newStage: evolved ? newStage : undefined }
  } catch (error) {
    console.error('Error updating companion after study:', error)
    return { success: false, evolved: false }
  }
}

/**
 * Daily companion update (called once per day on first login)
 */
export async function dailyCompanionUpdate(
  supabase: SupabaseClient,
  userId: string,
  studiedYesterday: boolean,
  dailyGoalMet: boolean,
  streakBroken: boolean
): Promise<void> {
  try {
    const currentState = await getCompanionState(supabase, userId)
    if (!currentState) return

    // Calculate days idle
    const daysIdle = calculateDaysIdle(currentState.wraithLastActive)
    
    // Update guardian health based on yesterday's performance
    const hoursYesterday = studiedYesterday ? 1 : 0 // Simplified for daily check
    const newHealth = calculateGuardianHealth(
      currentState.guardianHealth,
      hoursYesterday,
      daysIdle,
      !dailyGoalMet,
      streakBroken
    )

    // Calculate wraith state
    const newWraithStage = calculateWraithStage(daysIdle)
    
    // Calculate exam urgency if exam is set
    let examUrgency: ExamUrgency = 'none'
    let wastedDays = 0
    
    if (currentState.wraithExamDate) {
      const daysUntilExam = Math.ceil(
        (new Date(currentState.wraithExamDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
      examUrgency = calculateExamUrgency(daysUntilExam)
      wastedDays = calculateWastedDays(daysIdle, examUrgency)
    }

    // Update database
    await supabase
      .from('companion_states')
      .update({
        guardian_health: Math.round(newHealth),
        wraith_stage: newWraithStage,
        wraith_days_idle: daysIdle,
        wraith_wasted_days: wastedDays,
      })
      .eq('user_id', userId)

  } catch (error) {
    console.error('Error in daily companion update:', error)
  }
}

/**
 * Set exam date for Time Wraith
 */
export async function setExamDate(
  supabase: SupabaseClient,
  userId: string,
  examName: string,
  examDate: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('companion_states')
      .update({
        wraith_exam_name: examName,
        wraith_exam_date: examDate,
      })
      .eq('user_id', userId)

    return !error
  } catch (error) {
    console.error('Error setting exam date:', error)
    return false
  }
}