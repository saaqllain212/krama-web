'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, Timer, RotateCw, Map, LineChart, LogOut,
  Trophy, Sparkles, Brain
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useSyllabus } from '@/context/SyllabusContext'
import { useAppConfig } from '@/context/AppConfigContext'
import LevelBadge from '@/components/dashboard/LevelBadge'

// Each nav item maps to a feature flag key (null = always visible)
const NAV_ITEMS = [
  { label: 'Overview',       href: '/dashboard',           icon: LayoutDashboard, flag: null,                       isPro: false },
  { label: 'Focus Mode',     href: '/dashboard/focus',     icon: Timer,           flag: 'feature_focus_enabled',    isPro: false },
  { label: 'Spaced Review',  href: '/dashboard/review',    icon: RotateCw,        flag: 'feature_review_enabled',   isPro: true },
  { label: 'Syllabus Map',   href: '/dashboard/syllabus',  icon: Map,             flag: null,                       isPro: false },
  { label: 'Mock Scores',    href: '/dashboard/mocks',     icon: LineChart,        flag: 'feature_mocks_enabled',   isPro: true },
  { label: 'Analytics',      href: '/dashboard/insights',  icon: Sparkles,        flag: 'feature_insights_enabled', isPro: true },
  { label: 'AI MCQ Gen',     href: '/dashboard/mcq',       icon: Brain,           flag: 'feature_mcq_enabled',     isPro: false },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const { activeExam, stats } = useSyllabus()
  const { config } = useAppConfig()
  
  const [userName, setUserName] = useState('')
  const [userInitial, setUserInitial] = useState('U')

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.user_metadata?.full_name) {
        const name = user.user_metadata.full_name
        setUserName(name.split(' ')[0])
        setUserInitial(name.charAt(0).toUpperCase())
      } else if (user?.email) {
        setUserName(user.email.split('@')[0])
        setUserInitial(user.email.charAt(0).toUpperCase())
      }
    }
    getUser()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  // Filter items: exam mode filter + feature flag filter
  const visibleItems = NAV_ITEMS.filter(item => {
    // Exam mode filter (existing logic)
    if (activeExam === 'focus') {
      if (!['Overview', 'Focus Mode', 'Spaced Review', 'Mock Scores', 'AI MCQ Gen'].includes(item.label)) {
        return false
      }
    }
    // Feature flag filter — if a flag exists and is disabled, hide the item
    if (item.flag && !(config as any)[item.flag]) {
      return false
    }
    return true
  })

  const getExamLabel = () => {
    switch(activeExam) {
      case 'upsc': return 'UPSC'
      case 'ssc': return 'SSC'
      case 'bank': return 'Bank PO'
      case 'jee': return 'JEE'
      case 'neet': return 'NEET'
      case 'rbi': return 'RBI'
      case 'custom': return 'Custom'
      case 'focus': return 'Focus'
      default: return 'Exam'
    }
  }

  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-gray-50 border-r border-gray-200 lg:flex">
      
      {/* Brand Logo */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
        <div className="text-2xl font-bold uppercase tracking-tight text-gray-900">Krama</div>
        {activeExam && (
          <div className="text-[10px] font-bold uppercase tracking-wider bg-primary-500 text-white px-2 py-1 rounded-full">
            {getExamLabel()}
          </div>
        )}
      </div>

      {/* User Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="relative w-10 h-10">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center font-bold text-white text-base shadow-soft">
              {userInitial}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-gray-900 truncate">{userName || 'Student'}</span>
              <LevelBadge variant="mini" showProgress={false} clickable={false} />
            </div>
            <div className="text-xs text-gray-500 font-medium">
              {stats.percentage}% complete
            </div>
          </div>
        </div>
        
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary-500 to-purple-500 transition-all duration-500 rounded-full"
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                ${isActive 
                  ? 'bg-primary-500 text-white shadow-soft' 
                  : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-soft'
                }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
              <span>{item.label}</span>
              {item.isPro && (
                <span className="ml-auto text-[9px] font-bold uppercase tracking-wider bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded">
                  Pro
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer Actions */}
      <div className="p-3 border-t border-gray-200 space-y-2">
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-white hover:shadow-soft transition-all"
        >
          <Trophy className="h-5 w-5" strokeWidth={2} />
          <span>Progress Card</span>
        </Link>
        
        <button 
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all"
        >
          <LogOut className="h-5 w-5" strokeWidth={2} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  )
}
