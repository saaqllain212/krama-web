// src/lib/companions/messageGenerator.ts
// Intelligent context-aware message generation for companions

import { 
  CompanionState, 
  GuardianStage, 
  WraithStage,
  StudyTime,
  ExamUrgency,
  getTimeOfDay,
  calculateExamUrgency,
  GUARDIAN_STAGE_HOURS,
} from './companionLogic'

// ============================================
// MESSAGE CONTEXT
// ============================================

export interface MessageContext {
  // Time context
  timeOfDay: StudyTime
  dayOfWeek: string
  isWeekend: boolean
  
  // Study context
  studiedToday: boolean
  todayMinutes: number
  streak: number
  daysIdle: number
  
  // Exam context
  examName: string | null
  daysUntilExam: number | null
  examUrgency: ExamUrgency
  
  // Performance context
  recentPerformance: 'improving' | 'stable' | 'declining'
  lastWeekAverage: number
  healthStatus: 'critical' | 'low' | 'medium' | 'high' | 'excellent'
  
  // Milestone context
  justUnlockedAchievement: string | null
  justEvolved: boolean
  justBrokeStreak: boolean
  nearEvolution: boolean // Within 10% of next stage
  
  // Companion state
  guardianStage: GuardianStage
  guardianHealth: number
  wraithStage: WraithStage
  wraithWastedDays: number
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Build message context from current data
 */
export function buildMessageContext(
  companionState: CompanionState,
  todayMinutes: number,
  streak: number,
  recentData: {
    lastWeekAverage: number
    recentPerformance: 'improving' | 'stable' | 'declining'
    justEvolved?: boolean
    justBrokeStreak?: boolean
    justUnlockedAchievement?: string
  }
): MessageContext {
  const now = new Date()
  const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' })
  const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday'
  
  // Calculate health status
  let healthStatus: MessageContext['healthStatus'] = 'medium'
  if (companionState.guardianHealth >= 90) healthStatus = 'excellent'
  else if (companionState.guardianHealth >= 70) healthStatus = 'high'
  else if (companionState.guardianHealth >= 40) healthStatus = 'medium'
  else if (companionState.guardianHealth >= 20) healthStatus = 'low'
  else healthStatus = 'critical'
  
  // Calculate exam context
  let daysUntilExam: number | null = null
  if (companionState.wraithExamDate) {
    daysUntilExam = Math.ceil(
      (new Date(companionState.wraithExamDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )
  }
  const examUrgency = calculateExamUrgency(daysUntilExam)
  
  // Check if near evolution
  const currentStageHours = GUARDIAN_STAGE_HOURS[companionState.guardianStage]
  const nextStageHours = GUARDIAN_STAGE_HOURS[Math.min(4, companionState.guardianStage + 1) as GuardianStage]
  const progress = (companionState.guardianTotalHours - currentStageHours) / (nextStageHours - currentStageHours)
  const nearEvolution = progress >= 0.9 && companionState.guardianStage < 4
  
  return {
    timeOfDay: getTimeOfDay(),
    dayOfWeek,
    isWeekend,
    studiedToday: todayMinutes > 0,
    todayMinutes,
    streak,
    daysIdle: companionState.wraithDaysIdle,
    examName: companionState.wraithExamName,
    daysUntilExam,
    examUrgency,
    recentPerformance: recentData.recentPerformance,
    lastWeekAverage: recentData.lastWeekAverage,
    healthStatus,
    justUnlockedAchievement: recentData.justUnlockedAchievement || null,
    justEvolved: recentData.justEvolved || false,
    justBrokeStreak: recentData.justBrokeStreak || false,
    nearEvolution,
    guardianStage: companionState.guardianStage,
    guardianHealth: companionState.guardianHealth,
    wraithStage: companionState.wraithStage,
    wraithWastedDays: companionState.wraithWastedDays,
  }
}

// ============================================
// GROWTH GUARDIAN MESSAGES
// ============================================

const GUARDIAN_MESSAGES = {
  // EVOLUTION MESSAGES (Highest priority)
  evolution: [
    "🌱 I EVOLVED! From a seed to a sprout! Your {hours} hours of dedication transformed me!",
    "🌿 I'm now a SAPLING! {hours} hours of your effort made this happen! I'm growing stronger!",
    "🌳 YOUNG TREE achieved! {hours} hours together... I can feel your commitment in every branch!",
    "🌲 ANCIENT GUARDIAN unlocked! {hours} hours of pure dedication! I'm majestic now—and so is your discipline!",
  ],
  
  // MORNING GREETINGS
  morning: {
    studiedYesterday: [
      "Good morning! Yesterday's {minutes}-minute session gave me {branches} new {leaf}! Let's keep growing! 🌿",
      "Morning! I felt your {minutes} minutes yesterday—I grew stronger overnight! Ready for more?",
      "Hey! Woke up with extra energy from yesterday's {minutes}-minute effort. What are we tackling today?",
    ],
    missedYesterday: [
      "Good morning... I noticed you skipped yesterday. No worries! Even 30 minutes today helps me recover.",
      "Hey there. Yesterday was quiet, but today's a fresh start. Shall we study together?",
      "Morning! I missed you yesterday, but I'm still here. A single session today restarts our growth!",
    ],
    lowHealth: [
      "Good morning... I'm not feeling great (health: {health}%). I need at least 1 hour today to stay alive.",
      "Morning. I'm wilting a bit. Can we study for an hour today? I really need your help.",
    ],
  },
  
  // AFTERNOON CHECK-INS
  afternoon: {
    studiedToday: [
      "Great work this morning! {minutes} minutes already—keep the momentum going!",
      "You studied {minutes} minutes today! I can feel myself growing stronger. Want to add another session?",
    ],
    notStudied: [
      "It's afternoon and we haven't studied yet. No pressure, but even 30 minutes makes a difference!",
      "Half the day is gone. Let's squeeze in a quick session before evening?",
    ],
  },
  
  // EXAM COUNTDOWN
  examUrgency: {
    critical: [
      "{exam} is in {days} days! Every hour counts now. I believe in you—let's make these final days count!",
      "{days} days until {exam}. You've prepared well so far ({hours}hrs logged). Final push time!",
    ],
    high: [
      "{exam} in {days} days. We're in the home stretch! Your {hours} hours have built a strong foundation.",
      "{days} days to {exam}. Let's keep the intensity up—you've got this!",
    ],
  },
  
  // MILESTONE CELEBRATIONS
  milestones: {
    achievement: [
      "🎉 You unlocked '{achievement}'! I'm so proud of your progress!",
      "Achievement unlocked: {achievement}! Your dedication is paying off!",
    ],
    nearEvolution: [
      "I can feel it... I'm SO close to evolving! Just {hours} more hours to the next stage!",
      "Almost there! {hours} more hours and I'll transform into {nextStage}! Keep going!",
    ],
    streak: [
      "🔥 {streak}-day streak! Our consistency is building something incredible together!",
      "{streak} days in a row! This is what growth looks like. I'm thriving because of you!",
    ],
  },
  
  // ENCOURAGEMENT
  encouragement: {
    struggling: [
      "I know it's tough, but look—you've already logged {hours} hours with me. You're stronger than you think!",
      "Every expert was once a beginner. Your {hours} hours prove you're committed. Keep going!",
    ],
    weekend: [
      "It's {day}! Even a 1-hour session today keeps our momentum. Weekends count too!",
      "{day} study session? That's dedication! I respect that commitment!",
    ],
    lateNight: [
      "It's {time} and you're still studying? You're incredible! But rest soon—burnout helps neither of us.",
      "{time} session? Your dedication is amazing, but remember: sleep is part of growth too!",
    ],
  },
  
  // HEALTH CRITICAL
  healthCritical: [
    "🆘 CRITICAL: I'm at {health}% health. I need 2+ hours today or I might not survive!",
    "I'm barely hanging on ({health}% health). Please, just one good session today?",
  ],
}

/**
 * Generate Guardian message based on context
 */
export function generateGuardianMessage(context: MessageContext): string {
  // Priority 1: Evolution (if just evolved)
  if (context.justEvolved) {
    const messages = GUARDIAN_MESSAGES.evolution
    const message = messages[Math.min(context.guardianStage, messages.length - 1)]
    return message.replace('{hours}', Math.round(context.guardianStage === 1 ? 5 : 
                                                   context.guardianStage === 2 ? 25 :
                                                   context.guardianStage === 3 ? 100 : 250).toString())
  }
  
  // Priority 2: Health critical
  if (context.healthStatus === 'critical') {
    return pickRandom(GUARDIAN_MESSAGES.healthCritical)
      .replace('{health}', context.guardianHealth.toString())
  }
  
  // Priority 3: Achievement unlocked
  if (context.justUnlockedAchievement) {
    return pickRandom(GUARDIAN_MESSAGES.milestones.achievement)
      .replace('{achievement}', context.justUnlockedAchievement)
  }
  
  // Priority 4: Exam urgency (critical or high)
  if (context.examUrgency === 'critical' && context.examName && context.daysUntilExam) {
    return pickRandom(GUARDIAN_MESSAGES.examUrgency.critical)
      .replace('{exam}', context.examName)
      .replace('{days}', context.daysUntilExam.toString())
      .replace('{hours}', Math.round(context.guardianStage * 50).toString())
  }
  
  // Priority 5: Near evolution
  if (context.nearEvolution && !context.justEvolved) {
    const nextStageHours = GUARDIAN_STAGE_HOURS[Math.min(4, context.guardianStage + 1) as GuardianStage]
    const hoursNeeded = Math.max(1, Math.round(nextStageHours - (context.guardianStage * 50)))
    return pickRandom(GUARDIAN_MESSAGES.milestones.nearEvolution)
      .replace('{hours}', hoursNeeded.toString())
      .replace('{nextStage}', ['Sprout', 'Sapling', 'Young Tree', 'Ancient Guardian'][context.guardianStage])
  }
  
  // Priority 6: Time-based greetings
  if (context.timeOfDay === 'morning') {
    // FIX: Removed "|| context.healthStatus === 'critical'" because it's handled in Priority 2
    if (context.healthStatus === 'low') {
      return pickRandom(GUARDIAN_MESSAGES.morning.lowHealth)
        .replace('{health}', context.guardianHealth.toString())
    }
    
    const messages = context.studiedToday 
      ? GUARDIAN_MESSAGES.morning.studiedYesterday 
      : GUARDIAN_MESSAGES.morning.missedYesterday
    
    return pickRandom(messages)
      .replace('{minutes}', context.todayMinutes.toString())
      .replace('{branches}', Math.floor(context.todayMinutes / 20).toString())
      .replace('{leaf}', context.todayMinutes > 40 ? 'leaves' : 'leaf')
  }
  
  // Priority 7: Afternoon check-in
  if (context.timeOfDay === 'afternoon') {
    const messages = context.studiedToday 
      ? GUARDIAN_MESSAGES.afternoon.studiedToday
      : GUARDIAN_MESSAGES.afternoon.notStudied
    
    return pickRandom(messages)
      .replace('{minutes}', context.todayMinutes.toString())
  }
  
  // Priority 8: Late night
  if (context.timeOfDay === 'night') {
    const hour = new Date().getHours()
    if (hour >= 23 || hour < 5) {
      return pickRandom(GUARDIAN_MESSAGES.encouragement.lateNight)
        .replace('{time}', `${hour > 12 ? hour - 12 : hour} ${hour >= 12 ? 'AM' : 'PM'}`)
    }
  }
  
  // Priority 9: Streak milestone
  if (context.streak >= 7 && context.streak % 7 === 0) {
    return pickRandom(GUARDIAN_MESSAGES.milestones.streak)
      .replace('{streak}', context.streak.toString())
  }
  
  // Default: Encouragement
  if (context.isWeekend) {
    return pickRandom(GUARDIAN_MESSAGES.encouragement.weekend)
      .replace('{day}', context.dayOfWeek)
  }
  
  return pickRandom(GUARDIAN_MESSAGES.encouragement.struggling)
    .replace('{hours}', Math.round(context.guardianStage * 50).toString())
}

// ============================================
// TIME WRAITH MESSAGES
// ============================================

const WRAITH_MESSAGES = {
  // IDLE WARNINGS (Highest priority)
  idle: {
    day1: [
      "One day idle. Not terrible, but I'm watching. ⏳",
      "1 day without study. I'm noting this.",
    ],
    day2: [
      "2 days idle. Starting to fade. Get back soon.",
      "2 days gone. I'm getting dimmer.",
    ],
    day3: [
      "3 days idle. That's {wasted} wasted days with your exam in {remaining} days. Get back. Now.",
      "3 DAYS IDLE. I'm fading fast. This is serious.",
    ],
    day5: [
      "5 days idle = {wasted} wasted days. You're hemorrhaging time. MOVE.",
      "5 DAYS. I'm almost a shadow. What are you doing?!",
    ],
    day7Plus: [
      "{days} DAYS IDLE. You have {remaining} days until {exam}. Do you realize what you're doing? MOVE.",
      "{days} days gone. I'm nearly void. This is your wake-up call.",
    ],
  },
  
  // EXAM COUNTDOWN (Urgent)
  examCountdown: {
    critical: [
      "{exam} in {days} days. Every hour counts. I'm not here to sugarcoat this—ACT.",
      "{days} days to {exam}. This is it. No more excuses. Study. Now.",
    ],
    high: [
      "{exam} is {days} days away. The clock is ticking. Make every day count.",
      "{days} days left. Stop procrastinating. Start executing.",
    ],
    moderate: [
      "{exam} in {days} days. Still time, but don't waste it. Build momentum now.",
      "{days} days to prep. Consistent effort now prevents panic later.",
    ],
  },
  
  // AFTER RETURNING FROM IDLE
  returned: {
    short: [
      "Finally. {days} days idle. I almost faded to nothing. Don't do that again.",
      "You're back. {days} days was too long. Let's not repeat that.",
    ],
    long: [
      "After {days} days, you return. I'm barely here. Prove you're serious this time.",
      "{days} days idle nearly killed me. Rebuild the habit. Now.",
    ],
  },
  
  // VIGILANT (Currently active)
  vigilant: [
    "You studied today. Good. Keep this up.",
    "Active again. Momentum matters. Don't stop now.",
    "{streak}-day streak. This is what discipline looks like.",
  ],
  
  // EXAM DAY APPROACHING
  examWeek: [
    "{exam} in {days} days. Final stretch. Every hour is critical now.",
    "{days} days left. This is what you prepared for. Execute.",
  ],
  
  // LATE NIGHT GRIND
  lateNight: [
    "2 AM study? Either you're desperate or disciplined. Either way, respect. But sleep matters too.",
    "Late night grind? I see you. But burnout is real—balance it.",
  ],
  
  // STREAK BROKEN
  streakBroken: [
    "Streak broken. That hurts. Fix it. Now.",
    "You broke the {streak}-day streak. Rebuild it. Today.",
  ],
  
  // REALITY CHECKS
  realityCheck: [
    "Still haven't studied today? The day's half over. Act.",
    "Procrastinating again? Time doesn't negotiate. Get to work.",
  ],
  
  // GOOD PERFORMANCE
  goodWork: [
    "Good. {minutes} minutes today. You're back on track.",
    "{minutes} minutes logged. Keep this up for {days} more days and we survive this.",
  ],
}

/**
 * Generate Wraith message based on context
 */
export function generateWraithMessage(context: MessageContext): string {
  // Priority 1: Long idle (7+ days)
  if (context.daysIdle >= 7) {
    return pickRandom(WRAITH_MESSAGES.idle.day7Plus)
      .replace('{days}', context.daysIdle.toString())
      .replace('{remaining}', context.daysUntilExam?.toString() || 'X')
      .replace('{exam}', context.examName || 'your exam')
  }
  
  // Priority 2: Moderate idle (5-6 days)
  if (context.daysIdle >= 5) {
    return pickRandom(WRAITH_MESSAGES.idle.day5)
      .replace('{wasted}', Math.round(context.wraithWastedDays).toString())
      .replace('{remaining}', context.daysUntilExam?.toString() || 'X')
  }
  
  // Priority 3: Short idle (3-4 days)
  if (context.daysIdle >= 3) {
    return pickRandom(WRAITH_MESSAGES.idle.day3)
      .replace('{wasted}', Math.round(context.wraithWastedDays).toString())
      .replace('{remaining}', context.daysUntilExam?.toString() || 'X')
  }
  
  // Priority 4: 2 days idle
  if (context.daysIdle === 2) {
    return pickRandom(WRAITH_MESSAGES.idle.day2)
  }
  
  // Priority 5: 1 day idle
  if (context.daysIdle === 1) {
    return pickRandom(WRAITH_MESSAGES.idle.day1)
  }
  
  // Priority 6: Exam urgency (if active)
  if (context.examUrgency === 'critical' && context.examName && context.daysUntilExam) {
    if (context.daysUntilExam <= 7) {
      return pickRandom(WRAITH_MESSAGES.examWeek)
        .replace('{exam}', context.examName)
        .replace('{days}', context.daysUntilExam.toString())
    }
    return pickRandom(WRAITH_MESSAGES.examCountdown.critical)
      .replace('{exam}', context.examName)
      .replace('{days}', context.daysUntilExam.toString())
  }
  
  if (context.examUrgency === 'high' && context.examName && context.daysUntilExam) {
    return pickRandom(WRAITH_MESSAGES.examCountdown.high)
      .replace('{exam}', context.examName)
      .replace('{days}', context.daysUntilExam.toString())
  }
  
  // Priority 7: Streak broken
  if (context.justBrokeStreak) {
    return pickRandom(WRAITH_MESSAGES.streakBroken)
      .replace('{streak}', context.streak.toString())
  }
  
  // Priority 8: Late night (if studying now)
  if (context.timeOfDay === 'night' && context.studiedToday) {
    const hour = new Date().getHours()
    if (hour >= 23 || hour < 5) {
      return pickRandom(WRAITH_MESSAGES.lateNight)
    }
  }
  
  // Priority 9: Afternoon reality check (not studied)
  if (context.timeOfDay === 'afternoon' && !context.studiedToday) {
    return pickRandom(WRAITH_MESSAGES.realityCheck)
  }
  
  // Priority 10: Good work (studied today)
  if (context.studiedToday && context.todayMinutes >= 60) {
    return pickRandom(WRAITH_MESSAGES.goodWork)
      .replace('{minutes}', context.todayMinutes.toString())
      .replace('{days}', context.daysUntilExam?.toString() || 'X')
  }
  
  // Default: Vigilant
  return pickRandom(WRAITH_MESSAGES.vigilant)
    .replace('{streak}', context.streak.toString())
}

// ============================================
// UTILITY
// ============================================

function pickRandom<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

/**
 * Save message to companion history
 */
export function saveMessage(
  messages: any[],
  newMessage: string,
  context: string,
  maxMessages: number = 10
): any[] {
  const message = {
    id: Date.now().toString(),
    text: newMessage,
    timestamp: new Date().toISOString(),
    context,
  }
  
  const updated = [message, ...messages]
  return updated.slice(0, maxMessages) // Keep only last 10 messages
}