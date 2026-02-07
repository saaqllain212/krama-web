// src/components/companions/MessageBubble.tsx
// Animated speech bubble for companion messages

'use client'

import { MessageSquare } from 'lucide-react'

interface MessageBubbleProps {
  message: string
  type: 'guardian' | 'wraith'
}

export default function MessageBubble({ message, type }: MessageBubbleProps) {
  const isGuardian = type === 'guardian'
  
  return (
    <div className={`relative animate-fade-in ${isGuardian ? 'text-left' : 'text-left'}`}>
      <div 
        className={`inline-block max-w-full px-4 py-3 rounded-2xl shadow-soft border-2 ${
          isGuardian 
            ? 'bg-white border-success-200 text-gray-800' 
            : 'bg-white border-warning-200 text-gray-800'
        }`}
      >
        {/* Icon */}
        <div className={`inline-flex items-center gap-2 mb-1 ${
          isGuardian ? 'text-success-600' : 'text-warning-600'
        }`}>
          <MessageSquare className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-wide">
            {isGuardian ? 'Guardian' : 'Wraith'}
          </span>
        </div>
        
        {/* Message text */}
        <p className="text-sm leading-relaxed">
          {message}
        </p>
      </div>
      
      {/* Tail (speech bubble pointer) */}
      <div 
        className={`absolute top-0 w-0 h-0 ${
          isGuardian 
            ? 'left-6 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-success-200' 
            : 'left-6 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-b-[12px] border-b-warning-200'
        }`}
        style={{ transform: 'translateY(-11px)' }}
      />
    </div>
  )
}