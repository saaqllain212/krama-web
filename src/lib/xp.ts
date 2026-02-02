// src/lib/xp.ts
// XP & Leveling System for Krama

export const LEVELS = [
  { level: 1, xp: 0, title: 'Beginner', color: 'stone' },
  { level: 2, xp: 100, title: 'Apprentice', color: 'stone' },
  { level: 3, xp: 300, title: 'Student', color: 'blue' },
  { level: 4, xp: 600, title: 'Learner', color: 'blue' },
  { level: 5, xp: 1000, title: 'Dedicated', color: 'green' },
  { level: 6, xp: 1500, title: 'Focused', color: 'green' },
  { level: 7, xp: 2200, title: 'Committed', color: 'purple' },
  { level: 8, xp: 3000, title: 'Warrior', color: 'purple' },
  { level: 9, xp: 4000, title: 'Scholar', color: 'amber' },
  { level: 10, xp: 5200, title: 'Expert', color: 'amber' },
  { level: 11, xp: 6500, title: 'Master', color: 'red' },
  { level: 12, xp: 8000, title: 'Grandmaster', color: 'red' },
  { level: 13, xp: 10000, title: 'Legend', color: 'brand' },
  { level: 14, xp: 12500, title: 'Mythic', color: 'brand' },
  { level: 15, xp: 15000, title: 'Immortal', color: 'brand' },
] as const

export type LevelInfo = typeof LEVELS[number]

// XP rewards for different actions
export const XP_REWARDS = {
  FOCUS_PER_MINUTE: 1,        // 1 XP per minute of focus
  REVIEW_COMPLETE: 10,        // 10 XP per review
  MOCK_LOGGED: 50,            // 50 XP per mock test
  SYLLABUS_TOPIC: 5,          // 5 XP per topic checked
  DAILY_LOGIN: 10,            // 10 XP for daily login
  STREAK_7_DAYS: 100,         // 100 XP bonus for 7-day streak
  STREAK_30_DAYS: 500,        // 500 XP bonus for 30-day streak
  FIRST_FOCUS: 25,            // 25 XP for first focus session ever
  FIRST_MOCK: 50,             // 50 XP for first mock ever
} as const

// Calculate level from XP
export function getLevelFromXP(xp: number): LevelInfo {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) {
      return LEVELS[i]
    }
  }
  return LEVELS[0]
}

// Get next level info
export function getNextLevel(currentXP: number): { nextLevel: LevelInfo | null, xpNeeded: number, progress: number } {
  const currentLevel = getLevelFromXP(currentXP)
  const currentIndex = LEVELS.findIndex(l => l.level === currentLevel.level)
  
  if (currentIndex >= LEVELS.length - 1) {
    return { nextLevel: null, xpNeeded: 0, progress: 100 }
  }
  
  const nextLevel = LEVELS[currentIndex + 1]
  const xpNeeded = nextLevel.xp - currentXP
  const levelXPRange = nextLevel.xp - currentLevel.xp
  const progressXP = currentXP - currentLevel.xp
  const progress = Math.round((progressXP / levelXPRange) * 100)
  
  return { nextLevel, xpNeeded, progress }
}

// Get color classes for level
export function getLevelColor(color: string): { bg: string, text: string, border: string } {
  const colors: Record<string, { bg: string, text: string, border: string }> = {
    stone: { bg: 'bg-stone-100', text: 'text-stone-600', border: 'border-stone-300' },
    blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-300' },
    green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-300' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-300' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-300' },
    red: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-300' },
    brand: { bg: 'bg-brand', text: 'text-black', border: 'border-black' },
  }
  return colors[color] || colors.stone
}

// Format XP with K suffix for large numbers
export function formatXP(xp: number): string {
  if (xp >= 10000) {
    return `${(xp / 1000).toFixed(1)}K`
  }
  return xp.toLocaleString()
}

// Calculate streak
export function calculateStreak(lastActiveDate: string | null, currentStreak: number): { newStreak: number, isNewDay: boolean } {
  if (!lastActiveDate) {
    return { newStreak: 1, isNewDay: true }
  }
  
  const last = new Date(lastActiveDate)
  const today = new Date()
  
  // Reset time to compare dates only
  last.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  
  const diffDays = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    // Same day, no change
    return { newStreak: currentStreak, isNewDay: false }
  } else if (diffDays === 1) {
    // Consecutive day, increase streak
    return { newStreak: currentStreak + 1, isNewDay: true }
  } else {
    // Streak broken, reset to 1
    return { newStreak: 1, isNewDay: true }
  }
}

// Get achievement badges
export type Achievement = {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt?: string
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_focus', name: 'First Step', description: 'Complete your first focus session', icon: '🎯' },
  { id: 'streak_7', name: 'Week Warrior', description: 'Maintain a 7-day streak', icon: '🔥' },
  { id: 'streak_30', name: 'Monthly Master', description: 'Maintain a 30-day streak', icon: '💎' },
  { id: 'focus_100', name: 'Century', description: 'Log 100 hours of focus time', icon: '💯' },
  { id: 'level_5', name: 'Dedicated', description: 'Reach Level 5', icon: '⭐' },
  { id: 'level_10', name: 'Expert', description: 'Reach Level 10', icon: '🌟' },
  { id: 'mock_10', name: 'Test Taker', description: 'Log 10 mock tests', icon: '📝' },
  { id: 'reviews_50', name: 'Memory Master', description: 'Complete 50 reviews', icon: '🧠' },
]

export function checkNewAchievements(stats: {
  xp: number
  level: number
  current_streak: number
  total_focus_minutes: number
  total_reviews: number
  total_mocks: number
  achievements: string[]
}): Achievement[] {
  const newAchievements: Achievement[] = []
  const existing = new Set(stats.achievements)
  
  // Check each achievement
  if (!existing.has('first_focus') && stats.total_focus_minutes > 0) {
    newAchievements.push(ACHIEVEMENTS.find(a => a.id === 'first_focus')!)
  }
  if (!existing.has('streak_7') && stats.current_streak >= 7) {
    newAchievements.push(ACHIEVEMENTS.find(a => a.id === 'streak_7')!)
  }
  if (!existing.has('streak_30') && stats.current_streak >= 30) {
    newAchievements.push(ACHIEVEMENTS.find(a => a.id === 'streak_30')!)
  }
  if (!existing.has('focus_100') && stats.total_focus_minutes >= 6000) { // 100 hours
    newAchievements.push(ACHIEVEMENTS.find(a => a.id === 'focus_100')!)
  }
  if (!existing.has('level_5') && stats.level >= 5) {
    newAchievements.push(ACHIEVEMENTS.find(a => a.id === 'level_5')!)
  }
  if (!existing.has('level_10') && stats.level >= 10) {
    newAchievements.push(ACHIEVEMENTS.find(a => a.id === 'level_10')!)
  }
  if (!existing.has('mock_10') && stats.total_mocks >= 10) {
    newAchievements.push(ACHIEVEMENTS.find(a => a.id === 'mock_10')!)
  }
  if (!existing.has('reviews_50') && stats.total_reviews >= 50) {
    newAchievements.push(ACHIEVEMENTS.find(a => a.id === 'reviews_50')!)
  }
  
  return newAchievements
}
