'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { X, Trash2, RotateCcw, Zap, AlertCircle, Target } from 'lucide-react'
import { useSyllabus } from '@/context/SyllabusContext'
import { useAlert } from '@/context/AlertContext'

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
  const { showAlert } = useAlert()

  useEffect(() => {
    if (open) {
      // Reset states when modal opens
      setActiveTab(null)
      setConfirmText('')
      setShowSwitchConfirm(false)
      
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
          } else {
            const metaTarget = user.user_metadata?.target_hours
            if (metaTarget) {
              setDailyHours(Number(metaTarget))
              setInitialHours(Number(metaTarget))
            }
          }
        }
      }
      fetchSettings()
    }
  }, [open, supabase])

  if (!open) return null

  const handleSaveGoal = async () => {
    setSavingGoal(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Update Database
        const { error: dbError } = await supabase
          .from('syllabus_settings')
          .update({ daily_goal_hours: dailyHours })
          .eq('user_id', user.id)
        
        if (dbError) throw dbError

        // Update Metadata
        const { error: metaError } = await supabase.auth.updateUser({
          data: { target_hours: dailyHours }
        })

        if (metaError) throw metaError
        
        setInitialHours(dailyHours)
        showAlert('Daily goal updated!', 'success')
        
        // Reload after a brief delay
        setTimeout(() => window.location.reload(), 1000)
      }
    } catch (e) {
      console.error('Save goal error:', e)
      showAlert('Failed to save goal.', 'error')
    } finally {
      setSavingGoal(false)
    }
  }

  const closeAndReset = () => {
    setActiveTab(null)
    setConfirmText('')
    setShowSwitchConfirm(false)
    onClose()
  }

  const handleSwitchProtocol = async () => {
    if (!showSwitchConfirm) { 
      setShowSwitchConfirm(true)
      return 
    }
    
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { error } = await supabase
          .from('syllabus_settings')
          .update({ active_exam_id: null })
          .eq('user_id', user.id)
        
        if (error) throw error
        
        localStorage.clear() 
        showAlert('Switching protocol...', 'success')
        setTimeout(() => window.location.reload(), 500)
      }
    } catch (err) { 
      console.error('Switch protocol error:', err)
      setLoading(false)
      setShowSwitchConfirm(false)
      showAlert('Switch failed. Try again.', 'error')
    }
  }

  const handleReset = async () => {
    if (confirmText !== 'RESET') {
      showAlert('Type RESET to confirm', 'neutral')
      return
    }
    
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')
      
      console.log('Starting reset for user:', user.id)
      
      // Delete data from each table individually with error checking
      const tables = ['focus_logs', 'topics', 'mock_logs', 'syllabus_progress']
      
      for (const table of tables) {
        console.log(`Deleting from ${table}...`)
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', user.id)
        
        if (error) {
          console.error(`Error deleting from ${table}:`, error)
          // Continue with other tables even if one fails
        } else {
          console.log(`Successfully deleted from ${table}`)
        }
      }
      
      // Reset syllabus settings but keep the active exam
      console.log('Resetting syllabus_settings...')
      const { error: settingsError } = await supabase
        .from('syllabus_settings')
        .update({ 
          daily_goal_hours: 6,
          target_date: null,
          custom_title: null
        })
        .eq('user_id', user.id)
      
      if (settingsError) {
        console.error('Error resetting settings:', settingsError)
      }
      
      showAlert('Progress reset! Reloading...', 'success')
      setTimeout(() => window.location.reload(), 1500)
      
    } catch (err) { 
      console.error('Reset failed:', err)
      setLoading(false)
      showAlert('Reset failed. Check console for details.', 'error')
    }
  }

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      showAlert('Type DELETE to confirm', 'neutral')
      return
    }
    
    setLoading(true)
    try {
      const response = await fetch('/api/auth/delete-account', { method: 'DELETE' })
      
      if (!response.ok) {
        throw new Error('Delete API failed')
      }
      
      await supabase.auth.signOut()
      showAlert('Account deleted. Goodbye!', 'success')
      router.replace('/')
    } catch (err) { 
      console.error('Delete account error:', err)
      setLoading(false)
      showAlert('Delete failed. Try again.', 'error')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg border-2 border-black bg-white shadow-[8px_8px_0_0_#000] max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black bg-stone-100 p-4 sticky top-0 z-10">
          <h2 className="text-lg font-black uppercase tracking-tight">Settings</h2>
          <button 
            onClick={closeAndReset} 
            className="p-1 hover:bg-red-100 hover:text-red-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* DAILY GOAL */}
          <div className="border-2 border-black bg-white p-5 shadow-[3px_3px_0_0_#000]">
            <div className="flex items-start gap-4">
              <div className="bg-black text-white p-3">
                <Target size={20} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-bold uppercase text-sm">Daily Goal</h3>
                  <span className="text-sm font-black bg-brand px-3 py-1 text-black">
                    {dailyHours} hrs/day
                  </span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="14" 
                  step="1" 
                  value={dailyHours} 
                  onChange={(e) => setDailyHours(parseInt(e.target.value))} 
                  className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-black mb-4" 
                />
                {dailyHours !== initialHours && (
                  <button 
                    onClick={handleSaveGoal} 
                    disabled={savingGoal} 
                    className="w-full bg-black text-white py-3 text-sm font-bold uppercase hover:bg-stone-800 transition-all disabled:opacity-50"
                  >
                    {savingGoal ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* PROTOCOL SWITCH */}
          <div className="border-2 border-black bg-stone-50 p-5 shadow-[3px_3px_0_0_#000]">
            <div className="flex items-start gap-4">
              <div className={`p-3 transition-colors ${showSwitchConfirm ? 'bg-red-600 text-white' : 'bg-black text-white'}`}>
                {showSwitchConfirm ? <AlertCircle size={20}/> : <Zap size={20} />}
              </div>
              <div className="flex-1">
                <h3 className="font-bold uppercase text-sm mb-2">Active Protocol</h3>
                {!showSwitchConfirm ? (
                  <>
                    <div className="text-sm font-mono bg-white border-2 border-black inline-block px-3 py-1 mb-3 uppercase">
                      {activeExam || 'None'}
                    </div>
                    <p className="text-sm text-black/60 mb-4">
                      Switch to a different exam. Your progress is saved separately for each exam.
                    </p>
                    <button 
                      onClick={handleSwitchProtocol} 
                      className="bg-white border-2 border-black px-5 py-2.5 text-sm font-bold uppercase hover:bg-black hover:text-white transition-all shadow-[3px_3px_0_0_#000] hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px]"
                    >
                      Switch Exam
                    </button>
                  </>
                ) : (
                  <div>
                    <p className="text-sm font-bold text-red-600 mb-4">
                      This will clear local cache and reload. Continue?
                    </p>
                    <div className="flex gap-3">
                      <button 
                        onClick={handleSwitchProtocol} 
                        disabled={loading} 
                        className="bg-red-600 text-white border-2 border-red-800 px-5 py-2.5 text-sm font-bold uppercase hover:bg-red-700 disabled:opacity-50"
                      >
                        {loading ? 'Switching...' : 'Yes, Switch'}
                      </button>
                      <button 
                        onClick={() => setShowSwitchConfirm(false)} 
                        className="px-5 py-2.5 text-sm font-bold uppercase text-black/50 hover:text-black"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* DANGER ZONE DIVIDER */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-red-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-xs font-bold uppercase text-red-400 tracking-widest">
                Danger Zone
              </span>
            </div>
          </div>

          {/* RESET PROGRESS */}
          <div className="border-2 border-dashed border-black/20 p-5 hover:border-black transition-colors">
            <div className="flex items-start gap-4">
              <div className="bg-stone-100 p-3 text-black/60">
                <RotateCcw size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold uppercase text-sm mb-1">Reset Progress</h3>
                <p className="text-sm text-black/50 mb-3">
                  Clears all focus logs, review topics, mock scores, and syllabus progress.
                </p>
                {activeTab === 'reset' ? (
                  <div className="bg-stone-50 border border-stone-200 p-4">
                    <label className="text-xs font-bold uppercase text-black/50 block mb-2">
                      Type "RESET" to confirm
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={confirmText} 
                        onChange={(e) => setConfirmText(e.target.value.toUpperCase())} 
                        placeholder="RESET"
                        className="flex-1 border-2 border-black px-3 py-2 text-sm font-bold uppercase focus:outline-none" 
                      />
                      <button 
                        onClick={handleReset} 
                        disabled={confirmText !== 'RESET' || loading} 
                        className="bg-black text-white px-5 py-2 text-sm font-bold uppercase disabled:opacity-30"
                      >
                        {loading ? '...' : 'Reset'}
                      </button>
                    </div>
                    <button 
                      onClick={() => { setActiveTab(null); setConfirmText('') }}
                      className="mt-3 text-xs font-bold text-black/40 hover:text-black"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setActiveTab('reset'); setConfirmText('') }} 
                    className="text-sm font-bold text-black/50 underline hover:text-black"
                  >
                    Reset All Data
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* DELETE ACCOUNT */}
          <div className="border-2 border-dashed border-red-300 bg-red-50 p-5 hover:border-red-500 transition-colors">
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 text-red-500 border border-red-200">
                <Trash2 size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold uppercase text-sm text-red-700 mb-1">Delete Account</h3>
                <p className="text-sm text-red-600/70 mb-3">
                  Permanently delete your account and all data. This cannot be undone.
                </p>
                {activeTab === 'delete' ? (
                  <div className="bg-white border border-red-200 p-4">
                    <label className="text-xs font-bold uppercase text-red-400 block mb-2">
                      Type "DELETE" to confirm
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={confirmText} 
                        onChange={(e) => setConfirmText(e.target.value.toUpperCase())} 
                        placeholder="DELETE"
                        className="flex-1 border-2 border-red-400 px-3 py-2 text-sm font-bold uppercase text-red-600 focus:outline-none" 
                      />
                      <button 
                        onClick={handleDelete} 
                        disabled={confirmText !== 'DELETE' || loading} 
                        className="bg-red-600 text-white px-5 py-2 text-sm font-bold uppercase hover:bg-red-700 disabled:opacity-30"
                      >
                        {loading ? '...' : 'Delete'}
                      </button>
                    </div>
                    <button 
                      onClick={() => { setActiveTab(null); setConfirmText('') }}
                      className="mt-3 text-xs font-bold text-red-400 hover:text-red-600"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setActiveTab('delete'); setConfirmText('') }} 
                    className="text-sm font-bold text-red-400 underline hover:text-red-600"
                  >
                    Delete My Account
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
