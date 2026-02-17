'use client'

import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useXP } from '@/context/XPContext'
import { useSyllabus } from '@/context/SyllabusContext'
import { getLevelColor, formatXP, LEVELS, ACHIEVEMENTS } from '@/lib/xp'
import { 
  ArrowLeft, Flame, Clock, Brain, Target, Trophy, 
  Share2, Check, TrendingUp, Shield, Smartphone
} from 'lucide-react'
import Link from 'next/link'

const EXAM_LABELS: Record<string, string> = {
  upsc: 'UPSC', ssc: 'SSC CGL', bank: 'Banking', jee: 'JEE', 
  neet: 'NEET', rbi: 'RBI Grade B', custom: 'Custom', focus: 'Focus Mode',
}

export default function ProfilePage() {
  const { stats, levelInfo, nextLevelInfo, loading } = useXP()
  const { activeExam } = useSyllabus()
  const supabase = useMemo(() => createClient(), [])
  const shareCardRef = useRef<HTMLDivElement>(null)
  
  const [userName, setUserName] = useState('Student')
  const [showCopied, setShowCopied] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [targetDate, setTargetDate] = useState<string | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name.split(' ')[0])
      }
      if (user) {
        const { data } = await supabase
          .from('syllabus_settings')
          .select('target_date')
          .eq('user_id', user.id)
          .single()
        if (data?.target_date) setTargetDate(data.target_date)
      }
    }
    getUser()
  }, [supabase])

  const daysLeft = useMemo(() => {
    if (!targetDate) return null
    const now = new Date(); now.setHours(0,0,0,0)
    const target = new Date(targetDate); target.setHours(0,0,0,0)
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff >= 0 ? diff : null
  }, [targetDate])

  const generateImage = useCallback(async (): Promise<Blob | null> => {
    if (!shareCardRef.current) return null
    try {
      const { toBlob } = await import('html-to-image')
      const blob = await toBlob(shareCardRef.current, {
        backgroundColor: '#f9fafb',
        pixelRatio: 2,
        quality: 0.95,
      })
      return blob
    } catch (e) {
      console.error('Image generation failed:', e)
      return null
    }
  }, [])

  const handleShare = async () => {
    setGenerating(true)
    try {
      const blob = await generateImage()
      if (!blob) return

      const file = new File([blob], 'krama-progress.png', { type: 'image/png' })
      
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            title: 'My Krama Progress',
            text: `I'm Level ${levelInfo?.level} ${levelInfo?.title} on Krama! 🔥 ${stats?.current_streak}-day streak.`,
            files: [file]
          })
          return
        } catch {
          // User cancelled — fall through to download
        }
      }
      downloadImage(blob)
    } finally {
      setGenerating(false)
    }
  }

  const handleWhatsAppShare = async () => {
    setGenerating(true)
    try {
      const blob = await generateImage()
      if (!blob) return

      const file = new File([blob], 'krama-progress.png', { type: 'image/png' })
      
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: 'My Krama Progress',
          text: `📚 Level ${levelInfo?.level} ${levelInfo?.title} | ${stats?.current_streak}-day streak | ${Math.round((stats?.total_focus_minutes || 0) / 60)}h studied\n\nTrack your prep at usekrama.com`,
          files: [file]
        })
      } else {
        const text = encodeURIComponent(
          `📚 I'm Level ${levelInfo?.level} ${levelInfo?.title} on Krama!\n🔥 ${stats?.current_streak}-day streak | ${Math.round((stats?.total_focus_minutes || 0) / 60)}h studied\n\nTrack your exam prep: https://usekrama.com`
        )
        window.open(`https://wa.me/?text=${text}`, '_blank')
        downloadImage(blob)
      }
    } finally {
      setGenerating(false)
    }
  }

  const downloadImage = (blob: Blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'krama-progress.png'
    a.click()
    URL.revokeObjectURL(url)
    setShowCopied(true)
    setTimeout(() => setShowCopied(false), 2000)
  }

  if (loading || !stats || !levelInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const colors = getLevelColor(levelInfo.color)
  const totalHours = Math.round(stats.total_focus_minutes / 60)
  const unlockedAchievements = ACHIEVEMENTS.filter(a => stats.achievements.includes(a.id))
  const lockedAchievements = ACHIEVEMENTS.filter(a => !stats.achievements.includes(a.id))
  const examLabel = EXAM_LABELS[activeExam || ''] || activeExam?.toUpperCase() || ''

  return (
    <div className="pb-20">
      <div className="mb-8">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-4">
          <ArrowLeft size={16} /> Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">Progress Card</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          
          {/* SHAREABLE CARD */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Share Your Progress</h2>
              <div className="flex items-center gap-2">
                <button onClick={handleWhatsAppShare} disabled={generating}
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors disabled:opacity-50">
                  <Smartphone size={14} /> WhatsApp
                </button>
                <button onClick={handleShare} disabled={generating}
                  className="btn btn-secondary flex items-center gap-2 text-sm">
                  {generating ? 'Generating...' : showCopied ? <><Check size={14} /> Downloaded</> : <><Share2 size={14} /> Share</>}
                </button>
              </div>
            </div>
            
            <div ref={shareCardRef} className="p-6 bg-gray-50 rounded-xl">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-soft">
                <div className="flex items-center justify-between mb-6">
                  <div className="font-bold text-xl tracking-tight text-gray-900">KRAMA</div>
                  <div className="flex items-center gap-2">
                    {examLabel && (
                      <div className="text-[10px] font-bold uppercase tracking-wider bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full">
                        {examLabel}
                      </div>
                    )}
                    <div className="text-xs font-medium text-gray-400">usekrama.com</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 ${colors.bg} ${colors.border} border-2 rounded-xl flex items-center justify-center`}>
                    <span className={`text-3xl font-bold ${colors.text}`}>{levelInfo.level}</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{userName}</div>
                    <div className={`text-sm font-semibold ${colors.text}`}>{levelInfo.title}</div>
                  </div>
                </div>

                {daysLeft !== null && (
                  <div className="mb-4 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-700">{examLabel} Exam</span>
                    <span className="text-sm font-bold text-amber-700">{daysLeft} days left</span>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="text-2xl font-bold text-gray-900">{formatXP(stats.xp)}</div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase">Total XP</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="text-2xl font-bold text-gray-900">{stats.current_streak}</div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase">Day Streak</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="text-2xl font-bold text-gray-900">{totalHours}h</div>
                    <div className="text-[10px] font-semibold text-gray-400 uppercase">Focus Time</div>
                  </div>
                </div>

                {nextLevelInfo?.nextLevel && (
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-gray-400 mb-1">
                      <span>Progress to Level {nextLevelInfo.nextLevel.level}</span>
                      <span>{nextLevelInfo.progress}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all"
                        style={{ width: `${nextLevelInfo.progress}%` }} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ACHIEVEMENTS */}
          <div className="card">
            <h2 className="font-bold text-lg mb-6 flex items-center gap-2 text-gray-900">
              <Trophy size={20} className="text-primary-500" /> Achievements
            </h2>
            {unlockedAchievements.length > 0 && (
              <div className="mb-6">
                <div className="text-xs font-semibold text-gray-400 uppercase mb-3">Unlocked ({unlockedAchievements.length})</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {unlockedAchievements.map(a => (
                    <div key={a.id} className="p-4 bg-primary-50 border border-primary-200 rounded-xl text-center">
                      <div className="text-3xl mb-2">{a.icon}</div>
                      <div className="font-semibold text-sm text-gray-900">{a.name}</div>
                      <div className="text-[10px] text-gray-500">{a.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {lockedAchievements.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase mb-3">Locked ({lockedAchievements.length})</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {lockedAchievements.map(a => (
                    <div key={a.id} className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center opacity-50">
                      <div className="text-3xl mb-2 grayscale">🔒</div>
                      <div className="font-semibold text-sm text-gray-900">{a.name}</div>
                      <div className="text-[10px] text-gray-500">{a.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <div className={`${colors.bg} border ${colors.border} rounded-2xl p-6`}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-20 h-20 bg-white border-2 ${colors.border} rounded-xl flex items-center justify-center`}>
                <span className={`text-4xl font-bold ${colors.text}`}>{levelInfo.level}</span>
              </div>
              <div>
                <div className={`text-2xl font-bold ${colors.text}`}>{levelInfo.title}</div>
                <div className="text-sm font-medium text-gray-600">{formatXP(stats.xp)} XP total</div>
              </div>
            </div>
            {nextLevelInfo?.nextLevel && (
              <div className="bg-white/50 p-3 rounded-lg">
                <div className="text-xs font-semibold text-gray-600 mb-2">
                  {nextLevelInfo.xpNeeded} XP to {nextLevelInfo.nextLevel.title}
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${colors.text.replace('text-', 'bg-')}`}
                    style={{ width: `${nextLevelInfo.progress}%` }} />
                </div>
              </div>
            )}
          </div>

          {/* STREAK INSURANCE */}
          <div className="card">
            <h3 className="font-bold text-sm text-gray-900 uppercase mb-3 flex items-center gap-2">
              <Shield size={16} className="text-blue-500" /> Streak Insurance
            </h3>
            <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div>
                <div className="text-sm font-medium text-blue-700">Freezes Available</div>
                <div className="text-[10px] text-blue-500">Miss 1 day without losing streak</div>
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {stats.streak_freezes_remaining ?? 1}
              </div>
            </div>
            {stats.streak_freeze_used_at && (
              <div className="mt-2 text-[10px] text-gray-400">
                Last used: {new Date(stats.streak_freeze_used_at).toLocaleDateString('en-IN')}
              </div>
            )}
          </div>

          {/* STATS */}
          <div className="card space-y-4">
            <h3 className="font-bold text-sm text-gray-900 uppercase">Statistics</h3>
            {[
              { icon: Flame, color: 'text-orange-500', label: 'Current Streak', value: stats.current_streak },
              { icon: TrendingUp, color: 'text-green-500', label: 'Longest Streak', value: stats.longest_streak },
              { icon: Clock, color: 'text-blue-500', label: 'Focus Time', value: `${totalHours}h` },
              { icon: Brain, color: 'text-purple-500', label: 'Reviews Done', value: stats.total_reviews },
              { icon: Target, color: 'text-red-500', label: 'Mocks Logged', value: stats.total_mocks },
            ].map(({ icon: Icon, color, label, value }) => (
              <div key={label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <Icon className={color} size={20} />
                  <span className="font-medium text-gray-700">{label}</span>
                </div>
                <span className="font-bold text-xl text-gray-900">{value}</span>
              </div>
            ))}
          </div>

          {/* ALL LEVELS */}
          <div className="card">
            <h3 className="font-bold text-sm text-gray-900 uppercase mb-4">All Levels</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {LEVELS.map(level => {
                const lvlColors = getLevelColor(level.color)
                const isCurrentOrPast = stats.xp >= level.xp
                const isCurrent = levelInfo.level === level.level
                return (
                  <div key={level.level}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      isCurrent ? `${lvlColors.bg} border ${lvlColors.border}` : 
                      isCurrentOrPast ? 'bg-gray-50' : 'opacity-40'
                    }`}>
                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${isCurrent ? lvlColors.text : 'text-gray-400'}`}>{level.level}</span>
                      <span className={`font-medium text-sm ${isCurrent ? lvlColors.text : ''}`}>{level.title}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-400">{formatXP(level.xp)} XP</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
