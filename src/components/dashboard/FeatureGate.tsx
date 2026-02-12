'use client'

import { useAppConfig } from '@/context/AppConfigContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Lock } from 'lucide-react'

interface FeatureGateProps {
  flag: keyof ReturnType<typeof useAppConfig>['config']
  featureName: string
  children: React.ReactNode
}

/**
 * Wraps a page/component and checks if the given feature flag is enabled.
 * If disabled, shows a "feature unavailable" message instead of the children.
 * 
 * Usage:
 *   <FeatureGate flag="feature_focus_enabled" featureName="Focus Mode">
 *     <YourPageContent />
 *   </FeatureGate>
 */
export default function FeatureGate({ flag, featureName, children }: FeatureGateProps) {
  const { config, loading } = useAppConfig()

  if (loading) return null

  const isEnabled = config[flag]

  if (!isEnabled) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Lock className="text-gray-400" size={28} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {featureName} is currently unavailable
        </h2>
        <p className="text-gray-500 font-medium max-w-md">
          This feature has been temporarily disabled. Please check back later.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
