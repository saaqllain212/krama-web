'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Users } from 'lucide-react'

/**
 * LiveStudyingCount — Social proof widget
 * 
 * Shows "X students studying right now" by counting distinct users
 * who have a focus_log entry in the last 60 minutes.
 * 
 * This is approximate — it means "studied recently", not truly "live".
 * But it creates FOMO and makes the platform feel alive.
 * 
 * Refreshes every 5 minutes. Zero cost — just a COUNT query.
 */
export default function LiveStudyingCount() {
  const supabase = useMemo(() => createClient(), [])
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    const fetchCount = async () => {
      // Use server-side function that bypasses RLS — returns just a count, no user data
      const { data, error } = await supabase.rpc('get_active_students_count')

      if (error || data === null) return
      setCount(data as number)
    }

    fetchCount()
    const interval = setInterval(fetchCount, 5 * 60 * 1000) // Refresh every 5 min
    return () => clearInterval(interval)
  }, [supabase])

  // Don't show if 0 or still loading
  if (!count || count < 1) return null

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
      </span>
      <Users size={14} className="text-gray-400" />
      <span className="font-medium">
        {count} {count === 1 ? 'student' : 'students'} studying now
      </span>
    </div>
  )
}
