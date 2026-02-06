'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, RefreshCcw, Check, Zap } from 'lucide-react'
import { Topic } from '@/lib/logic'

interface ReviewQueueCardProps {
  topic: Topic
  onReview: (rating: number) => void
  onDelete: () => void
}

export default function ReviewQueueCard({ topic, onReview, onDelete }: ReviewQueueCardProps) {
  return (
    <AnimatePresence mode='wait'>
      <motion.div 
        key={topic.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl p-6 md:p-8 shadow-medium border border-gray-200"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="bg-gradient-to-r from-primary-500 to-purple-500 text-white text-xs font-semibold px-4 py-2 rounded-full">
            Day {topic.last_gap} interval
          </div>
          <button 
            onClick={onDelete} 
            className="p-2 text-gray-400 hover:text-danger-500 hover:bg-danger-50 rounded-lg transition-all"
          >
            <Trash2 size={18} />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-8 break-words">
          {topic.title}
        </h3>

        {/* Instruction Text */}
        <p className="text-sm text-gray-500 mb-4">How well did you remember this?</p>

        {/* Rating Buttons */}
        <div className="grid grid-cols-3 gap-3">
          {/* Forgot */}
          <motion.button 
            onClick={() => onReview(0)} 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group flex flex-col items-center gap-3 p-4 md:p-5 bg-gradient-to-br from-danger-50 to-danger-100 border-2 border-danger-200 hover:border-danger-400 rounded-xl transition-all"
          >
            <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md transition-shadow">
              <RefreshCcw size={24} className="text-danger-500" />
            </div>
            <div className="text-center">
              <span className="block text-sm font-bold text-danger-600">Forgot</span>
              <span className="block text-xs text-danger-500 mt-1">Review again today</span>
            </div>
          </motion.button>

          {/* Got It */}
          <motion.button 
            onClick={() => onReview(1)} 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group flex flex-col items-center gap-3 p-4 md:p-5 bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-200 hover:border-primary-400 rounded-xl transition-all"
          >
            <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md transition-shadow">
              <Check size={24} className="text-primary-600" />
            </div>
            <div className="text-center">
              <span className="block text-sm font-bold text-primary-700">Got It</span>
              <span className="block text-xs text-primary-600 mt-1">Next review soon</span>
            </div>
          </motion.button>

          {/* Easy */}
          <motion.button 
            onClick={() => onReview(2)} 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="group flex flex-col items-center gap-3 p-4 md:p-5 bg-gradient-to-br from-success-500 to-success-600 border-2 border-success-700 hover:shadow-glow-success rounded-xl transition-all"
          >
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-full group-hover:bg-white/30 transition-colors">
              <Zap size={24} className="text-white" />
            </div>
            <div className="text-center">
              <span className="block text-sm font-bold text-white">Easy!</span>
              <span className="block text-xs text-white/90 mt-1">Longer interval</span>
            </div>
          </motion.button>
        </div>

        {/* Progress indicator - Updated without review_count */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Current interval: {topic.last_gap} days</span>
            <span className="font-medium">
              {topic.next_review 
                ? new Date(topic.next_review).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : 'Due today'
              }
            </span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}