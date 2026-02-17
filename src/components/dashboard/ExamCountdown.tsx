'use client'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Clock, AlertTriangle } from 'lucide-react'
import { useSyllabus } from '@/context/SyllabusContext'

const EXAM_LABELS: Record<string, string> = {
  upsc: 'UPSC Prelims',
  ssc: 'SSC CGL',
  bank: 'Banking Exam',
  jee: 'JEE Mains',
  neet: 'NEET',
  rbi: 'RBI Grade B',
  custom: 'Your Exam',
  focus: '',
}

export default function ExamCountdown() {
  const supabase = useMemo(() => createClient(), [])
  const { activeExam } = useSyllabus()
  const [targetDate, setTargetDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDate = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('syllabus_settings')
        .select('target_date')
        .eq('user_id', user.id)
        .single()

      if (data?.target_date) setTargetDate(data.target_date)
      setLoading(false)
    }
    fetchDate()
  }, [supabase])

  if (loading || !targetDate || activeExam === 'focus') return null

  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(targetDate)
  target.setHours(0, 0, 0, 0)
  const diffMs = target.getTime() - now.getTime()
  const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  // Don't show if exam has passed
  if (daysLeft < 0) return null

  const examLabel = EXAM_LABELS[activeExam || ''] || activeExam?.toUpperCase() || 'Exam'

  // Urgency levels
  let bgClass = 'bg-green-50 border-green-200'
  let textClass = 'text-green-700'
  let accentClass = 'text-green-600'
  let IconComponent = Calendar

  if (daysLeft <= 30) {
    bgClass = 'bg-red-50 border-red-200'
    textClass = 'text-red-700'
    accentClass = 'text-red-600'
    IconComponent = AlertTriangle
  } else if (daysLeft <= 90) {
    bgClass = 'bg-amber-50 border-amber-200'
    textClass = 'text-amber-700'
    accentClass = 'text-amber-600'
    IconComponent = Clock
  }

  const formattedDate = target.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <div className={`flex items-center justify-between px-4 py-3 rounded-xl border ${bgClass} transition-all`}>
      <div className="flex items-center gap-3">
        <IconComponent size={18} className={accentClass} />
        <span className={`text-sm font-semibold ${textClass}`}>
          {examLabel}
        </span>
        <span className="text-xs text-gray-400">•</span>
        <span className="text-xs font-medium text-gray-500">{formattedDate}</span>
      </div>
      <div className={`text-lg font-bold ${accentClass} tabular-nums`}>
        {daysLeft === 0 ? 'Today!' : daysLeft === 1 ? '1 day left' : `${daysLeft} days left`}
      </div>
    </div>
  )
}
