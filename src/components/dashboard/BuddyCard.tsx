'use client'

// src/components/dashboard/BuddyCard.tsx
// Accountability Buddy system — Phase 1
// Shows buddy's today study stats vs yours. Handles: no buddy yet, waiting for match, matched.

import { useEffect, useState, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Flame, Clock, Zap, UserPlus, RefreshCw, X, ChevronDown, ChevronUp } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

type BuddyState =
  | { phase: 'loading' }
  | { phase: 'no_buddy' }
  | { phase: 'waiting'; examType: string; hoursPerDay: number }
  | { phase: 'matched'; buddyId: string; examType: string; pairId: string }

type BuddyStats = {
  xp: number
  level: number
  title: string
  current_streak: number
  today_minutes: number
}

const EXAM_LABELS: Record<string, string> = {
  upsc: 'UPSC', jee: 'JEE', neet: 'NEET',
  ssc: 'SSC', bank: 'Banking', rbi: 'RBI Grade B', custom: 'Custom',
}

const HOUR_OPTIONS = [4, 6, 8, 10]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function getDelta(myMins: number, buddyMins: number) {
  const diff = myMins - buddyMins
  if (Math.abs(diff) < 5) return { label: 'neck and neck', color: 'text-amber-600', icon: '⚡' }
  if (diff > 0) return { label: `+${fmt(diff)} ahead`, color: 'text-green-600', icon: '🔥' }
  return { label: `${fmt(Math.abs(diff))} behind`, color: 'text-orange-500', icon: '⚠️' }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatPill({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-3 py-2 bg-gray-50 rounded-xl">
      <div className="text-gray-400 mb-0.5">{icon}</div>
      <span className="text-sm font-bold text-gray-900 tabular-nums">{value}</span>
      <span className="text-[10px] text-gray-400 font-medium">{label}</span>
    </div>
  )
}

function WaitingState({
  examType,
  onCancel,
}: {
  examType: string
  onCancel: () => void
}) {
  return (
    <div className="flex flex-col items-center py-4 gap-3 text-center">
      <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <RefreshCw size={20} className="text-primary-500" />
        </motion.div>
      </div>
      <div>
        <p className="font-semibold text-gray-900 text-sm">Finding your {EXAM_LABELS[examType] || examType} buddy…</p>
        <p className="text-xs text-gray-500 mt-0.5">We'll match you when another aspirant joins</p>
      </div>
      <button
        onClick={onCancel}
        className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
      >
        <X size={12} /> Cancel request
      </button>
    </div>
  )
}

function JoinForm({
  activeExam,
  onJoin,
  joining,
}: {
  activeExam: string | null
  onJoin: (exam: string, hours: number) => void
  joining: boolean
}) {
  const [selectedExam, setSelectedExam] = useState(activeExam || 'upsc')
  const [selectedHours, setSelectedHours] = useState(6)
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center shrink-0">
          <Users size={18} className="text-primary-500" />
        </div>
        <div>
          <p className="font-semibold text-gray-900 text-sm">Find a Study Buddy</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            Get matched with a fellow aspirant. See each other's daily progress and stay accountable.
          </p>
        </div>
      </div>

      {/* Expandable form */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-2.5 border border-dashed border-primary-300 rounded-xl text-sm font-semibold text-primary-600 hover:bg-primary-50 transition-all"
      >
        <span className="flex items-center gap-2">
          <UserPlus size={15} />
          Find my buddy
        </span>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pt-1">
              {/* Exam selector */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Your Target Exam
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {Object.entries(EXAM_LABELS).slice(0, 6).map(([id, label]) => (
                    <button
                      key={id}
                      onClick={() => setSelectedExam(id)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all ${
                        selectedExam === id
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Hours selector */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">
                  Daily Study Goal
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {HOUR_OPTIONS.map(h => (
                    <button
                      key={h}
                      onClick={() => setSelectedHours(h)}
                      className={`py-1.5 rounded-lg text-xs font-bold border transition-all ${
                        selectedHours === h
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      {h}h
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onJoin(selectedExam, selectedHours)}
                disabled={joining}
                className="w-full py-2.5 bg-primary-500 text-white text-sm font-bold rounded-xl hover:bg-primary-600 transition-all disabled:opacity-60 shadow-soft"
              >
                {joining ? 'Searching…' : 'Match Me Now'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────────

interface BuddyCardProps {
  myTodayMinutes: number
  activeExam: string | null
}

export default function BuddyCard({ myTodayMinutes, activeExam }: BuddyCardProps) {
  const supabase = useMemo(() => createClient(), [])

  const [userId, setUserId]         = useState<string | null>(null)
  const [state, setState]           = useState<BuddyState>({ phase: 'loading' })
  const [buddyStats, setBuddyStats] = useState<BuddyStats | null>(null)
  const [joining, setJoining]       = useState(false)

  // ── Load current user & buddy status ────────────────────────────────────────
  const loadState = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setState({ phase: 'no_buddy' }); return }
    setUserId(user.id)

    // Check for active pair first
    const { data: pair } = await supabase
      .from('buddy_pairs')
      .select('id, user_a, user_b, exam_type')
      .eq('status', 'active')
      .or(`user_a.eq.${user.id},user_b.eq.${user.id}`)
      .single()

    if (pair) {
      const partnerId = pair.user_a === user.id ? pair.user_b : pair.user_a
      setState({ phase: 'matched', buddyId: partnerId, examType: pair.exam_type, pairId: pair.id })
      return
    }

    // Check for waiting request
    const { data: request } = await supabase
      .from('buddy_requests')
      .select('exam_type, hours_per_day')
      .eq('user_id', user.id)
      .eq('status', 'waiting')
      .single()

    if (request) {
      setState({ phase: 'waiting', examType: request.exam_type, hoursPerDay: request.hours_per_day })
      return
    }

    setState({ phase: 'no_buddy' })
  }, [supabase])

  useEffect(() => { loadState() }, [loadState])

  // ── Load buddy stats when matched ────────────────────────────────────────────
  const loadBuddyStats = useCallback(async () => {
    if (state.phase !== 'matched' || !userId) return
    const { data } = await supabase.rpc('get_buddy_stats', {
      p_viewer_id: userId,
      p_buddy_id: state.buddyId,
    })
    if (data && data[0]) setBuddyStats(data[0])
  }, [state, userId, supabase])

  useEffect(() => {
    loadBuddyStats()
    // Refresh buddy stats every 5 minutes
    const interval = setInterval(loadBuddyStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [loadBuddyStats])

  // ── Actions ──────────────────────────────────────────────────────────────────

  const handleJoin = async (examType: string, hoursPerDay: number) => {
    if (!userId) return
    setJoining(true)
    try {
      const { data } = await supabase.rpc('match_buddy', {
        p_user_id: userId,
        p_exam_type: examType,
        p_hours: hoursPerDay,
      })
      if (data && data.length > 0) {
        // Matched immediately
        setState({ phase: 'matched', buddyId: data[0].partner_id, examType: data[0].exam_type, pairId: data[0].pair_id })
      } else {
        // Added to queue
        setState({ phase: 'waiting', examType, hoursPerDay })
      }
    } finally {
      setJoining(false)
    }
  }

  const handleCancel = async () => {
    if (!userId) return
    await supabase.from('buddy_requests').delete().eq('user_id', userId)
    setState({ phase: 'no_buddy' })
  }

  const handleDissolve = async () => {
    if (!userId) return
    await supabase.rpc('dissolve_buddy_pair', { p_user_id: userId })
    setBuddyStats(null)
    setState({ phase: 'no_buddy' })
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  if (state.phase === 'loading') return null

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Users size={18} className="text-primary-500" />
          Study Buddy
        </h3>
        {state.phase === 'matched' && (
          <button
            onClick={handleDissolve}
            className="text-[11px] text-gray-400 hover:text-red-400 transition-colors"
          >
            Leave pair
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {state.phase === 'no_buddy' && (
          <motion.div key="no_buddy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <JoinForm activeExam={activeExam} onJoin={handleJoin} joining={joining} />
          </motion.div>
        )}

        {state.phase === 'waiting' && (
          <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <WaitingState examType={state.examType} onCancel={handleCancel} />
          </motion.div>
        )}

        {state.phase === 'matched' && (
          <motion.div key="matched" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {!buddyStats ? (
              <div className="flex justify-center py-4">
                <div className="w-6 h-6 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
              </div>
            ) : (
              <MatchedView
                myMins={myTodayMinutes}
                buddy={buddyStats}
                examType={state.examType}
                onRefresh={loadBuddyStats}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Matched View ─────────────────────────────────────────────────────────────

function MatchedView({
  myMins,
  buddy,
  examType,
  onRefresh,
}: {
  myMins: number
  buddy: BuddyStats
  examType: string
  onRefresh: () => void
}) {
  const delta = getDelta(myMins, buddy.today_minutes)

  return (
    <div className="space-y-4">
      {/* Exam badge */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold bg-primary-50 text-primary-600 px-2.5 py-1 rounded-full">
          {EXAM_LABELS[examType] || examType} Pair
        </span>
        <button onClick={onRefresh} className="text-gray-400 hover:text-gray-600 transition-colors">
          <RefreshCw size={13} />
        </button>
      </div>

      {/* Today's head-to-head */}
      <div className="bg-gray-50 rounded-2xl p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 text-center">Today's Progress</p>

        <div className="grid grid-cols-2 gap-3">
          {/* You */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-lg">🧑‍💻</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tabular-nums">{fmt(myMins)}</span>
            <span className="text-[11px] text-gray-500 font-medium">You</span>
          </div>

          {/* VS divider */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center self-center">
            <span className="text-xs font-black text-gray-300">VS</span>
          </div>

          {/* Buddy */}
          <div className="flex flex-col items-center gap-1">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-lg">🎯</span>
            </div>
            <span className="text-xl font-bold text-gray-900 tabular-nums">{fmt(buddy.today_minutes)}</span>
            <span className="text-[11px] text-gray-500 font-medium">Buddy · Lv.{buddy.level}</span>
          </div>
        </div>

        {/* Delta */}
        <div className={`mt-3 text-center text-xs font-bold ${delta.color}`}>
          {delta.icon} You're {delta.label}
        </div>

        {/* Progress bars */}
        <div className="mt-3 space-y-1.5">
          <ProgressBar value={myMins} max={Math.max(myMins, buddy.today_minutes, 1)} color="bg-primary-500" label="You" />
          <ProgressBar value={buddy.today_minutes} max={Math.max(myMins, buddy.today_minutes, 1)} color="bg-purple-400" label="Buddy" />
        </div>
      </div>

      {/* Buddy stats pills */}
      <div className="grid grid-cols-3 gap-2">
        <StatPill icon={<Flame size={13} />} value={`${buddy.current_streak}d`} label="Streak" />
        <StatPill icon={<Zap size={13} />} value={buddy.xp.toLocaleString()} label="XP" />
        <StatPill icon={<Clock size={13} />} value={`Lv.${buddy.level}`} label={buddy.title} />
      </div>

      {/* Nudge message */}
      {buddy.today_minutes === 0 && (
        <div className="text-xs text-center text-amber-600 bg-amber-50 rounded-lg py-2 px-3 font-medium">
          👻 Your buddy hasn't started today. Get ahead!
        </div>
      )}
      {buddy.today_minutes > myMins && myMins < 30 && (
        <div className="text-xs text-center text-orange-600 bg-orange-50 rounded-lg py-2 px-3 font-medium">
          ⚡ Your buddy is ahead. Time to open that timer!
        </div>
      )}
    </div>
  )
}

function ProgressBar({ value, max, color, label }: { value: number; max: number; color: string; label: string }) {
  const pct = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-gray-400 w-7 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}
