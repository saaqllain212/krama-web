'use client'

import { Sprout, Clock, Sparkles } from 'lucide-react'

export default function DualCompanionsPreview() {
  return (
    <div className="card bg-gradient-to-br from-white to-gray-50">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-1">Your Study Companions</h3>
          <p className="text-sm text-gray-600">Two AI personalities that evolve with your study habits</p>
        </div>
        <div className="flex items-center gap-2 bg-purple-100 px-3 py-1.5 rounded-full">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Coming Soon</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Growth Guardian */}
        <div className="card-flat bg-gradient-to-br from-success-50 to-success-100 border-2 border-success-200 group hover:scale-[1.02] transition-all">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-success-400 to-success-600 rounded-xl flex items-center justify-center shadow-glow-success">
              <Sprout className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-1">Growth Guardian</h4>
              <p className="text-xs text-success-700 font-semibold">Grows with your effort</p>
            </div>
          </div>

          <p className="text-sm text-gray-700 mb-4">
            A tree companion that evolves from a tiny sprout to a majestic guardian as you log study hours and build consistency.
          </p>

          <div className="bg-white rounded-lg p-3 border border-success-200">
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-success-500 rounded-full mt-1.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-800 mb-1">Current State: Preview</p>
                <p className="text-xs text-gray-600">
                  Level: Sprout 🌱 • Hours: 0h • Stage: 1/4
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Time Wraith */}
        <div className="card-flat bg-gradient-to-br from-warning-50 to-warning-100 border-2 border-warning-200 group hover:scale-[1.02] transition-all">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-warning-400 to-warning-600 rounded-xl flex items-center justify-center shadow-glow-warning">
              <Clock className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-900 mb-1">Time Wraith</h4>
              <p className="text-xs text-warning-700 font-semibold">Fades with inactivity</p>
            </div>
          </div>

          <p className="text-sm text-gray-700 mb-4">
            An hourglass guardian that darkens when you're idle. Creates healthy urgency by tracking your exam countdown and wasted days.
          </p>

          <div className="bg-white rounded-lg p-3 border border-warning-200">
            <div className="flex items-start gap-2">
              <div className="w-1 h-1 bg-warning-500 rounded-full mt-1.5" />
              <div className="flex-1">
                <p className="text-xs font-medium text-gray-800 mb-1">Current State: Preview</p>
                <p className="text-xs text-gray-600">
                  Days Idle: 0 • Exam: Not set • Status: Vigilant
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Note */}
      <div className="mt-6 p-4 bg-primary-50 rounded-lg border border-primary-200">
        <p className="text-sm text-gray-700">
          <span className="font-semibold text-primary-700">Launching in Version 2.0:</span> Both companions will be fully interactive with real-time evolution, personalized messages, and achievement tracking.
        </p>
      </div>
    </div>
  )
}