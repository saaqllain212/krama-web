'use client'
import FeatureGate from '@/components/dashboard/FeatureGate'

import { useEffect, useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Trash2, Clock, TrendingUp, AlertCircle, Search, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAlert } from '@/context/AlertContext'
import StudyHeatmap from '@/components/dashboard/StudyHeatmap'
import ProductivityChart from '@/components/insights/ProductivityChart'
import PeakHoursChart from '@/components/insights/PeakHoursChart'
import WeeklyComparisonCard from '@/components/insights/WeeklyComparisonCard'
import EfficiencyScoreCard from '@/components/insights/EfficiencyScoreCard'

type TopicSummary = {
  name: string
  totalMinutes: number
  sessions: number
  lastSession: string
}

type FocusLog = {
  id: string
  created_at: string
  started_at: string
  duration_minutes: number
  target_minutes: number
  topic: string
}

export default function InsightsPage() {
  return (
    <FeatureGate flag="feature_insights_enabled" featureName="Analytics">
      <InsightsPageInner />
    </FeatureGate>
  )
}

function InsightsPageInner() {
  const supabase = useMemo(() => createClient(), [])
  const { showAlert, askConfirm } = useAlert()
  
  const [loading, setLoading] = useState(true)
  const [allTopics, setAllTopics] = useState<TopicSummary[]>([])
  const [visibleTopics, setVisibleTopics] = useState<TopicSummary[]>([])
  const [allLogs, setAllLogs] = useState<FocusLog[]>([])
  const [totalHours, setTotalHours] = useState(0)
  const [query, setQuery] = useState('')

  useEffect(() => { fetchData() }, [])

  // Filter Logic (Search + Top 8)
  useEffect(() => {
    let filtered = allTopics
    if (query.trim()) {
      filtered = allTopics.filter(t => t.name.toLowerCase().includes(query.toLowerCase()))
    }
    // Show all matches if searching, otherwise Top 8
    setVisibleTopics(query.trim() ? filtered : filtered.slice(0, 8))
  }, [query, allTopics])

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: logs } = await supabase
      .from('focus_logs')
      .select('*')
      .eq('user_id', user.id)

    if (logs) {
      setAllLogs(logs)
      
      const map: Record<string, TopicSummary> = {}
      let globalMinutes = 0

      logs.forEach(log => {
        const name = log.topic || 'Unlabeled'
        globalMinutes += log.duration_minutes
        
        if (!map[name]) {
          map[name] = { name, totalMinutes: 0, sessions: 0, lastSession: log.started_at }
        }
        
        map[name].totalMinutes += log.duration_minutes
        map[name].sessions += 1
        if (new Date(log.started_at) > new Date(map[name].lastSession)) {
          map[name].lastSession = log.started_at
        }
      })

      const sorted = Object.values(map).sort((a, b) => b.totalMinutes - a.totalMinutes)
      setAllTopics(sorted)
      setTotalHours(Math.round(globalMinutes / 60 * 10) / 10)
    }
    setLoading(false)
  }

  const handleDeleteTopic = (topicName: string) => {
    askConfirm(
      `This will permanently erase all ${topicName} logs.`, 
      async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { error } = await supabase
            .from('focus_logs')
            .delete()
            .eq('user_id', user.id)
            .eq('topic', topicName)

          if (!error) {
            setAllTopics(current => current.filter(t => t.name !== topicName))
            setAllLogs(current => current.filter(l => l.topic !== topicName))
            showAlert(`History for ${topicName} deleted.`, 'success')
          } else {
            showAlert('Failed to delete. Check database policies.', 'error')
          }
        }
      }
    )
  }

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return h === 0 ? `${m}m` : `${h}h ${m}m`
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-10">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <Sparkles className="text-white" size={24} />
              </div>
              <h1 className="text-4xl font-bold text-gray-900">
                Study Analytics
              </h1>
            </div>
            <p className="text-gray-500">Deep insights into your learning patterns</p>
          </div>
          
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-500 mb-1">Total Deep Work</div>
            <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {totalHours}h
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* TOP SECTION - Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductivityChart logs={allLogs} />
          <PeakHoursChart logs={allLogs} />
        </div>
        
        {/* MIDDLE SECTION - Comparison + Efficiency */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WeeklyComparisonCard logs={allLogs} />
          <EfficiencyScoreCard logs={allLogs} />
        </div>
        
        {/* HEATMAP */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="font-bold text-gray-900 mb-4">Study Calendar</h3>
          <StudyHeatmap />
        </div>

        {/* DISTRIBUTION BAR */}
        {!loading && allTopics.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex justify-between text-sm font-semibold mb-3 text-gray-600">
              <span>Focus Distribution</span>
              <span>{allTopics.length} Topics</span>
            </div>
            <div className="flex w-full h-4 rounded-full overflow-hidden">
              {allTopics.slice(0, 5).map((t, i) => (
                <div 
                  key={t.name}
                  style={{ width: `${(t.totalMinutes / (totalHours * 60)) * 100}%` }}
                  className={`${[
                    'bg-blue-600', 
                    'bg-purple-600', 
                    'bg-pink-600', 
                    'bg-amber-600', 
                    'bg-green-600'
                  ][i]}`}
                  title={t.name}
                />
              ))}
              {allTopics.length > 5 && <div className="bg-gray-200 flex-1" />}
            </div>
            <div className="flex flex-wrap gap-3 mt-4">
              {allTopics.slice(0, 5).map((t, i) => (
                <div key={t.name} className="flex items-center gap-2 text-xs">
                  <div className={`w-3 h-3 rounded-full ${[
                    'bg-blue-600', 
                    'bg-purple-600', 
                    'bg-pink-600', 
                    'bg-amber-600', 
                    'bg-green-600'
                  ][i]}`} />
                  <span className="text-gray-700">{t.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TOPIC BREAKDOWN LIST */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">Topic Breakdown</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find topic..."
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 w-48 transition-all"
              />
            </div>
          </div>

          <div className="space-y-3 min-h-[300px]">
            {loading ? (
              <div className="py-8 text-center text-gray-400 animate-pulse">Analyzing data...</div>
            ) : visibleTopics.length === 0 ? (
              <div className="py-12 border-2 border-dashed border-gray-200 text-center rounded-xl">
                <AlertCircle className="mx-auto mb-2 text-gray-300" size={32} />
                <div className="text-gray-400 font-medium">{query ? 'No matching topics' : 'No data recorded yet'}</div>
              </div>
            ) : (
              <AnimatePresence>
                {visibleTopics.map((topic) => (
                  <motion.div 
                    key={topic.name}
                    layout 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="group flex items-center justify-between p-4 bg-gray-50 hover:bg-white border border-gray-200 hover:border-primary-500 rounded-xl hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-2xl font-bold text-gray-200 group-hover:text-primary-500 w-10 text-center transition-colors">
                        #{allTopics.findIndex(t => t.name === topic.name) + 1}
                      </div>
                      <div>
                        <div className="text-base font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {topic.name}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <TrendingUp size={12} />
                            {topic.sessions} sessions
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {new Date(topic.lastSession).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-xl font-bold text-gray-900">
                        {formatDuration(topic.totalMinutes)}
                      </div>
                      <button 
                        onClick={() => handleDeleteTopic(topic.name)}
                        className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        aria-label={`Delete ${topic.name}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}