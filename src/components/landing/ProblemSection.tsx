import { X, Brain, TrendingUp } from 'lucide-react'

export default function ProblemSection() {
  return (
    <section className="bg-black py-24 text-white">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2 items-center">
          
          {/* Left: The Statement */}
          <div>
            <div className="inline-block border-2 border-brand bg-brand px-4 py-1.5 text-xs font-black uppercase tracking-widest text-black shadow-[3px_3px_0px_0px_rgba(255,255,255,0.2)] mb-8">
              The Reality
            </div>
            <h2 className="text-4xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
              You study hard. <br />
              <span className="text-white/30">You still forget.</span>
            </h2>
            <p className="mt-8 text-lg font-medium leading-relaxed text-white/60 max-w-md">
              The human brain is designed to forget <span className="text-white font-bold">50% of what you learn</span> within 24 hours. Cramming fights biology. You will always lose.
            </p>

            {/* Stats */}
            <div className="mt-10 flex gap-8">
              <div>
                <div className="text-4xl font-black text-brand">50%</div>
                <div className="text-xs font-bold uppercase text-white/40 mt-1">Forgotten in 24h</div>
              </div>
              <div>
                <div className="text-4xl font-black text-white">90%</div>
                <div className="text-xs font-bold uppercase text-white/40 mt-1">Retained with Krama</div>
              </div>
            </div>
          </div>

          {/* Right: The Comparison */}
          <div className="space-y-4">
            {/* Bad Way */}
            <div className="border-2 border-white/10 bg-white/5 p-6 transition-all hover:border-red-500/50 group">
              <div className="flex items-center gap-3 text-red-400 mb-3">
                <div className="p-2 bg-red-500/20 rounded-sm">
                  <X className="h-5 w-5 stroke-[3px]" />
                </div>
                <h3 className="font-bold uppercase tracking-wider text-sm">The Old Way</h3>
              </div>
              <p className="text-white/50 text-sm leading-relaxed">
                Study 10 hours straight. Burn out. Forget everything by Monday. Panic before the exam. Repeat.
              </p>
            </div>

            {/* Krama Way */}
            <div className="border-2 border-brand bg-brand/10 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-brand/20 blur-2xl" />
              <div className="flex items-center gap-3 text-brand mb-3 relative z-10">
                <div className="p-2 bg-brand/20 rounded-sm">
                  <Brain className="h-5 w-5 stroke-[2.5px]" />
                </div>
                <h3 className="font-bold uppercase tracking-wider text-sm">The Krama Way</h3>
              </div>
              <p className="text-white/80 text-sm leading-relaxed relative z-10">
                Study. Rest. Review only what you're about to forget. <span className="text-brand font-bold">Retain 90%</span> with half the effort.
              </p>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}