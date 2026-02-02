'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSyllabus } from '@/context/SyllabusContext'
import { MockLogEntry, calculatePhase, calculateRecovery, calculateConsistency, calculateBestTime, getChartData } from '@/lib/analytics'
import { ArrowLeft, TrendingUp, Activity, Zap, Brain, AlertTriangle, Search, X, Sun, PieChart, Target, Clock } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

// --- TREND CHART COMPONENT ---
const TrendChart = ({ data }: { data: { date: string, score: number }[] }) => {
  if (data.length < 2) return (
    <div className="h-[200px] flex items-center justify-center text-sm font-bold text-black/30 border-2 border-dashed border-black/10">
      Need 2+ tests for trajectory
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
        {/* Grid Lines */}
        <line x1="0" y1={getY(50)} x2={width} y2={getY(50)} stroke="#e5e5e5" strokeWidth="2" strokeDasharray="8,8" />
        <line x1="0" y1={getY(75)} x2={width} y2={getY(75)} stroke="#e5e5e5" strokeWidth="2" strokeDasharray="8,8" />
        {/* Fill Area */}
        <path d={`M ${fillPath}`} fill="rgba(204,255,0,0.15)" stroke="none" />
        {/* Line */}
        <polyline points={points} fill="none" stroke="black" strokeWidth="3" vectorEffect="non-scaling-stroke" />
        {/* Points */}
        {data.map((d, i) => (
          <circle 
            key={i} 
            cx={getX(i)} 
            cy={getY(d.score)} 
            r="6" 
            className="fill-white stroke-black hover:fill-brand transition-colors cursor-pointer" 
            strokeWidth="3"
          >
            <title>{d.date}: {d.score}%</title>
          </circle>
        ))}
      </svg>
      {/* Labels */}
      <div className="absolute top-0 right-2 text-xs font-bold text-black/40">100%</div>
      <div className="absolute top-[50%] right-2 text-xs font-bold text-black/40 -translate-y-1/2">50%</div>
      <div className="absolute bottom-0 left-0 text-xs font-bold text-black/40">{data[0].date}</div>
      <div className="absolute bottom-0 right-0 text-xs font-bold text-black/40">{data[data.length-1].date}</div>
    </div>
  )
}

