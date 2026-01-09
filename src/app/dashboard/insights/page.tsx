'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Trash2, Clock, TrendingUp, AlertCircle, Search } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
// 1. Import the hook
import { useAlert } from '@/context/AlertContext'

type TopicSummary = {
  name: string
  totalMinutes: number
  sessions: number
  lastSession: string
}

export default function InsightsPage() {
  const supabase = createClient()
  // 2. Activate the hook
  const { showAlert, askConfirm } = useAlert()
  
  const [loading, setLoading] = useState(true)
  const [allTopics, setAllTopics] = useState<TopicSummary[]>([])
  const [visibleTopics, setVisibleTopics] = useState<TopicSummary[]>([])
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

  // --- 3. UPDATED DELETE HANDLER ---
  const handleDeleteTopic = (topicName: string) => {
    // Replace window.confirm with askConfirm
    askConfirm(
      `This will permanently erase all ${topicName} logs.`, 
      async () => {
        // This runs ONLY if user clicks "Proceed"
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { error } = await supabase
            .from('focus_logs')
            .delete() // This will now work because of the SQL fix
            .eq('user_id', user.id)
            .eq('topic', topicName)

          if (!error) {
            setAllTopics(current => current.filter(t => t.name !== topicName))
            // Replace alert with showAlert
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
    <div className="min-h-screen bg-[#FBF9F6] p-6 md:p-12 text-black">
      
      {/* HEADER */}
      <div className="max-w-4xl mx-auto mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Link href="/dashboard" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black mb-4">
             <ArrowLeft size={14} /> Dashboard
          </Link>
          <h1 className="text-4xl font-black tracking-tighter uppercase">
            Field Intelligence
          </h1>
        </div>
        
        <div className="text-right">
          <div className="text-xs font-bold uppercase tracking-widest text-black/40">Total Deep Work</div>
          <div className="text-6xl font-black tracking-tighter text-amber-500">
            {totalHours}<span className="text-lg text-black/20 align-top ml-1">HRS</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto grid grid-cols-1 gap-12">
        
        {/* DISTRIBUTION BAR */}
        {!loading && allTopics.length > 0 && (
          <div className="w-full">
             <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-2 text-black/40">
                <span>Focus Distribution</span>
                <span>{allTopics.length} Topics</span>
             </div>
             <div className="flex w-full h-4 rounded-full overflow-hidden border border-black/10">
                {allTopics.slice(0, 5).map((t, i) => (
                   <div 
                     key={t.name}
                     style={{ width: `${(t.totalMinutes / (totalHours * 60)) * 100}%` }}
                     className={`${['bg-black', 'bg-amber-500', 'bg-stone-400', 'bg-stone-300', 'bg-stone-200'][i]}`}
                   />
                ))}
                {allTopics.length > 5 && <div className="bg-gray-100 flex-1" />}
             </div>
          </div>
        )}

        {/* LIST SECTION */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b-2 border-black/10 pb-4">
            <h3 className="text-lg font-black uppercase tracking-tight">Breakdown</h3>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30 group-focus-within:text-amber-500 transition-colors" size={16} />
              <input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Find topic..."
                className="pl-10 pr-4 py-2 bg-white border border-black/10 rounded-full text-xs font-bold uppercase tracking-wide focus:outline-none focus:border-amber-500 w-48 transition-all"
              />
            </div>
          </div>

          <div className="space-y-4 min-h-[300px]">
            {loading ? (
              <div className="py-8 text-center text-black/40 animate-pulse">Scanning logs...</div>
            ) : visibleTopics.length === 0 ? (
              <div className="py-12 border-2 border-dashed border-black/10 text-center rounded-xl">
                <AlertCircle className="mx-auto mb-2 text-black/20" />
                <div className="text-black/40 font-bold">{query ? 'No match' : 'No data recorded'}</div>
              </div>
            ) : (
              <AnimatePresence>
                {visibleTopics.map((topic, index) => (
                  <motion.div 
                    key={topic.name}
                    layout 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="group flex items-center justify-between p-5 bg-white border-2 border-black/5 shadow-sm hover:border-black hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all"
                  >
                    <div className="flex items-center gap-6">
                      <div className="text-3xl font-black text-black/10 w-10 text-center">
                        #{allTopics.findIndex(t => t.name === topic.name) + 1}
                      </div>
                      <div>
                        <div className="text-lg font-bold uppercase tracking-tight group-hover:text-amber-600 transition-colors">
                          {topic.name}
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-black/40 mt-1 uppercase">
                          <span><TrendingUp size={10} className="inline mr-1"/>{topic.sessions} Sess.</span>
                          <span><Clock size={10} className="inline mr-1"/>{new Date(topic.lastSession).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-xl font-black tracking-tighter text-right">
                        {formatDuration(topic.totalMinutes)}
                      </div>
                      <button 
                        onClick={() => handleDeleteTopic(topic.name)}
                        className="p-2 text-black/10 hover:text-red-600 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100"
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