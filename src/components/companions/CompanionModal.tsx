// src/components/companions/CompanionModal.tsx
// Full-screen modal for deep companion interaction

'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Calendar, Sparkles, MessageCircle, TrendingUp, Trophy } from 'lucide-react'
import GuardianTree from './visuals/GuardianTree'
import WraithHourglass from './visuals/WraithHourglass'
import { 
  type CompanionState,
  getGuardianProgress,
  setExamDate,
  GUARDIAN_STAGE_HOURS 
} from '@/lib/companions/companionLogic'

interface CompanionModalProps {
  isOpen: boolean
  onClose: () => void
  companionType: 'guardian' | 'wraith'
  companionState: CompanionState
  userId: string
  onRefresh: () => void
}

export default function CompanionModal({
  isOpen,
  onClose,
  companionType,
  companionState,
  userId,
  onRefresh
}: CompanionModalProps) {
  const [examName, setExamName] = useState(companionState.wraithExamName || '')
  const [examDate, setExamDateState] = useState(
    companionState.wraithExamDate ? companionState.wraithExamDate.split('T')[0] : ''
  )
  const [saving, setSaving] = useState(false)
  
  const supabase = useMemo(() => createClient(), [])
  const isGuardian = companionType === 'guardian'

  if (!isOpen) return null

  const guardianStageNames = [
    'Dormant Seed 🌰',
    'Sprout 🌱', 
    'Sapling 🌿',
    'Young Tree 🌳',
    'Ancient Guardian 🌲'
  ]

  const wraithStageNames = [
    'Vigilant ⏳',
    'Watchful ⌛',
    'Fading 💨',
    'Shadow 👻',
    'Void 💀'
  ]

  const handleSetExam = async () => {
    if (!examName || !examDate) return

    setSaving(true)
    const success = await setExamDate(supabase, userId, examName, examDate)
    setSaving(false)

    if (success) {
      onRefresh()
      onClose()
    }
  }

  // Guardian-specific data
  const guardianProgress = getGuardianProgress(
    companionState.guardianTotalHours,
    companionState.guardianStage
  )

  // Wraith-specific data
  const daysUntilExam = companionState.wraithExamDate
    ? Math.ceil((new Date(companionState.wraithExamDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`sticky top-0 p-6 border-b ${
          isGuardian 
            ? 'bg-gradient-to-r from-success-50 to-success-100 border-success-200' 
            : 'bg-gradient-to-r from-warning-50 to-warning-100 border-warning-200'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {isGuardian ? 'Growth Guardian' : 'Time Wraith'}
              </h2>
              <p className="text-sm text-gray-600">
                {isGuardian 
                  ? `Stage: ${guardianStageNames[companionState.guardianStage]}`
                  : `Status: ${wraithStageNames[companionState.wraithStage]}`
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Visual */}
          <div className="flex justify-center py-8">
            {isGuardian ? (
              <div className="w-48 h-56">
                <GuardianTree 
                  stage={companionState.guardianStage}
                  health={companionState.guardianHealth}
                  animated={true}
                />
              </div>
            ) : (
              <div className="w-32 h-48">
                <WraithHourglass 
                  stage={companionState.wraithStage}
                  daysIdle={companionState.wraithDaysIdle}
                  animated={true}
                />
              </div>
            )}
          </div>

          {/* GUARDIAN CONTENT */}
          {isGuardian && (
            <>
              {/* Current Stats */}
              <div className="card-flat bg-gray-50">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-600" />
                  Current Status
                </h3>
                
                <div className="space-y-3">
                  {/* Health */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-700">Health</span>
                      <span className={`font-bold ${
                        companionState.guardianHealth >= 80 ? 'text-success-600' :
                        companionState.guardianHealth >= 50 ? 'text-warning-600' :
                        'text-red-600'
                      }`}>
                        {companionState.guardianHealth}%
                      </span>
                    </div>
                    <div className="h-3 bg-white rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-success-400 to-success-600 transition-all"
                        style={{ width: `${companionState.guardianHealth}%` }}
                      />
                    </div>
                  </div>

                  {/* Total hours */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Total Study Hours</span>
                    <span className="font-bold text-gray-900">{companionState.guardianTotalHours.toFixed(1)}h</span>
                  </div>

                  {/* Last fed */}
                  {companionState.guardianLastFed && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Last Study Session</span>
                      <span className="text-gray-600">
                        {new Date(companionState.guardianLastFed).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Evolution Timeline */}
              <div className="card-flat bg-gray-50">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-600" />
                  Evolution Timeline
                </h3>
                
                <div className="space-y-4">
                  {[0, 1, 2, 3, 4].map((stage) => {
                    const isUnlocked = stage <= companionState.guardianStage
                    const hours = GUARDIAN_STAGE_HOURS[stage as 0 | 1 | 2 | 3 | 4]
                    
                    return (
                      <div 
                        key={stage}
                        className={`flex items-center gap-3 ${isUnlocked ? '' : 'opacity-40'}`}
                      >
                        <div className={`w-3 h-3 rounded-full ${
                          isUnlocked ? 'bg-success-500' : 'bg-gray-300'
                        }`} />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className={`text-sm font-semibold ${
                              isUnlocked ? 'text-gray-900' : 'text-gray-500'
                            }`}>
                              {guardianStageNames[stage]}
                            </span>
                            <span className="text-xs text-gray-600">{hours}h</span>
                          </div>
                          {stage === companionState.guardianStage && stage < 4 && (
                            <p className="text-xs text-primary-600 mt-1">
                              {guardianProgress.needed.toFixed(1)}h to next stage
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Message History */}
              {companionState.guardianMessages.length > 0 && (
                <div className="card-flat bg-gray-50">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary-600" />
                    Recent Messages
                  </h3>
                  
                  <div className="space-y-3">
                    {companionState.guardianMessages.slice(0, 5).map((msg: any) => (
                      <div key={msg.id} className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-800">{msg.text}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(msg.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* WRAITH CONTENT */}
          {!isGuardian && (
            <>
              {/* Current Stats */}
              <div className="card-flat bg-gray-50">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary-600" />
                  Current Status
                </h3>
                
                <div className="space-y-3">
                  {/* Days idle */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700">Consecutive Days Idle</span>
                    <span className={`font-bold ${
                      companionState.wraithDaysIdle === 0 ? 'text-success-600' :
                      companionState.wraithDaysIdle <= 2 ? 'text-warning-600' :
                      'text-red-600'
                    }`}>
                      {companionState.wraithDaysIdle} days
                    </span>
                  </div>

                  {/* Wasted days */}
                  {companionState.wraithWastedDays > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Wasted Days (with urgency)</span>
                      <span className="font-bold text-red-600">
                        ~{Math.round(companionState.wraithWastedDays)} days
                      </span>
                    </div>
                  )}

                  {/* Last active */}
                  {companionState.wraithLastActive && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Last Study Session</span>
                      <span className="text-gray-600">
                        {new Date(companionState.wraithLastActive).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Exam Setup */}
              <div className="card-flat bg-gray-50">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-warning-600" />
                  Exam Countdown
                </h3>
                
                {companionState.wraithExamName && daysUntilExam !== null ? (
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-lg border-2 border-warning-300">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-900">{companionState.wraithExamName}</span>
                        <span className={`text-2xl font-bold ${
                          daysUntilExam <= 7 ? 'text-red-600' :
                          daysUntilExam <= 30 ? 'text-warning-600' :
                          'text-gray-700'
                        }`}>
                          {daysUntilExam} days
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(companionState.wraithExamDate!).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setExamName('')
                        setExamDateState('')
                      }}
                      className="w-full py-2 text-sm text-warning-700 hover:text-warning-900 transition-colors"
                    >
                      Change exam details
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-4">
                      Set your exam date so I can track urgency and hold you accountable.
                    </p>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Exam Name
                      </label>
                      <input
                        type="text"
                        value={examName}
                        onChange={(e) => setExamName(e.target.value)}
                        placeholder="e.g. JEE Main 2025"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-warning-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Exam Date
                      </label>
                      <input
                        type="date"
                        value={examDate}
                        onChange={(e) => setExamDateState(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-warning-500"
                      />
                    </div>
                    
                    <button
                      onClick={handleSetExam}
                      disabled={!examName || !examDate || saving}
                      className="w-full py-3 bg-gradient-to-r from-warning-500 to-warning-600 text-white font-semibold rounded-lg hover:from-warning-600 hover:to-warning-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      {saving ? 'Saving...' : 'Set Exam Date'}
                    </button>
                  </div>
                )}
              </div>

              {/* Message History */}
              {companionState.wraithMessages.length > 0 && (
                <div className="card-flat bg-gray-50">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-primary-600" />
                    Recent Messages
                  </h3>
                  
                  <div className="space-y-3">
                    {companionState.wraithMessages.slice(0, 5).map((msg: any) => (
                      <div key={msg.id} className="bg-white p-3 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-800">{msg.text}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(msg.timestamp).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}