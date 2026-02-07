'use client'

import { Sprout, Clock, TrendingUp, AlertTriangle } from 'lucide-react'

export default function DualBrainPreview() {
  return (
    <section className="relative px-6 py-24 md:px-12 lg:px-16 bg-gradient-to-br from-gray-50 to-white overflow-hidden">
      
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-success-100 to-transparent rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-br from-warning-100 to-transparent rounded-full blur-3xl opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full mb-6">
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Dual Companions</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4 md:text-5xl">
            Your Dual Study Companions
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Two AI personalities that evolve with your study habits. One grows with your effort. One fades when you slack.
          </p>
        </div>

        {/* Dual Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Growth Guardian */}
          <div className="card group hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-success-400 to-success-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-glow-success">
                <Sprout className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Growth Guardian</h3>
                <p className="text-sm text-success-600 font-semibold">Level 1 → Legendary</p>
              </div>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">
              A companion that grows stronger with every study session. Watch it evolve from a tiny sprout to a mighty tree as you log hours, complete mocks, and build consistency.
            </p>

            {/* Evolution Preview */}
            <div className="bg-gradient-to-br from-success-50 to-success-100 rounded-xl p-6 border border-success-200">
              <p className="text-xs font-semibold text-success-700 uppercase tracking-wider mb-3">Evolution Path</p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-success-500 rounded-full" />
                  <span className="text-sm font-medium text-gray-700">0-25h: Seed Sprout 🌱</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-success-500 rounded-full" />
                  <span className="text-sm font-medium text-gray-700">25-100h: Growing Sapling 🌿</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-success-500 rounded-full" />
                  <span className="text-sm font-medium text-gray-700">100-250h: Flourishing Tree 🌳</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-success-500 rounded-full" />
                  <span className="text-sm font-medium text-gray-700">250h+: Ancient Guardian 🌲</span>
                </div>
              </div>
            </div>

            {/* Sample Message */}
            <div className="mt-6 bg-white rounded-lg p-4 border border-success-200">
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    "You studied 4 hours today. I grew 3 new branches! Keep going!"
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Positive reinforcement, always</p>
                </div>
              </div>
            </div>
          </div>

          {/* Time Wraith */}
          <div className="card group hover:scale-[1.02] transition-transform duration-300">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-warning-400 to-warning-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-glow-warning">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Time Wraith</h3>
                <p className="text-sm text-warning-600 font-semibold">Vigilant → Dormant</p>
              </div>
            </div>

            <p className="text-gray-600 mb-6 leading-relaxed">
              A companion that fades when you're idle. It tracks your exam countdown and reminds you of wasted days. Creates healthy urgency without toxic pressure.
            </p>

            {/* Status Preview */}
            <div className="bg-gradient-to-br from-warning-50 to-warning-100 rounded-xl p-6 border border-warning-200">
              <p className="text-xs font-semibold text-warning-700 uppercase tracking-wider mb-3">Current Status</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Exam in:</span>
                  <span className="text-lg font-bold text-warning-700">44 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Days idle:</span>
                  <span className="text-lg font-bold text-warning-700">3 days</span>
                </div>
                <div className="h-2 bg-warning-200 rounded-full overflow-hidden">
                  <div className="h-full bg-warning-500 w-3/4" />
                </div>
                <p className="text-xs text-gray-600">Wraith is fading... Get back to work!</p>
              </div>
            </div>

            {/* Sample Message */}
            <div className="mt-6 bg-white rounded-lg p-4 border border-warning-200">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    "3 days idle. 44 days until JEE. What are you waiting for?"
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Healthy urgency, not panic</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">
            Two companions that keep you <span className="font-semibold text-primary-600">accountable and motivated</span>
          </p>
        </div>
      </div>
    </section>
  )
}