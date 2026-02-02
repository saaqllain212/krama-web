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
        backgroundColor: '#FBF9F6',
        scale: 2,
      })
      
      canvas.toBlob(async (blob) => {
        if (!blob) return
        
        const file = new File([blob], 'krama-progress.png', { type: 'image/png' })
        
        // Try native share first (check if sharing files is supported)
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              title: 'My Krama Progress',
              text: `I'm Level ${levelInfo?.level} ${levelInfo?.title} on Krama! 🔥`,
              files: [file]
            })
          } catch (e) {
            // User cancelled or share failed, download instead
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
      <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const colors = getLevelColor(levelInfo.color)
  const totalHours = Math.round(stats.total_focus_minutes / 60)
  const unlockedAchievements = ACHIEVEMENTS.filter(a => stats.achievements.includes(a.id))
  const lockedAchievements = ACHIEVEMENTS.filter(a => !stats.achievements.includes(a.id))

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-black pb-20">
      {/* HEADER */}
      <div className="mb-8">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-sm font-bold text-black/40 hover:text-black transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Dashboard
        </Link>
        <h1 className="text-4xl font-black tracking-tight">Your Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN - Share Card */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SHAREABLE CARD */}
          <div className="bg-white border-2 border-black shadow-[6px_6px_0_0_#000] overflow-hidden">
            <div className="p-4 border-b-2 border-black bg-stone-50 flex items-center justify-between">
              <h2 className="font-black uppercase">Progress Card</h2>
              <button
                onClick={handleShare}
                disabled={generating}
                className="flex items-center gap-2 bg-black text-white px-4 py-2 text-xs font-bold uppercase hover:bg-stone-800 disabled:opacity-50"
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
            <div ref={shareCardRef} className="p-8 bg-[#FBF9F6]">
              <div className="bg-white border-2 border-black p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="font-black text-xl tracking-tight">KRAMA</div>
                  <div className="text-xs font-bold text-black/40">usekrama.com</div>
                </div>

                {/* Level & Name */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 ${colors.bg} border-2 ${colors.border} flex items-center justify-center`}>
                    <span className={`text-3xl font-black ${colors.text}`}>{levelInfo.level}</span>
                  </div>
                  <div>
                    <div className="text-2xl font-black">{userName}</div>
                    <div className={`text-sm font-bold ${colors.text}`}>{levelInfo.title}</div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-stone-50 border border-stone-200">
                    <div className="text-2xl font-black">{formatXP(stats.xp)}</div>
                    <div className="text-[10px] font-bold text-black/40 uppercase">Total XP</div>
                  </div>
                  <div className="text-center p-3 bg-stone-50 border border-stone-200">
                    <div className="text-2xl font-black">{stats.current_streak}</div>
                    <div className="text-[10px] font-bold text-black/40 uppercase">Day Streak</div>
                  </div>
                  <div className="text-center p-3 bg-stone-50 border border-stone-200">
                    <div className="text-2xl font-black">{totalHours}h</div>
                    <div className="text-[10px] font-bold text-black/40 uppercase">Focus Time</div>
                  </div>
                </div>

                {/* Progress to next level */}
                {nextLevelInfo?.nextLevel && (
                  <div>
                    <div className="flex justify-between text-xs font-bold text-black/40 mb-1">
                      <span>Progress to Level {nextLevelInfo.nextLevel.level}</span>
                      <span>{nextLevelInfo.progress}%</span>
                    </div>
                    <div className="h-3 bg-stone-200 border border-stone-300">
                      <div 
                        className="h-full bg-brand"
                        style={{ width: `${nextLevelInfo.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ACHIEVEMENTS */}
          <div className="bg-white border-2 border-black shadow-[4px_4px_0_0_#000] p-6">
            <h2 className="font-black text-lg mb-6 flex items-center gap-2">
              <Trophy size={20} /> Achievements
            </h2>
            
            {/* Unlocked */}
            {unlockedAchievements.length > 0 && (
              <div className="mb-6">
                <div className="text-xs font-bold text-black/40 uppercase mb-3">Unlocked ({unlockedAchievements.length})</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {unlockedAchievements.map(achievement => (
                    <div key={achievement.id} className="p-4 bg-brand/10 border-2 border-brand text-center">
                      <div className="text-3xl mb-2">{achievement.icon}</div>
                      <div className="font-bold text-sm">{achievement.name}</div>
                      <div className="text-[10px] text-black/50">{achievement.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Locked */}
            {lockedAchievements.length > 0 && (
              <div>
                <div className="text-xs font-bold text-black/40 uppercase mb-3">Locked ({lockedAchievements.length})</div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {lockedAchievements.map(achievement => (
                    <div key={achievement.id} className="p-4 bg-stone-100 border border-stone-200 text-center opacity-50">
                      <div className="text-3xl mb-2 grayscale">🔒</div>
                      <div className="font-bold text-sm">{achievement.name}</div>
                      <div className="text-[10px] text-black/50">{achievement.description}</div>
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
          <div className={`${colors.bg} border-2 ${colors.border} p-6`}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-20 h-20 bg-white border-2 ${colors.border} flex items-center justify-center`}>
                <span className={`text-4xl font-black ${colors.text}`}>{levelInfo.level}</span>
              </div>
              <div>
                <div className={`text-2xl font-black ${colors.text}`}>{levelInfo.title}</div>
                <div className="text-sm font-bold text-black/50">{formatXP(stats.xp)} XP total</div>
              </div>
            </div>
            
            {nextLevelInfo?.nextLevel && (
              <div className="bg-white/50 p-3 rounded">
                <div className="text-xs font-bold text-black/50 mb-2">
                  {nextLevelInfo.xpNeeded} XP to {nextLevelInfo.nextLevel.title}
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${colors.text.replace('text-', 'bg-')}`}
                    style={{ width: `${nextLevelInfo.progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* STATS BREAKDOWN */}
          <div className="bg-white border-2 border-black shadow-[4px_4px_0_0_#000] p-6 space-y-4">
            <h3 className="font-black uppercase text-sm">Statistics</h3>
            
            <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200">
              <div className="flex items-center gap-3">
                <Flame className="text-orange-500" size={20} />
                <span className="font-bold">Current Streak</span>
              </div>
              <span className="font-black text-xl">{stats.current_streak}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200">
              <div className="flex items-center gap-3">
                <TrendingUp className="text-green-500" size={20} />
                <span className="font-bold">Longest Streak</span>
              </div>
              <span className="font-black text-xl">{stats.longest_streak}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200">
              <div className="flex items-center gap-3">
                <Clock className="text-blue-500" size={20} />
                <span className="font-bold">Focus Time</span>
              </div>
              <span className="font-black text-xl">{totalHours}h</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200">
              <div className="flex items-center gap-3">
                <Brain className="text-purple-500" size={20} />
                <span className="font-bold">Reviews Done</span>
              </div>
              <span className="font-black text-xl">{stats.total_reviews}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-stone-50 border border-stone-200">
              <div className="flex items-center gap-3">
                <Target className="text-red-500" size={20} />
                <span className="font-bold">Mocks Logged</span>
              </div>
              <span className="font-black text-xl">{stats.total_mocks}</span>
            </div>
          </div>

          {/* ALL LEVELS */}
          <div className="bg-white border-2 border-black shadow-[4px_4px_0_0_#000] p-6">
            <h3 className="font-black uppercase text-sm mb-4">All Levels</h3>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {LEVELS.map(level => {
                const lvlColors = getLevelColor(level.color)
                const isCurrentOrPast = stats.xp >= level.xp
                const isCurrent = levelInfo.level === level.level
                
                return (
                  <div 
                    key={level.level}
                    className={`flex items-center justify-between p-2 rounded ${
                      isCurrent ? `${lvlColors.bg} border-2 ${lvlColors.border}` : 
                      isCurrentOrPast ? 'bg-stone-50' : 'opacity-40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`font-black ${isCurrent ? lvlColors.text : 'text-black/30'}`}>
                        {level.level}
                      </span>
                      <span className={`font-bold text-sm ${isCurrent ? lvlColors.text : ''}`}>
                        {level.title}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-black/40">
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