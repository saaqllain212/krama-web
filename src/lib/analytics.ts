// src/lib/analytics.ts

// --- TYPES ---
export type MockLogEntry = {
  id: string
  d: string      // Date
  n: string      // Name
  s: number      // Score
  m: number      // Max
  a?: number     // Accuracy
  st?: number    // Stress
  fa?: number    // Fatigue
  nt?: string    // Note
  t?: string     // Time of Day ('morning', 'afternoon', 'evening', 'night')
  
  // --- MISTAKE AUTOPSY (New Fields) ---
  si?: number    // Silly Mistakes (Marks Lost)
  co?: number    // Conceptual Errors (Marks Lost)
  ua?: number    // Unattempted (Marks Lost)
}

export type PhaseType = 'Instability' | 'Stability' | 'Growth' | 'Peak'

// --- HELPER ---
const getPct = (log: MockLogEntry) => Math.round((log.s / log.m) * 100)

// --- 1. SMART PHASE DETECTION ---
export function calculatePhase(logs: MockLogEntry[]): PhaseType {
  if (logs.length < 3) return 'Instability'

  const window = logs.slice(-5) 
  const percentages = window.map(getPct)
  
  const current = percentages[percentages.length - 1]
  const avg = percentages.reduce((a, b) => a + b, 0) / percentages.length
  const min = Math.min(...percentages)

  const previousLogs = percentages.slice(0, -1)
  const previousAvg = previousLogs.reduce((a,b)=>a+b,0) / previousLogs.length
  
  let trend: 'up' | 'down' | 'stable' = 'stable'
  if (current > previousAvg + 2) trend = 'up'
  else if (current < previousAvg - 2) trend = 'down'

  let adjustedMin = min
  if (min < avg - 20 && current > min) {
     const sorted = [...percentages].sort((a,b) => a - b)
     adjustedMin = sorted[1] || min
  }

  if (avg >= 80 && adjustedMin >= 70) return 'Peak'
  if ((avg >= 65 && adjustedMin >= 50) || (avg >= 55 && trend === 'up')) return 'Growth'
  if (avg >= 50 && trend !== 'down') return 'Stability'
  if (current >= 60) return 'Stability'

  return 'Instability'
}

// --- 2. GOLDEN HOUR (New Smart Feature) ---
export function calculateBestTime(logs: MockLogEntry[]) {
  const timeMap: Record<string, number[]> = { morning: [], afternoon: [], evening: [], night: [] }
  
  logs.forEach(log => {
    if (log.t && timeMap[log.t]) {
      timeMap[log.t].push(getPct(log))
    }
  })

  // Calculate Averages
  let bestTime = 'any'
  let bestAvg = 0
  
  Object.entries(timeMap).forEach(([time, scores]) => {
     if (scores.length > 0) {
        const avg = scores.reduce((a,b)=>a+b,0) / scores.length
        if (avg > bestAvg) {
           bestAvg = avg
           bestTime = time
        }
     }
  })

  if (bestAvg === 0) return { status: 'insufficient' }
  return { status: 'found', time: bestTime, avg: Math.round(bestAvg) }
}

// --- 3. STANDARD ANALYTICS ---
export function calculateRecovery(logs: MockLogEntry[]) {
  if (logs.length < 5) return { status: 'insufficient-data' }

  const percentages = logs.map(getPct)
  const recentWindow = percentages.slice(-5)
  const baseline = recentWindow.reduce((a, b) => a + b, 0) / recentWindow.length
  const dropThreshold = baseline - 10

  for (let i = percentages.length - 1; i >= 0; i--) {
    if (percentages[i] <= dropThreshold) {
      let recoveryCount = 0
      for (let j = i + 1; j < percentages.length; j++) {
        recoveryCount++
        if (percentages[j] >= baseline) {
           if (recoveryCount <= 2) return { status: 'fast', count: recoveryCount }
           if (recoveryCount <= 4) return { status: 'moderate', count: recoveryCount }
           return { status: 'slow', count: recoveryCount }
        }
      }
      return { status: 'none' } 
    }
  }
  return { status: 'none' } 
}

export function calculateConsistency(logs: MockLogEntry[]) {
  if (logs.length < 6) return { status: 'insufficient-data' }

  let accuracyHits = 0
  let stressHits = 0
  let fatigueHits = 0
  let dipCount = 0

  const percentages = logs.map(getPct)
  const recentLogs = logs.slice(-10) 
  const totalAvg = percentages.reduce((a,b)=>a+b,0) / percentages.length

  recentLogs.forEach((log) => {
     const pct = getPct(log)
     if (pct < totalAvg - 8) {
        dipCount++
        if (log.a && log.a < 60) accuracyHits++
        if (log.st && log.st > 6) stressHits++
        if (log.fa && log.fa > 6) fatigueHits++
     }
  })

  if (dipCount === 0) return { status: 'solid' }

  const max = Math.max(accuracyHits, stressHits, fatigueHits)
  if (max === 0) return { status: 'random' } 

  if (max === accuracyHits) return { status: 'accuracy', count: accuracyHits }
  if (max === stressHits) return { status: 'stress', count: stressHits }
  return { status: 'fatigue', count: fatigueHits }
}

export function getChartData(logs: MockLogEntry[]) {
   return logs.map(log => ({
      date: new Date(log.d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: getPct(log),
      rawScore: log.s,
      accuracy: log.a || 0
   }))
}