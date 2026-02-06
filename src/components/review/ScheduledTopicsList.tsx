'use client'

import { Topic } from '@/lib/logic'
import { Calendar, Clock } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface ScheduledTopicsListProps {
  topics: Topic[]
  totalCount: number
  hasSearch: boolean
}

export default function ScheduledTopicsList({ topics, totalCount, hasSearch }: ScheduledTopicsListProps) {
  if (topics.length === 0) return null

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary-100 rounded-xl">
            <Calendar size={22} className="text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Upcoming Reviews</h2>
            <p className="text-sm text-gray-600">
              {topics.length} shown{!hasSearch && totalCount > 20 ? ` of ${totalCount} total` : ''}
            </p>
          </div>
        </div>
        {!hasSearch && totalCount > 20 && (
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
            Use search to see all
          </span>
        )}
      </div>

      <div className="grid gap-3">
        {topics.map((topic) => (
          <div 
            key={topic.id}
            className="group bg-white rounded-xl p-4 border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate group-hover:text-primary-600 transition-colors">
                  {topic.title}
                </h3>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Clock size={14} />
                    {topic.next_review && formatDistanceToNow(new Date(topic.next_review), { addSuffix: true })}
                  </span>
                  <span className="text-gray-300">•</span>
                  <span>Day {topic.last_gap} interval</span>
                  {topic.category && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="capitalize">{topic.category}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                <div className="px-3 py-1.5 bg-primary-50 text-primary-700 text-xs font-semibold rounded-full">
                  {topic.next_review && new Date(topic.next_review).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}