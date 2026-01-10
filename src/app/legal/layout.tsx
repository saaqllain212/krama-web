import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
      {/* Simple Header */}
      <header className="border-b-2 border-black bg-white px-6 py-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="text-2xl font-black uppercase tracking-tighter">Krama</div>
          <Link href="/" className="flex items-center gap-2 text-sm font-bold uppercase hover:underline">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl py-12 px-6">
        <div className="bg-white p-8 border-2 border-black/5 shadow-sm md:p-12">
           {children}
        </div>
      </main>

      {/* Footer Links */}
      <footer className="py-12 text-center">
        <div className="flex justify-center gap-6 text-xs font-bold uppercase text-stone-400">
           <Link href="/legal/terms" className="hover:text-black">Terms</Link>
           <Link href="/legal/privacy" className="hover:text-black">Privacy</Link>
           <Link href="/legal/refund" className="hover:text-black">Refunds</Link>
        </div>
        <div className="mt-4 text-[10px] text-stone-300 uppercase">
           © {new Date().getFullYear()} Krama. All rights reserved.
        </div>
      </footer>
    </div>
  )
}