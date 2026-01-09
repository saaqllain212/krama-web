'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSyllabus } from '@/context/SyllabusContext'
import { MockLogEntry, calculatePhase } from '@/lib/analytics'
import { ArrowLeft, Plus, Activity, AlertCircle, Search, X } from 'lucide-react'
import Link from 'next/link'
import MocksModal from '@/components/mocks/MocksModal'

export default function MocksPage() {
  const { activeExam } = useSyllabus()
  const supabase = createClient()
  
  const [viewExamId, setViewExamId] = useState<string>('upsc')
  const [logs, setLogs] = useState<MockLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Sync view with active exam on mount
  useEffect(() => {
    if (activeExam) setViewExamId(activeExam)
  }, [activeExam])

  // FETCH LOGS
  const fetchLogs = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data } = await supabase
        .from('mock_logs')
        .select('logs')
        .eq('user_id', user.id)
        .eq('exam_id', viewExamId)
        .maybeSingle()
      
      if (data?.logs) {
         // Sort NEWEST first for the list UI
         const sorted = (data.logs as unknown as MockLogEntry[])
           .sort((a, b) => new Date(b.d).getTime() - new Date(a.d).getTime())
         setLogs(sorted)
      } else {
         setLogs([])
      }
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchLogs()
    setSearchQuery('') // Reset search when switching tabs
  }, [viewExamId]) 

  // --- FILTERING & HARD LOCK LOGIC ---
  const displayLogs = useMemo(() => {
    let filtered = logs
    if (searchQuery.trim()) {
      filtered = logs.filter(l => l.n.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    // HARD LOCK: Only show top 8
    return filtered.slice(0, 8)
  }, [logs, searchQuery])

  // --- METRICS (Calculated on ALL logs, not just visible ones) ---
  const totalMocks = logs.length
  
  // Reverse for chronological trend calculation
  const chronologicalLogs = [...logs].reverse()
  const phase = calculatePhase(chronologicalLogs)
  
  const bestScore = logs.length > 0 ? Math.max(...logs.map(l => Math.round((l.s/l.m)*100))) : 0
  const avgScore = logs.length > 0 ? Math.round(logs.reduce((a, b) => a + (b.s/b.m)*100, 0) / logs.length) : 0

  return (
    // FIX: suppressHydrationWarning added here to ignore Proton Pass injections
    <div 
      className="min-h-screen bg-[#FDFBF7] p-6 md:p-12 text-black"
      suppressHydrationWarning={true}
    >
      
      {/* HEADER */}
      <Link href="/dashboard" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black mb-8">
         <ArrowLeft size={14} /> Dashboard
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
        <div>
          <h1 className="text-6xl font-black tracking-tighter uppercase mb-4">Mocks Lab</h1>
          
          {/* TABS */}
          <div className="flex gap-2">
            {['upsc', 'ssc', 'bank', 'custom'].map(id => (
              <button
                key={id}
                onClick={() => setViewExamId(id)}
                className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border-2 transition-all ${
                  viewExamId === id 
                    ? 'bg-black text-white border-black' 
                    : 'bg-white text-stone-400 border-stone-200 hover:border-black hover:text-black'
                }`}
              >
                {id}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex gap-4">
           {logs.length > 2 && (
             <Link 
               href={`/dashboard/mocks/insights?exam=${viewExamId}`} 
               className="flex items-center gap-2 px-6 py-3 border-2 border-black font-bold uppercase hover:bg-black hover:text-white transition-all"
             >
               <Activity size={16} /> Analysis
             </Link>
           )}
           <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-3 bg-black text-white font-bold uppercase hover:bg-stone-800 transition-all shadow-[6px_6px_0_0_#000]">
             <Plus size={16} /> Log Entry
           </button>
        </div>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
         <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#000]">
            <div className="text-xs font-bold uppercase text-stone-400 mb-1">Total Logs</div>
            <div className="text-4xl font-black">{totalMocks}</div>
         </div>
         <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#000]">
            <div className="text-xs font-bold uppercase text-stone-400 mb-1">Current Phase</div>
            <div className={`text-2xl font-black uppercase ${phase === 'Peak' ? 'text-green-600' : phase === 'Instability' ? 'text-red-600' : 'text-amber-600'}`}>
              {phase}
            </div>
         </div>
         <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#000]">
            <div className="text-xs font-bold uppercase text-stone-400 mb-1">Best Score</div>
            <div className="text-4xl font-black">{bestScore}%</div>
         </div>
         <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#000]">
            <div className="text-xs font-bold uppercase text-stone-400 mb-1">Average</div>
            <div className="text-4xl font-black">{avgScore}%</div>
         </div>
      </div>

      {/* RECENT LOGS LIST */}
      <div className="max-w-4xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h3 className="text-xl font-black uppercase flex items-center gap-2">
            <Activity size={20} /> {viewExamId.toUpperCase()} Transmissions
          </h3>
          
          {/* SEARCH BAR */}
          <div className="relative w-full md:w-64">
             <input 
               type="text" 
               placeholder="Search by Name..." 
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full bg-white border-2 border-black p-2 pl-9 font-bold text-sm focus:outline-none focus:shadow-[4px_4px_0_0_#000] transition-all placeholder:text-stone-300"
             />
             <Search className="absolute left-3 top-2.5 text-black/40" size={14} />
             {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 hover:text-red-600">
                  <X size={14} />
                </button>
             )}
          </div>
        </div>
        
        {loading ? (
          <div className="animate-pulse font-bold text-stone-400">SYNCING DATABASE...</div>
        ) : logs.length === 0 ? (
          <div className="border-2 border-dashed border-stone-300 p-12 text-center text-stone-400 font-bold uppercase">
             <AlertCircle className="mx-auto mb-2 opacity-50" />
             No data for {viewExamId}. Initialize Log Entry.
          </div>
        ) : displayLogs.length === 0 ? (
          <div className="border-2 border-dashed border-stone-300 p-8 text-center text-stone-400 font-bold uppercase">
             No logs match &quot;{searchQuery}&quot;
          </div>
        ) : (
          <div className="space-y-3">
            {displayLogs.map((log) => {
              const pct = Math.round((log.s / log.m) * 100)
              return (
                <div key={log.id} className="group bg-white border-2 border-stone-100 hover:border-black p-5 flex justify-between items-center transition-all">
                  <div>
                    <div className="font-bold text-lg uppercase mb-1">{log.n}</div>
                    <div className="text-xs font-bold text-stone-400 uppercase">
                      {new Date(log.d).toLocaleDateString()} | {log.a ? `ACCURACY: ${log.a}%` : 'N/A'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black">{pct}%</div>
                    <div className="text-xs font-bold text-stone-400">{log.s}/{log.m}</div>
                  </div>
                </div>
              )
            })}
            
            {/* HINT IF MORE LOGS EXIST */}
            {!searchQuery && logs.length > 8 && (
               <div className="text-center text-xs font-bold uppercase text-stone-400 mt-4 tracking-widest">
                  Showing recent 8 of {logs.length} logs
               </div>
            )}
          </div>
        )}
      </div>

      <MocksModal 
         open={isModalOpen} 
         onClose={() => setIsModalOpen(false)} 
         examId={viewExamId} 
         onSuccess={fetchLogs} 
      />

    </div>
  )
}