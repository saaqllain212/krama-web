'use client'

import { ShieldAlert, Skull, Smartphone, ArrowRight } from 'lucide-react'

export default function SentinelSection() {
  return (
    <section className="border-y-2 border-black bg-[#1A0000] text-white py-24 relative overflow-hidden">
      
      {/* Background Pattern - Pure CSS, no external dependency */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 10px,
          rgba(255,255,255,0.1) 10px,
          rgba(255,255,255,0.1) 20px
        )`
      }} />
      
      {/* Subtle Red Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-600/20 blur-[150px] rounded-full" />

      <div className="mx-auto max-w-6xl px-6 md:px-12 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          
          {/* LEFT: The Pitch */}
          <div>
            <div className="inline-flex items-center gap-2 border-2 border-red-500 bg-red-500 text-white px-4 py-1.5 text-xs font-black uppercase tracking-widest mb-8 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <Skull size={14} /> The Nuclear Option
            </div>
            
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
              Willpower <br/>is a <span className="text-red-500">Lie.</span>
            </h2>
            
            <p className="mt-8 text-xl font-medium leading-relaxed max-w-md text-white/80">
              You don't need "motivation." You need <span className="text-white font-bold">consequences</span>. 
            </p>
            <p className="mt-4 text-lg text-white/60 max-w-md">
              Krama introduces <span className="text-red-400 font-bold underline decoration-red-500/50 decoration-2 underline-offset-4">The Sentinel</span> — a digital dead man's switch that ensures you do the work.
            </p>

            {/* The 3 Steps */}
            <div className="mt-12 space-y-5">
              <div className="flex gap-4 items-start group">
                <div className="bg-white/10 border border-white/20 text-white p-3 shrink-0 font-mono font-bold text-sm group-hover:bg-red-500 group-hover:border-red-500 transition-all duration-300">01</div>
                <div>
                  <h4 className="font-bold uppercase text-base text-white">Set a Target</h4>
                  <p className="text-white/50 text-sm mt-1">Commit to 4 hours of Deep Work. The clock starts at midnight.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start group">
                <div className="bg-white/10 border border-white/20 text-white p-3 shrink-0 font-mono font-bold text-sm group-hover:bg-red-500 group-hover:border-red-500 transition-all duration-300">02</div>
                <div>
                  <h4 className="font-bold uppercase text-base text-white">The Countdown</h4>
                  <p className="text-white/50 text-sm mt-1">The Sentinel watches. If you work, the timer resets. If you slack...</p>
                </div>
              </div>

              <div className="flex gap-4 items-start group">
                <div className="bg-red-500 border border-red-500 text-white p-3 shrink-0 font-mono font-bold text-sm">03</div>
                <div>
                  <h4 className="font-bold uppercase text-base text-red-400">Failure = Exposure</h4>
                  <p className="text-white/70 font-medium text-sm mt-1">
                    We message your Guardian (Dad, Boss, or Partner) and tell them you didn't do the work.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: The Visual (Phone Notification) */}
          <div className="relative flex justify-center">
            {/* The Phone Mockup */}
            <div className="w-full max-w-xs bg-white text-black border-4 border-black p-5 shadow-[12px_12px_0px_0px_rgba(220,38,38,0.5)] rotate-2 hover:rotate-0 transition-transform duration-500">
              {/* Phone Header */}
              <div className="flex justify-between items-center mb-6 pb-3 border-b-2 border-black/10">
                <span className="font-bold text-[10px] uppercase tracking-widest text-black/40">Lock Screen</span>
                <Smartphone size={14} className="text-black/40" />
              </div>

              {/* Notification 1 (Muted) */}
              <div className="mb-4 bg-stone-100 p-3 border-l-4 border-stone-300 opacity-60">
                <div className="flex justify-between text-[9px] font-bold uppercase text-stone-400 mb-1">
                  <span>Instagram</span>
                  <span>2m ago</span>
                </div>
                <p className="text-xs text-stone-400">🔥 liked your story...</p>
              </div>

              {/* Notification 2 (THE ALERT - Hero) */}
              <div className="bg-red-50 p-4 border-2 border-red-500 relative overflow-hidden shadow-lg">
                {/* Corner Badge */}
                <div className="absolute top-0 right-0 p-1.5 bg-red-500 text-white">
                  <ShieldAlert size={12} />
                </div>
                
                <div className="flex justify-between text-[9px] font-black uppercase text-red-700 mb-2">
                  <span>Krama Sentinel</span>
                  <span className="animate-pulse">NOW</span>
                </div>
                <p className="text-sm font-bold text-black leading-snug">
                  🚨 ALERT: Raj failed his daily goal. He promised 4 hours but only did 2.
                </p>
                <p className="text-xs font-bold text-red-600 mt-2 uppercase tracking-wide">
                  Time to hold him accountable.
                </p>
              </div>

              {/* Bottom Text */}
              <div className="mt-8 text-center">
                <p className="text-[10px] font-mono text-black/30 uppercase tracking-wider">
                  Do you dare activate this?
                </p>
              </div>
            </div>
            
            {/* Decor Element */}
            <div className="absolute -bottom-8 -right-4 md:right-4 opacity-10">
              <ArrowRight size={120} className="text-white -rotate-45" strokeWidth={1} />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}