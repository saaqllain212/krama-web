'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SyllabusNode } from '@/types/syllabus'
import upscData from '@/data/syllabus/upsc-gs1.json' 
// We will add other imports (ssc, bank) later or load dynamically

type SyllabusContextType = {
  activeExam: string | null // 'upsc', 'ssc', 'custom', or null (nothing selected)
  setActiveExam: (id: string) => void
  data: SyllabusNode[]
  setData: (nodes: SyllabusNode[]) => void // Allow setting data manually (for Custom Uploads)
  completedIds: string[]
  toggleNode: (id: string) => void
  stats: {
    totalLeaves: number
    completedLeaves: number
    percentage: number
  }
  loading: boolean
}

const SyllabusContext = createContext<SyllabusContextType | undefined>(undefined)

// HELPER: Count leaf nodes
const countLeaves = (nodes: SyllabusNode[]): number => {
  let count = 0
  for (const node of nodes) {
    if (node.type === 'leaf') count++
    else if (node.children) count += countLeaves(node.children)
  }
  return count
}

export function SyllabusProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  
  // 1. STATE
  const [activeExam, setActiveExamState] = useState<string | null>(null)
  const [data, setData] = useState<SyllabusNode[]>([]) 
  const [completedIds, setCompletedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // 2. INITIAL LOAD (Fetch Settings & Progress)
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // A. Get Active Exam
      const { data: settings } = await supabase
        .from('syllabus_settings')
        .select('active_exam_id')
        .eq('user_id', user.id)
        .single()
      
      if (settings?.active_exam_id) {
        setActiveExamState(settings.active_exam_id)
        
        // Load default data if it's a preset
        if (settings.active_exam_id === 'upsc') setData(upscData as SyllabusNode[])
        // else if (settings.active_exam_id === 'ssc') setData(sscData) ...
        
        // B. Get Progress for this exam
        const { data: progress } = await supabase
          .from('syllabus_progress')
          .select('completed_ids')
          .eq('user_id', user.id)
          .eq('exam_id', settings.active_exam_id)
          .single()

        if (progress?.completed_ids) {
          // Parse JSONB to string[]
          const ids = typeof progress.completed_ids === 'string' 
            ? JSON.parse(progress.completed_ids) 
            : progress.completed_ids
          setCompletedIds(ids)
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  // 3. SET ACTIVE EXAM (User Selects Card)
  const setActiveExam = async (examId: string) => {
    setActiveExamState(examId)
    
    // Load Data immediately for UX
    if (examId === 'upsc') setData(upscData as SyllabusNode[])
    if (examId === 'custom') setData([]) // Clear data, wait for upload

    // Save Preference to DB
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('syllabus_settings').upsert({
        user_id: user.id,
        active_exam_id: examId
      })
    }
  }

  // 4. TOGGLE NODE (With Debounced Cloud Save)
  const toggleNode = useCallback(async (id: string) => {
    // A. Optimistic Update (Instant UI)
    let newIds: string[] = []
    setCompletedIds(prev => {
      newIds = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      return newIds
    })

    // B. Save to Cloud (We trigger this immediately here, but usually debounce is better for high volume)
    // For simplicity, we save on every click. Supabase is fast enough for 1 click/sec.
    const { data: { user } } = await supabase.auth.getUser()
    if (user && activeExam) {
       await supabase.from('syllabus_progress').upsert({
         user_id: user.id,
         exam_id: activeExam,
         completed_ids: newIds // Saves the whole array
       })
    }
  }, [activeExam])

  // 5. STATS
  const stats = useMemo(() => {
    const totalLeaves = countLeaves(data)
    // Only count ids that match current data (in case user switches files)
    // Actually, for simplicity, we just count length. 
    // Ideally we intersect, but for custom JSONs with changing IDs, length is risky.
    // Let's stick to simple length for now.
    const completedLeaves = completedIds.length 
    const percentage = totalLeaves === 0 ? 0 : Math.round((completedLeaves / totalLeaves) * 100)

    return { totalLeaves, completedLeaves, percentage }
  }, [data, completedIds])

  return (
    <SyllabusContext.Provider value={{ 
      activeExam, 
      setActiveExam, 
      data, 
      setData, 
      completedIds, 
      toggleNode, 
      stats,
      loading 
    }}>
      {children}
    </SyllabusContext.Provider>
  )
}

export const useSyllabus = () => {
  const context = useContext(SyllabusContext)
  if (!context) throw new Error('useSyllabus must be used within a SyllabusProvider')
  return context
}