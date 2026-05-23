'use client'

// GettingStartedCard.tsx
// ORIGINAL: Only shown when focusMinutes === 0 AND dueReviews === 0 AND syllabusPercentage === 0
// IMPROVED: 
//   - New users (all zeros) → same welcome card as before
//   - Returning users who haven't started today → contextual "Start Today" nudge
//   - Users with due reviews → review nudge
//   - All other cases → return null (unchanged behaviour)

import Link from 'next/link'
import { Timer, RotateCw, Map, ArrowRight, Sparkles, Play, Brain } from 'lucide-react'
import { motion } from 'framer-motion'

interface GettingStartedCardProps {
  focusMinutes: number
  dueReviews: number
  syllabusPercentage: number
}

export default function GettingStartedCard({ 
  focusMinutes, 
  dueReviews, 
  syllabusPercentage 
}: GettingStartedCardProps) {
  const isNewUser    = focusMinutes === 0 && dueReviews === 0 && syllabusPercentage === 0
  const notStartedYet = focusMinutes === 0 && !isNewUser        // returning user, no session today
  const hasReviews   = dueReviews > 0

  // ── NEW USER — full welcome card (UNCHANGED from original) ─────────────────
  if (isNewUser) {
    const actions = [
      {
        icon: Timer,
        label: 'Start your first focus session',
        description: '25 minutes of deep work — that\'s all it takes to begin',
        href: '/dashboard/focus',
        gradient: 'from-primary-500 to-primary-600',
        bgHover: 'hover:border-primary-300',
        primary: true,
      },
      {
        icon: Map,
        label: 'Explore your syllabus map',
        description: 'See every topic laid out clearly',
        href: '/dashboard/syllabus',
        gradient: 'from-cyan-500 to-cyan-600',
        bgHover: 'hover:border-cyan-300',
        primary: false,
      },
      {
        icon: RotateCw,
        label: 'Add your first review topic',
        description: 'Never forget what you study',
        href: '/dashboard/review',
        gradient: 'from-purple-500 to-purple-600',
        bgHover: 'hover:border-purple-300',
        primary: false,
      },
    ]

    return (
      <div className="card border-2 border-primary-200 bg-gradient-to-br from-primary-50/60 to-purple-50/40 overflow-hidden">
        <div className="flex items-start gap-3 mb-6">
          <div className="w-11 h-11 bg-gradient-to-br from-primary-500 to-purple-500 rounded-xl flex items-center justify-center shadow-soft flex-shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Welcome to Krama! 🎉</h3>
            <p className="text-sm text-gray-500 mt-0.5">Your journey starts here — pick one to begin</p>
          </div>
        </div>

        <div className="space-y-3">
          {actions.map((action, i) => {
            const Icon = action.icon
            return (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <Link
                  href={action.href}
                  className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border bg-white ${action.bgHover} transition-all group active:scale-[0.98] ${
                    action.primary ? 'border-primary-200 shadow-soft' : 'border-gray-100'
                  }`}
                >
                  <div className={`w-10 h-10 bg-gradient-to-br ${action.gradient} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-5 h-5 text-white" strokeWidth={2} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                      {action.label}
                      {action.primary && (
                        <span className="text-[10px] font-bold bg-primary-100 text-primary-600 px-1.5 py-0.5 rounded-full">
                          Recommended
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">{action.description}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all flex-shrink-0" />
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }

  // ── RETURNING USER — hasn't started today yet ──────────────────────────────
  // This is the key retention fix: returning users saw an empty dashboard → left.
  // Now they see a clear "Start today" prompt.
  if (notStartedYet) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card border-2 border-amber-200 bg-gradient-to-br from-amber-50/60 to-orange-50/40 overflow-hidden"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-soft flex-shrink-0">
            <Play className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900">No sessions logged yet today</h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {hasReviews
                ? `You have ${dueReviews} review${dueReviews > 1 ? 's' : ''} due. Start with a focus session first.`
                : 'Open the timer and get going — even 15 minutes counts.'}
            </p>
          </div>
          <Link
            href="/dashboard/focus"
            className="shrink-0 flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-soft"
          >
            <Play size={14} />
            Start
          </Link>
        </div>
      </motion.div>
    )
  }

  // ── HAS DUE REVIEWS but has studied today — compact review nudge ───────────
  if (hasReviews && focusMinutes > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="card border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 to-indigo-50/30"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-soft flex-shrink-0">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900">
              {dueReviews} topic{dueReviews > 1 ? 's' : ''} waiting for review
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              Great focus session! Don't let these slip — reviewing now locks them in.
            </p>
          </div>
          <Link
            href="/dashboard/review"
            className="shrink-0 flex items-center gap-1.5 bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95 shadow-soft"
          >
            <Brain size={14} />
            Review
          </Link>
        </div>
      </motion.div>
    )
  }

  return null
}
