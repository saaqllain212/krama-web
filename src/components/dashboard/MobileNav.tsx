'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  Timer, 
  RotateCw, 
  Map, 
  LineChart, 
  LogOut, 
  Menu, 
  X,
  ChevronRight,
  Sparkles,
  Brain
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useSyllabus } from '@/context/SyllabusContext'

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Focus Mode', href: '/dashboard/focus', icon: Timer },
  { label: 'Spaced Review', href: '/dashboard/review', icon: RotateCw },
  { label: 'Syllabus Map', href: '/dashboard/syllabus', icon: Map },
  { label: 'Mock Scores', href: '/dashboard/mocks', icon: LineChart },
  { label: 'Analytics', href: '/dashboard/insights', icon: Sparkles },
  { label: 'AI MCQ Gen', href: '/dashboard/mcq', icon: Brain },
]

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const { activeExam, stats } = useSyllabus()
  
  // User state
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

  // Filter items based on mode
  const visibleItems = NAV_ITEMS.filter(item => {
    if (activeExam === 'focus') {
      return ['Overview', 'Focus Mode', 'Spaced Review', 'Mock Scores', 'AI MCQ Gen'].includes(item.label)
    }
    return true
  })

  // Get exam label
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
      {/* TOP HEADER (Always Visible on Mobile) */}
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
        <div className="flex items-center gap-3">
          <div className="text-xl font-bold uppercase tracking-tight text-gray-900">Krama</div>
          {activeExam && (
            <div className="text-[9px] font-bold uppercase tracking-wider bg-primary-500 text-white px-2 py-0.5 rounded-full">
              {getExamLabel()}
            </div>
          )}
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Menu className="h-6 w-6 text-gray-700" strokeWidth={2} />
        </button>
      </div>

      {/* SLIDE-OUT MENU */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* BACKDROP */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            />

            {/* DRAWER */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 right-0 z-50 w-72 flex flex-col border-l border-gray-200 bg-white shadow-2xl lg:hidden"
            >
              {/* Drawer Header */}
              <div className="flex h-16 items-center justify-between border-b border-gray-200 px-5">
                <span className="text-sm font-semibold uppercase tracking-wider text-gray-400">Menu</span>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" strokeWidth={2} />
                </button>
              </div>

              {/* User Section */}
              <div className="border-b border-gray-200 p-5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-500 rounded-full text-white flex items-center justify-center font-bold text-xl">
                    {userInitial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-base text-gray-900 truncate">{userName || 'Student'}</div>
                    <div className="text-sm text-gray-500 font-medium">
                      {stats.percentage}% complete
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-3 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${stats.percentage}%` }}
                  />
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {visibleItems.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all active:scale-[0.98]
                        ${isActive 
                          ? 'bg-primary-500 text-white shadow-soft' 
                          : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5" strokeWidth={2} />
                        {item.label}
                      </div>
                      {isActive && <ChevronRight size={16} />}
                    </Link>
                  )
                })}
              </nav>

              {/* Footer / Logout */}
              <div className="border-t border-gray-200 p-4 mt-auto">
                <button 
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all active:scale-[0.98]"
                >
                  <LogOut className="h-5 w-5" strokeWidth={2} />
                  Log Out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