// --- STAT CARD COMPONENT ---
const StatCard = ({ icon: Icon, label, value, description, color = 'stone' }: {
  icon: any
  label: string
  value: string
  description: string
  color?: 'stone' | 'green' | 'amber' | 'red' | 'blue' | 'purple'
}) => {
  const colors = {
    stone: 'bg-stone-100 text-stone-600',
    green: 'bg-green-100 text-green-600',
    amber: 'bg-amber-100 text-amber-600',
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600',
    purple: 'bg-purple-100 text-purple-600',
  }
  
  return (
    <div className="bg-white border-2 border-black/10 p-5 hover:border-black hover:shadow-[4px_4px_0_0_#000] transition-all">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 ${colors[color]}`}>
          <Icon size={20} />
        </div>
        <span className="text-sm font-bold text-black/50 uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-2xl font-black mb-1">{value}</div>
      <p className="text-sm text-black/50 leading-relaxed">{description}</p>
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
  }, [effectiveExamId, supabase])

  const logs = useMemo(() => {
    if (!filterQuery) return allLogs
    return allLogs.filter(log => log.n.toLowerCase().includes(filterQuery.toLowerCase()))
  }, [allLogs, filterQuery])

  const analytics = useMemo(() => {
    if (logs.length === 0) return null

    // Mistake Calculation
    let totalSilly = 0, totalConcept = 0, totalUnattempted = 0
    let logsWithMistakes = 0

    logs.forEach(log => {
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

    // Calculate averages
    const avgScore = Math.round(logs.reduce((sum, l) => sum + (l.s / l.m) * 100, 0) / logs.length)
    const recentLogs = logs.slice(-5)
    const recentAvg = Math.round(recentLogs.reduce((sum, l) => sum + (l.s / l.m) * 100, 0) / recentLogs.length)

    return {
      phase: calculatePhase(logs),
      recovery: calculateRecovery(logs),
      consistency: calculateConsistency(logs),
      bestTime: calculateBestTime(logs),
      chartData: getChartData(logs),
      mistakes,
      avgScore,
      recentAvg,
      totalTests: logs.length
    }
  }, [logs])

  const getPhaseColor = (phase: string) => {
    switch(phase) {
      case 'Peak': return 'green'
      case 'Growth': return 'blue'
      case 'Stability': return 'amber'
      case 'Instability': return 'red'
      default: return 'stone'
    }
  }

  const getCoachNote = (phase: string) => {
    switch(phase) {
      case 'Instability': return "Scores are fluctuating. Pause testing and analyze your last 3 failures deeply."
      case 'Stability': return "You've found a baseline. Focus on small, incremental gains in weak areas."
      case 'Growth': return "Great upward trend! Maintain this rhythm without burning out."
      case 'Peak': return "Excellent performance. Focus on maintenance and staying calm."
      default: return "Log more tests to see patterns."
    }
  }

  const getMistakeAdvice = (m: { silly: number, concept: number, unattempted: number }) => {
    const max = Math.max(m.silly, m.concept, m.unattempted)
    if (max === m.silly) return "Your main enemy is Carelessness. Read questions twice before answering."
    if (max === m.concept) return "Your main enemy is Knowledge Gaps. Go back to studying weak topics."
    return "Your main enemy is Speed. Practice more timed sectional tests."
  }

  // --- LOADING STATE ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-bold text-black/50">Analyzing patterns...</p>
        </div>
      </div>
    )
  }

  // --- EMPTY STATE ---
  if (allLogs.length === 0) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] text-black">
        <Link 
          href="/dashboard/mocks" 
          className="inline-flex items-center gap-2 text-sm font-bold text-black/40 hover:text-black transition-colors mb-8"
        >
          <ArrowLeft size={16} /> Back to Mocks
        </Link>
        
        <div className="text-center py-20">
          <PieChart size={64} className="mx-auto mb-6 text-black/20" />
          <h1 className="text-3xl font-black mb-3">No Data Yet</h1>
          <p className="text-black/50 mb-8 max-w-md mx-auto">
            Log at least one mock test to start seeing insights and patterns.
          </p>
          <Link 
            href="/dashboard/mocks"
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 font-bold"
          >
            Log Your First Test
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-black pb-20">
      
      {/* HEADER */}
      <div className="mb-8">
        <Link 
          href="/dashboard/mocks" 
          className="inline-flex items-center gap-2 text-sm font-bold text-black/40 hover:text-black transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Back to Mocks
        </Link>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">Mock Analytics</h1>
            <div className="flex items-center gap-3">
              <span className="bg-black text-white text-xs font-bold px-3 py-1 uppercase">
                {effectiveExamId}
              </span>
              <span className="text-black/50 font-bold">{analytics?.totalTests} tests logged</span>
            </div>
          </div>

          {/* SEARCH */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" size={18} />
            <input 
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Filter tests..."
              className="w-full bg-white border-2 border-black/20 p-3 pl-10 font-bold text-sm focus:outline-none focus:border-black transition-all placeholder:text-black/30"
            />
            {filterQuery && (
              <button onClick={() => setFilterQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-red-500">
                <X size={18} />
              </button>
            )}
          </div>
        </div>
      </div>

      {analytics && (
        <>
          {/* PHASE BANNER */}
          <div className={`mb-8 p-6 border-2 border-black shadow-[4px_4px_0_0_#000] ${
            analytics.phase === 'Peak' ? 'bg-green-50' :
            analytics.phase === 'Growth' ? 'bg-blue-50' :
            analytics.phase === 'Stability' ? 'bg-amber-50' :
            'bg-red-50'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-bold uppercase text-black/40 mb-1">Current Phase</div>
                <div className="text-3xl font-black">{analytics.phase}</div>
              </div>
              <div className="flex-1 md:ml-8">
                <p className="text-sm font-medium text-black/70 leading-relaxed">
                  {getCoachNote(analytics.phase)}
                </p>
              </div>
              <div className="flex gap-6">
                <div className="text-center">
                  <div className="text-2xl font-black">{analytics.avgScore}%</div>
                  <div className="text-xs font-bold text-black/40">Overall Avg</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-black">{analytics.recentAvg}%</div>
                  <div className="text-xs font-bold text-black/40">Last 5 Avg</div>
                </div>
              </div>
            </div>
          </div>

          {/* TREND CHART */}
          <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#000] mb-8">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp size={20} />
              <h2 className="text-xl font-black">Score Trajectory</h2>
            </div>
            <TrendChart data={analytics.chartData} />
          </div>

          {/* MISTAKE ANALYSIS */}
          {analytics.mistakes.hasData && (
            <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0_0_#000] mb-8">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle size={20} className="text-red-500" />
                <h2 className="text-xl font-black">Mistake Breakdown</h2>
              </div>
              
              <p className="text-sm text-black/60 mb-6">
                {getMistakeAdvice(analytics.mistakes)}
              </p>

              {/* Stacked Bar */}
              <div className="h-10 flex overflow-hidden border-2 border-black mb-4">
                {analytics.mistakes.silly > 0 && (
                  <div 
                    style={{ width: `${analytics.mistakes.silly}%` }} 
                    className="bg-red-500 flex items-center justify-center text-white font-bold text-sm"
                  >
                    {analytics.mistakes.silly}%
                  </div>
                )}
                {analytics.mistakes.concept > 0 && (
                  <div 
                    style={{ width: `${analytics.mistakes.concept}%` }} 
                    className="bg-amber-400 flex items-center justify-center text-black font-bold text-sm"
                  >
                    {analytics.mistakes.concept}%
                  </div>
                )}
                {analytics.mistakes.unattempted > 0 && (
                  <div 
                    style={{ width: `${analytics.mistakes.unattempted}%` }} 
                    className="bg-stone-300 flex items-center justify-center text-black font-bold text-sm"
                  >
                    {analytics.mistakes.unattempted}%
                  </div>
                )}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-6 text-sm font-bold">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500"></div>
                  <span>Silly Mistakes</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-400"></div>
                  <span>Conceptual Errors</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-stone-300"></div>
                  <span>Unattempted</span>
                </div>
              </div>
            </div>
          )}

          {/* METRICS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard 
              icon={Sun}
              label="Prime Time"
              value={analytics.bestTime.status === 'found' ? analytics.bestTime.time! : '—'}
              description={analytics.bestTime.status === 'found' 
                ? `You score highest (${analytics.bestTime.avg}% avg) in the ${analytics.bestTime.time}.`
                : "Log tests at different times to find your peak."}
              color="amber"
            />
            
            <StatCard 
              icon={Zap}
              label="Recovery"
              value={analytics.recovery.status === 'fast' ? 'Fast' : 
                     analytics.recovery.status === 'slow' ? 'Slow' : 
                     analytics.recovery.status === 'none' ? 'Stable' : 'Moderate'}
              description={analytics.recovery.status === 'none' 
                ? "No major dips detected recently." 
                : `Takes ~${analytics.recovery.count || '?'} tests to recover from dips.`}
              color="blue"
            />
            
            <StatCard 
              icon={Activity}
              label="Main Threat"
              value={analytics.consistency.status === 'solid' ? 'None' : 
                     analytics.consistency.status === 'stress' ? 'Stress' : 'Fatigue'}
              description={analytics.consistency.status === 'solid' 
                ? "Your performance is consistent." 
                : analytics.consistency.status === 'stress' 
                  ? "High stress correlates with lower scores." 
                  : "Fatigue is affecting your performance."}
              color={analytics.consistency.status === 'solid' ? 'green' : 'red'}
            />
            
            <StatCard 
              icon={Brain}
              label="Mental State"
              value={analytics.phase === 'Instability' ? 'Chaotic' : 'Focused'}
              description={analytics.phase === 'Instability' 
                ? "Scores are erratic. Focus on fundamentals." 
                : "Your baseline is holding steady."}
              color="purple"
            />
          </div>

          {/* RECENT TESTS TABLE */}
          <div className="bg-white border-2 border-black shadow-[4px_4px_0_0_#000]">
            <div className="p-4 border-b-2 border-black bg-stone-50 flex justify-between items-center">
              <h3 className="font-black uppercase">Recent Tests</h3>
              <span className="text-sm font-bold text-black/40">{logs.length} total</span>
            </div>
            <div className="divide-y divide-black/10">
              {[...logs].reverse().slice(0, 10).map(log => {
                const pct = Math.round((log.s / log.m) * 100)
                return (
                  <div key={log.id} className="p-4 flex justify-between items-center hover:bg-stone-50 transition-colors">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="font-mono text-sm font-bold text-black/40 w-24 shrink-0">
                        {new Date(log.d).toLocaleDateString()}
                      </div>
                      <div className="font-bold truncate">{log.n}</div>
                      {log.t && (
                        <span className="text-xs font-bold uppercase bg-stone-100 px-2 py-1 text-black/50 shrink-0">
                          {log.t}
                        </span>
                      )}
                    </div>
                    <div className={`text-lg font-black shrink-0 ml-4 ${pct >= 60 ? 'text-green-600' : 'text-red-600'}`}>
                      {pct}%
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function InsightsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <InsightsContent />
    </Suspense>
  )
}
