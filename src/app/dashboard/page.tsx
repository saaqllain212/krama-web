'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Play, Brain, CheckSquare } from 'lucide-react'
import Link from 'next/link'
import Countdown from '@/components/dashboard/Countdown'

export default function DashboardPage() {
  const [userName, setUserName] = useState('Student')
  const [focusMinutes, setFocusMinutes] = useState(0)
  const [dueReviews, setDueReviews] = useState(0) // New State
  const supabase = createClient()

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // 1. Get Name
        if (user.user_metadata?.full_name) {
          setUserName(user.user_metadata.full_name.split(' ')[0])
        }

        // 2. Get Focus Minutes (Today)
        const todayStr = new Date().toISOString().split('T')[0]
        const { data: logs } = await supabase
          .from('focus_logs')
          .select('duration_minutes')
          .eq('user_id', user.id)
          .gte('started_at', `${todayStr}T00:00:00.000Z`)
          .lte('started_at', `${todayStr}T23:59:59.999Z`)

        if (logs) {
          const total = logs.reduce((sum, log) => sum + log.duration_minutes, 0)
          setFocusMinutes(total)
        }

        // 3. Get Due Reviews Count (Real Time)
        // Logic: next_review is in the PAST (<= now) AND status is NOT completed
        const now = new Date().toISOString()
        const { count } = await supabase
          .from('topics')
          .select('*', { count: 'exact', head: true }) // head: true means "don't fetch data, just count"
          .eq('user_id', user.id)
          .neq('status', 'completed')
          .lte('next_review', now)
        
        if (count !== null) setDueReviews(count)
      }
    }
    getData()
  }, [supabase])

  return (
    <div className="space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter md:text-5xl">
            Good afternoon, {userName}.
          </h1>
          <p className="mt-2 text-lg text-black/60">
            You have <span className="font-bold text-black">{dueReviews} items</span> to review right now.
          </p>
          
          <div className="mt-6 flex gap-2">
            <Link 
              href="/dashboard/insights" 
              className="rounded-full border border-black/10 bg-white px-5 py-2 text-xs font-bold uppercase tracking-widest text-black/60 hover:bg-black hover:text-white transition-colors"
            >
              View Insights
            </Link>
          </div>
        </div>

        <div className="w-full md:w-auto">
          <Countdown />
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        
        {/* CARD 1: DEEP WORK */}
        <div className="group relative border-neo bg-black p-6 text-white shadow-neo transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(245,158,11,1)]">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-bold uppercase tracking-widest text-white/60">
                Deep Work
              </div>
              <div className="mt-2 text-4xl font-bold tracking-tighter">
                {focusMinutes}m
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
              <Play className="h-5 w-5 fill-current" />
            </div>
          </div>
          <Link href="/dashboard/focus" className="absolute inset-0" />
        </div>

        {/* CARD 2: REVIEWS (Now Connected) */}
        <div className="group relative border-neo bg-brand p-6 text-black shadow-neo transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-bold uppercase tracking-widest text-black/60">
                Due Reviews
              </div>
              {/* REAL DATA */}
              <div className="mt-2 text-4xl font-bold tracking-tighter">
                {dueReviews}
              </div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/10">
              <Brain className="h-5 w-5 stroke-[2.5px]" />
            </div>
          </div>
          <Link href="/dashboard/review" className="absolute inset-0" />
        </div>

        {/* CARD 3: SYLLABUS (Still Fake) */}
        <div className="group border-neo bg-white p-6 shadow-neo transition-all hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm font-bold uppercase tracking-widest text-black/40">
                Syllabus
              </div>
              <div className="mt-2 text-4xl font-bold tracking-tighter">12%</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/5">
              <CheckSquare className="h-5 w-5 stroke-[2.5px]" />
            </div>
          </div>
          <div className="mt-4 h-2 w-full overflow-hidden bg-black/10">
            <div className="h-full w-[12%] bg-black" />
          </div>
        </div>
      </div>
    </div>
  )
}