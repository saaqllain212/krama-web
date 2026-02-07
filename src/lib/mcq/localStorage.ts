// ============================================
// MCQ LOCAL STORAGE MANAGER
// ============================================
// Manages MCQ sets in browser's LocalStorage
// Limit: 50 most recent sets (~5-8 MB total)
// Older sets auto-deleted to prevent storage overflow
// ============================================

const MCQ_STORAGE_KEY = 'krama_mcq_sets'
const MAX_MCQ_SETS = 50 // Keep last 50 sets
const STORAGE_WARNING_THRESHOLD = 0.8 // Warn at 80% full

export interface MCQQuestion {
  question: string
  options: string[]
  correctAnswer: number // Index of correct option (0-3)
  explanation: string
}

export interface MCQSet {
  id: string // UUID
  title: string
  examPattern: string
  pdfName?: string
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed'
  questions: MCQQuestion[]
  createdAt: string // ISO timestamp
  lastAccessedAt?: string
}

export interface StorageStats {
  usedSets: number
  maxSets: number
  usagePercentage: number
  estimatedSizeMB: number
  isNearLimit: boolean
}

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Get all MCQ sets from LocalStorage
 */
export function getAllMCQSets(): MCQSet[] {
  try {
    const stored = localStorage.getItem(MCQ_STORAGE_KEY)
    if (!stored) return []
    
    const sets: MCQSet[] = JSON.parse(stored)
    // Sort by most recent first
    return sets.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  } catch (error) {
    console.error('Error reading MCQ sets from LocalStorage:', error)
    return []
  }
}

/**
 * Get a single MCQ set by ID
 */
export function getMCQSet(id: string): MCQSet | null {
  const sets = getAllMCQSets()
  const set = sets.find(s => s.id === id)
  
  if (set) {
    // Update last accessed time
    set.lastAccessedAt = new Date().toISOString()
    saveMCQSets(sets)
  }
  
  return set || null
}

/**
 * Save a new MCQ set
 * Auto-deletes oldest sets if exceeding MAX_MCQ_SETS
 */
export function saveMCQSet(newSet: MCQSet): boolean {
  try {
    let sets = getAllMCQSets()
    
    // Add new set
    sets.unshift(newSet)
    
    // Keep only last MAX_MCQ_SETS
    if (sets.length > MAX_MCQ_SETS) {
      sets = sets.slice(0, MAX_MCQ_SETS)
    }
    
    localStorage.setItem(MCQ_STORAGE_KEY, JSON.stringify(sets))
    return true
  } catch (error) {
    console.error('Error saving MCQ set:', error)
    
    // If storage quota exceeded, try deleting old sets
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      try {
        let sets = getAllMCQSets()
        // Keep only last 30 sets instead of 50
        sets = sets.slice(0, 30)
        localStorage.setItem(MCQ_STORAGE_KEY, JSON.stringify(sets))
        
        // Try saving again
        sets.unshift(newSet)
        localStorage.setItem(MCQ_STORAGE_KEY, JSON.stringify(sets))
        return true
      } catch (retryError) {
        console.error('Still failed after cleanup:', retryError)
        return false
      }
    }
    
    return false
  }
}

/**
 * Update an existing MCQ set
 */
export function updateMCQSet(id: string, updates: Partial<MCQSet>): boolean {
  try {
    const sets = getAllMCQSets()
    const index = sets.findIndex(s => s.id === id)
    
    if (index === -1) return false
    
    sets[index] = {
      ...sets[index],
      ...updates,
      lastAccessedAt: new Date().toISOString()
    }
    
    saveMCQSets(sets)
    return true
  } catch (error) {
    console.error('Error updating MCQ set:', error)
    return false
  }
}

/**
 * Delete an MCQ set
 */
export function deleteMCQSet(id: string): boolean {
  try {
    let sets = getAllMCQSets()
    sets = sets.filter(s => s.id !== id)
    saveMCQSets(sets)
    return true
  } catch (error) {
    console.error('Error deleting MCQ set:', error)
    return false
  }
}

/**
 * Delete all MCQ sets (clear storage)
 */
export function clearAllMCQSets(): boolean {
  try {
    localStorage.removeItem(MCQ_STORAGE_KEY)
    return true
  } catch (error) {
    console.error('Error clearing MCQ sets:', error)
    return false
  }
}

/**
 * Save sets array directly (internal use)
 */
function saveMCQSets(sets: MCQSet[]): void {
  localStorage.setItem(MCQ_STORAGE_KEY, JSON.stringify(sets))
}

