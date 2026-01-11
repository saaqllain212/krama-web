import { X, TrendingDown, Brain } from 'lucide-react'

export default function ProblemSection() {
  return (
    <section className="bg-black py-24 text-white">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
          
          {/* Left: The Statement */}
          <div>
            <div className="inline-block border-2 border-brand bg-brand px-3 py-1 text-xs font-bold uppercase tracking-widest text-black">
              The Reality
            </div>
            <h2 className="mt-6 text-5xl font-bold leading-tight tracking-tighter md:text-6xl">
              You study hard. <br />
              <span className="text-white/40">You still forget.</span>
            </h2>
            <p className="mt-6 text-xl font-medium leading-relaxed text-white/60">
              The human brain is designed to forget 50% of what you learn within 24 hours. Cramming fights biology. You will always lose.
            </p>
          </div>

          {/* Right: The Comparison */}
          <div className="space-y-6">
            {/* Bad Way */}
            <div className="border-2 border-white/20 bg-white/5 p-6 transition hover:border-red-500/50">
              <div className="flex items-center gap-3 text-red-400">
                <X className="h-6 w-6 stroke-[3px]" />
                <h3 className="font-bold uppercase tracking-wider">The Old Way</h3>
              </div>
              <p className="mt-2 text-white/60">
                Study 10 hours straight. Burn out. Forget everything by Monday. Panic before the exam.
              </p>
            </div>

            {/* Krama Way */}
            <div className="border-2 border-brand bg-brand/10 p-6">
              <div className="flex items-center gap-3 text-brand">
                <Brain className="h-6 w-6 stroke-[3px]" />
                <h3 className="font-bold uppercase tracking-wider">The Krama Way</h3>
              </div>
              <p className="mt-2 text-white/80">
                Study. Rest. Review only what you're about to forget. Retain 90% with half the effort.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}