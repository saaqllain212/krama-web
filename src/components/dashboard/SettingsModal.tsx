'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { X, Trash2, RotateCcw, Loader2, Zap, AlertCircle, Target } from 'lucide-react'
import { useSyllabus } from '@/context/SyllabusContext'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'reset' | 'delete' | null>(null)
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSwitchConfirm, setShowSwitchConfirm] = useState(false)
  
  // GOAL STATE
  const [dailyHours, setDailyHours] = useState(6)
  const [initialHours, setInitialHours] = useState(6)
  const [savingGoal, setSavingGoal] = useState(false)

  const router = useRouter()
  const supabase = createClient()
  const { activeExam } = useSyllabus()

  useEffect(() => {
    if (open) {
      const fetchSettings = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data } = await supabase
            .from('syllabus_settings')
            .select('daily_goal_hours')
            .eq('user_id', user.id)
            .single()
          if (data?.daily_goal_hours) {
            setDailyHours(data.daily_goal_hours)
            setInitialHours(data.daily_goal_hours)
          }
        }
      }
      fetchSettings()
    }
  }, [open])

  if (!open) return null

  const handleSaveGoal = async () => {
    setSavingGoal(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('syllabus_settings')
          .update({ daily_goal_hours: dailyHours })
          .eq('user_id', user.id)
        
        setInitialHours(dailyHours)
        alert("Daily Target Updated")
      }
    } catch (e) {
      alert("Failed to save")
    } finally {
      setSavingGoal(false)
    }
  }

  // --- THE NUCLEAR OPTION ---
  const handleSwitchProtocol = async () => {
    if (!showSwitchConfirm) {
        setShowSwitchConfirm(true)
        return
    }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // 1. Reset Database
        await supabase
          .from('syllabus_settings')
          .update({ active_exam_id: null })
          .eq('user_id', user.id)

        // 2. NUKE BROWSER STORAGE (Delete Everything)
        // This ensures the Onboarding Modal triggers because the browser is "empty"
        localStorage.clear() 
        
        // 3. Reload
        window.location.reload()
      }
    } catch (err) {
      setLoading(false)
      setShowSwitchConfirm(false)
      alert("Failed to switch.")
    }
  }

  const handleReset = async () => {
    if (confirmText !== 'RESET') return
    setLoading(true)
    try {
      const { error } = await supabase.rpc('reset_user_progress')
      if (error) throw error
      window.location.reload()
    } catch (err) {
      setLoading(false)
      alert("Reset failed")
    }
  }

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') return
    setLoading(true)
    try {
      await fetch('/api/auth/delete-account', { method: 'DELETE' })
      await supabase.auth.signOut()
      router.replace('/')
    } catch (err) {
      setLoading(false)
      alert("Delete failed")
    }
  }

  const closeAndReset = () => {
    setActiveTab(null)
    setConfirmText('')
    setShowSwitchConfirm(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg border-2 border-black bg-white shadow-[8px_8px_0_0_#000] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b-2 border-black bg-stone-100 p-4 sticky top-0 z-10">
          <h2 className="text-lg font-black uppercase tracking-tight">System Configuration</h2>
          <button onClick={closeAndReset} className="hover:text-red-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          
          {/* WORKLOAD */}
          <div className="border-2 border-black bg-white p-5 shadow-sm">
             <div className="flex items-start gap-4">
                <div className="bg-black text-white p-3 rounded-full">
                   <Target size={20} className="fill-current" />
                </div>
                <div className="flex-1">
                   <div className="flex justify-between items-center mb-1">
                     <h3 className="font-bold uppercase text-sm">Workload Calibration</h3>
                     <span className="text-xs font-black bg-amber-400 px-2 py-0.5 rounded text-black">{dailyHours} HRS / DAY</span>
                   </div>
                   <input type="range" min="1" max="14" step="1" value={dailyHours} onChange={(e) => setDailyHours(parseInt(e.target.value))} className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-black mb-4" />
                   {dailyHours !== initialHours && (
                     <button onClick={handleSaveGoal} disabled={savingGoal} className="w-full bg-black text-white py-2 text-xs font-bold uppercase hover:bg-stone-800 transition-all">{savingGoal ? 'Calibrating...' : 'Update Target'}</button>
                   )}
                </div>
             </div>
          </div>

          {/* PROTOCOL SWITCH */}
          <div className="border-2 border-black bg-stone-50 p-5 shadow-sm">
             <div className="flex items-start gap-4">
                <div className={`p-3 rounded-full transition-colors ${showSwitchConfirm ? 'bg-red-600 text-white' : 'bg-black text-white'}`}>
                   {showSwitchConfirm ? <AlertCircle size={20}/> : <Zap size={20} className="fill-current" />}
                </div>
                <div className="flex-1">
                   <h3 className="font-bold uppercase text-sm">Active Protocol</h3>
                   {!showSwitchConfirm ? (
                       <>
                           <div className="text-xs font-mono bg-white border border-stone-200 inline-block px-2 py-1 mt-1 rounded uppercase mb-2">{activeExam || 'UNKNOWN'}</div>
                           <p className="text-xs text-stone-500 leading-relaxed mb-4">Switching protocols will reboot your setup. <span className="font-bold">This will delete saved custom files.</span></p>
                           <button onClick={handleSwitchProtocol} className="bg-white border-2 border-black px-4 py-2 text-xs font-bold uppercase hover:bg-black hover:text-white transition-all shadow-[2px_2px_0_0_#000]">Switch Protocol</button>
                       </>
                   ) : (
                       <div className="animate-in fade-in slide-in-from-left-2">
                           <p className="text-xs font-bold text-red-600 mb-3 uppercase tracking-wide">Warning: This deletes all local data.</p>
                           <div className="flex gap-2">
                               <button onClick={handleSwitchProtocol} disabled={loading} className="bg-red-600 text-white border-2 border-red-800 px-4 py-2 text-xs font-bold uppercase hover:bg-red-700 shadow-[2px_2px_0_0_rgba(153,27,27,1)]">{loading ? 'Rebooting...' : 'Confirm Reboot'}</button>
                               <button onClick={() => setShowSwitchConfirm(false)} className="text-xs font-bold uppercase text-stone-400 hover:text-black px-2">Cancel</button>
                           </div>
                       </div>
                   )}
                </div>
             </div>
          </div>

          {/* DANGER ZONE */}
          <div className="border-t-2 border-stone-100 relative"><span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-2 text-[10px] font-bold uppercase text-stone-300">Danger Zone</span></div>

          <div className="border-2 border-dashed border-stone-300 p-4 hover:border-black transition-colors group">
            <div className="flex items-start gap-4">
              <div className="bg-stone-100 p-3 rounded-full group-hover:bg-black group-hover:text-white transition-colors"><RotateCcw size={20} /></div>
              <div className="flex-1">
                <h3 className="font-bold uppercase text-sm">Reset Progress</h3>
                {activeTab === 'reset' ? (
                  <div className="mt-4 bg-stone-50 p-3 border border-stone-200">
                    <label className="text-[10px] font-bold uppercase text-stone-400">Type "RESET" to confirm</label>
                    <div className="flex gap-2 mt-1">
                      <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="w-full border border-stone-300 px-2 py-1 text-sm font-bold uppercase" />
                      <button onClick={handleReset} disabled={confirmText !== 'RESET' || loading} className="bg-black text-white px-4 py-1 text-xs font-bold uppercase disabled:opacity-50">Confirm</button>
                    </div>
                  </div>
                ) : ( <button onClick={() => { setActiveTab('reset'); setConfirmText('') }} className="mt-1 text-xs font-bold text-stone-400 underline hover:text-black">Reset All Data</button> )}
              </div>
            </div>
          </div>
          
           <div className="border-2 border-dashed border-red-200 bg-red-50/50 p-4 hover:border-red-600 transition-colors group">
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-full text-red-600 border border-red-100 group-hover:bg-red-600 group-hover:text-white transition-colors"><Trash2 size={20} /></div>
              <div className="flex-1">
                <h3 className="font-bold uppercase text-sm text-red-700">Delete Account</h3>
                {activeTab === 'delete' ? (
                  <div className="mt-4 bg-white p-3 border border-red-200">
                    <label className="text-[10px] font-bold uppercase text-red-400">Type "DELETE" to confirm</label>
                    <div className="flex gap-2 mt-1">
                      <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="w-full border border-red-300 px-2 py-1 text-sm font-bold uppercase text-red-600" />
                      <button onClick={handleDelete} disabled={confirmText !== 'DELETE' || loading} className="bg-red-600 text-white px-4 py-1 text-xs font-bold uppercase hover:bg-red-700">Nuke It</button>
                    </div>
                  </div>
                ) : ( <button onClick={() => { setActiveTab('delete'); setConfirmText('') }} className="mt-1 text-xs font-bold text-red-400 underline hover:text-red-600">Permanently Delete</button> )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}