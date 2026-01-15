'use client'

import { ShieldAlert, Skull, Timer, Smartphone, ArrowRight } from 'lucide-react'

export default function SentinelSection() {
  return (
    <section className="border-y-2 border-black bg-[#FF0000] text-white py-24 relative overflow-hidden">
      
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>

      <div className="mx-auto max-w-6xl px-6 md:px-12 relative z-10">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          
          {/* LEFT: The Pitch */}
          <div>
            <div className="inline-flex items-center gap-2 border-2 border-black bg-black text-white px-3 py-1 text-xs font-bold uppercase tracking-widest mb-6">
              <Skull size={14} /> The Nuclear Option
            </div>
            
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
              Willpower <br/>is a <span className="text-black text-stroke-white">Lie.</span>
            </h2>
            
            <p className="mt-6 text-xl font-bold leading-relaxed max-w-md">
              You don't need "motivation." You need consequences. 
              <br/><br/>
              Krama introduces <span className="underline decoration-black decoration-4 underline-offset-4">The Sentinel</span>—a digital dead man's switch that ensures you do the work.
            </p>

            {/* The 3 Steps */}
            <div className="mt-12 space-y-6">
              <div className="flex gap-4 items-start">
                <div className="bg-black text-white p-3 border-2 border-black shrink-0 font-mono font-bold">01</div>
                <div>
                  <h4 className="font-bold uppercase text-lg">Set a Target</h4>
                  <p className="text-white/80 text-sm">Commit to 4 hours of Deep Work. The clock starts at midnight.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-black text-white p-3 border-2 border-black shrink-0 font-mono font-bold">02</div>
                <div>
                  <h4 className="font-bold uppercase text-lg">The Countdown</h4>
                  <p className="text-white/80 text-sm">The Sentinel watches. If you work, the timer stops.</p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="bg-white text-[#FF0000] p-3 border-2 border-black shrink-0 font-mono font-bold">03</div>
                <div>
                  <h4 className="font-bold uppercase text-lg">Failure = Exposure</h4>
                  <p className="text-white/90 font-bold text-sm">
                    If you fail, we message your Guardian (Dad, Boss, or Partner) and tell them you slacked off.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: The Visual (Phone Notification) */}
          <div className="relative">
            {/* The Phone Mockup */}
            <div className="mx-auto max-w-xs bg-white text-black border-4 border-black p-4 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rotate-3 hover:rotate-0 transition-transform duration-500">
               <div className="flex justify-between items-center mb-6 border-b-2 border-black pb-2">
                 <span className="font-bold text-xs uppercase text-gray-400">Lock Screen</span>
                 <Smartphone size={16} />
               </div>

               {/* Notification 1 */}
               <div className="mb-4 bg-gray-100 p-3 border-l-4 border-gray-300">
                  <div className="flex justify-between text-[10px] font-bold uppercase text-gray-500 mb-1">
                    <span>Instagram</span>
                    <span>2m ago</span>
                  </div>
                  <p className="text-xs text-gray-400">🔥 liked your story...</p>
               </div>

               {/* Notification 2 (THE ALERT) */}
               <div className="bg-red-50 p-4 border-2 border-red-600 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-1 bg-red-600 text-white">
                    <ShieldAlert size={12} />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold uppercase text-red-800 mb-1">
                    <span>Krama Sentinel</span>
                    <span>NOW</span>
                  </div>
                  <p className="text-sm font-bold text-black leading-tight">
                    🚨 ALERT: Raj failed his daily goal. He promised 4 hours but only did 2. Shame him.
                  </p>
               </div>

               <div className="mt-8 text-center">
                 <p className="text-[10px] font-mono text-gray-400 uppercase">Do you dare activate this?</p>
               </div>
            </div>
            
            {/* Decor Elements */}
            <div className="absolute -bottom-10 -right-10 md:right-0">
               <ArrowRight size={100} className="text-black opacity-20 -rotate-45" />
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}