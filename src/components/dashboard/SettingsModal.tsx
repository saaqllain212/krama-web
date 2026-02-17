'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { X, Trash2, RotateCcw, Zap, AlertCircle, Target } from 'lucide-react'
import { useSyllabus } from '@/context/SyllabusContext'
import { useAlert } from '@/context/AlertContext'

interface SettingsModalProps {
  open: boolean
  onClose: () => void
  onGoalSaved?: () => void // NEW: callback to refresh dashboard without full reload
}

export default function SettingsModal({ open, onClose, onGoalSaved }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'reset' | 'delete' | null>(null)
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSwitchConfirm, setShowSwitchConfirm] = useState(false)
  
  // GOAL STATE
  const [dailyHours, setDailyHours] = useState(6)
  const [initialHours, setInitialHours] = useState(6)
  const [savingGoal, setSavingGoal] = useState(false)

  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const { activeExam } = useSyllabus()
  const { showAlert } = useAlert()

  useEffect(() => {
    if (open) {
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
        const { error: dbError } = await supabase
          .from('syllabus_settings')
          .update({ daily_goal_hours: dailyHours })
          .eq('user_id', user.id)
        
        if (dbError) throw dbError

        const { error: metaError } = await supabase.auth.updateUser({
          data: { target_hours: dailyHours }
        })

        if (metaError) throw metaError
        
        setInitialHours(dailyHours)
        showAlert('Daily goal updated!', 'success')
        
        // FIX: Use callback instead of full page reload
        if (onGoalSaved) {
          onGoalSaved()
        }
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
      
      const tables = ['focus_logs', 'topics', 'mock_logs', 'syllabus_progress']
      
      for (const table of tables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('user_id', user.id)
        
        if (error) {
          console.error(`Error deleting from ${table}:`, error)
        }
      }
      
      const { error: statsError } = await supabase
        .from('user_stats')
        .update({
          xp: 0,
          current_streak: 0,
          longest_streak: 0,
          total_focus_minutes: 0,
          total_reviews: 0,
          total_mocks: 0,
          achievements: [],
          last_active_date: null
        })
        .eq('user_id', user.id)
      
      if (statsError) {
        console.error('Error resetting user_stats:', statsError)
      }

      // FIX: Use correct table name 'companion_states' instead of 'companions'
      const { error: companionError } = await supabase
        .from('companion_states')
        .update({
          guardian_health: 50,
          guardian_total_hours: 0,
          guardian_stage: 0,
          wraith_days_idle: 0,
          wraith_wasted_days: 0
        })
        .eq('user_id', user.id)
      
      if (companionError && companionError.code !== '42P01') {
        console.error('Error resetting companion_states:', companionError)
      }

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

      try {
        const keysToRemove = Object.keys(localStorage).filter(k => 
          k.startsWith('krama_mcq_') || k.startsWith('mcq_')
        )
        keysToRemove.forEach(k => localStorage.removeItem(k))
      } catch (e) {
        // localStorage might not be available
      }
      
      showAlert('All progress reset! Reloading...', 'success')
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
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-5 sticky top-0 z-10 rounded-t-2xl">
          <h2 className="text-lg font-bold text-gray-900">Settings</h2>
          <button 
            onClick={closeAndReset} 
            className="p-2 hover:bg-red-100 hover:text-red-600 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {/* DAILY GOAL */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-soft">
            <div className="flex items-start gap-4">
              <div className="bg-primary-500 text-white p-3 rounded-lg">
                <Target size={20} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-sm text-gray-900">Daily Goal</h3>
                  <span className="text-sm font-bold bg-primary-100 text-primary-700 px-3 py-1 rounded-full">
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
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500 mb-4" 
                />
                {dailyHours !== initialHours && (
                  <button 
                    onClick={handleSaveGoal} 
                    disabled={savingGoal} 
                    className="btn btn-primary w-full text-sm disabled:opacity-50"
                  >
                    {savingGoal ? 'Saving...' : 'Save Changes'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* PROTOCOL SWITCH */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-5">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg transition-colors ${showSwitchConfirm ? 'bg-red-500 text-white' : 'bg-gray-800 text-white'}`}>
                {showSwitchConfirm ? <AlertCircle size={20}/> : <Zap size={20} />}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-gray-900 mb-2">Active Protocol</h3>
                {!showSwitchConfirm ? (
                  <>
                    <div className="text-sm font-mono bg-white border border-gray-200 inline-block px-3 py-1 mb-3 rounded-lg uppercase text-gray-700">
                      {activeExam || 'None'}
                    </div>
                    <p className="text-sm text-gray-500 mb-4">
                      Switch to a different exam. Your progress is saved separately for each exam.
                    </p>
                    <button 
                      onClick={handleSwitchProtocol} 
                      className="btn btn-secondary text-sm"
                    >
                      Switch Exam
                    </button>
                  </>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-red-600 mb-4">
                      This will clear local cache and reload. Continue?
                    </p>
                    <div className="flex gap-3">
                      <button 
                        onClick={handleSwitchProtocol} 
                        disabled={loading} 
                        className="bg-red-500 text-white px-5 py-2.5 text-sm font-semibold rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                      >
                        {loading ? 'Switching...' : 'Yes, Switch'}
                      </button>
                      <button 
                        onClick={() => setShowSwitchConfirm(false)} 
                        className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* DANGER ZONE */}
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-red-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-xs font-semibold text-red-400 tracking-wider">
                Danger Zone
              </span>
            </div>
          </div>

          {/* RESET */}
          <div className="border border-dashed border-gray-300 rounded-xl p-5 hover:border-gray-400 transition-colors">
            <div className="flex items-start gap-4">
              <div className="bg-gray-100 p-3 rounded-lg text-gray-500">
                <RotateCcw size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-gray-900 mb-1">Reset Progress</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Clears all focus logs, review topics, mock scores, syllabus progress, XP, streaks, and achievements.
                </p>
                {activeTab === 'reset' ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <label className="text-xs font-semibold text-gray-500 block mb-2">
                      Type &quot;RESET&quot; to confirm
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={confirmText} 
                        onChange={(e) => setConfirmText(e.target.value.toUpperCase())} 
                        placeholder="RESET"
                        className="input flex-1 text-sm font-semibold uppercase" 
                      />
                      <button 
                        onClick={handleReset} 
                        disabled={confirmText !== 'RESET' || loading} 
                        className="bg-gray-800 text-white px-5 py-2 text-sm font-semibold rounded-lg disabled:opacity-30 hover:bg-gray-900 transition-colors"
                      >
                        {loading ? '...' : 'Reset'}
                      </button>
                    </div>
                    <button 
                      onClick={() => { setActiveTab(null); setConfirmText('') }}
                      className="mt-3 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setActiveTab('reset'); setConfirmText('') }} 
                    className="text-sm font-medium text-gray-500 underline hover:text-gray-800 transition-colors"
                  >
                    Reset All Data
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* DELETE */}
          <div className="border border-dashed border-red-300 bg-red-50 rounded-xl p-5 hover:border-red-400 transition-colors">
            <div className="flex items-start gap-4">
              <div className="bg-white p-3 rounded-lg text-red-500 border border-red-200">
                <Trash2 size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm text-red-700 mb-1">Delete Account</h3>
                <p className="text-sm text-red-600/70 mb-3">
                  Permanently delete your account and all data. This cannot be undone.
                </p>
                {activeTab === 'delete' ? (
                  <div className="bg-white border border-red-200 rounded-lg p-4">
                    <label className="text-xs font-semibold text-red-400 block mb-2">
                      Type &quot;DELETE&quot; to confirm
                    </label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={confirmText} 
                        onChange={(e) => setConfirmText(e.target.value.toUpperCase())} 
                        placeholder="DELETE"
                        className="flex-1 border border-red-300 rounded-lg px-3 py-2 text-sm font-semibold uppercase text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-400" 
                      />
                      <button 
                        onClick={handleDelete} 
                        disabled={confirmText !== 'DELETE' || loading} 
                        className="bg-red-500 text-white px-5 py-2 text-sm font-semibold rounded-lg hover:bg-red-600 disabled:opacity-30 transition-colors"
                      >
                        {loading ? '...' : 'Delete'}
                      </button>
                    </div>
                    <button 
                      onClick={() => { setActiveTab(null); setConfirmText('') }}
                      className="mt-3 text-xs font-medium text-red-400 hover:text-red-600 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => { setActiveTab('delete'); setConfirmText('') }} 
                    className="text-sm font-medium text-red-400 underline hover:text-red-600 transition-colors"
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
