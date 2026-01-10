'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSyllabus } from '@/context/SyllabusContext'
import { MockLogEntry, calculatePhase, calculateRecovery, calculateConsistency, calculateBestTime, getChartData } from '@/lib/analytics'
import { ArrowLeft, TrendingUp, Activity, Zap, Brain, AlertTriangle, Search, X, Info, Sun, AlertCircle, PieChart } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

// ... (TrendChart component remains the same) ...
const TrendChart = ({ data }: { data: { date: string, score: number }[] }) => {
  if (data.length < 2) return (
    <div className="h-[200px] flex items-center justify-center text-xs font-bold text-stone-400 uppercase tracking-widest border-2 border-dashed border-stone-100">
       Need 2+ logs for trajectory
    </div>
  )

  const height = 200
  const width = 800
  const maxScore = 100
  
  const getX = (i: number) => (i / (data.length - 1)) * width
  const getY = (s: number) => height - (s / maxScore) * height
  const points = data.map((d, i) => `${getX(i)},${getY(d.score)}`).join(' ')
  const fillPath = `${points} ${width},${height} 0,${height}`

  return (
    <div className="w-full h-[200px] overflow-hidden relative">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
         <line x1="0" y1={getY(50)} x2={width} y2={getY(50)} stroke="#e5e5e5" strokeWidth="2" strokeDasharray="5,5" />
         <line x1="0" y1={getY(75)} x2={width} y2={getY(75)} stroke="#e5e5e5" strokeWidth="2" strokeDasharray="5,5" />
         <path d={`M ${fillPath}`} fill="rgba(0,0,0,0.05)" stroke="none" />
         <polyline points={points} fill="none" stroke="black" strokeWidth="3" vectorEffect="non-scaling-stroke" />
         {data.map((d, i) => (
            <circle key={i} cx={getX(i)} cy={getY(d.score)} r="4" className="fill-white stroke-black hover:fill-black transition-colors duration-200" strokeWidth="2">
              <title>{d.date}: {d.score}%</title>
            </circle>
         ))}
      </svg>
      <div className="absolute top-0 right-0 text-xs font-bold text-stone-400">100%</div>
      <div className="absolute top-[50%] right-0 text-xs font-bold text-stone-400">50%</div>
      <div className="absolute bottom-0 left-0 text-xs font-bold text-stone-400">{data[0].date}</div>
      <div className="absolute bottom-0 right-0 text-xs font-bold text-stone-400">{data[data.length-1].date}</div>
    </div>
  )
}

