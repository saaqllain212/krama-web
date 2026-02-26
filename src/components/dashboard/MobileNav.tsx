'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, Timer, RotateCw, Map, LineChart, LogOut, 
  Menu, X, ChevronRight, Sparkles, Brain, MoreHorizontal, Trophy
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useSyllabus } from '@/context/SyllabusContext'
import { useAppConfig } from '@/context/AppConfigContext'

const NAV_ITEMS = [
  { label: 'Overview',       href: '/dashboard',           icon: LayoutDashboard, flag: null,                       isPro: false },
  { label: 'Focus Mode',     href: '/dashboard/focus',     icon: Timer,           flag: 'feature_focus_enabled',    isPro: false },
  { label: 'Spaced Review',  href: '/dashboard/review',    icon: RotateCw,        flag: 'feature_review_enabled',   isPro: true },
  { label: 'Syllabus Map',   href: '/dashboard/syllabus',  icon: Map,             flag: null,                       isPro: false },
  { label: 'Mock Scores',    href: '/dashboard/mocks',     icon: LineChart,        flag: 'feature_mocks_enabled',   isPro: true },
  { label: 'Analytics',      href: '/dashboard/insights',  icon: Sparkles,        flag: 'feature_insights_enabled', isPro: true },
  { label: 'AI MCQ Gen',     href: '/dashboard/mcq',       icon: Brain,           flag: 'feature_mcq_enabled',     isPro: false },
]

// Bottom tab items — max 5 for mobile bottom bar
const BOTTOM_TAB_LABELS = ['Overview', 'Focus Mode', 'Spaced Review', 'Syllabus Map']

export default function MobileNav() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
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

  // Filter items: exam mode + feature flags
  const visibleItems = NAV_ITEMS.filter(item => {
    if (activeExam === 'focus') {
      if (!['Overview', 'Focus Mode', 'Spaced Review', 'Mock Scores', 'AI MCQ Gen'].includes(item.label)) {
        return false
      }
    }
    if (item.flag && !(config as any)[item.flag]) {
      return false
    }
    return true
  })

  // Bottom bar items (first 4 visible + "More" button)
  const bottomItems = visibleItems.filter(item => BOTTOM_TAB_LABELS.includes(item.label))
  // Overflow items for the drawer
  const drawerItems = visibleItems.filter(item => !BOTTOM_TAB_LABELS.includes(item.label))

  const getExamLabel = () => {
    switch(activeExam) {
      case 'upsc': return 'UPSC'
      case 'ssc': return 'SSC'
      case 'bank': return 'Bank'
      case 'jee': return 'JEE'
      case 'neet': return 'NEET'
      case 'rbi': return 'RBI'
      case 'custom': return 'Custom'
      case 'focus': return 'Focus'
      default: return ''
    }
  }

  return (
    <>
      {/* TOP HEADER */}
      <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white/95 backdrop-blur-sm px-4 lg:hidden">
        <div className="flex items-center gap-2">
          <div className="text-lg font-bold uppercase tracking-tight text-gray-900">Krama</div>
          {activeExam && (
            <div className="text-[9px] font-bold uppercase tracking-wider bg-primary-500 text-white px-2 py-0.5 rounded-full">
              {getExamLabel()}
            </div>
          )}
        </div>
        <Link href="/dashboard/profile" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {userInitial}
          </div>
        </Link>
      </div>

      {/* BOTTOM TAB BAR — persistent, always visible on mobile */}
      <div className="fixed bottom-0 left-0 right-0 z-30 lg:hidden">
        <div className="bg-white/95 backdrop-blur-md border-t border-gray-200 px-2 pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-center justify-around h-14">
            {bottomItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1.5 rounded-lg transition-colors active:scale-95 ${
                    isActive ? 'text-primary-600' : 'text-gray-400'
                  }`}
                >
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                  <span className={`text-[10px] font-semibold ${isActive ? 'text-primary-600' : 'text-gray-400'}`}>
                    {item.label === 'Overview' ? 'Home' : item.label === 'Focus Mode' ? 'Focus' : item.label === 'Spaced Review' ? 'Review' : item.label === 'Syllabus Map' ? 'Syllabus' : item.label}
                  </span>
                  {isActive && (
                    <motion.div 
                      layoutId="bottomTabIndicator"
                      className="absolute top-0 w-8 h-0.5 bg-primary-500 rounded-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}

            {/* More button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[56px] py-1.5 rounded-lg transition-colors active:scale-95 ${
                isDrawerOpen ? 'text-primary-600' : 'text-gray-400'
              }`}
            >
              <MoreHorizontal size={20} strokeWidth={1.8} />
              <span className="text-[10px] font-semibold">More</span>
            </button>
          </div>
        </div>
      </div>

      {/* SLIDE-OUT DRAWER for overflow items */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 lg:hidden"
            >
              <div className="bg-white rounded-t-2xl shadow-2xl border-t border-gray-200 pb-[env(safe-area-inset-bottom)]">
                {/* Handle */}
                <div className="flex justify-center py-3">
                  <div className="w-10 h-1 bg-gray-300 rounded-full" />
                </div>

                {/* User section */}
                <div className="px-5 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full text-white flex items-center justify-center font-bold text-base">
                      {userInitial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900 truncate">{userName || 'Student'}</div>
                      <div className="text-xs text-gray-500 font-medium">{stats.percentage}% complete</div>
                    </div>
                  </div>
                </div>

                {/* Extra nav items */}
                <nav className="p-3 space-y-1">
                  {drawerItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    return (
                      <Link key={item.href} href={item.href} onClick={() => setIsDrawerOpen(false)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all active:scale-[0.98]
                          ${isActive ? 'bg-primary-50 text-primary-600' : 'text-gray-700 hover:bg-gray-50'}`}>
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5" strokeWidth={2} />
                          {item.label}
                        </div>
                        {isActive && <ChevronRight size={16} />}
                      </Link>
                    )
                  })}

                  <Link href="/dashboard/profile" onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all active:scale-[0.98]">
                    <Trophy className="h-5 w-5" strokeWidth={2} />
                    Progress Card
                  </Link>
                </nav>

                {/* Logout */}
                <div className="border-t border-gray-100 p-3">
                  <button onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all active:scale-[0.98]">
                    <LogOut className="h-5 w-5" strokeWidth={2} />
                    Log Out
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
