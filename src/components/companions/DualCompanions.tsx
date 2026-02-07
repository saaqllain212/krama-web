// src/components/companions/DualCompanions.tsx
// Main dashboard widget showing both companions

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sprout, Clock, Sparkles, MessageSquare, TrendingUp } from 'lucide-react'
import GuardianTree from './visuals/GuardianTree'
import WraithHourglass from './visuals/WraithHourglass'
import MessageBubble from './MessageBubble'
import CompanionModal from './CompanionModal'
import { 
  getCompanionState,
  calculateExamUrgency,
  getGuardianProgress,
  type CompanionState 
} from '@/lib/companions/companionLogic'
import {
  generateGuardianMessage,
  generateWraithMessage,
  buildMessageContext,
  type MessageContext
} from '@/lib/companions/messageGenerator'

interface DualCompanionsProps {
  userId: string
  todayMinutes: number
  streak: number
  lastWeekAverage: number
}

export default function DualCompanions({ 
  userId, 
  todayMinutes, 
  streak,
  lastWeekAverage 
}: DualCompanionsProps) {
  const [companionState, setCompanionState] = useState<CompanionState | null>(null)
  const [guardianMessage, setGuardianMessage] = useState<string>('')
  const [wraithMessage, setWraithMessage] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [selectedCompanion, setSelectedCompanion] = useState<'guardian' | 'wraith' | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    loadCompanionData()
  }, [userId])

  const loadCompanionData = async () => {
    try {
      const state = await getCompanionState(supabase, userId)
      
      if (state) {
        setCompanionState(state)
        
        // Generate messages based on current context
        const context = buildMessageContext(state, todayMinutes, streak, {
          lastWeekAverage,
          recentPerformance: lastWeekAverage > 60 ? 'improving' : 'stable',
        })
        
        const guardMsg = generateGuardianMessage(context)
        const wrthMsg = generateWraithMessage(context)
        
        setGuardianMessage(guardMsg)
        setWraithMessage(wrthMsg)
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Error loading companion data:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="card bg-gradient-to-br from-white to-gray-50 animate-pulse">
        <div className="h-64"></div>
      </div>
    )
  }

  if (!companionState) {
    return (
      <div className="card bg-gradient-to-br from-white to-gray-50">
        <div className="text-center py-12">
          <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Initializing your companions...</p>
        </div>
      </div>
    )
  }

  // Calculate progress to next Guardian stage
  const guardianProgress = getGuardianProgress(
    companionState.guardianTotalHours,
    companionState.guardianStage
  )

  // Get exam urgency
  const daysUntilExam = companionState.wraithExamDate
    ? Math.ceil((new Date(companionState.wraithExamDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null
  const examUrgency = calculateExamUrgency(daysUntilExam)

  // Guardian stage names
  const guardianStageNames = ['Dormant Seed', 'Sprout', 'Sapling', 'Young Tree', 'Ancient Guardian']
  const wraithStageNames = ['Vigilant', 'Watchful', 'Fading', 'Shadow', 'Void']

  return (
    <>
      <div className="card bg-gradient-to-br from-white to-gray-50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Your Study Companions</h3>
            <p className="text-sm text-gray-600">Two AI personalities that evolve with your habits</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* GROWTH GUARDIAN CARD */}
          <div 
            className="relative group cursor-pointer"
            onClick={() => setSelectedCompanion('guardian')}
          >
            <div className="card-flat bg-gradient-to-br from-success-50 to-success-100 border-2 border-success-200 hover:border-success-400 transition-all hover:scale-[1.02]">
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-success-400 to-success-600 rounded-xl flex items-center justify-center shadow-glow-success">
                  <Sprout className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">Growth Guardian</h4>
                  <p className="text-xs text-success-700 font-semibold">
                    {guardianStageNames[companionState.guardianStage]}
                  </p>
                </div>
              </div>

              {/* Visual */}
              <div className="w-full h-48 mb-4 flex items-center justify-center">
                <div className="w-40 h-40">
                  <GuardianTree 
                    stage={companionState.guardianStage}
                    health={companionState.guardianHealth}
                    animated={true}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                {/* Health bar */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700 font-medium">Health</span>
                    <span className="text-success-700 font-bold">{companionState.guardianHealth}%</span>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-success-400 to-success-600 transition-all duration-500"
                      style={{ width: `${companionState.guardianHealth}%` }}
                    />
                  </div>
                </div>

                {/* Evolution progress */}
                {companionState.guardianStage < 4 && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-700 font-medium">Evolution Progress</span>
                      <span className="text-gray-600">{guardianProgress.needed.toFixed(1)}h to next stage</span>
                    </div>
                    <div className="h-2 bg-white rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary-400 to-primary-600 transition-all duration-500"
                        style={{ width: `${guardianProgress.percentage}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Total hours */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-success-200">
                  <span className="text-gray-700">Total Study Hours</span>
                  <span className="text-gray-900 font-bold">{companionState.guardianTotalHours.toFixed(1)}h</span>
                </div>
              </div>
            </div>

            {/* Message bubble */}
            {guardianMessage && (
              <div className="mt-3">
                <MessageBubble 
                  message={guardianMessage}
                  type="guardian"
                />
              </div>
            )}

            {/* Hover effect */}
            <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-success-400 pointer-events-none transition-all" />
          </div>

          {/* TIME WRAITH CARD */}
          <div 
            className="relative group cursor-pointer"
            onClick={() => setSelectedCompanion('wraith')}
          >
            <div className="card-flat bg-gradient-to-br from-warning-50 to-warning-100 border-2 border-warning-200 hover:border-warning-400 transition-all hover:scale-[1.02]">
              {/* Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-warning-400 to-warning-600 rounded-xl flex items-center justify-center shadow-glow-warning">
                  <Clock className="w-6 h-6 text-white" strokeWidth={2.5} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">Time Wraith</h4>
                  <p className="text-xs text-warning-700 font-semibold">
                    {wraithStageNames[companionState.wraithStage]}
                  </p>
                </div>
              </div>

              {/* Visual */}
              <div className="w-full h-48 mb-4 flex items-center justify-center">
                <div className="w-32 h-48">
                  <WraithHourglass 
                    stage={companionState.wraithStage}
                    daysIdle={companionState.wraithDaysIdle}
                    animated={true}
                  />
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3">
                {/* Idle days */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-700 font-medium">Days Idle</span>
                  <span className={`text-sm font-bold ${
                    companionState.wraithDaysIdle === 0 ? 'text-success-600' :
                    companionState.wraithDaysIdle <= 2 ? 'text-warning-600' :
                    'text-red-600'
                  }`}>
                    {companionState.wraithDaysIdle} days
                  </span>
                </div>

                {/* Exam countdown */}
                {companionState.wraithExamName && daysUntilExam !== null && (
                  <div className="bg-white rounded-lg p-3 border border-warning-200">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-700 font-medium">{companionState.wraithExamName}</span>
                      <span className={`text-sm font-bold ${
                        examUrgency === 'critical' ? 'text-red-600' :
                        examUrgency === 'high' ? 'text-warning-600' :
                        'text-gray-700'
                      }`}>
                        {daysUntilExam} days
                      </span>
                    </div>
                    {companionState.wraithWastedDays > 0 && (
                      <p className="text-xs text-red-600 font-semibold">
                        ~{Math.round(companionState.wraithWastedDays)} wasted days
                      </p>
                    )}
                  </div>
                )}

                {/* Set exam if not set */}
                {!companionState.wraithExamName && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedCompanion('wraith')
                    }}
                    className="w-full py-2 bg-white border border-warning-300 rounded-lg text-xs font-semibold text-warning-700 hover:bg-warning-50 transition-colors"
                  >
                    Set Exam Date
                  </button>
                )}
              </div>
            </div>

            {/* Message bubble */}
            {wraithMessage && (
              <div className="mt-3">
                <MessageBubble 
                  message={wraithMessage}
                  type="wraith"
                />
              </div>
            )}

            {/* Hover effect */}
            <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-warning-400 pointer-events-none transition-all" />
          </div>
        </div>

        {/* Quick insights */}
        <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-primary-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-700">
                <span className="font-semibold text-primary-700">Best study time:</span>{' '}
                {companionState.bestStudyTime || 'Not enough data yet'}
              </p>
              {companionState.averageSessionMinutes > 0 && (
                <p className="text-xs text-gray-600 mt-1">
                  Avg session: {companionState.averageSessionMinutes} min • Longest streak: {companionState.longestStreak} days
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Companion Detail Modal */}
      {selectedCompanion && (
        <CompanionModal
          isOpen={!!selectedCompanion}
          onClose={() => setSelectedCompanion(null)}
          companionType={selectedCompanion}
          companionState={companionState}
          userId={userId}
          onRefresh={loadCompanionData}
        />
      )}
    </>
  )
}