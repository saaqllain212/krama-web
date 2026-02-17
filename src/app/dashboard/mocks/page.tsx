'use client'
import FeatureGate from '@/components/dashboard/FeatureGate'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useSyllabus } from '@/context/SyllabusContext'
import { MockLogEntry, calculatePhase } from '@/lib/analytics'
import { ArrowLeft, Plus, Activity, Search, X, TrendingUp, Target, Award, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import MocksModal from '@/components/mocks/MocksModal'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'

export default function MocksPage() {
  return (
    <FeatureGate flag="feature_mocks_enabled" featureName="Mock Scores">
      <MocksPageInner />
    </FeatureGate>
  )
}

function MocksPageInner() {
  const { activeExam } = useSyllabus()
  const supabase = useMemo(() => createClient(), [])
  
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

  // --- FILTERING (PAGINATION PRESERVED: 8 max) ---
  const displayLogs = useMemo(() => {
    let filtered = logs
    if (searchQuery.trim()) {
      filtered = logs.filter(l => l.n.toLowerCase().includes(searchQuery.toLowerCase()))
    }
    return filtered.slice(0, 8) // PAGINATION: 8 max
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
      case 'Peak': return 'text-success-700 bg-success-100 border-success-300'
      case 'Growth': return 'text-primary-700 bg-primary-100 border-primary-300'
      case 'Stability': return 'text-warning-700 bg-warning-100 border-warning-300'
      case 'Instability': return 'text-danger-700 bg-danger-100 border-danger-300'
      default: return 'text-gray-700 bg-gray-100 border-gray-300'
    }
  }

  // --- CHART DATA ---
  const chartData = useMemo(() => {
    return [...logs]
      .reverse()
      .map((log, index) => ({
        name: `Test ${index + 1}`,
        date: new Date(log.d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        score: Math.round((log.s / log.m) * 100),
        rawScore: log.s,
        maxScore: log.m,
        testName: log.n,
      }))
  }, [logs])

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 text-sm mb-1">{data.testName}</p>
          <p className="text-xs text-gray-600 mb-2">{data.date}</p>
          <p className="text-xl font-bold text-primary-600">{data.score}%</p>
          <p className="text-xs text-gray-500 mt-1">{data.rawScore}/{data.maxScore}</p>
        </div>
      )
    }
    return null
  }

  const EXAM_TABS = ['upsc', 'ssc', 'bank', 'jee', 'neet', 'rbi', 'custom']

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24" suppressHydrationWarning={true}>
      
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft size={16} /> Dashboard
          </Link>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Mock Tests</h1>
              
              {/* EXAM TABS - Scrollable */}
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
                {EXAM_TABS.map(id => (
                  <button
                    key={id}
                    onClick={() => setViewExamId(id)}
                    className={`px-4 py-2 text-sm font-semibold uppercase tracking-wide rounded-lg border-2 transition-all whitespace-nowrap ${
                      viewExamId === id 
                        ? 'bg-gradient-to-r from-primary-500 to-purple-500 text-white border-primary-600 shadow-md' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-primary-300 hover:text-gray-900'
                    }`}
                  >
                    {id}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="flex gap-3 w-full lg:w-auto">
              {/* ANALYSIS BUTTON (shows when 2+ logs exist) */}
              {logs.length >= 2 && (
                <Link 
                  href={`/dashboard/mocks/insights?exam=${viewExamId}`} 
                  className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-3 border-2 border-primary-500 text-primary-600 rounded-lg font-semibold text-sm hover:bg-primary-50 transition-all"
                >
                  <BarChart3 size={18} /> Analysis
                </Link>
              )}
              
              {/* LOG TEST BUTTON */}
              <button 
                onClick={() => setIsModalOpen(true)} 
                className="btn btn-primary flex-1 lg:flex-none flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Log Test
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6">
        {/* STATS ROW */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <motion.div 
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
          >
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Activity size={16} />
              <span className="text-xs font-semibold uppercase tracking-wide">Total</span>
            </div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">{totalMocks}</div>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
          >
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <TrendingUp size={16} />
              <span className="text-xs font-semibold uppercase tracking-wide">Phase</span>
            </div>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-bold uppercase border-2 ${getPhaseColor(phase)}`}>
              {phase}
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
          >
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Award size={16} />
              <span className="text-xs font-semibold uppercase tracking-wide">Best</span>
            </div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">
              {bestScore}<span className="text-lg text-gray-400">%</span>
            </div>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
            whileHover={{ y: -4, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
          >
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Target size={16} />
              <span className="text-xs font-semibold uppercase tracking-wide">Average</span>
            </div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900">
              {avgScore}<span className="text-lg text-gray-400">%</span>
            </div>
          </motion.div>
        </div>

        {/* SCORE TREND CHART (shows when 2+ tests) */}
        {logs.length >= 2 && (
          <div className="bg-gradient-to-br from-white to-primary-50/30 rounded-2xl border border-gray-200 p-6 mb-10 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Score Progression</h3>
                <p className="text-sm text-gray-600">Track your improvement over time</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-100 text-primary-700 rounded-full text-xs font-semibold">
                <TrendingUp size={14} />
                {logs.length} Tests
              </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5B8FF9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#5B8FF9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                  domain={[0, 100]}
                  ticks={[0, 25, 50, 75, 100]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#5B8FF9"
                  strokeWidth={3}
                  fill="url(#scoreGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* RECENT TESTS */}
        <div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h3 className="text-xl font-bold text-gray-900">
              Recent Tests
            </h3>
            
            {/* SEARCH BAR */}
            {logs.length > 0 && (
              <div className="relative w-full md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search tests..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-10 w-full"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-danger-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            )}
          </div>
          
          {loading ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
              <div className="text-gray-500">Loading tests...</div>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300">
              <Activity size={48} className="mx-auto mb-4 text-gray-300" />
              <h4 className="text-lg font-bold text-gray-900 mb-2">No Tests Yet</h4>
              <p className="text-gray-600 mb-6">Start logging your mock test scores</p>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="btn btn-primary inline-flex items-center gap-2"
              >
                <Plus size={18} /> Log Your First Test
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {displayLogs.map((log, index) => {
                const percentage = Math.round((log.s / log.m) * 100)
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl border border-gray-200 p-5 hover:border-primary-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate mb-1">{log.n}</h4>
                        <p className="text-xs text-gray-500">
                          {new Date(log.d).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">
                            {percentage}<span className="text-sm text-gray-400">%</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {log.s}/{log.m}
                          </div>
                        </div>
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg border-4 ${
                          percentage >= 80 ? 'bg-success-50 border-success-500 text-success-700' :
                          percentage >= 60 ? 'bg-primary-50 border-primary-500 text-primary-700' :
                          percentage >= 40 ? 'bg-warning-50 border-warning-500 text-warning-700' :
                          'bg-danger-50 border-danger-500 text-danger-700'
                        }`}>
                          {percentage}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* PAGINATION INFO */}
          {!searchQuery && logs.length > 8 && (
            <p className="text-center text-sm text-gray-500 mt-6">
              Showing 8 of {logs.length} tests. Use search to find more.
            </p>
          )}
        </div>
      </div>

      {/* MODAL */}
      <MocksModal 
        open={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        examId={viewExamId}
        onSuccess={fetchLogs}
      />
    </div>
  )
}