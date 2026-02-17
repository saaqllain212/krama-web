'use client'

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SyllabusNode } from '@/types/syllabus'

type SyllabusContextType = {
  activeExam: string | null
  setActiveExam: (id: string) => void
  optionalSubject: string | null
  setOptionalSubject: (id: string) => void
  resetOptionalSelection: () => void
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

// --- HELPERS ---
const countLeaves = (nodes: SyllabusNode[]): number => {
  let count = 0
  for (const node of nodes) {
    if (node.type === 'leaf') count++
    else if (node.children) count += countLeaves(node.children)
  }
  return count
}

const findNodeById = (nodes: SyllabusNode[], id: string): SyllabusNode | null => {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return null
}

const getAllLeafIds = (node: SyllabusNode): string[] => {
  if (node.type === 'leaf') return [node.id]
  if (!node.children) return []
  return node.children.flatMap(getAllLeafIds)
}

const filterDataForOptional = (nodes: SyllabusNode[], optionalId: string): SyllabusNode[] => {
  return nodes.map(node => {
    if (node.id === 'mains_opt_folder' && node.children) {
      return { ...node, children: node.children.filter(child => child.id === optionalId) }
    }
    if (node.children) {
      return { ...node, children: filterDataForOptional(node.children, optionalId) }
    }
    return node
  })
}

export function SyllabusProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), [])
  
  const [activeExam, setActiveExamState] = useState<string | null>(null)
  const [optionalSubject, setOptionalSubjectState] = useState<string | null>(null)
  const [data, setData] = useState<SyllabusNode[]>([]) 
  const [completedIds, setCompletedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  // 1. INITIAL INIT
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: settings } = await supabase
        .from('syllabus_settings')
        .select('active_exam_id, optional_subject_id')
        .eq('user_id', user.id)
        .single()
      
      if (settings?.active_exam_id) setActiveExamState(settings.active_exam_id)
      if (settings?.optional_subject_id) setOptionalSubjectState(settings.optional_subject_id)
      setLoading(false)
    }
    init()
  }, [])

  // 2. DATA LOADER
  useEffect(() => {
    if (!activeExam) return

    const loadData = async () => {
      setLoading(true)
      try {
        let loadedNodes: SyllabusNode[] = []
        
        if (activeExam === 'focus') loadedNodes = []
        else if (activeExam === 'upsc') {
          const mod = await import('@/data/exams/upsc')
          loadedNodes = mod.default as SyllabusNode[]
          if (optionalSubject) loadedNodes = filterDataForOptional(loadedNodes, optionalSubject)
        } 
        else if (activeExam === 'ssc') {
          const mod = await import('@/data/exams/ssc/ssc-syllabus.json')
          loadedNodes = mod.default as SyllabusNode[]
        }
        else if (activeExam === 'bank') {
           const mod = await import('@/data/exams/bank/banking-exam.json')
           loadedNodes = mod.default as SyllabusNode[]
        }
        else if (activeExam === 'jee') {
           const mod = await import('@/data/exams/jee')
           loadedNodes = mod.default as SyllabusNode[]
        }
        else if (activeExam === 'neet') {
           const mod = await import('@/data/exams/neet')
           loadedNodes = mod.default as SyllabusNode[]
        }
        else if (activeExam === 'rbi') {
           const mod = await import('@/data/exams/rbi')
           loadedNodes = mod.default as SyllabusNode[]
        }
        else if (activeExam === 'custom') {
           const saved = localStorage.getItem('krama_custom_syllabus_data')
           if (saved) {
             try { loadedNodes = JSON.parse(saved) } catch (err) { loadedNodes = [] }
           }
        }

        setData(loadedNodes)

        // Load Progress
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: progress } = await supabase
            .from('syllabus_progress')
            .select('completed_ids')
            .eq('user_id', user.id)
            .eq('exam_id', activeExam)
            .maybeSingle()

          if (progress?.completed_ids) {
            const ids = typeof progress.completed_ids === 'string' ? JSON.parse(progress.completed_ids) : progress.completed_ids
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
  }, [activeExam, optionalSubject]) 

  // 3. SETTERS
  const setActiveExam = async (examId: string) => {
    setActiveExamState(examId)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('syllabus_settings').upsert({
        user_id: user.id,
        active_exam_id: examId
      }, { onConflict: 'user_id' })
    }
  }

  const setOptionalSubject = async (optId: string) => {
    setOptionalSubjectState(optId)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('syllabus_settings').update({
        optional_subject_id: optId
      }).eq('user_id', user.id)
    }
  }

  const resetOptionalSelection = () => { setOptionalSubjectState(null) }

  // 4. TOGGLE NODE
  const toggleNode = useCallback(async (targetId: string) => {
    const targetNode = findNodeById(data, targetId)
    if (!targetNode) return

    const affectedIds = getAllLeafIds(targetNode)
    if (affectedIds.length === 0) return

    let newIds: string[] = []

    setCompletedIds(prev => {
      const allChecked = affectedIds.every(id => prev.includes(id))
      if (allChecked) {
         newIds = prev.filter(id => !affectedIds.includes(id))
      } else {
         const uniqueSet = new Set([...prev, ...affectedIds])
         newIds = Array.from(uniqueSet)
      }
      return newIds
    })

    const { data: { user } } = await supabase.auth.getUser()
    if (user && activeExam) {
       await supabase.from('syllabus_progress').upsert(
         { user_id: user.id, exam_id: activeExam, completed_ids: newIds },
         { onConflict: 'user_id, exam_id' }
       )
    }
  }, [activeExam, data])

  const stats = useMemo(() => {
    const totalLeaves = countLeaves(data)
    const completedLeaves = completedIds.length 
    if (totalLeaves === 0) return { totalLeaves, completedLeaves, percentage: 0 }
    const percentage = Math.round((completedLeaves / totalLeaves) * 100)
    return { totalLeaves, completedLeaves, percentage: Math.min(percentage, 100) }
  }, [data, completedIds])

  return (
    <SyllabusContext.Provider value={{ 
      activeExam, setActiveExam, 
      optionalSubject, setOptionalSubject, resetOptionalSelection,
      data, setData, 
      completedIds, toggleNode, 
      stats, loading 
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