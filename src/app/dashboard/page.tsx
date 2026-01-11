'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Play, 
  Brain, 
  CheckSquare, 
  Activity, 
  Plus, 
  Crown, 
  Clock, 
  AlertTriangle, 
  Settings,
  BarChart2,
  Settings2
} from 'lucide-react'
import Link from 'next/link'
import Countdown from '@/components/dashboard/Countdown'
import { useSyllabus } from '@/context/SyllabusContext'
import MocksModal from '@/components/mocks/MocksModal'
import StudyHeatmap from '@/components/dashboard/StudyHeatmap'
import SettingsModal from '@/components/dashboard/SettingsModal'
import OnboardingModal from '@/components/dashboard/OnboardingModal'
import CheckoutModal from '@/components/dashboard/CheckoutModal'
import InitiationModal from '@/components/dashboard/InitiationModal'
import ProtocolManagerModal from '@/components/dashboard/ProtocolManagerModal'

export default function DashboardPage() {
  const [userName, setUserName] = useState('Student')
  const [userEmail, setUserEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [focusMinutes, setFocusMinutes] = useState(0)
  const [dueReviews, setDueReviews] = useState(0)
  const [mocksCount, setMocksCount] = useState(0)
  
  // MODAL STATES
  const [isMocksModalOpen, setIsMocksModalOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false) 
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [isProtocolManagerOpen, setIsProtocolManagerOpen] = useState(false)
  
  // MEMBERSHIP STATE
  const [isPremium, setIsPremium] = useState(false)
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null)

  const { stats, activeExam } = useSyllabus() 
  const supabase = createClient()
  
  // CHECK IF FOCUS MODE
  const isFocusMode = activeExam === 'focus'

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUserId(user.id)

        // Capture Name & Email
        if (user.user_metadata?.full_name) {
          setUserName(user.user_metadata.full_name.split(' ')[0])
        }
        if (user.email) {
            setUserEmail(user.email)
        }

        // --- 1. FETCH MEMBERSHIP STATUS ---
        const { data: access } = await supabase
          .from('user_access')
          .select('is_premium, trial_starts_at')
          .eq('user_id', user.id)
          .single()

        if (access) {
          setIsPremium(access.is_premium)
          
          if (!access.is_premium) {
            // Calculate Trial Days
            const start = new Date(access.trial_starts_at)
            const today = new Date()
            const diffTime = Math.abs(today.getTime() - start.getTime())
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            setTrialDaysLeft(14 - diffDays)
          }
        }

        // --- 2. Focus Minutes (Today) ---
        const todayStr = new Date().toISOString().split('T')[0]
        const { data: logs } = await supabase
          .from('focus_logs')
          .select('duration_minutes')
          .eq('user_id', user.id)
          .gte('started_at', `${todayStr}T00:00:00.000Z`)
          .lte('started_at', `${todayStr}T23:59:59.999Z`)

        if (logs) {
          const total = logs.reduce((sum, log) => sum + log.duration_minutes, 0)
          setFocusMinutes(total)
        }

        // --- 3. Due Reviews ---
        const now = new Date().toISOString()
        const { count: reviewCount } = await supabase
          .from('topics')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .neq('status', 'completed')
          .lte('next_review', now)
        
        if (reviewCount !== null) setDueReviews(reviewCount)

        // --- 4. Mocks Count ---
        const { data: mockData } = await supabase
            .from('mock_logs')
            .select('logs')
            .eq('user_id', user.id)
            .eq('exam_id', activeExam || 'upsc')
            .maybeSingle()
        
        if (mockData?.logs) {
            // @ts-ignore
            setMocksCount(mockData.logs.length)
        }
      }
    }
    getData()
  }, [supabase, activeExam])

  return (
    <div className="space-y-12 pb-20 relative">
      
      {/* INITIATION CEREMONY (Triggers on Payment Success) */}
      <InitiationModal />
      
      {/* ONBOARDING WIZARD */}
      <OnboardingModal />

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div className="w-full md:w-auto md:flex-1">
          
          {/* TOP ROW: Badge (Left) + Settings (Right) */}
          <div className="mb-4 flex items-center justify-between pr-2">
            
            {/* STATUS BADGE (CLICKABLE IF FREE) */}
            <div className="inline-flex">
              {isPremium ? (
                <div className="flex items-center gap-2 rounded-full border border-black bg-yellow-400 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-black shadow-[2px_2px_0_0_#000]">
                  <Crown size={12} fill="black" />
                  Pro Member
                </div>
              ) : (
                <button 
                  onClick={() => setIsCheckoutOpen(true)}
                  className={`group flex items-center gap-2 rounded-full border border-black px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-[2px_2px_0_0_#000] transition-transform active:scale-95 cursor-pointer
                    ${(trialDaysLeft !== null && trialDaysLeft <= 3) ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-stone-200 text-stone-600 hover:bg-stone-300'}`}
                >
                  {trialDaysLeft !== null && trialDaysLeft > 0 ? (
                    <>
                      <Clock size={12} />
                      Trial: {trialDaysLeft} Days Left (Upgrade)
                    </>
                  ) : (
                    <>
                      <AlertTriangle size={12} />
                      Trial Expired (Upgrade)
                    </>
                  )}
                </button>
              )}
            </div>

            {/* SETTINGS BUTTON */}
            <button 
              onClick={() => setIsSettingsOpen(true)}
              className="rounded-full bg-white p-2 text-stone-400 hover:bg-black hover:text-white transition-all shadow-sm border border-stone-200"
              title="Settings"
            >
              <Settings size={20} />
            </button>
          </div>

          <h1 className="text-4xl font-bold tracking-tighter md:text-5xl">
            Hello, {userName}.
          </h1>
          <p className="mt-2 text-lg text-black/60">
            You have <span className="font-bold text-black">{dueReviews} items</span> to review right now.
          </p>
          
          {/* ACTION BUTTONS */}
          <div className="mt-6 flex gap-2">
            
            {/* INSIGHTS (Mocks) */}
            <Link 
              href="/dashboard/mocks/insights" 
              className="rounded-full border border-black/10 bg-white px-5 py-2 text-xs font-bold uppercase tracking-widest text-black/60 hover:bg-black hover:text-white transition-colors flex items-center gap-2"
            >
              <Activity size={14} /> Insights
            </Link>

            {/* LOG MOCK: VISIBLE FOR EVERYONE (Even Focus Mode) */}
            <button 
              onClick={() => setIsMocksModalOpen(true)}
              className="rounded-full border border-black/10 bg-black px-5 py-2 text-xs font-bold uppercase tracking-widest text-white hover:bg-stone-800 transition-colors flex items-center gap-2 shadow-lg shadow-black/20"
            >
              <Plus size={14} /> Log Mock
            </button>
          </div>

        </div>

        <div className="w-full md:w-auto">
          <Countdown />
        </div>
      </div>

      {/* STATS GRID - ADAPTIVE COLUMNS */}
      {/* Focus Mode = 3 Columns (Deep Work, Reviews, Mocks) */}
      {/* Standard Mode = 4 Columns (Deep Work, Reviews, Syllabus, Mocks) */}
      <div className={`grid grid-cols-1 gap-6 md:grid-cols-2 ${isFocusMode ? 'lg:grid-cols-3' : 'lg:grid-cols-4'}`}>
        
        {/* CARD 1: DEEP WORK (Always Visible) */}
        <div className="group relative border-neo bg-black p-6 text-white shadow-neo transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(245,158,11,1)]">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-bold uppercase tracking-widest text-white/60">Deep Work</div>
              <div className="mt-2 text-4xl font-bold tracking-tighter">{focusMinutes}m</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Play className="h-5 w-5 fill-current" />
            </div>
          </div>
          <Link href="/dashboard/focus" className="absolute inset-0" />
          
          {/* FOCUS ANALYTICS BUTTON */}
          <Link 
             href="/dashboard/focus/insights" 
             className="absolute bottom-4 right-4 z-20 rounded-full bg-white/20 p-2 text-white hover:bg-white hover:text-black transition-colors"
             title="View Focus Analytics"
          >
             <BarChart2 size={16} /> 
          </Link>
        </div>

        {/* CARD 2: REVIEWS (Always Visible) */}
        <div className="group relative border-neo bg-brand p-6 text-black shadow-neo transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-bold uppercase tracking-widest text-black/60">Due Reviews</div>
              <div className="mt-2 text-4xl font-bold tracking-tighter">{dueReviews}</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/10">
              <Brain className="h-5 w-5 stroke-[2.5px]" />
            </div>
          </div>
          <Link href="/dashboard/review" className="absolute inset-0" />
        </div>

        {/* CARD 3: SYLLABUS (HIDDEN in Focus Mode) */}
        {!isFocusMode && (
            <div className="group relative border-neo bg-white p-6 shadow-neo transition-all hover:-translate-y-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm font-bold uppercase tracking-widest text-black/40">Syllabus</div>
                  <div className="mt-2 text-4xl font-bold tracking-tighter">{stats.percentage}%</div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5">
                  <CheckSquare className="h-5 w-5 stroke-[2.5px]" />
                </div>
              </div>
              <div className="mt-4 h-2 w-full overflow-hidden bg-black/10">
                <div className="h-full bg-black transition-all duration-1000 ease-out" style={{ width: `${stats.percentage}%` }} />
              </div>
              <Link href="/dashboard/syllabus" className="absolute inset-0" />
              
              {/* RADIOACTIVE PROTOCOL MANAGER BUTTON (Only for Custom) */}
              {activeExam === 'custom' && (
                  <button 
                    onClick={(e) => {
                        e.preventDefault(); 
                        setIsProtocolManagerOpen(true);
                    }}
                    className="absolute bottom-4 right-4 z-20 rounded-full bg-black p-3 text-[#ccff00] shadow-[0_0_20px_#ccff00] border-2 border-[#ccff00] hover:scale-110 transition-all"
                    title="Manage Custom Protocol"
                  >
                    <Settings2 size={20} />
                  </button>
              )}
            </div>
        )}

        {/* CARD 4: MOCKS (ALWAYS VISIBLE - Even in Focus Mode) */}
        <div className="group relative border-neo bg-white p-6 shadow-neo transition-all hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-bold uppercase tracking-widest text-black/40">Tests Taken</div>
              <div className="mt-2 text-4xl font-bold tracking-tighter">{mocksCount}</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5">
              <Activity className="h-5 w-5 stroke-[2.5px]" />
            </div>
          </div>
          <Link href="/dashboard/mocks" className="absolute inset-0" />
        </div>

      </div>

      {/* HEATMAP */}
      <div className="mt-12">
        <StudyHeatmap />
      </div>

      {/* MOCKS MODAL */}
      <MocksModal 
          open={isMocksModalOpen} 
          onClose={() => setIsMocksModalOpen(false)} 
          examId={activeExam || 'upsc'} 
          onSuccess={() => window.location.reload()} 
      />

      {/* SETTINGS MODAL */}
      <SettingsModal 
        open={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />

      {/* CHECKOUT MODAL (For Payments) */}
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        userName={userName}
        userEmail={userEmail}
      />
      
      {/* PROTOCOL MANAGER (Custom Only) */}
      <ProtocolManagerModal 
        isOpen={isProtocolManagerOpen}
        onClose={() => setIsProtocolManagerOpen(false)}
        userId={userId}
      />
    </div>
  )
}