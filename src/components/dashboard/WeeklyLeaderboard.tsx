'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useXP } from '@/context/XPContext'
import { Trophy, Medal, Crown, ChevronUp } from 'lucide-react'
import { getLevelColor } from '@/lib/xp'
import { motion, AnimatePresence } from 'framer-motion'

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
  const [toppers, setToppers] = useState<any[]>([])
  const [showToppers, setShowToppers] = useState(true)

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

  if (loading || entries.length < 1) return null

  const visibleEntries = expanded ? entries : entries.slice(0, 5)
  const currentUserRank = entries.find(e => e.isCurrentUser)?.rank

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={14} className="text-amber-500" />
    if (rank === 2) return <Medal size={14} className="text-gray-400" />
    if (rank === 3) return <Medal size={14} className="text-amber-700" />
    return <span className="text-[11px] font-bold text-gray-400 w-3.5 text-center">{rank}</span>
  }


  const BADGE: any = { qualifier:{label:'Qualifier',bg:'bg-blue-50',text:'text-blue-700',border:'border-blue-200',icon:'🎯'}, finalist:{label:'Finalist',bg:'bg-purple-50',text:'text-purple-700',border:'border-purple-200',icon:'⭐'}, achiever:{label:'Achiever',bg:'bg-amber-50',text:'text-amber-700',border:'border-amber-200',icon:'🏅'}, legend:{label:'Legend',bg:'bg-yellow-50',text:'text-amber-800',border:'border-amber-300',icon:'👑'} }
  const EXAM_L: any = { upsc:'UPSC', jee:'JEE', neet:'NEET', ssc:'SSC', bank:'Banking', rbi:'RBI' }
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


      {toppers.length > 0 && (
        <div className="mb-4">
          <button onClick={() => setShowToppers(v => !v)} className="w-full flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">⭐ Benchmarks · Toppers</span>
            <span className={`text-gray-400 text-xs inline-block transition-transform duration-200 ${showToppers ? '' : 'rotate-180'}`}>▲</span>
          </button>
          <AnimatePresence initial={false}>
            {showToppers && (
              <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} className="overflow-hidden space-y-1.5">
                {toppers.map((t,i) => { const cfg=BADGE[t.topper_badge]||BADGE.qualifier; const exam=EXAM_L[t.topper_exam]||(t.topper_exam||'').toUpperCase(); return (
                  <motion.div key={t.user_id} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.06}}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                    <div className="w-8 h-8 rounded-lg bg-white/70 flex items-center justify-center text-base shrink-0">{cfg.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs font-bold ${cfg.text} truncate`}>{t.display_name||`${exam} ${cfg.label}`}</div>
                      <div className={`text-[10px] ${cfg.text} opacity-70`}>{exam}{t.topper_year?` · ${t.topper_year}`:''}{t.topper_rank?` · ${t.topper_rank}`:''}</div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.text} ${cfg.border} shrink-0`}>{cfg.label}</span>
                  </motion.div>
                )})}
                <div className="text-[10px] text-center text-gray-400 py-1">💡 These toppers study daily. Can you match them?</div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="h-px bg-gray-100 mt-3 mb-3" />
        </div>
      )}

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
