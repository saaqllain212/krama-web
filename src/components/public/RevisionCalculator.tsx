'use client'

import React, { useState, useEffect } from 'react' // Import useEffect
import { CalendarDays, ArrowRight, Zap } from 'lucide-react'
import Link from 'next/link'

export default function RevisionCalculator() {
  // 1. Start with an empty string to avoid Mismatch
  const [date, setDate] = useState<string>("")
  
  // 2. Set "Today" only once we are on the Client (Browser)
  useEffect(() => {
     setDate(new Date().toISOString().split('T')[0])
  }, [])

  const intervals = [1, 3, 7, 14, 30]

  const calculateDates = (startDate: string) => {
    if (!startDate) return []
    const start = new Date(startDate)
    return intervals.map(gap => {
      const d = new Date(start)
      d.setDate(d.getDate() + gap)
      return { 
        gap, 
        // 3. FORCE 'en-GB' LOCALE to fix the "Mon, 12 Jan" error
        dateStr: d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric', weekday: 'short' }) 
      }
    })
  }

  const schedule = calculateDates(date)

  // 4. Loading State (Prevents layout shift while date loads)
  if (!date) return (
     <section className="mt-8 mb-12 bg-stone-100 h-64 rounded-2xl animate-pulse border-4 border-stone-200"></section>
  )

  return (
    // Added 'mb-12' for spacing since it's now at the top
    <section className="mt-8 mb-12 bg-white border-4 border-black p-8 rounded-2xl shadow-[8px_8px_0_0_#000]">
       
       <div className="md:flex justify-between items-start gap-8">
          
          {/* LEFT: INPUT */}
          <div className="flex-1 mb-8 md:mb-0">
             <div className="inline-block bg-amber-400 border-2 border-black px-3 py-1 text-[10px] font-black uppercase tracking-widest mb-4">
                Free Tool
             </div>
             <h2 className="text-3xl font-black uppercase leading-none mb-4">
                Don't Study blindly. <br/>Calculate your Plan.
             </h2>
             <p className="text-stone-600 font-medium mb-6 leading-relaxed">
                Pick a starting date for this subject. We will generate the scientifically perfect revision schedule for you.
             </p>
             
             <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-2">Start Date</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-stone-100 border-2 border-stone-200 p-4 font-bold rounded-lg focus:border-black outline-none transition-colors"
                />
             </div>
          </div>

          {/* RIGHT: OUTPUT */}
          <div className="flex-1 bg-stone-50 border-2 border-stone-200 rounded-xl p-6">
             <div className="flex items-center gap-2 mb-6 border-b-2 border-stone-200 pb-4">
                <CalendarDays className="text-stone-400" size={20} />
                <span className="font-black uppercase tracking-widest text-xs text-stone-500">Your Generated Schedule</span>
             </div>

             <div className="space-y-4">
                {schedule.map((item, i) => (
                   <div key={item.gap} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                         <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">
                            {i + 1}
                         </div>
                         <div className="font-bold text-sm text-stone-700">
                            {item.dateStr}
                         </div>
                      </div>
                      <div className="text-[10px] font-black uppercase text-stone-300">
                         +{item.gap} Days
                      </div>
                   </div>
                ))}
             </div>

             {/* THE CONVERSION BUTTON */}
             <div className="mt-8 pt-6 border-t-2 border-stone-200">
                <div className="flex items-start gap-3 mb-4">
                   <Zap className="text-amber-500 shrink-0" size={18} />
                   <p className="text-xs font-medium text-stone-500 italic">
                      "I'm going to forget these dates."
                   </p>
                </div>
                <Link href="/signup" className="flex items-center justify-center gap-2 w-full bg-black text-white py-4 rounded-lg font-bold uppercase text-xs hover:bg-stone-800 hover:scale-[1.02] transition-all">
                   Save to My Calendar (Free) <ArrowRight size={16} />
                </Link>
             </div>
          </div>

       </div>
    </section>
  )
}