// ============================================
// STORAGE STATS
// ============================================

/**
 * Get storage usage statistics
 */
export function getStorageStats(): StorageStats {
  const sets = getAllMCQSets()
  const usedSets = sets.length
  const usagePercentage = (usedSets / MAX_MCQ_SETS) * 100
  
  // Estimate size (rough)
  const storedData = localStorage.getItem(MCQ_STORAGE_KEY) || ''
  const estimatedSizeMB = (storedData.length * 2) / (1024 * 1024) // Rough estimate
  
  return {
    usedSets,
    maxSets: MAX_MCQ_SETS,
    usagePercentage,
    estimatedSizeMB,
    isNearLimit: usagePercentage >= (STORAGE_WARNING_THRESHOLD * 100)
  }
}

/**
 * Check if storage is near limit
 */
export function isStorageNearLimit(): boolean {
  const stats = getStorageStats()
  return stats.isNearLimit
}

// ============================================
// EXPORT / IMPORT
// ============================================

/**
 * Export all MCQ sets as JSON file
 */
export function exportAllSets(): string {
  const sets = getAllMCQSets()
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    totalSets: sets.length,
    sets
  }
  
  return JSON.stringify(exportData, null, 2)
}

/**
 * Download export as file
 */
export function downloadExport(): void {
  const jsonData = exportAllSets()
  const blob = new Blob([jsonData], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const a = document.createElement('a')
  a.href = url
  a.download = `krama-mcq-backup-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Import MCQ sets from JSON
 */
export function importSets(jsonData: string): { success: boolean; imported: number; errors: string[] } {
  const errors: string[] = []
  let imported = 0
  
  try {
    const data = JSON.parse(jsonData)
    
    // Validate format
    if (!data.sets || !Array.isArray(data.sets)) {
      return {
        success: false,
        imported: 0,
        errors: ['Invalid export file format']
      }
    }
    
    // Get existing sets
    let existingSets = getAllMCQSets()
    const existingIds = new Set(existingSets.map(s => s.id))
    
    // Import each set
    for (const set of data.sets) {
      try {
        // Skip if already exists
        if (existingIds.has(set.id)) {
          continue
        }
        
        // Validate set structure
        if (!set.id || !set.title || !set.questions || !Array.isArray(set.questions)) {
          errors.push(`Invalid set: ${set.title || 'Unknown'}`)
          continue
        }
        
        existingSets.unshift(set)
        imported++
      } catch (error) {
        errors.push(`Failed to import set: ${set.title || 'Unknown'}`)
      }
    }
    
    // Keep only last MAX_MCQ_SETS
    if (existingSets.length > MAX_MCQ_SETS) {
      existingSets = existingSets.slice(0, MAX_MCQ_SETS)
    }
    
    // Save
    saveMCQSets(existingSets)
    
    return {
      success: imported > 0,
      imported,
      errors
    }
  } catch (error) {
    return {
      success: false,
      imported: 0,
      errors: ['Failed to parse import file']
    }
  }
}

// ============================================
// SEARCH / FILTER
// ============================================

/**
 * Search MCQ sets by title or exam pattern
 */
export function searchMCQSets(query: string): MCQSet[] {
  const sets = getAllMCQSets()
  const lowerQuery = query.toLowerCase()
  
  return sets.filter(set => 
    set.title.toLowerCase().includes(lowerQuery) ||
    set.examPattern.toLowerCase().includes(lowerQuery) ||
    (set.pdfName && set.pdfName.toLowerCase().includes(lowerQuery))
  )
}

/**
 * Filter MCQ sets by exam pattern
 */
export function filterByExamPattern(pattern: string): MCQSet[] {
  const sets = getAllMCQSets()
  return sets.filter(set => set.examPattern === pattern)
}

/**
 * Filter MCQ sets by difficulty
 */
export function filterByDifficulty(difficulty: 'easy' | 'medium' | 'hard' | 'mixed'): MCQSet[] {
  const sets = getAllMCQSets()
  return sets.filter(set => set.difficulty === difficulty)
}

// ============================================
// CLEANUP
// ============================================

/**
 * Delete old sets (older than X days)
 */
export function deleteOldSets(daysOld: number = 90): number {
  const sets = getAllMCQSets()
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysOld)
  
  const filteredSets = sets.filter(set => {
    const createdDate = new Date(set.createdAt)
    return createdDate >= cutoffDate
  })
  
  const deletedCount = sets.length - filteredSets.length
  
  if (deletedCount > 0) {
    saveMCQSets(filteredSets)
  }
  
  return deletedCount
}