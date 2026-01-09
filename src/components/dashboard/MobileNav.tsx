'use client'

import { useState } from 'react'
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
  X 
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Focus Mode', href: '/dashboard/focus', icon: Timer },
  { label: 'Spaced Review', href: '/dashboard/review', icon: RotateCw },
  { label: 'Syllabus Map', href: '/dashboard/syllabus', icon: Map },
  { label: 'Mock Scores', href: '/dashboard/mocks', icon: LineChart },
]

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.replace('/login')
  }

  return (
    <>
      {/* TOP HEADER (Always Visible on Mobile) */}
      <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b-2 border-black bg-white px-6 lg:hidden">
        <div className="text-xl font-black uppercase tracking-tight">Krama</div>
        <button onClick={() => setIsOpen(true)}>
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* SLIDE-OUT MENU */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* BACKDROP (Darkens the background) */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            />

            {/* DRAWER (The actual menu) */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-64 flex-col border-l-2 border-black bg-white shadow-2xl lg:hidden"
            >
              {/* Drawer Header */}
              <div className="flex h-16 items-center justify-between border-b-2 border-black px-6">
                <span className="text-sm font-black uppercase tracking-widest text-black/40">Menu</span>
                <button onClick={() => setIsOpen(false)} className="hover:text-red-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 space-y-2 p-4">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsOpen(false)} // Close menu on click
                      className={`flex items-center gap-3 border-2 px-4 py-3 text-sm font-bold uppercase tracking-wide transition-all
                        ${isActive 
                          ? 'border-black bg-brand shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                          : 'border-transparent bg-transparent active:bg-gray-50'
                        }`}
                    >
                      <Icon className="h-5 w-5 stroke-[2.5px]" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>

              {/* Footer / Logout */}
              <div className="border-t-2 border-black p-4">
                <button 
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 border-2 border-transparent px-4 py-3 text-sm font-bold uppercase tracking-wide text-black/40 hover:border-black hover:bg-red-100 hover:text-red-600"
                >
                  <LogOut className="h-5 w-5 stroke-[2.5px]" />
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