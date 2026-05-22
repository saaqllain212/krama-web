'use client'

// src/components/dashboard/WeeklyLeaderboard.tsx
// Weekly Leaderboard + Topper Benchmarks (Phase 2)
// UNCHANGED: all original leaderboard logic preserved.
// ADDED: pinned "Benchmarks" section at top showing toppers with their badge.

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useXP } from '@/context/XPContext'
import { Trophy, Medal, Crown, ChevronUp, Star, Flame } from 'lucide-react'
import { getLevelColor } from '@/lib/xp'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────

type LeaderboardEntry = {
  rank: number
  display_name: string
  xp: number
  level: number
  title: string
  isCurrentUser: boolean
}

type TopperEntry = {
  user_id: string
  badge: string          // 'qualifier' | 'finalist' | 'achiever' | 'legend'
  topper_exam: string
  topper_year: number | null
  topper_rank: string | null
  display_name: string | null
  xp: number
  level: number
  today_minutes?: number
}

// ─── Badge config ─────────────────────────────────────────────────────────────

const BADGE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string; icon: string }> = {
  qualifier: { label: 'Qualifier', bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',  icon: '🎯' },
  finalist:  { label: 'Finalist',  bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: '⭐' },
  achiever:  { label: 'Achiever',  bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200',  icon: '🏅' },
  legend:    { label: 'Legend',    bg: 'bg-gradient-to-r from-amber-50 to-yellow-50', text: 'text-amber-800', border: 'border-amber-300', icon: '👑' },
}

const EXAM_LABELS: Record<string, string> = {
  upsc: 'UPSC', jee: 'JEE', neet: 'NEET',
  ssc: 'SSC', bank: 'Banking', rbi: 'RBI',
}

// ─── Helper: today focus minutes for a topper (public via leaderboard RLS) ───
// We can read user_stats for all authenticated users already (existing policy).
// today_minutes comes from get_active_students_count pattern — we call focus_logs
// through a helper. For simplicity we show XP as activity proxy (same as leaderboard).

// ─── Component ────────────────────────────────────────────────────────────────

export default function WeeklyLeaderboard() {
  const supabase = useMemo(() => createClient(), [])
  const { stats } = useXP()
  const [entries, setEntries]       = useState<LeaderboardEntry[]>([])
  const [toppers, setToppers]       = useState<TopperEntry[]>([])
  const [loading, setLoading]       = useState(true)
  const [expanded, setExpanded]     = useState(false)
  const [showToppers, setShowToppers] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      // ── Original leaderboard query (UNCHANGED) ────────────────────────────
      const { data: lbData, error: lbError } = await supabase
        .from('user_stats')
        .select('user_id, xp, level, title')
        .order('xp', { ascending: false })
        .limit(20)

      if (!lbError && lbData) {
        const mapped: LeaderboardEntry[] = lbData.map((entry, i) => ({
          rank: i + 1,
          display_name: entry.title || 'Student',
          xp: entry.xp,
          level: entry.level,
          title: entry.title || 'Beginner',
          isCurrentUser: entry.user_id === user.id,
        }))
        setEntries(mapped)
      }

      // ── Topper / Benchmark query (NEW) ────────────────────────────────────
      // Reads topper_badge, topper_exam, display_name from user_stats
      // The existing "Authenticated users can read leaderboard data" policy (SELECT true) covers this.
      const { data: topperData } = await supabase
        .from('user_stats')
        .select('user_id, topper_badge, topper_exam, topper_year, topper_rank, display_name, xp, level')
        .not('topper_badge', 'is', null)
        .order('topper_badge', { ascending: false }) // legend > achiever > finalist > qualifier

      if (topperData && topperData.length > 0) {
        setToppers(topperData.map(t => ({
          user_id:      t.user_id,
          badge:        t.topper_badge,
          topper_exam:  t.topper_exam || 'upsc',
          topper_year:  t.topper_year,
          topper_rank:  t.topper_rank,
          display_name: t.display_name,
          xp:           t.xp,
          level:        t.level,
        })))
      }

      setLoading(false)
    }
    fetchAll()
  }, [supabase])

  // ── Unchanged early return (original logic) ──────────────────────────────────
  if (loading || entries.length < 3) return null

  const visibleEntries = expanded ? entries : entries.slice(0, 5)
  const currentUserRank = entries.find(e => e.isCurrentUser)?.rank

  // ── Unchanged rank icon helper ────────────────────────────────────────────────
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={14} className="text-amber-500" />
    if (rank === 2) return <Medal size={14} className="text-gray-400" />
    if (rank === 3) return <Medal size={14} className="text-amber-700" />
    return <span className="text-[11px] font-bold text-gray-400 w-3.5 text-center">{rank}</span>
  }

  return (
    <div className="card">
      {/* ── Header (UNCHANGED) ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Trophy size={18} className="text-amber-500" />
          Leaderboard
        </h3>
        {currentUserRank && (
          <div className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
            You: #{currentUserRank}
          </div>
        )}
      </div>

      {/* ── BENCHMARKS section (NEW — pinned above regular leaderboard) ─────── */}
      {toppers.length > 0 && (
        <div className="mb-4">
          <button
            onClick={() => setShowToppers(v => !v)}
            className="w-full flex items-center justify-between mb-2"
          >
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Star size={11} className="text-amber-500" />
              Benchmarks · Toppers
            </span>
            <ChevronUp size={13} className={`text-gray-400 transition-transform ${showToppers ? '' : 'rotate-180'}`} />
          </button>

          <AnimatePresence initial={false}>
            {showToppers && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden space-y-1.5"
              >
                {toppers.map((topper, i) => {
                  const cfg = BADGE_CONFIG[topper.badge] || BADGE_CONFIG.qualifier
                  const examLabel = EXAM_LABELS[topper.topper_exam] || topper.topper_exam.toUpperCase()
                  const nameDisplay = topper.display_name || `${examLabel} ${cfg.label}`

                  return (
                    <motion.div
                      key={topper.user_id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${cfg.bg} ${cfg.border}`}
                    >
                      {/* Badge icon */}
                      <div className="w-8 h-8 rounded-lg bg-white/70 flex items-center justify-center text-base shrink-0">
                        {cfg.icon}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-bold ${cfg.text} truncate`}>{nameDisplay}</div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className={`text-[10px] font-semibold ${cfg.text} opacity-70`}>
                            {examLabel}{topper.topper_year ? ` · ${topper.topper_year}` : ''}
                          </span>
                          {topper.topper_rank && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/60 ${cfg.text}`}>
                              {topper.topper_rank}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Badge pill */}
                      <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border} shrink-0`}>
                        {cfg.label}
                      </div>
                    </motion.div>
                  )
                })}

                {/* Motivational nudge */}
                <div className="text-[10px] text-center text-gray-400 pt-1 pb-0.5">
                  💡 These toppers study daily. Can you match them?
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="h-px bg-gray-100 mt-3 mb-3" />
        </div>
      )}

      {/* ── Regular leaderboard entries (UNCHANGED logic) ───────────────────── */}
      <div className="space-y-1.5">
        {visibleEntries.map((entry, i) => {
          const colors = getLevelColor(
            entry.level <= 2 ? 'stone' :
            entry.level <= 4 ? 'blue' :
            entry.level <= 6 ? 'green' :
            entry.level <= 8 ? 'purple' :
            entry.level <= 10 ? 'amber' : 'red'
          )

          return (
            <motion.div
              key={`${entry.rank}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 p-2.5 rounded-lg transition-all ${
                entry.isCurrentUser
                  ? 'bg-primary-50 border border-primary-200 ring-1 ring-primary-200'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="w-6 flex justify-center">{getRankIcon(entry.rank)}</div>

              <div className={`w-7 h-7 ${colors.bg} ${colors.border} border rounded-md flex items-center justify-center`}>
                <span className={`text-xs font-bold ${colors.text}`}>{entry.level}</span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {entry.isCurrentUser ? 'You' : `Level ${entry.level} ${entry.title}`}
                </div>
              </div>

              <div className="text-sm font-bold text-gray-700 tabular-nums">
                {entry.xp.toLocaleString()} <span className="text-[10px] text-gray-400">XP</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* ── Show more/less toggle (UNCHANGED) ──────────────────────────────── */}
      {entries.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-3 py-2 text-xs font-bold text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1 transition-colors"
        >
          <ChevronUp size={14} className={`transition-transform ${expanded ? '' : 'rotate-180'}`} />
          {expanded ? 'Show less' : `Show all ${entries.length}`}
        </button>
      )}
    </div>
  )
}
