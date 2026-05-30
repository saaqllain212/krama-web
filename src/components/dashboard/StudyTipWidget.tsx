'use client'

// src/components/dashboard/StudyTipWidget.tsx
// Floating science-backed study tips that appear periodically on the dashboard.
// Shows a different tip every 90 seconds. Dismissible per session.
// Tips are grounded in real cognitive science — not generic advice.

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lightbulb, ChevronRight } from 'lucide-react'

const TIPS = [
  { emoji: '💧', fact: 'Drinking water improves focus by 14%', detail: 'Even mild dehydration (1–2%) measurably reduces cognitive performance. Keep water on your desk.', tag: 'Hydration' },
  { emoji: '😴', fact: 'Sleep moves learning from short to long-term memory', detail: 'Studying then sleeping within 6 hours consolidates 40% more than pulling an all-nighter. Sleep is not wasted time.', tag: 'Sleep' },
  { emoji: '🍅', fact: '25-minute focus beats 3-hour marathon study', detail: 'The Pomodoro technique works because your brain processes information during the break. Rest is part of learning.', tag: 'Focus' },
  { emoji: '✍️', fact: 'Handwriting notes improves recall by 29% vs typing', detail: 'Slower writing forces deeper processing. You summarise instead of transcribing — that\'s where learning happens.', tag: 'Notes' },
  { emoji: '🔁', fact: 'You forget 70% of new information within 24 hours', detail: 'Without review, nearly everything learned today disappears by tomorrow. One 10-minute revision session cuts that to 30%.', tag: 'Review' },
  { emoji: '🎵', fact: 'Background noise at 65–70 dB boosts creative thinking', detail: 'Coffee shop level noise improves abstract thinking. Complete silence is better for technical problems. Match your environment to your task.', tag: 'Environment' },
  { emoji: '🏃', fact: '20 minutes of exercise before studying = 2x memory formation', detail: 'Aerobic exercise spikes BDNF — a protein that literally grows new brain connections. Even a brisk walk before studying works.', tag: 'Exercise' },
  { emoji: '🌡️', fact: 'Your brain works best at 22°C (72°F)', detail: 'Room temperature directly affects cognitive performance. Too hot or too cold and your brain spends energy regulating body temperature instead.', tag: 'Environment' },
  { emoji: '🔤', fact: 'Teaching others is the fastest way to learn', detail: 'The "protégé effect" — preparing to teach forces deeper understanding. Explain every topic you study as if someone is listening.', tag: 'Technique' },
  { emoji: '📱', fact: 'Just having your phone visible reduces IQ by ~10 points', detail: 'The mere presence of a smartphone — even face down, even off — reduces available cognitive capacity. Phone in another room = better focus.', tag: 'Distraction' },
  { emoji: '🧘', fact: '10 minutes of meditation improves exam scores', detail: 'Mindfulness training before studying reduces test anxiety and improves working memory. Even beginners see measurable effects after 8 days.', tag: 'Mindfulness' },
  { emoji: '🌿', fact: 'Studying near nature (even a photo) reduces mental fatigue', detail: 'Attention Restoration Theory: natural scenes replenish directed attention. A plant on your desk or a nature wallpaper has measurable effects.', tag: 'Environment' },
  { emoji: '⏰', fact: 'Most people have a 90-minute natural focus window', detail: 'Ultradian rhythms mean your brain naturally cycles between high and low alertness every 90 minutes. Study in 90-minute blocks, then take a real break.', tag: 'Rhythm' },
  { emoji: '🎯', fact: 'Writing your goal before a session improves performance 42%', detail: 'Stating a specific intention ("I will finish Chapter 4 tonight") dramatically increases follow-through vs vague plans like "study history".', tag: 'Planning' },
  { emoji: '🍎', fact: 'Low blood sugar kills focus faster than tiredness', detail: 'Your brain uses 20% of your body\'s glucose. Studying for 2+ hours without eating causes measurable attention drops. Eat something small every 2 hours.', tag: 'Nutrition' },
  { emoji: '🔄', fact: 'Interleaving topics beats blocking (studying one at a time)', detail: 'Mixing topics (History → Polity → Geography → History) feels harder but produces 23% better retention than finishing one subject completely before moving on.', tag: 'Technique' },
  { emoji: '🌙', fact: 'Review before sleeping — not after waking up', detail: 'Information studied just before sleep benefits from memory consolidation during deep sleep. Morning review only reinforces what\'s already fading.', tag: 'Timing' },
  { emoji: '📊', fact: 'Testing yourself is 50% more effective than re-reading', detail: 'The "testing effect" — actively recalling information instead of re-reading it produces dramatically stronger long-term memory, even if recall feels harder.', tag: 'Technique' },
]

export default function StudyTipWidget() {
  const [visible, setVisible] = useState(false)
  const [tipIndex, setTipIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const nextTip = useCallback(() => {
    setTipIndex(i => (i + 1) % TIPS.length)
    setExpanded(false)
  }, [])

  // Show first tip after 8 seconds, then rotate every 90 seconds
  useEffect(() => {
    if (dismissed) return

    // Pick random start tip
    setTipIndex(Math.floor(Math.random() * TIPS.length))

    const showTimer = setTimeout(() => setVisible(true), 8000)
    return () => clearTimeout(showTimer)
  }, [dismissed])

  useEffect(() => {
    if (!visible || dismissed) return
    const rotateTimer = setInterval(() => {
      nextTip()
    }, 90 * 1000)
    return () => clearInterval(rotateTimer)
  }, [visible, dismissed, nextTip])

  const tip = TIPS[tipIndex]

  return (
    <AnimatePresence>
      {visible && !dismissed && (
        <motion.div
          key={tipIndex}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="card border-l-4 border-l-amber-400 bg-gradient-to-r from-amber-50/60 to-white"
        >
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center text-xl shrink-0">
              {tip.emoji}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <Lightbulb size={11} className="text-amber-500 shrink-0" />
                <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider">{tip.tag}</span>
              </div>
              <p className="text-sm font-bold text-gray-900 leading-snug">{tip.fact}</p>

              {/* Expandable detail */}
              <AnimatePresence>
                {expanded && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-gray-500 leading-relaxed mt-1.5 overflow-hidden"
                  >
                    {tip.detail}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Actions */}
              <div className="flex items-center gap-3 mt-2">
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="text-[11px] font-bold text-amber-600 hover:text-amber-700 flex items-center gap-0.5 transition-colors"
                >
                  {expanded ? 'Less' : 'Why?'}
                  <ChevronRight size={11} className={`transition-transform ${expanded ? 'rotate-90' : ''}`} />
                </button>
                <button
                  onClick={nextTip}
                  className="text-[11px] font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Next tip →
                </button>
              </div>
            </div>

            {/* Dismiss */}
            <button
              onClick={() => setDismissed(true)}
              className="text-gray-300 hover:text-gray-500 transition-colors shrink-0 mt-0.5"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
