import Link from 'next/link'
import { Home, ArrowLeft, Search } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      
      {/* Big 404 */}
      <div className="relative mb-8">
        <div className="text-[160px] sm:text-[200px] font-black text-gray-100 leading-none select-none">
          404
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-5xl sm:text-6xl">📚</div>
        </div>
      </div>

      {/* Message */}
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
        Page not found
      </h1>
      <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
        Looks like this page went on a study break and never came back. 
        Let&apos;s get you back on track.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Link 
          href="/dashboard" 
          className="btn btn-primary inline-flex items-center gap-2 px-6"
        >
          <Home size={16} />
          Go to Dashboard
        </Link>
        <Link 
          href="/" 
          className="btn btn-secondary inline-flex items-center gap-2 px-6"
        >
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>

      {/* Subtle branding */}
      <div className="mt-16 text-xs text-gray-300 font-semibold uppercase tracking-wider">
        Krama · Study Tracker
      </div>
    </div>
  )
}
