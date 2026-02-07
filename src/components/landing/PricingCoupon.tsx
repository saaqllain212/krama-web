'use client'

import { Tag, Clock } from 'lucide-react'

export function PricingCouponCard() {
  return (
    <div className="bg-gradient-to-br from-primary-50 to-purple-50 rounded-2xl p-6 border border-primary-100 shadow-sm">
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="bg-primary-500 text-white p-3 rounded-xl">
          <Tag className="w-5 h-5" />
        </div>
        
        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-bold text-gray-900">Launch Special</h3>
            <span className="bg-primary-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              Limited
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-3">
            First 100 users get <span className="font-bold text-primary-600">₹150 OFF</span> on any plan!
          </p>
          
          {/* Coupon code display */}
          <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
            <div className="flex-1">
              <span className="text-xs text-gray-500 font-medium">Use this code at checkout:</span>
              <code className="block text-lg font-bold text-primary-600 tracking-wider mt-0.5">
                NEW2026
              </code>
            </div>
            
            {/* Urgency indicator */}
            <div className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
              <Clock className="w-4 h-4" />
              <span className="text-xs font-semibold whitespace-nowrap">Limited slots</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Alternative: Compact version above pricing card
export function PricingCouponBanner() {
  return (
    <div className="bg-gradient-to-r from-primary-500 to-purple-500 text-white rounded-xl p-4 mb-6 shadow-lg">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-lg">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <p className="font-bold text-sm">Launch Offer: ₹150 OFF</p>
            <p className="text-xs text-white/80">For the first 100 users only</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
          <span className="text-xs font-medium">Code:</span>
          <code className="font-bold text-base tracking-wider">NEW2026</code>
        </div>
      </div>
    </div>
  )
}