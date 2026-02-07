'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useXP } from '@/context/XPContext'
import { getLevelColor, formatXP, LEVELS, ACHIEVEMENTS } from '@/lib/xp'
import { 
  ArrowLeft, Zap, Flame, Clock, Brain, Target, Trophy, 
  Share2, Download, Check, Calendar, TrendingUp 
} from 'lucide-react'
import Link from 'next/link'
import html2canvas from 'html2canvas'

export default function ProfilePage() {
  const { stats, levelInfo, nextLevelInfo, loading } = useXP()
  const supabase = createClient()
  const shareCardRef = useRef<HTMLDivElement>(null)
  
  const [userName, setUserName] = useState('Student')
  const [showCopied, setShowCopied] = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.full_name) {
        setUserName(user.user_metadata.full_name.split(' ')[0])
      }
    }
    getUser()
  }, [supabase])

  const handleShare = async () => {
    if (!shareCardRef.current) return
    
    setGenerating(true)
    try {
      const canvas = await html2canvas(shareCardRef.current, {
        backgroundColor: '#f9fafb',
        scale: 2,
      })
      
      canvas.toBlob(async (blob) => {
        if (!blob) return
        
        const file = new File([blob], 'krama-progress.png', { type: 'image/png' })
        
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: 'My Krama Progress',
              text: `I'm Level ${levelInfo?.level} ${levelInfo?.title} on Krama! 🔥`,
              files: [file]
            })
          } catch (e) {
            downloadImage(blob)
          }
        } else {
          downloadImage(blob)
        }
      })
    } catch (e) {
      console.error('Share failed:', e)
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const colors = getLevelColor(levelInfo.color)
  const totalHours = Math.round(stats.total_focus_minutes / 60)
  const unlockedAchievements = ACHIEVEMENTS.filter(a => stats.achievements.includes(a.id))
  const lockedAchievements = ACHIEVEMENTS.filter(a => !stats.achievements.includes(a.id))

  return (
    <div className="pb-20">
      {/* HEADER */}
      <div className="mb-8">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-700 transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Dashboard
        </Link>
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Your Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN - Share Card */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SHAREABLE CARD */}
          <div className="card overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">Progress Card</h2>
              <button
                onClick={handleShare}
                disabled={generating}
                className="btn btn-primary flex items-center gap-2 text-xs disabled:opacity-50"
              >
                {generating ? (
                  'Generating...'
                ) : showCopied ? (
                  <><Check size={14} /> Downloaded</>
                ) : (
                  <><Share2 size={14} /> Share</>
                )}
              </button>
            </div>
            
            {/* The actual card to be captured */}
            <div ref={shareCardRef} className="p-8 bg-gray-50">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-soft">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="font-bold text-xl tracking-tight text-gray-900">KRAMA</div>
                  <div className="text-xs font-medium text-gray-400">usekrama.com</div>
                </div>

                {/* Level & Name */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 ${colors.bg} border-2 ${colors.border} rounded-xl flex items-center justify-center`}>
                    <span className={`text-3xl font-bold ${colors.text}`}>{levelInfo.level}</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{userName}</div>
                    <div className={`text-sm font-semibold ${colors.text}`}>{levelInfo.title}</div>
                  </div>
                </div>

                {/* Stats Grid */}
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

                {/* Progress to next level */}
                {nextLevelInfo?.nextLevel && (
                  <div>
                    <div className="flex justify-between text-xs font-medium text-gray-400 mb-1">
                      <span>Progress to Level {nextLevelInfo.nextLevel.level}</span>
                      <span>{nextLevelInfo.progress}%</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${colors.text.replace('text-', 'bg-')}`}
                        style={{ width: `${nextLevelInfo.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ACHIEVEMENTS */}
          <div className="card p-6">
            <h2 className="font-bold text-lg mb-6 flex items-center gap-2 text-gray-900">
              <Trophy size={20} /> Achievements
            </h2>
            
            {/* Unlocked */}
            {unlockedAchievements.length > 0 && (
              <div className="mb-6">
                <div className="text-xs font-semibold text-gray-400 uppercase mb-3">Unlocked ({unlockedAchievements.length})</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {unlockedAchievements.map(achievement => (
                    <div key={achievement.id} className="p-4 bg-primary-50 border border-primary-200 rounded-xl text-center">
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <div className="font-semibold text-sm text-gray-900">{achievement.name}</div>
                      <div className="text-[10px] text-gray-500">{achievement.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Locked */}
            {lockedAchievements.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase mb-3">Locked ({lockedAchievements.length})</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {lockedAchievements.map(achievement => (
                    <div key={achievement.id} className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center opacity-50">
                      <div className="text-3xl mb-2 grayscale">🔒</div>
                      <div className="font-semibold text-sm text-gray-900">{achievement.name}</div>
                      <div className="text-[10px] text-gray-500">{achievement.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN - Stats */}
        <div className="space-y-6">
          
          {/* LEVEL CARD */}
          <div className={`${colors.bg} border-2 ${colors.border} p-6 rounded-2xl`}>
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
                <div className="text-xs font-medium text-gray-600 mb-2">
                  {nextLevelInfo.xpNeeded} XP to {nextLevelInfo.nextLevel.title}
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${colors.text.replace('text-', 'bg-')}`}
                    style={{ width: `${nextLevelInfo.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* STATS BREAKDOWN */}
          <div className="card p-6 space-y-3">
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider">Statistics</h3>
            
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <Flame className="text-orange-500" size={20} />
                <span className="font-medium text-gray-700">Current Streak</span>
              </div>
              <span className="font-bold text-xl text-gray-900">{stats.current_streak}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-green-500" size={20} />
                <span className="font-medium text-gray-700">Longest Streak</span>
              </div>
              <span className="font-bold text-xl text-gray-900">{stats.longest_streak}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <Clock className="text-blue-500" size={20} />
                <span className="font-medium text-gray-700">Focus Time</span>
              </div>
              <span className="font-bold text-xl text-gray-900">{totalHours}h</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <Brain className="text-purple-500" size={20} />
                <span className="font-medium text-gray-700">Reviews Done</span>
              </div>
              <span className="font-bold text-xl text-gray-900">{stats.total_reviews}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-3">
                <Target className="text-red-500" size={20} />
                <span className="font-medium text-gray-700">Mocks Logged</span>
              </div>
              <span className="font-bold text-xl text-gray-900">{stats.total_mocks}</span>
            </div>
          </div>

          {/* ALL LEVELS */}
          <div className="card p-6">
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider mb-4">All Levels</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {LEVELS.map(level => {
                const lvlColors = getLevelColor(level.color)
                const isCurrentOrPast = stats.xp >= level.xp
                const isCurrent = levelInfo.level === level.level
                
                return (
                  <div 
                    key={level.level}
                    className={`flex items-center justify-between p-2 rounded-lg ${
                      isCurrent ? `${lvlColors.bg} border-2 ${lvlColors.border}` : 
                      isCurrentOrPast ? 'bg-gray-50' : 'opacity-40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`font-bold ${isCurrent ? lvlColors.text : 'text-gray-400'}`}>
                        {level.level}
                      </span>
                      <span className={`font-medium text-sm ${isCurrent ? lvlColors.text : ''}`}>
                        {level.title}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-gray-400">
                      {formatXP(level.xp)} XP
                    </span>
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
