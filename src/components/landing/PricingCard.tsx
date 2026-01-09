import Link from 'next/link'
import { Infinity } from 'lucide-react'

export default function PricingCard() {
  return (
    <section className="px-6 py-24 md:px-12">
      <h2 className="mb-12 text-center text-4xl font-bold uppercase tracking-tight md:text-5xl">
        The Passport
      </h2>

      <div className="mx-auto max-w-xl border-neo bg-white p-8 shadow-neo md:p-12">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-mono text-sm uppercase text-black/60">
              Krama Lifetime Access
            </div>
            <div className="mt-2 text-6xl font-bold tracking-tighter">
              ₹199
            </div>
            <div className="mt-2 font-mono text-sm text-black/60">
              One payment. Forever.
            </div>
          </div>
          <Infinity className="h-12 w-12 stroke-[2.5px]" />
        </div>

        <hr className="my-8 border-t-2 border-black" />

        <ul className="space-y-4 font-mono text-sm md:text-base">
          <li className="flex items-center gap-3">
            <span className="font-bold">✓</span> All 4 tools unlocked
          </li>
          <li className="flex items-center gap-3">
            <span className="font-bold">✓</span> Unlimited sessions
          </li>
          <li className="flex items-center gap-3">
            <span className="font-bold">✓</span> Your data stays private
          </li>
          <li className="flex items-center gap-3">
            <span className="font-bold">✓</span> No ads, ever
          </li>
          <li className="flex items-center gap-3">
            <span className="font-bold">✓</span> 14-day free trial
          </li>
        </ul>

        <Link 
          href="/signup"
          className="mt-10 block w-full border-neo bg-brand py-4 text-center text-sm font-bold uppercase tracking-wide shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          Start 14-Day Free Trial
        </Link>
        
        <p className="mt-4 text-center font-mono text-xs text-black/40">
          No credit card required. Cancel anytime.
        </p>
      </div>
    </section>
  )
}