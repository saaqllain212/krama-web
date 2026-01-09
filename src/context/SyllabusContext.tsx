'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SyllabusNode } from '@/types/syllabus'

type SyllabusContextType = {
  activeExam: string | null
  setActiveExam: (id: string) => void
  data: SyllabusNode[]
  setData: (nodes: SyllabusNode[]) => void
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

// HELPER: Count leaf nodes (Recursively)
const countLeaves = (nodes: SyllabusNode[]): number => {
  let count = 0
  for (const node of nodes) {
    // FIX: Skip 'mains_optional' to keep percentage accurate
    if (node.id === 'mains_optional') continue;

    if (node.type === 'leaf') count++
    else if (node.children) count += countLeaves(node.children)
  }
  return count
}

export function SyllabusProvider({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  
  // --- STATE ---
  const [activeExam, setActiveExamState] = useState<string | null>(null)
  const [data, setData] = useState<SyllabusNode[]>([]) 
  const [completedIds, setCompletedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // 1. INITIAL INIT (Auth & Settings only)
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: settings } = await supabase
        .from('syllabus_settings')
        .select('active_exam_id')
        .eq('user_id', user.id)
        .single()
      
      if (settings?.active_exam_id) {
        setActiveExamState(settings.active_exam_id)
      } else {
        setLoading(false)
      }
    }
    init()
  }, [])


  // 2. DATA LOADER
  useEffect(() => {
    if (!activeExam) return

    const loadData = async () => {
      setLoading(true)
      try {
        // A. Load The JSON File
        if (activeExam === 'upsc') {
          const mod = await import('@/data/exams/upsc')
          setData(mod.default as SyllabusNode[])
        } 
        else if (activeExam === 'ssc') {
          const mod = await import('@/data/exams/ssc/ssc-syllabus.json')
          setData(mod.default as SyllabusNode[])
        }
        else if (activeExam === 'bank') {
           const mod = await import('@/data/exams/bank/banking-exam.json')
           setData(mod.default as SyllabusNode[])
        }
        else if (activeExam === 'custom') {
           const saved = localStorage.getItem('krama_custom_syllabus_data')
           if (saved) setData(JSON.parse(saved))
           else setData([])
        }

        // B. Load Progress (With FIX for .maybeSingle)
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: progress, error } = await supabase
            .from('syllabus_progress')
            .select('completed_ids')
            .eq('user_id', user.id)
            .eq('exam_id', activeExam)
            .maybeSingle() // <--- FIX: Don't error if row is missing

          if (error) console.error("Load Error:", error)

          if (progress?.completed_ids) {
            const ids = typeof progress.completed_ids === 'string' 
              ? JSON.parse(progress.completed_ids) 
              : progress.completed_ids
            setCompletedIds(ids)
          } else {
            setCompletedIds([])
          }
        }

      } catch (e) {
        console.error("Failed to load syllabus data", e)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [activeExam])


  // 3. SET ACTIVE EXAM
  const setActiveExam = async (examId: string) => {
    setActiveExamState(examId)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('syllabus_settings').upsert({
        user_id: user.id,
        active_exam_id: examId
      })
    }
  }

  // 4. TOGGLE NODE (THE CRITICAL FIX)
  const toggleNode = useCallback(async (id: string) => {
    // Optimistic Update
    let newIds: string[] = []
    setCompletedIds(prev => {
      newIds = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      return newIds
    })

    // Cloud Sync
    const { data: { user } } = await supabase.auth.getUser()
    if (user && activeExam) {
       const { error } = await supabase.from('syllabus_progress').upsert(
         {
           user_id: user.id,
           exam_id: activeExam,
           completed_ids: newIds
         },
         { onConflict: 'user_id, exam_id' } // <--- FIX: Forces update instead of duplicate insert
       )
       
       if (error) {
         console.error("Save Failed:", error)
         // Optional: Revert state if save fails? 
         // For now, we just log it.
       }
    }
  }, [activeExam])

  // 5. STATS CALCULATION
  const stats = useMemo(() => {
    const totalLeaves = countLeaves(data)
    const completedLeaves = completedIds.length 
    const percentage = totalLeaves === 0 ? 0 : Math.round((completedLeaves / totalLeaves) * 100)
    const safePercentage = Math.min(percentage, 100)

    return { totalLeaves, completedLeaves, percentage: safePercentage }
  }, [data, completedIds])

  return (
    <SyllabusContext.Provider value={{ 
      activeExam, setActiveExam, data, setData, completedIds, toggleNode, stats, loading 
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