'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSyllabus } from '@/context/SyllabusContext'
import { MockLogEntry, calculatePhase } from '@/lib/analytics'
import { ArrowLeft, Plus, Activity, AlertCircle, Search, X, TrendingUp, Target, Award, BarChart3 } from 'lucide-react'
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
    if (activeExam && activeExam !== 'focus') setViewExamId(activeExam)
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
    setSearchQuery('')
  }, [viewExamId]) 

  // --- FILTERING ---
  const displayLogs = useMemo(() => {
    let filtered = logs
    if (searchQuery.trim()) {
      filtered = logs.filter(l => l.n.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    return filtered.slice(0, 8)
  }, [logs, searchQuery])

  // --- METRICS ---
  const totalMocks = logs.length
  const chronologicalLogs = [...logs].reverse()
  const phase = calculatePhase(chronologicalLogs)
  const bestScore = logs.length > 0 ? Math.max(...logs.map(l => Math.round((l.s/l.m)*100))) : 0
  const avgScore = logs.length > 0 ? Math.round(logs.reduce((a, b) => a + (b.s/b.m)*100, 0) / logs.length) : 0

  // Phase color helper
  const getPhaseColor = (p: string) => {
    switch(p) {
      case 'Peak': return 'text-green-600 bg-green-50'
      case 'Growth': return 'text-blue-600 bg-blue-50'
      case 'Stability': return 'text-amber-600 bg-amber-50'
      case 'Instability': return 'text-red-600 bg-red-50'
      default: return 'text-stone-600 bg-stone-50'
    }
  }

  const EXAM_TABS = ['upsc', 'ssc', 'bank', 'jee', 'neet', 'rbi', 'custom']

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-black" suppressHydrationWarning={true}>
      
      {/* HEADER */}
      <div className="mb-8">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-black/40 hover:text-black transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Dashboard
        </Link>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">Mock Tests</h1>
            
            {/* TABS - Scrollable on mobile */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
              {EXAM_TABS.map(id => (
                <button
                  key={id}
                  onClick={() => setViewExamId(id)}
                  className={`px-4 py-2.5 text-sm font-bold uppercase tracking-wide border-2 transition-all whitespace-nowrap ${
                    viewExamId === id 
                      ? 'bg-black text-white border-black' 
                      : 'bg-white text-black/50 border-black/20 hover:border-black hover:text-black'
                  }`}
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex gap-3 w-full lg:w-auto">
            {logs.length >= 2 && (
              <Link 
                href={`/dashboard/mocks/insights?exam=${viewExamId}`} 
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 border-2 border-black font-bold uppercase text-sm tracking-wide hover:bg-black hover:text-white transition-all"
              >
                <BarChart3 size={18} /> Analysis
              </Link>
            )}
            <button 
              onClick={() => setIsModalOpen(true)} 
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 bg-black text-white border-2 border-black font-bold uppercase text-sm tracking-wide hover:bg-stone-800 transition-all shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
            >
              <Plus size={18} /> Log Test
            </button>
          </div>
        </div>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-10">
        <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0_0_#000]">
          <div className="flex items-center gap-2 text-black/50 mb-2">
            <Activity size={16} />
            <span className="text-xs font-bold uppercase tracking-wide">Total</span>
          </div>
          <div className="text-3xl md:text-4xl font-black">{totalMocks}</div>
        </div>
        
        <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0_0_#000]">
          <div className="flex items-center gap-2 text-black/50 mb-2">
            <TrendingUp size={16} />
            <span className="text-xs font-bold uppercase tracking-wide">Phase</span>
          </div>
          <div className={`inline-block px-3 py-1 text-lg md:text-xl font-black uppercase ${getPhaseColor(phase)}`}>
            {phase}
          </div>
        </div>
        
        <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0_0_#000]">
          <div className="flex items-center gap-2 text-black/50 mb-2">
            <Award size={16} />
            <span className="text-xs font-bold uppercase tracking-wide">Best</span>
          </div>
          <div className="text-3xl md:text-4xl font-black">{bestScore}<span className="text-lg text-black/40">%</span></div>
        </div>
        
        <div className="bg-white border-2 border-black p-5 shadow-[4px_4px_0_0_#000]">
          <div className="flex items-center gap-2 text-black/50 mb-2">
            <Target size={16} />
            <span className="text-xs font-bold uppercase tracking-wide">Average</span>
          </div>
          <div className="text-3xl md:text-4xl font-black">{avgScore}<span className="text-lg text-black/40">%</span></div>
        </div>
      </div>

      {/* RECENT LOGS */}
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h3 className="text-xl font-black uppercase tracking-tight">
            Recent Tests
          </h3>
          
          {/* SEARCH BAR */}
          {logs.length > 0 && (
            <div className="relative w-full md:w-72">
              <input 
                type="text" 
                placeholder="Search tests..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border-2 border-black p-3 pl-10 font-bold text-sm focus:outline-none focus:shadow-[3px_3px_0_0_#000] transition-all placeholder:text-black/30"
              />
              <Search className="absolute left-3 top-3.5 text-black/40" size={18} />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3.5 text-black/40 hover:text-red-600 transition-colors">
                  <X size={18} />
                </button>
              )}
            </div>
          )}
        </div>
        
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="h-20 bg-stone-100 animate-pulse" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="border-2 border-dashed border-black/20 p-12 text-center">
            <AlertCircle className="mx-auto mb-4 text-black/20" size={40} />
            <p className="text-lg font-bold text-black/40 mb-2">No tests logged yet</p>
            <p className="text-sm text-black/30 mb-6">Start tracking your mock test scores</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-black text-white font-bold uppercase text-sm"
            >
              <Plus size={16} /> Log Your First Test
            </button>
          </div>
        ) : displayLogs.length === 0 ? (
          <div className="border-2 border-dashed border-black/20 p-8 text-center">
            <p className="font-bold text-black/40">No tests match &quot;{searchQuery}&quot;</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayLogs.map((log) => {
              const pct = Math.round((log.s / log.m) * 100)
              const isGood = pct >= 60
              
              return (
                <div 
                  key={log.id} 
                  className="group bg-white border-2 border-black/10 hover:border-black p-5 flex justify-between items-center transition-all hover:shadow-[4px_4px_0_0_#000]"
                >
                  <div className="min-w-0 flex-1 mr-4">
                    <div className="font-bold text-base md:text-lg truncate mb-1">{log.n}</div>
                    <div className="flex items-center gap-3 text-xs font-bold text-black/40">
                      <span>{new Date(log.d).toLocaleDateString()}</span>
                      {log.a && <span>Accuracy: {log.a}%</span>}
                      {log.t && <span className="uppercase">{log.t}</span>}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-2xl md:text-3xl font-black ${isGood ? 'text-black' : 'text-red-600'}`}>
                      {pct}%
                    </div>
                    <div className="text-xs font-bold text-black/40">{log.s}/{log.m}</div>
                  </div>
                </div>
              )
            })}
            
            {/* HINT IF MORE LOGS EXIST */}
            {!searchQuery && logs.length > 8 && (
              <div className="text-center py-4">
                <span className="text-sm font-bold text-black/40">
                  Showing 8 of {logs.length} tests • 
                </span>
                <Link 
                  href={`/dashboard/mocks/insights?exam=${viewExamId}`}
                  className="text-sm font-bold text-black hover:underline ml-1"
                >
                  View all in Analysis
                </Link>
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