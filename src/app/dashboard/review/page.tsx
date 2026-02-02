'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { reviewTopic, type Topic } from '@/lib/logic'
import { ArrowLeft, Plus, Clock, CheckCircle2, AlertTriangle, Trash2, Search, Zap, Check, RefreshCcw, Calendar, X, Brain } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAlert } from '@/context/AlertContext'

// --- CONSTANTS ---
const SCHEDULE_PRESETS = [
  { name: "Standard", val: "0, 1, 3, 7, 14, 30, 60", desc: "Balanced retention" },
  { name: "Aggressive", val: "0, 1, 2, 4, 7, 14", desc: "Fast learning" },
  { name: "Relaxed", val: "0, 2, 7, 14, 30, 60, 90", desc: "Long-term memory" },
  { name: "Custom", val: "custom", desc: "Set your own intervals" },
]

export default function ReviewPage() {
  const supabase = createClient()
  const { showAlert, askConfirm } = useAlert()
  
  const [allTopics, setAllTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  // Selection State
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)

  // Modal State
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newSchedule, setNewSchedule] = useState(SCHEDULE_PRESETS[0].val)
  const [selectedPreset, setSelectedPreset] = useState(0)
  const [customIntervals, setCustomIntervals] = useState("0, 1, 3, 7, 14, 30")

  useEffect(() => {
    fetchTopics()
  }, [])

  const fetchTopics = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('topics')
      .select('*')
      .eq('user_id', user.id)
      .order('next_review', { ascending: true })

    if (data) {
      setAllTopics(data)
    }
    setLoading(false)
  }

  // --- FILTER LOGIC ---
  const getLists = () => {
    const now = new Date()
    
    let filtered = allTopics
    if (query.trim()) {
      filtered = allTopics.filter(t => t.title.toLowerCase().includes(query.toLowerCase()))
    }

    const due: Topic[] = []
    const scheduled: Topic[] = []
    const archived: Topic[] = []

    filtered.forEach(t => {
      if (t.status === 'completed') {
        archived.push(t)
      } else if (t.next_review && new Date(t.next_review) <= now) {
        due.push(t)
      } else {
        scheduled.push(t)
      }
    })

    return { 
      due, 
      scheduled: query ? scheduled : scheduled.slice(0, 20),
      archived: query ? archived : archived.slice(0, 20),
      totalScheduled: scheduled.length,
      totalArchived: archived.length
    }
  }

  const { due, scheduled, archived, totalScheduled, totalArchived } = getLists()
  const activeTopic = due.find(t => t.id === selectedTopicId) || due[0]

  // --- ACTIONS ---
  const handleAdd = async () => {
    if (!newTitle.trim()) {
      showAlert("Please enter a topic name", "error")
      return
    }
    
    // Determine the intervals to use
    const intervalsToUse = selectedPreset === 3 ? customIntervals : newSchedule
    
    // Validate custom intervals
    if (selectedPreset === 3) {
      const parts = customIntervals.split(',').map(s => s.trim())
      const valid = parts.every(p => !isNaN(Number(p)) && Number(p) >= 0)
      if (!valid || parts.length < 2) {
        showAlert("Invalid intervals. Use comma-separated numbers (e.g., 0, 1, 3, 7)", "error")
        return
      }
    }
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('topics').insert({
      user_id: user.id,
      title: newTitle.trim(),
      custom_intervals: intervalsToUse,
      last_gap: 0,
      next_review: new Date().toISOString()
    })

    if (error) {
      showAlert('Error adding topic.', 'error')
    } else {
      showAlert('Topic added!', 'success')
      setNewTitle("")
      setShowAdd(false)
      fetchTopics()
    }
  }

  const handleReview = async (topic: Topic, rating: 0 | 1 | 2) => {
    try {
      const result = await reviewTopic(supabase, topic, rating)
      
      if (result.completed) {
        showAlert(`"${topic.title}" completed & archived!`, 'success')
      } else {
        const msgs = ["Reset to start", "Good! See you soon", "Easy! Skipped ahead"]
        showAlert(msgs[rating], 'success')
      }
      
      if (selectedTopicId === topic.id) setSelectedTopicId(null)
      fetchTopics()
    } catch (e) {
      showAlert('Review failed.', 'error')
    }
  }

  const handleDelete = (id: string) => {
    askConfirm("Delete this topic permanently?", async () => {
      await supabase.from('topics').delete().eq('id', id)
      fetchTopics()
      showAlert("Topic deleted", 'neutral')
    })
  }

  // --- HELPERS ---
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
    
    const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    if (diff < 7) return d.toLocaleDateString(undefined, { weekday: 'short' })
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  // --- LOADING ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-bold text-black/50">Loading topics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-black pb-20">
      
      {/* HEADER */}
      <div className="mb-8">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-sm font-bold text-black/40 hover:text-black transition-colors mb-4"
        >
          <ArrowLeft size={16} /> Dashboard
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">Spaced Review</h1>
            <p className="text-base text-black/50 font-medium">
              {due.length > 0 ? `${due.length} topics due now` : 'All caught up!'}
            </p>
          </div>

          <div className="flex w-full md:w-auto gap-3">
            {/* SEARCH */}
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" size={18} />
              <input 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-white border-2 border-black p-3 pl-10 font-bold text-sm focus:outline-none focus:shadow-[3px_3px_0_0_#000] transition-all placeholder:text-black/30"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-red-500">
                  <X size={18} />
                </button>
              )}
            </div>
            
            {/* ADD BUTTON */}
            <button 
              onClick={() => setShowAdd(true)} 
              className="bg-black text-white px-5 py-3 font-bold text-sm border-2 border-black shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex items-center gap-2"
            >
              <Plus size={18} /> <span className="hidden sm:inline">Add</span>
            </button>
          </div>
        </div>
      </div>

      {/* EMPTY STATE */}
      {allTopics.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-black/20">
          <Brain size={48} className="mx-auto mb-4 text-black/20" />
          <h2 className="text-xl font-black mb-2">No Topics Yet</h2>
          <p className="text-black/50 mb-6">Add topics you want to remember using spaced repetition</p>
          <button 
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 font-bold"
          >
            <Plus size={18} /> Add Your First Topic
          </button>
        </div>
      )}

      {/* DUE NOW SECTION */}
      {!query && due.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-red-100">
              <AlertTriangle size={22} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-black">Due Now</h2>
              <p className="text-sm font-bold text-black/40">{due.length} topics need review</p>
            </div>
          </div>

          {/* MAIN REVIEW CARD */}
          {activeTopic && (
            <AnimatePresence mode='wait'>
              <motion.div 
                key={activeTopic.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border-2 border-black p-6 md:p-8 shadow-[6px_6px_0_0_#000] mb-6"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-black text-white text-xs font-bold px-3 py-1.5">
                    Day {activeTopic.last_gap} interval
                  </div>
                  <button 
                    onClick={() => handleDelete(activeTopic.id)} 
                    className="p-2 text-black/30 hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Title */}
                <h3 className="text-2xl md:text-3xl font-black leading-tight mb-8 break-words">
                  {activeTopic.title}
                </h3>

                {/* Rating Buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => handleReview(activeTopic, 0)} 
                    className="group flex flex-col items-center gap-2 p-4 md:p-5 bg-white border-2 border-red-200 hover:border-red-500 hover:bg-red-50 transition-all"
                  >
                    <RefreshCcw size={24} className="text-red-400 group-hover:text-red-600" />
                    <span className="text-xs font-bold text-red-400 group-hover:text-red-600">Forgot</span>
                  </button>
                  <button 
                    onClick={() => handleReview(activeTopic, 1)} 
                    className="group flex flex-col items-center gap-2 p-4 md:p-5 bg-white border-2 border-blue-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                  >
                    <Check size={24} className="text-blue-400 group-hover:text-blue-600" />
                    <span className="text-xs font-bold text-blue-400 group-hover:text-blue-600">Got It</span>
                  </button>
                  <button 
                    onClick={() => handleReview(activeTopic, 2)} 
                    className="group flex flex-col items-center gap-2 p-4 md:p-5 bg-brand border-2 border-black hover:bg-brand-hover transition-all"
                  >
                    <Zap size={24} className="text-black" />
                    <span className="text-xs font-bold text-black">Easy</span>
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* TOPIC SELECTOR */}
          {due.length > 1 && (
            <div className="overflow-x-auto pb-2 -mx-1 px-1">
              <div className="flex gap-3 w-max">
                {due.map(t => (
                  <button 
                    key={t.id}
                    onClick={() => setSelectedTopicId(t.id)}
                    className={`flex-shrink-0 px-4 py-3 border-2 text-left w-48 transition-all ${
                      activeTopic?.id === t.id 
                        ? 'bg-black text-white border-black' 
                        : 'bg-white text-black/60 border-black/20 hover:border-black'
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase opacity-60 mb-1">
                      Day {t.last_gap}
                    </div>
                    <div className="font-bold text-sm truncate">{t.title}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {/* ALL CLEAR STATE */}
      {!query && due.length === 0 && allTopics.length > 0 && (
        <div className="mb-12 p-8 bg-green-50 border-2 border-green-200 text-center">
          <CheckCircle2 size={40} className="mx-auto mb-3 text-green-500" />
          <h2 className="text-xl font-black text-green-800 mb-1">All Caught Up!</h2>
          <p className="text-green-600">No topics due right now. Check back later.</p>
        </div>
      )}

      {/* SCHEDULED SECTION */}
      {scheduled.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-blue-100">
              <Clock size={22} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-black">Upcoming</h2>
              <p className="text-sm font-bold text-black/40">{totalScheduled} scheduled</p>
            </div>
          </div>

          <div className="space-y-2">
            {scheduled.map(t => (
              <div 
                key={t.id} 
                className="bg-white border-2 border-black/10 p-4 flex items-center justify-between hover:border-black transition-all group"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <h4 className="font-bold truncate">{t.title}</h4>
                  <div className="flex items-center gap-2 text-xs font-bold text-black/40 mt-1">
                    <Calendar size={12} />
                    <span>{formatDate(t.next_review)}</span>
                    <span className="text-black/20">•</span>
                    <span>Day {t.last_gap}</span>
                  </div>
                </div>
                <button 
                  onClick={() => handleDelete(t.id)} 
                  className="p-2 text-black/20 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {!query && totalScheduled > 20 && (
            <p className="text-center text-sm font-bold text-black/40 mt-4">
              +{totalScheduled - 20} more scheduled (use search to find)
            </p>
          )}
        </section>
      )}

      {/* ARCHIVED SECTION */}
      {archived.length > 0 && (
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 bg-stone-200">
              <CheckCircle2 size={22} className="text-stone-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-black/50">Completed</h2>
              <p className="text-sm font-bold text-black/30">{totalArchived} archived</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {archived.map(t => (
              <div 
                key={t.id} 
                className="bg-stone-100 border border-stone-200 p-4 flex items-center justify-between group"
              >
                <span className="font-bold text-stone-500 line-through truncate flex-1 mr-4">
                  {t.title}
                </span>
                <button 
                  onClick={() => handleDelete(t.id)} 
                  className="p-2 text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {!query && totalArchived > 20 && (
            <p className="text-center text-sm font-bold text-black/30 mt-4">
              +{totalArchived - 20} more archived
            </p>
          )}
        </section>
      )}

      {/* ADD TOPIC MODAL */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border-2 border-black shadow-[8px_8px_0_0_#000] w-full max-w-md"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b-2 border-black p-4 bg-stone-50">
                <h2 className="text-lg font-black">Add Topic</h2>
                <button onClick={() => setShowAdd(false)} className="p-1 hover:bg-red-100 hover:text-red-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold mb-2">Topic Name</label>
                  <input 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="What do you want to remember?"
                    className="w-full border-2 border-black p-3 font-bold focus:outline-none focus:shadow-[3px_3px_0_0_#000]"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold mb-3">Review Schedule</label>
                  <div className="space-y-2">
                    {SCHEDULE_PRESETS.map((preset, i) => (
                      <button
                        key={preset.name}
                        onClick={() => { setSelectedPreset(i); if (preset.val !== 'custom') setNewSchedule(preset.val) }}
                        className={`w-full p-3 border-2 text-left transition-all ${
                          selectedPreset === i 
                            ? 'border-black bg-black text-white' 
                            : 'border-black/20 hover:border-black'
                        }`}
                      >
                        <div className="font-bold">{preset.name}</div>
                        <div className={`text-xs ${selectedPreset === i ? 'text-white/60' : 'text-black/40'}`}>
                          {preset.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom Interval Input */}
                  {selectedPreset === 3 && (
                    <div className="mt-4 p-4 bg-stone-50 border-2 border-black/10">
                      <label className="block text-xs font-bold text-black/50 mb-2">
                        Custom Intervals (days, comma-separated)
                      </label>
                      <input 
                        value={customIntervals}
                        onChange={(e) => setCustomIntervals(e.target.value)}
                        placeholder="0, 1, 3, 7, 14, 30"
                        className="w-full border-2 border-black p-2 font-mono text-sm focus:outline-none"
                      />
                      <p className="text-xs text-black/40 mt-2">
                        Example: 0, 1, 3, 7, 14, 30 means review today, then after 1 day, 3 days, etc.
                      </p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleAdd}
                  className="w-full bg-black text-white py-4 font-bold hover:bg-stone-800 transition-all"
                >
                  Add Topic
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
