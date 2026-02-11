'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Plus, Trash2, Check, AlertTriangle, Loader2, ArrowRight } from 'lucide-react'

interface ProtocolManagerModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

export default function ProtocolManagerModal({ isOpen, onClose, userId }: ProtocolManagerModalProps) {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<'inject' | 'reset'>('inject')
  const [loading, setLoading] = useState(false)
  const [manualText, setManualText] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  if (!isOpen) return null

  // --- LOGIC: INJECT MODULES (APPEND) ---
  const handleInject = async () => {
    if (!manualText.trim()) return
    setLoading(true)

    try {
      // 1. Fetch Current Syllabus (Raw)
      const { data: record } = await supabase
        .from('syllabus_settings')
        .select('custom_syllabus')
        .eq('user_id', userId)
        .single()
      
      let currentSyllabus = record?.custom_syllabus || []
      
      // 2. Parse New Text (Smart Parser Logic)
      const lines = manualText.split('\n')
      const newModules = []
      let currentBranch = null

      for (let line of lines) {
        const clean = line.trim()
        if (!clean) continue
        const isLeaf = clean.startsWith('-') || clean.startsWith('•') || clean.startsWith('*')

        if (isLeaf) {
          const title = clean.replace(/^[-•*]\s*/, '')
          const leafNode = {
            id: `leaf_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            title: title,
            type: 'leaf',
            status: 'locked'
          }
          if (currentBranch) {
             // @ts-ignore
             currentBranch.children.push(leafNode)
          } else {
             // Orphan leaf -> Generic Branch
             currentBranch = {
               id: `branch_${Date.now()}`,
               title: "New Module (Injected)",
               type: 'branch',
               children: [leafNode]
             }
             // @ts-ignore
             newModules.push(currentBranch)
          }
        } else {
          // New Branch
          currentBranch = {
            id: `branch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            title: clean,
            type: 'branch',
            children: []
          }
          newModules.push(currentBranch)
        }
      }

      // 3. Append & Save
      const updatedSyllabus = [...currentSyllabus, ...newModules]

      const { error } = await supabase
        .from('syllabus_settings')
        .update({ custom_syllabus: updatedSyllabus })
        .eq('user_id', userId)
      
      if (error) throw error

      setStatus('success')
      setTimeout(() => {
         window.location.reload()
      }, 1000)

    } catch (e) {
      console.error(e)
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  // --- LOGIC: HARD RESET ---
  const handleReset = async () => {
    if (!confirm("WARNING: This will delete your syllabus and ALL progress. Are you sure?")) return
    setLoading(true)
    try {
        // We just clear the active exam and custom data
        // This triggers the Onboarding Modal again on reload
        await supabase
          .from('syllabus_settings')
          .update({ active_exam_id: null, custom_syllabus: null })
          .eq('user_id', userId)

        localStorage.removeItem('krama-exam-name')
        window.location.reload()
    } catch (e) {
        console.error(e)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-200 shadow-xl">
        
        {/* Header */}
        <div className="bg-gray-900 text-white p-4 rounded-t-2xl flex justify-between items-center">
            <h3 className="font-bold">Protocol Manager</h3>
            <button onClick={onClose}><X /></button>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-gray-200/10">
            <button 
              onClick={() => setActiveTab('inject')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest ${activeTab === 'inject' ? 'bg-primary-500 text-white' : 'text-stone-400 hover:text-black'}`}
            >
                Inject Modules
            </button>
            <button 
              onClick={() => setActiveTab('reset')}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest ${activeTab === 'reset' ? 'bg-red-500 text-white' : 'text-stone-400 hover:text-black'}`}
            >
                Hard Reset
            </button>
        </div>

        {/* Body */}
        <div className="p-6">
            {activeTab === 'inject' ? (
                <div className="space-y-4">
                    <p className="text-xs font-bold text-stone-500 uppercase">
                        Add new topics to the end of your list without losing progress.
                    </p>
                    <textarea 
                        value={manualText}
                        onChange={(e) => setManualText(e.target.value)}
                        placeholder={`New Subject\n- Topic A\n- Topic B`}
                        className="w-full h-40 bg-stone-100 border border-gray-200/10 p-4 font-mono text-xs focus:border-gray-200 outline-none resize-none"
                    />
                    <button 
                        onClick={handleInject}
                        disabled={loading || !manualText}
                        className="w-full bg-primary-500 text-white py-4 font-semibold rounded-lg hover:bg-primary-500 hover:text-white transition-all flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : status === 'success' ? <Check /> : <Plus size={18} />}
                        {status === 'success' ? 'Protocol Expanded' : 'Inject Data'}
                    </button>
                </div>
            ) : (
                <div className="space-y-6 text-center py-6">
                    <AlertTriangle size={48} className="mx-auto text-red-500" />
                    <div>
                        <h4 className="font-bold text-xl uppercase mb-2">Danger Zone</h4>
                        <p className="text-stone-500 text-sm">
                            This will wipe your current syllabus and all tracked progress. You will be sent back to System Setup.
                        </p>
                    </div>
                    <button 
                        onClick={handleReset}
                        disabled={loading}
                        className="w-full border-2 border-red-500 text-red-600 py-4 font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                    >
                        {loading ? 'Wiping System...' : 'Confirm System Wipe'}
                    </button>
                </div>
            )}
        </div>

      </div>
    </div>
  )
}