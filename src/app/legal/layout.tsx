import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-5">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="text-2xl font-bold uppercase tracking-tight text-gray-900 hover:text-primary-600 transition-colors">
            Krama
          </Link>
          <Link href="/" className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl py-12 px-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-soft p-8 md:p-12">
           {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 text-center">
        <div className="flex justify-center gap-8 text-sm font-medium text-gray-400">
           <Link href="/legal/terms" className="hover:text-gray-900 transition-colors">Terms</Link>
           <Link href="/legal/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
           <Link href="/legal/refund" className="hover:text-gray-900 transition-colors">Refunds</Link>
        </div>
        <div className="mt-4 text-xs text-gray-300 font-medium">
           © {new Date().getFullYear()} Krama Systems. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
