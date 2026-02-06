'use client'

import { Topic } from '@/lib/logic'
import { Archive, CheckCircle2, RotateCcw } from 'lucide-react'

interface ArchivedTopicsListProps {
  topics: Topic[]
  totalCount: number
  hasSearch: boolean
  onReactivate: (topicId: string) => void
}

export default function ArchivedTopicsList({ topics, totalCount, hasSearch, onReactivate }: ArchivedTopicsListProps) {
  if (topics.length === 0) return null

  return (
    <section>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-success-100 rounded-xl">
            <Archive size={22} className="text-success-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Completed</h2>
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
            className="group bg-gradient-to-r from-success-50/50 to-success-100/30 rounded-xl p-4 border border-success-200 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle2 size={16} className="text-success-600 flex-shrink-0" />
                  <h3 className="font-semibold text-gray-900 truncate">
                    {topic.title}
                  </h3>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  {topic.category && (
                    <>
                      <span className="capitalize">{topic.category}</span>
                      <span className="text-gray-300">•</span>
                    </>
                  )}
                  <span className="text-success-700 font-medium">Mastered!</span>
                </div>
              </div>
              <button
                onClick={() => onReactivate(topic.id)}
                className="flex-shrink-0 p-2 text-gray-400 hover:text-primary-600 hover:bg-white rounded-lg transition-all"
                title="Reactivate this topic"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}