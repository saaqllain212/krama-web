'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { X, Trash2, RotateCcw, AlertTriangle, Loader2 } from 'lucide-react'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'reset' | 'delete' | null>(null)
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  if (!open) return null

  // 1. HANDLE SOFT RESET
  const handleReset = async () => {
    if (confirmText !== 'RESET') return
    setLoading(true)
    
    try {
      // Call the Database Function
      const { error } = await supabase.rpc('reset_user_progress')
      if (error) throw error

      window.location.reload() // Refresh to show empty dashboard
    } catch (err) {
      alert('Failed to reset progress.')
    } finally {
      setLoading(false)
    }
  }

  // 2. HANDLE HARD DELETE
  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return
    setLoading(true)

    try {
      // Call the API Route
      const res = await fetch('/api/auth/delete-account', { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')

      // Force logout and go home
      await supabase.auth.signOut()
      router.replace('/')
    } catch (err) {
      alert('Failed to delete account. Contact support.')
      setLoading(false)
    }
  }

  // RESET STATE ON CLOSE
  const closeAndReset = () => {
    setActiveTab(null)
    setConfirmText('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg border-2 border-black bg-white shadow-[8px_8px_0_0_#000]">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b-2 border-black bg-stone-100 p-4">
          <h2 className="text-lg font-black uppercase tracking-tight">Settings & Danger Zone</h2>
          <button onClick={closeAndReset} className="hover:text-red-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-6">
          
          {/* OPTION 1: RESET PROGRESS */}
          <div className="border-2 border-dashed border-stone-300 p-4 hover:border-black transition-colors group">
            <div className="flex items-start gap-4">
              <div className="bg-stone-100 p-3 rounded-full group-hover:bg-black group-hover:text-white transition-colors">
                 <RotateCcw size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold uppercase text-sm">Reset Progress</h3>
                <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                  Clear all focus logs, syllabus tracking, and test scores. <br/>
                  <span className="font-bold">Your account and payment status remain safe.</span>
                </p>
                
                {activeTab === 'reset' ? (
                  <div className="mt-4 bg-stone-50 p-3 border border-stone-200">
                    <label className="text-[10px] font-bold uppercase text-stone-400">Type "RESET" to confirm</label>
                    <div className="flex gap-2 mt-1">
                      <input 
                        type="text" 
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        className="w-full border border-stone-300 px-2 py-1 text-sm font-bold uppercase focus:outline-none focus:border-black"
                      />
                      <button 
                        onClick={handleReset}
                        disabled={confirmText !== 'RESET' || loading}
                        className="bg-black text-white px-4 py-1 text-xs font-bold uppercase disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="animate-spin" size={14}/> : 'Confirm'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setActiveTab('reset'); setConfirmText('') }}
                    className="mt-3 text-xs font-bold underline decoration-2 underline-offset-4 hover:text-black text-stone-400"
                  >
                    Start Reset Process
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* OPTION 2: DELETE ACCOUNT */}
          <div className="border-2 border-dashed border-red-200 bg-red-50/50 p-4 hover:border-red-600 transition-colors group">
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-full text-red-600 border border-red-100 group-hover:bg-red-600 group-hover:text-white transition-colors">
                 <Trash2 size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold uppercase text-sm text-red-700">Delete Account</h3>
                <p className="text-xs text-red-900/60 mt-1 leading-relaxed">
                  Permanently delete your account and all data. <br/>
                  <span className="font-bold">This action cannot be undone.</span>
                </p>

                {activeTab === 'delete' ? (
                  <div className="mt-4 bg-white p-3 border border-red-200">
                    <label className="text-[10px] font-bold uppercase text-red-400">Type "DELETE" to confirm</label>
                    <div className="flex gap-2 mt-1">
                      <input 
                        type="text" 
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        className="w-full border border-red-300 px-2 py-1 text-sm font-bold uppercase text-red-600 focus:outline-none focus:border-red-600"
                      />
                      <button 
                        onClick={handleDelete}
                        disabled={confirmText !== 'DELETE' || loading}
                        className="bg-red-600 text-white px-4 py-1 text-xs font-bold uppercase disabled:opacity-50 hover:bg-red-700"
                      >
                         {loading ? <Loader2 className="animate-spin" size={14}/> : 'Nuke It'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                     onClick={() => { setActiveTab('delete'); setConfirmText('') }}
                     className="mt-3 text-xs font-bold underline decoration-2 underline-offset-4 text-red-400 hover:text-red-600"
                  >
                    Start Deletion Process
                  </button>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}