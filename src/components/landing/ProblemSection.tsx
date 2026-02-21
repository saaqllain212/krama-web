import { X, Brain } from 'lucide-react'

export default function ProblemSection() {
  return (
    <section className="bg-gradient-to-b from-gray-900 to-black py-24 text-white relative overflow-hidden">
      {/* Animated background gradient orbs */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="mx-auto max-w-6xl px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2 items-center">
          
          {/* Left: The Statement */}
          <div>
            <div className="inline-block bg-gradient-to-r from-primary-500 to-primary-600 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white rounded-full shadow-lg shadow-primary-500/50 mb-8">
              The Reality
            </div>
            <h2 className="text-4xl font-bold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
              You study hard. <br />
              <span className="text-white/30">You still forget.</span>
            </h2>
            <p className="mt-8 text-lg md:text-xl font-medium leading-relaxed text-white/60 max-w-md">
              The human brain is designed to forget <span className="text-white font-bold">50% of what you learn</span> within 24 hours. Cramming fights biology. You will always lose.
            </p>

            {/* Stats */}
            <div className="mt-10 flex gap-8">
              <div className="relative">
                <div className="absolute inset-0 bg-primary-500/20 blur-xl rounded-full" />
                <div className="relative">
                  <div className="text-4xl font-black bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                    50%
                  </div>
                  <div className="text-xs font-bold uppercase text-white/40 mt-1">Forgotten in 24h</div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 blur-xl rounded-full" />
                <div className="relative">
                  <div className="text-4xl font-black text-white">90%</div>
                  <div className="text-xs font-bold uppercase text-white/40 mt-1">Retained with Krama</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: The Comparison */}
          <div className="space-y-4">
            {/* Bad Way */}
            <div className="relative group border border-white/10 bg-gradient-to-br from-red-500/10 to-red-600/5 backdrop-blur-sm p-6 rounded-2xl transition-all hover:border-red-500/30 overflow-hidden">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 text-red-400 mb-3">
                  <div className="p-2.5 bg-red-500/20 rounded-xl backdrop-blur-sm border border-red-500/30">
                    <X className="h-5 w-5 stroke-[3px]" />
                  </div>
                  <h3 className="font-bold uppercase tracking-wider text-sm">The Old Way</h3>
                </div>
                <p className="text-white/50 text-sm leading-relaxed">
                  Study 10 hours straight. Burn out. Forget everything by Monday. Panic before the exam. Repeat.
                </p>
              </div>
            </div>

            {/* Krama Way */}
            <div className="relative group border border-primary-500/30 bg-gradient-to-br from-primary-500/20 to-purple-600/10 backdrop-blur-sm p-6 rounded-2xl overflow-hidden">
              {/* Animated gradient background */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary-400/30 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-400/30 rounded-full blur-2xl group-hover:blur-3xl transition-all duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 bg-gradient-to-br from-primary-500/30 to-purple-600/30 rounded-xl backdrop-blur-sm border border-primary-400/40 group-hover:scale-110 transition-transform duration-300">
                    <Brain className="h-5 w-5 stroke-[2.5px] text-primary-300" />
                  </div>
                  <h3 className="font-bold uppercase tracking-wider text-sm bg-gradient-to-r from-primary-300 to-purple-300 bg-clip-text text-transparent">
                    The Krama Way
                  </h3>
                </div>
                <p className="text-white/80 text-sm leading-relaxed">
                  Study. Rest. Review only what you're about to forget.{' '}
                  <span className="font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent">
                    Retain 90%
                  </span>{' '}
                  with half the effort.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}