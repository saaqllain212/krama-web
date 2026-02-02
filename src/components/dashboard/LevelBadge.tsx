'use client'

import { useXP } from '@/context/XPContext'
import { getLevelColor, formatXP } from '@/lib/xp'
import { Zap, ChevronRight } from 'lucide-react'
import Link from 'next/link'

type LevelBadgeProps = {
  variant?: 'compact' | 'full' | 'mini'
  showProgress?: boolean
  clickable?: boolean
}

export default function LevelBadge({ variant = 'compact', showProgress = true, clickable = true }: LevelBadgeProps) {
  const { stats, levelInfo, nextLevelInfo, loading } = useXP()

  if (loading || !stats || !levelInfo) {
    return (
      <div className={`animate-pulse bg-stone-100 rounded ${
        variant === 'mini' ? 'h-6 w-16' : 'h-12 w-full'
      }`} />
    )
  }

  const colors = getLevelColor(levelInfo.color)

  // Mini variant - just the level number
  if (variant === 'mini') {
    return (
      <div className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-black ${colors.bg} ${colors.text} rounded`}>
        <Zap size={10} />
        Lv.{levelInfo.level}
      </div>
    )
  }

  const content = (
    <div className={`${colors.bg} border-2 ${colors.border} p-3 transition-all ${
      clickable ? 'hover:shadow-[3px_3px_0_0_#000] cursor-pointer' : ''
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`${colors.text} font-black text-2xl`}>
            {levelInfo.level}
          </div>
          <div>
            <div className={`font-black text-sm ${colors.text}`}>{levelInfo.title}</div>
            <div className="text-xs font-bold text-black/40">{formatXP(stats.xp)} XP</div>
          </div>
        </div>
        {clickable && <ChevronRight size={18} className="text-black/30" />}
      </div>

      {/* Progress Bar */}
      {showProgress && nextLevelInfo?.nextLevel && (
        <div className="mt-3">
          <div className="flex justify-between text-[10px] font-bold text-black/40 mb-1">
            <span>Lv.{levelInfo.level}</span>
            <span>{nextLevelInfo.xpNeeded} XP to Lv.{nextLevelInfo.nextLevel.level}</span>
          </div>
          <div className="h-2 bg-black/10 rounded-full overflow-hidden">
            <div 
              className={`h-full ${levelInfo.color === 'brand' ? 'bg-black' : colors.text.replace('text-', 'bg-')} transition-all duration-500`}
              style={{ width: `${nextLevelInfo.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )

  if (clickable) {
    return <Link href="/dashboard/profile">{content}</Link>
  }

  return content
}

// Compact inline version for headers
export function LevelBadgeInline() {
  const { stats, levelInfo, loading } = useXP()

  if (loading || !stats || !levelInfo) {
    return <div className="animate-pulse bg-stone-200 h-6 w-20 rounded" />
  }

  const colors = getLevelColor(levelInfo.color)

  return (
    <Link 
      href="/dashboard/profile"
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-black ${colors.bg} ${colors.text} border ${colors.border} hover:shadow-[2px_2px_0_0_#000] transition-all`}
    >
      <Zap size={12} />
      <span>Lv.{levelInfo.level}</span>
      <span className="text-black/40">•</span>
      <span>{levelInfo.title}</span>
    </Link>
  )
}
