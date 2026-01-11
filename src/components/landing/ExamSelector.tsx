'use client'

import Link from "next/link"

export default function ExamSelector() {
  return (
    <section className="py-24 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* SECTION HEADER */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#1A1A1A] mb-4 tracking-tight">
            Select Your Battleground
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Krama provides structured syllabus trackers for India's toughest exams. 
            Choose yours to start tracking or build your own.
          </p>
        </div>

        {/* THE GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* UPSC CARD */}
          <Link href="/syllabus/upsc/history" className="group bg-[#FBF9F6] p-8 rounded-2xl border border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <span className="text-4xl">🏛️</span>
              <span className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider">
                Union
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">UPSC CSE</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Complete tracker for Prelims & Mains. Covers History, Polity, Geography, Ethics & Optionals.
            </p>
          </Link>

          {/* JEE CARD */}
          <Link href="/syllabus/jee/physics" className="group bg-[#FBF9F6] p-8 rounded-2xl border border-gray-200 hover:border-red-500 hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <span className="text-4xl">⚛️</span>
              <span className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider">
                Engineering
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">JEE Mains</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Chapter-wise tracker for Physics, Chemistry & Maths. Includes weightage analysis.
            </p>
          </Link>

          {/* NEET CARD */}
          <Link href="/syllabus/neet/biology" className="group bg-[#FBF9F6] p-8 rounded-2xl border border-gray-200 hover:border-green-500 hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <span className="text-4xl">🧬</span>
              <span className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider">
                Medical
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors">NEET UG</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              NCERT-aligned syllabus tracker for Biology (Botany/Zoology), Physics & Chemistry.
            </p>
          </Link>

          {/* SSC CARD */}
          <Link href="/syllabus/ssc/cgl" className="group bg-[#FBF9F6] p-8 rounded-2xl border border-gray-200 hover:border-orange-500 hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <span className="text-4xl">📊</span>
              <span className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider">
                Govt Jobs
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">SSC CGL</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Strategic tracker for Quant, Reasoning, English & GA. Tier I & II coverage.
            </p>
          </Link>

          {/* RBI CARD */}
          <Link href="/syllabus/rbi/phase2" className="group bg-[#FBF9F6] p-8 rounded-2xl border border-gray-200 hover:border-purple-500 hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-start mb-6">
              <span className="text-4xl">🏦</span>
              <span className="px-3 py-1 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-full uppercase tracking-wider">
                Banking
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">RBI Grade B</h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Specialized Phase-II tracker for ESI, FM & English Writing skills.
            </p>
          </Link>

          {/* CUSTOM SYLLABUS CARD (Updated) */}
          <div className="group bg-white p-8 rounded-2xl border border-dashed border-gray-300 hover:border-gray-800 hover:bg-gray-50 transition-all cursor-pointer flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-6">
                <span className="text-4xl grayscale opacity-70">🛠️</span>
                <span className="px-3 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-full uppercase tracking-wider">
                  Custom
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-700 mb-2 group-hover:text-black transition-colors">Bring Your Own</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Don't see your exam? You can add your own syllabus structure using simple JSON files.
              </p>
            </div>
          </div>

        </div>

        {/* DISCLAIMER / WARNING (New) */}
        <div className="mt-16 mx-auto max-w-4xl p-4 bg-gray-50 border border-gray-100 rounded-xl text-center">
            <p className="text-xs text-gray-400 leading-relaxed">
                <span className="font-bold text-gray-500">⚠️ Important Note:</span> The syllabus data provided here is structured for tracking and productivity purposes only. 
                While we strive for accuracy, the syllabus is "trickled down" into actionable topics. 
                <br className="hidden md:block"/>
                Always refer to the official notifications from the conducting bodies (UPSC, NTA, SSC, etc.) for the legally accurate syllabus.
            </p>
        </div>

      </div>
    </section>
  )
}