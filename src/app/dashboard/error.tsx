'use client'

import { useEffect } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log to Sentry if available
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="text-red-500" size={28} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
        <p className="text-gray-600 mb-6 text-sm">
          An unexpected error occurred. This has been logged and we&apos;ll look into it.
        </p>
        <button
          onClick={reset}
          className="btn btn-primary inline-flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Try again
        </button>
      </div>
    </div>
  )
}
