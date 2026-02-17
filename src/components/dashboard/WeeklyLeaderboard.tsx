'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useXP } from '@/context/XPContext'
import { Trophy, Medal, Crown, ChevronUp } from 'lucide-react'
import { getLevelColor } from '@/lib/xp'
import { motion } from 'framer-motion'

type LeaderboardEntry = {
  rank: number
  display_name: string
  xp: number
  level: number
  title: string
  isCurrentUser: boolean
}

export default function WeeklyLeaderboard() {
  const supabase = useMemo(() => createClient(), [])
  const { stats } = useXP()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      // Fetch top 20 users by XP (total, not weekly — simpler and works on free tier)
      const { data, error } = await supabase
        .from('user_stats')
        .select('user_id, xp, level, title')
        .order('xp', { ascending: false })
        .limit(20)

      if (error || !data) { setLoading(false); return }

      // Get display names from auth (we use user_metadata.full_name)
      // Since we can't join auth.users from client, we'll show level titles instead
      const mapped: LeaderboardEntry[] = data.map((entry, i) => ({
        rank: i + 1,
        display_name: entry.title || 'Student', // Use level title as display
        xp: entry.xp,
        level: entry.level,
        title: entry.title || 'Beginner',
        isCurrentUser: entry.user_id === user.id,
      }))

      setEntries(mapped)
      setLoading(false)
    }
    fetchLeaderboard()
  }, [supabase])

  if (loading || entries.length < 3) return null

  const visibleEntries = expanded ? entries : entries.slice(0, 5)
  const currentUserRank = entries.find(e => e.isCurrentUser)?.rank

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={14} className="text-amber-500" />
    if (rank === 2) return <Medal size={14} className="text-gray-400" />
    if (rank === 3) return <Medal size={14} className="text-amber-700" />
    return <span className="text-[11px] font-bold text-gray-400 w-3.5 text-center">{rank}</span>
  }

  return (
    <div className="card">
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