function InsightsContent() {
  const { activeExam } = useSyllabus()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const effectiveExamId = searchParams.get('exam') || activeExam || 'upsc'

  const [allLogs, setAllLogs] = useState<MockLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [filterQuery, setFilterQuery] = useState('')

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('mock_logs')
          .select('logs')
          .eq('user_id', user.id)
          .eq('exam_id', effectiveExamId)
          .maybeSingle()
        
        if (data?.logs) {
           const sorted = (data.logs as unknown as MockLogEntry[])
             .sort((a, b) => new Date(a.d).getTime() - new Date(b.d).getTime())
           setAllLogs(sorted)
        }
      }
      setLoading(false)
    }
    fetchLogs()
  }, [effectiveExamId])

  const logs = useMemo(() => {
     if (!filterQuery) return allLogs
     return allLogs.filter(log => log.n.toLowerCase().includes(filterQuery.toLowerCase()))
  }, [allLogs, filterQuery])

  const analytics = useMemo(() => {
    if (logs.length === 0) return null

    // --- NEW: MISTAKE CALCULATION ---
    let totalSilly = 0, totalConcept = 0, totalUnattempted = 0
    let logsWithMistakes = 0

    logs.forEach(log => {
       // Check if this log has any autopsy data
       if (log.si !== undefined || log.co !== undefined || log.ua !== undefined) {
           totalSilly += (log.si || 0)
           totalConcept += (log.co || 0)
           totalUnattempted += (log.ua || 0)
           logsWithMistakes++
       }
    })

    const totalLost = totalSilly + totalConcept + totalUnattempted
    const mistakes = logsWithMistakes > 0 && totalLost > 0 ? {
        hasData: true,
        silly: Math.round((totalSilly / totalLost) * 100),
        concept: Math.round((totalConcept / totalLost) * 100),
        unattempted: Math.round((totalUnattempted / totalLost) * 100),
        totalLost
    } : { hasData: false, silly: 0, concept: 0, unattempted: 0, totalLost: 0 }

    return {
       phase: calculatePhase(logs),
       recovery: calculateRecovery(logs),
       consistency: calculateConsistency(logs),
       bestTime: calculateBestTime(logs),
       chartData: getChartData(logs),
       mistakes // <--- ADDED TO ANALYTICS OBJECT
    }
  }, [logs])

  const getCoachNote = (phase: string) => {
     switch(phase) {
        case 'Instability': return "Your scores are fluctuating significantly. Stop testing. Analyze your last 3 failures deeply."
        case 'Stability': return "You found a baseline. Now push for small, incremental gains. Target one weak subject."
        case 'Growth': return "You are on an upward trajectory! Maintain this rhythm. Do not burn out."
        case 'Peak': return "Excellent performance. You are ready. Focus on maintenance and mental calmness."
        default: return "Insufficient data."
     }
  }

  // Helper for Mistake Advice
  const getMistakeAdvice = (m: { silly: number, concept: number, unattempted: number }) => {
      const max = Math.max(m.silly, m.concept, m.unattempted)
      if (max === m.silly) return "Your main enemy is Carelessness. You know the answers but lose focus. Solution: Read questions twice."
      if (max === m.concept) return "Your main enemy is Knowledge Gaps. You simply don't know enough yet. Solution: Stop testing, go back to books."
      return "Your main enemy is Speed. You are running out of time. Solution: Practice timed sectional tests."
  }

  if (loading) return <div className="min-h-screen bg-[#FDFBF7] p-12 flex items-center justify-center font-bold animate-pulse">ANALYZING PATTERNS...</div>

  if (allLogs.length === 0) {
      return (
        <div className="min-h-screen bg-[#FDFBF7] p-12 flex flex-col items-center justify-center text-center">
           <AlertTriangle size={48} className="text-amber-500 mb-4 opacity-80" />
           <h2 className="text-2xl font-black uppercase mb-4">Insufficient Data</h2>
           <p className="text-stone-600 mb-6 font-medium">We need at least 1 log for <strong>{effectiveExamId.toUpperCase()}</strong>.</p>
           <Link href="/dashboard/mocks" className="bg-black text-white px-8 py-3 font-bold uppercase hover:bg-stone-800">Return to Lab</Link>
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 md:p-12 text-black">
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-6">
        <Link href="/dashboard/mocks" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black">
            <ArrowLeft size={14} /> Back to Lab
        </Link>
      </div>

      <div className="max-w-4xl mx-auto">
         
         {/* BANNER */}
         <div className="mb-10 bg-amber-50 border-l-4 border-amber-500 p-6 shadow-sm flex items-start gap-4">
            <div className="text-amber-600 mt-1 shrink-0">
               <Info size={24} />
            </div>
            <div>
               <h3 className="font-black text-amber-900 text-sm uppercase tracking-wider mb-1">
                  Protocol Disclaimer
               </h3>
               <p className="text-sm text-amber-800 leading-relaxed font-medium">
                  I calculate trends, not destiny. These insights are strictly for tactical awareness. <br className="hidden md:block"/>
                  <span className="font-black">Trust your preparation, not this algorithm.</span> If the graph says &quot;Panic&quot;, ignore it and go study.
               </p>
            </div>
         </div>

         {/* HEADER */}
         <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
             <div>
                <h1 className="text-4xl font-black tracking-tighter uppercase mb-2">Tactical Insights</h1>
                <p className="text-stone-500 font-bold uppercase tracking-widest text-xs">
                    Protocol: {effectiveExamId} | Sample Size: {logs.length}
                </p>
             </div>

             <div className="relative w-full md:w-64">
                <input 
                  type="text" 
                  placeholder="Filter by Name..." 
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full bg-white border-2 border-black p-2 pl-9 font-bold text-sm focus:outline-none focus:shadow-[4px_4px_0_0_#000] transition-all"
                />
                <Search className="absolute left-3 top-2.5 text-black/40" size={14} />
                {filterQuery && (
                   <button onClick={() => setFilterQuery('')} className="absolute right-3 top-2.5 hover:text-red-600">
                     <X size={14} />
                   </button>
                )}
             </div>
         </div>

         {!analytics || logs.length < 3 ? (
             <div className="bg-white border-2 border-dashed border-stone-300 p-12 text-center mb-12">
                <p className="font-bold text-stone-500 uppercase">
                   {filterQuery ? "No logs match your filter." : "Need at least 3 logs to generate insights."}
                </p>
             </div>
         ) : (
            <>
                {/* HERO */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="col-span-1 bg-black text-white p-8 shadow-[8px_8px_0_0_#444]">
                        <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Current Phase</div>
                        <h2 className={`text-3xl font-black uppercase mb-4 ${
                            analytics.phase === 'Growth' ? 'text-green-400' : 
                            analytics.phase === 'Instability' ? 'text-red-400' : 'text-white'
                        }`}>
                            {analytics.phase}
                        </h2>
                        <div className="h-1 w-12 bg-white/20 mb-4"></div>
                        <p className="text-sm font-medium leading-relaxed opacity-90">
                            {getCoachNote(analytics.phase)}
                        </p>
                    </div>

                    <div className="col-span-1 md:col-span-2 bg-white border-2 border-black p-8 shadow-[8px_8px_0_0_#000]">
                        <div className="flex justify-between items-center mb-6">
                            <div className="text-xs font-bold uppercase tracking-widest text-stone-400">Performance Trajectory</div>
                            <div className="flex items-center gap-2 text-xs font-bold uppercase bg-stone-100 px-2 py-1 rounded">
                                <TrendingUp size={14} /> Last 8 Tests
                            </div>
                        </div>
                        <TrendChart data={analytics.chartData.slice(-8)} />
                    </div>
                </div>

                {/* --- NEW SECTION: THE LEAKY BUCKET (Mistake Autopsy) --- */}
                {analytics.mistakes.hasData && (
                    <div className="bg-white border-2 border-red-100 p-8 shadow-[8px_8px_0_0_#ffe4e6] mb-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                            <AlertCircle size={100} className="text-red-500"/>
                        </div>
                        
                        <div className="flex flex-col md:flex-row gap-8 relative z-10">
                            {/* Left: Text Insight */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2 text-red-600">
                                   <PieChart size={18} />
                                   <span className="text-xs font-black uppercase tracking-widest">The Leaky Bucket</span>
                                </div>
                                <h3 className="text-2xl font-black uppercase mb-4 leading-none">
                                    Where are you losing marks?
                                </h3>
                                <p className="text-sm font-medium text-stone-600 leading-relaxed mb-6">
                                    Based on your logs, here is the breakdown of your lost marks. <br/>
                                    <span className="font-bold text-black bg-yellow-100 px-1">
                                        {getMistakeAdvice(analytics.mistakes)}
                                    </span>
                                </p>
                            </div>

                            {/* Right: The Stacked Bar */}
                            <div className="flex-1 flex flex-col justify-center">
                                {/* The Bar */}
                                <div className="h-12 w-full bg-stone-100 flex rounded-md overflow-hidden border-2 border-black/5 mb-4">
                                    {analytics.mistakes.silly > 0 && (
                                        <div style={{ width: `${analytics.mistakes.silly}%` }} className="bg-red-500 h-full flex items-center justify-center text-white font-bold text-xs relative group cursor-help">
                                            {analytics.mistakes.silly}%
                                            <span className="absolute -top-8 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Silly Mistakes</span>
                                        </div>
                                    )}
                                    {analytics.mistakes.concept > 0 && (
                                        <div style={{ width: `${analytics.mistakes.concept}%` }} className="bg-amber-400 h-full flex items-center justify-center text-black font-bold text-xs relative group cursor-help">
                                            {analytics.mistakes.concept}%
                                            <span className="absolute -top-8 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Conceptual Errors</span>
                                        </div>
                                    )}
                                    {analytics.mistakes.unattempted > 0 && (
                                        <div style={{ width: `${analytics.mistakes.unattempted}%` }} className="bg-stone-300 h-full flex items-center justify-center text-stone-600 font-bold text-xs relative group cursor-help">
                                            {analytics.mistakes.unattempted}%
                                            <span className="absolute -top-8 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Unattempted</span>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Legend */}
                                <div className="flex justify-between text-xs font-bold uppercase text-stone-400">
                                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"></div> Silly</div>
                                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-amber-400 rounded-full"></div> Conceptual</div>
                                    <div className="flex items-center gap-1"><div className="w-2 h-2 bg-stone-300 rounded-full"></div> Unattempted</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}


                {/* METRICS GRID - NOW WITH GOLDEN HOUR */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    
                    <div className="bg-white border-2 border-stone-200 p-6 hover:border-black transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-yellow-100 text-yellow-700 p-2 rounded-md"><Sun size={20} /></div>
                            <div className="font-bold uppercase text-sm">Prime Time</div>
                        </div>
                        <div className="text-2xl font-black uppercase mb-2">
                           {analytics.bestTime.status === 'found' ? analytics.bestTime.time : '—'}
                        </div>
                        <p className="text-xs font-medium text-stone-500 leading-relaxed">
                            {analytics.bestTime.status === 'found' 
                               ? `You score highest (avg ${analytics.bestTime.avg}%) when testing in the ${analytics.bestTime.time}.`
                               : "Log more tests at different times to find your peak."}
                        </p>
                    </div>

                    <div className="bg-white border-2 border-stone-200 p-6 hover:border-black transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-amber-100 text-amber-700 p-2 rounded-md"><Zap size={20} /></div>
                            <div className="font-bold uppercase text-sm">Bounce Back</div>
                        </div>
                        <div className="text-2xl font-black uppercase mb-2">
                            {analytics.recovery.status === 'fast' ? 'Rapid' : 
                            analytics.recovery.status === 'slow' ? 'Sluggish' : 
                            analytics.recovery.status === 'none' ? 'Stable' : 'Moderate'}
                        </div>
                        <p className="text-xs font-medium text-stone-500 leading-relaxed">
                            {analytics.recovery.status === 'none' 
                                ? "No major dips detected recently." 
                                : `It takes ~${analytics.recovery.count || '?'} tests to recover.`
                            }
                        </p>
                    </div>

                    <div className="bg-white border-2 border-stone-200 p-6 hover:border-black transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-blue-100 text-blue-700 p-2 rounded-md"><Activity size={20} /></div>
                            <div className="font-bold uppercase text-sm">Main Threat</div>
                        </div>
                        <div className="text-2xl font-black uppercase mb-2">
                            {analytics.consistency.status === 'solid' ? 'None' : analytics.consistency.status}
                        </div>
                        <p className="text-xs font-medium text-stone-500 leading-relaxed">
                            {analytics.consistency.status === 'solid' 
                                ? "Performance solid." 
                                : analytics.consistency.status === 'stress' 
                                    ? "High stress kills your scores." 
                                    : "Fatigue is your main enemy."
                            }
                        </p>
                    </div>

                    <div className="bg-white border-2 border-stone-200 p-6 hover:border-black transition-colors">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-purple-100 text-purple-700 p-2 rounded-md"><Brain size={20} /></div>
                            <div className="font-bold uppercase text-sm">Mental State</div>
                        </div>
                        <div className="text-2xl font-black uppercase mb-2">
                            {analytics.phase === 'Instability' ? 'Entropy' : 'Focused'}
                        </div>
                        <p className="text-xs font-medium text-stone-500 leading-relaxed">
                            {analytics.phase === 'Instability' 
                                ? "Graph is chaotic. Focus on basics." 
                                : "Baseline holding steady."
                            }
                        </p>
                    </div>
                </div>

                {/* TABLE */}
                <div className="bg-white border-2 border-stone-200 mb-20">
                    <div className="p-4 border-b-2 border-stone-200 bg-stone-50 text-xs font-black uppercase tracking-widest text-stone-500 flex justify-between">
                        <span>Source Data (Recent 8)</span>
                        <span className="text-stone-400">Total: {logs.length}</span>
                    </div>
                    <div className="divide-y divide-stone-100">
                        {[...logs].reverse().slice(0, 8).map(log => {
                            const pct = Math.round((log.s / log.m) * 100)
                            return (
                                <div key={log.id} className="p-4 flex justify-between items-center text-sm hover:bg-stone-50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="font-mono font-bold text-stone-400 w-24">{new Date(log.d).toLocaleDateString()}</div>
                                        <div className="font-bold uppercase truncate max-w-[200px] md:max-w-xs">{log.n}</div>
                                        {/* Show Time Icon if available */}
                                        {log.t && (
                                            <span className="text-[10px] font-bold uppercase bg-stone-200 px-1.5 py-0.5 rounded text-stone-500">
                                                {log.t}
                                            </span>
                                        )}
                                    </div>
                                    <div className="font-black">{pct}%</div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </>
         )}
      </div>
    </div>
  )
}

export default function InsightsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-bold">LOADING...</div>}>
      <InsightsContent />
    </Suspense>
  )
}