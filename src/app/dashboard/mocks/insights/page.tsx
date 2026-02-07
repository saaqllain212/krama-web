'use client'

import { useState, useEffect, useMemo, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSyllabus } from '@/context/SyllabusContext'
import { MockLogEntry, calculatePhase, calculateRecovery, calculateConsistency, calculateBestTime, getChartData } from '@/lib/analytics'
import { ArrowLeft, TrendingUp, Activity, Zap, Brain, AlertTriangle, Search, X, Sun, Target, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import PredictedScoreCard from '@/components/mocks-insights/PredictedScoreCard'
import MonthComparisonCard from '@/components/mocks-insights/MonthComparisonCard'
import BestDaysCard from '@/components/mocks-insights/BestDaysCard'

// Modern Score Trajectory Chart
const TrendChart = ({ data }: { data: { date: string, score: number }[] }) => {
  if (data.length < 2) return (
    <div className="h-[250px] flex items-center justify-center text-sm text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
      Need 2+ tests for trajectory
    </div>
  )

  return (
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.4} />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis 
          dataKey="date" 
          stroke="#9ca3af"
          fontSize={11}
          tickLine={false}
        />
        <YAxis 
          stroke="#9ca3af"
          fontSize={11}
          tickLine={false}
          domain={[0, 100]}
          label={{ value: 'Score %', angle: -90, position: 'insideLeft', style: { fontSize: 11, fill: '#9ca3af' } }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1f2937', 
            border: 'none', 
            borderRadius: '8px',
            fontSize: '12px',
            color: '#fff'
          }}
          // FIX: Use 'any' type for value to prevent TS error about undefined
          formatter={(value: any) => [`${value}%`, 'Score']}
        />
        <Area 
          type="monotone" 
          dataKey="score" 
          stroke="#3b82f6" 
          strokeWidth={3}
          fill="url(#scoreGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, description, color = 'blue' }: {
  icon: any
  label: string
  value: string
  description: string
  color?: 'blue' | 'green' | 'amber' | 'red' | 'purple'
}) => {
  const gradients = {
    blue: 'from-blue-500 to-cyan-600',
    green: 'from-green-500 to-emerald-600',
    amber: 'from-amber-500 to-orange-600',
    red: 'from-red-500 to-rose-600',
    purple: 'from-purple-500 to-pink-600',
  }
  
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 bg-gradient-to-br ${gradients[color]} rounded-lg`}>
          <Icon size={18} className="text-white" />
        </div>
        <span className="text-sm font-bold text-gray-600 uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-2">{value}</div>
      <p className="text-sm text-gray-600 leading-relaxed">{description}</p>
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

  const getCoachNote = (phase: string) => {
    switch(phase) {
      case 'Instability': return "Scores are fluctuating. Pause testing and analyze your last 3 failures deeply."
      case 'Stability': return "You've found a baseline. Focus on small, incremental gains in weak areas."
      case 'Growth': return "Great upward trend! Maintain this rhythm without burning out."
      case 'Peak': return "Excellent performance. Focus on maintenance and staying calm."
      default: return "Log more tests to see patterns."
    }
  }

  const getMistakeAdvice = (mistakes: any) => {
    if (mistakes.silly >= 40) return "⚠️ Too many silly mistakes! Slow down and double-check answers."
    if (mistakes.concept >= 50) return "📚 Conceptual gaps detected. Revise fundamentals before next test."
    if (mistakes.unattempted >= 40) return "⏱️ Time management issue. Practice speed without sacrificing accuracy."
    return "✅ Balanced error distribution. Keep refining all areas."
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-10">
        <Link 
          href={`/dashboard/mocks${effectiveExamId !== activeExam ? `?exam=${effectiveExamId}` : ''}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Mocks
        </Link>
        
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
            <Sparkles className="text-white" size={24} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Mock Test Analysis
          </h1>
        </div>
        <p className="text-gray-500">Advanced insights powered by pure math</p>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : !analytics ? (
          <div className="text-center py-20">
            <Brain size={48} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Tests Logged Yet</h2>
            <p className="text-gray-500 mb-6">Take your first mock test to generate insights</p>
            <Link 
              href={`/dashboard/mocks${effectiveExamId !== activeExam ? `?exam=${effectiveExamId}` : ''}`}
              className="inline-block px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white font-bold rounded-xl hover:shadow-lg transition-shadow"
            >
              Log First Test
            </Link>
          </div>
        ) : (
          <>
            {/* PHASE BANNER */}
            <div className={`p-6 rounded-2xl border shadow-sm ${
              analytics.phase === 'Peak' ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200' :
              analytics.phase === 'Growth' ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200' :
              analytics.phase === 'Stability' ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200' :
              'bg-gradient-to-br from-red-50 to-rose-50 border-red-200'
            }`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase text-gray-600 mb-1 tracking-wide">Current Phase</div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{analytics.phase}</div>
                  <p className="text-sm text-gray-700 leading-relaxed max-w-xl">
                    {getCoachNote(analytics.phase)}
                  </p>
                </div>
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{analytics.avgScore}%</div>
                    <div className="text-xs font-bold text-gray-600">Overall Avg</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">{analytics.recentAvg}%</div>
                    <div className="text-xs font-bold text-gray-600">Last 5 Avg</div>
                  </div>
                </div>
              </div>
            </div>

            {/* PREDICTED SCORE + MONTH COMPARISON */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PredictedScoreCard logs={logs} />
              <MonthComparisonCard logs={logs} />
            </div>

            {/* TREND CHART */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
                  <TrendingUp size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Score Trajectory</h2>
                  <p className="text-xs text-gray-500">Performance over time</p>
                </div>
              </div>
              <TrendChart data={analytics.chartData} />
            </div>

            {/* BEST DAYS ANALYSIS */}
            <BestDaysCard logs={logs} />

            {/* MISTAKE ANALYSIS */}
            {analytics.mistakes.hasData && (
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-br from-red-500 to-rose-600 rounded-lg">
                    <AlertTriangle size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Mistake Breakdown</h2>
                    <p className="text-xs text-gray-500">Where marks are lost</p>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  {getMistakeAdvice(analytics.mistakes)}
                </p>

                {/* Stacked Bar */}
                <div className="h-12 flex overflow-hidden rounded-xl border-2 border-gray-200 mb-4">
                  {analytics.mistakes.silly > 0 && (
                    <div 
                      style={{ width: `${analytics.mistakes.silly}%` }} 
                      className="bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center text-white font-bold text-sm"
                    >
                      {analytics.mistakes.silly}%
                    </div>
                  )}
                  {analytics.mistakes.concept > 0 && (
                    <div 
                      style={{ width: `${analytics.mistakes.concept}%` }} 
                      className="bg-gradient-to-r from-amber-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm"
                    >
                      {analytics.mistakes.concept}%
                    </div>
                  )}
                  {analytics.mistakes.unattempted > 0 && (
                    <div 
                      style={{ width: `${analytics.mistakes.unattempted}%` }} 
                      className="bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center text-white font-bold text-sm"
                    >
                      {analytics.mistakes.unattempted}%
                    </div>
                  )}
                </div>

                {/* Legend */}
                <div className="flex flex-wrap gap-6 text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-red-500 to-red-600 rounded"></div>
                    <span className="text-gray-700">Silly Mistakes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-amber-400 to-amber-500 rounded"></div>
                    <span className="text-gray-700">Conceptual Errors</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gradient-to-r from-gray-400 to-gray-500 rounded"></div>
                    <span className="text-gray-700">Unattempted</span>
                  </div>
                </div>
              </div>
            )}

            {/* METRICS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-900">Recent Tests</h3>
                <span className="text-sm font-bold text-gray-500">{logs.length} total</span>
              </div>
              <div className="divide-y divide-gray-100">
                {[...logs].reverse().slice(0, 10).map(log => {
                  const pct = Math.round((log.s / log.m) * 100)
                  return (
                    <div key={log.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-500 w-24 shrink-0">
                          {new Date(log.d).toLocaleDateString()}
                        </div>
                        <div className="font-bold text-gray-900 truncate">{log.n}</div>
                        {log.t && (
                          <span className="text-xs font-bold uppercase bg-gray-100 px-2 py-1 text-gray-600 rounded-full shrink-0">
                            {log.t}
                          </span>
                        )}
                      </div>
                      <div className={`text-xl font-bold shrink-0 ml-4 ${pct >= 60 ? 'text-green-600' : 'text-red-600'}`}>
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
    </div>
  )
}

export default function InsightsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <InsightsContent />
    </Suspense>
  )
}