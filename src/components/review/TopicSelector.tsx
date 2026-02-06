'use client'

import { Topic } from '@/lib/logic'

interface TopicSelectorProps {
  topics: Topic[]
  activeTopicId: string | null
  onSelect: (id: string) => void
}

export default function TopicSelector({ topics, activeTopicId, onSelect }: TopicSelectorProps) {
  if (topics.length <= 1) return null

  return (
    <div className="mt-6">
      <p className="text-sm font-medium text-gray-600 mb-4">
        {topics.length} topics due • Select one to review
      </p>
      <div className="overflow-x-auto pb-2 -mx-1 px-1">
        <div className="flex gap-3 w-max">
          {topics.map(topic => (
            <button 
              key={topic.id}
              onClick={() => onSelect(topic.id)}
              className={`
                flex-shrink-0 px-5 py-4 rounded-xl border-2 text-left w-56 transition-all
                ${
                  activeTopicId === topic.id 
                    ? 'bg-gradient-to-br from-primary-500 to-purple-500 text-white border-primary-600 shadow-lg' 
                    : 'bg-white text-gray-700 border-gray-200 hover:border-primary-300 hover:shadow-md'
                }
              `}
            >
              <div className={`text-xs font-semibold uppercase mb-2 ${
                activeTopicId === topic.id ? 'text-white/80' : 'text-gray-500'
              }`}>
                Day {topic.last_gap}
              </div>
              <div className="font-bold text-sm line-clamp-2">{topic.title}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}