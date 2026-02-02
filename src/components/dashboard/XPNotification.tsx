'use client'

import { useXP } from '@/context/XPContext'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Trophy } from 'lucide-react'

export default function XPNotification() {
  const { recentXPGain, newAchievement, clearNotifications } = useXP()

  return (
    <>
      {/* XP Gain Popup */}
      <AnimatePresence>
        {recentXPGain && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="fixed bottom-24 right-6 z-50"
          >
            <div className="bg-black text-white px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 border-2 border-brand">
              <div className="bg-brand text-black p-2 rounded-full">
                <Zap size={18} />
              </div>
              <div>
                <div className="text-brand font-black text-lg">+{recentXPGain.amount} XP</div>
                <div className="text-white/60 text-xs font-bold">{recentXPGain.reason}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Achievement Popup */}
      <AnimatePresence>
        {newAchievement && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={clearNotifications}
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-white border-4 border-black p-8 shadow-[8px_8px_0_0_#000] text-center max-w-sm mx-4"
            >
              <div className="text-6xl mb-4">{newAchievement.icon}</div>
              <div className="flex items-center justify-center gap-2 text-sm font-bold text-brand uppercase tracking-widest mb-2">
                <Trophy size={16} /> Achievement Unlocked
              </div>
              <h2 className="text-2xl font-black mb-2">{newAchievement.name}</h2>
              <p className="text-black/60">{newAchievement.description}</p>
              <button 
                onClick={clearNotifications}
                className="mt-6 bg-black text-white px-6 py-3 font-bold text-sm uppercase"
              >
                Awesome!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
