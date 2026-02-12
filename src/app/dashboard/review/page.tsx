'use client'
import FeatureGate from '@/components/dashboard/FeatureGate'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { reviewTopic, type Topic } from '@/lib/logic'
import { ArrowLeft, Plus, Search, X, Brain, AlertTriangle, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAlert } from '@/context/AlertContext'
import { useXP } from '@/context/XPContext'
import ReviewQueueCard from '@/components/review/ReviewQueueCard'
import TopicSelector from '@/components/review/TopicSelector'
import ScheduledTopicsList from '@/components/review/ScheduledTopicsList'
import ArchivedTopicsList from '@/components/review/ArchivedTopicsList'

// --- CONSTANTS ---
const SCHEDULE_PRESETS = [
  { name: "Standard", val: "0, 1, 3, 7, 14, 30, 60", desc: "Balanced retention" },
  { name: "Aggressive", val: "0, 1, 2, 4, 7, 14", desc: "Fast learning" },
  { name: "Relaxed", val: "0, 2, 7, 14, 30, 60, 90", desc: "Long-term memory" },
  { name: "Custom", val: "custom", desc: "Set your own intervals" },
]

export default function ReviewPage() {
  return (
    <FeatureGate flag="feature_review_enabled" featureName="Spaced Review">
      <ReviewPageInner />
    </FeatureGate>
  )
}

function ReviewPageInner() {
  const supabase = createClient()
  const { showAlert, askConfirm } = useAlert()
  const { recordReview } = useXP()
  
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

  // --- FILTER LOGIC (PRESERVED) ---
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
      scheduled: query ? scheduled : scheduled.slice(0, 15),
      archived: query ? archived : archived.slice(0, 15),
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
    
    const intervalsToUse = selectedPreset === 3 ? customIntervals : newSchedule
    
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
      setSelectedPreset(0)
      fetchTopics()
    }
  }

  // --- LOGIC FIX 1: Updated handleReview to use correct signature ---
  const handleReview = async (topic: Topic, rating: number) => {
    try {
      // We pass 'supabase' because your logic.ts requires it to save to DB
      // @ts-ignore
      await reviewTopic(supabase, topic, rating as 0 | 1 | 2)
      
      showAlert(
        rating === 0 ? "Reviewing again today" : 
        rating === 1 ? "Next review scheduled" : 
        "Longer interval applied",
        "success"
      )
      
      // Update XP
      await recordReview()

      // Refresh data
      if (selectedTopicId === topic.id) setSelectedTopicId(null)
      fetchTopics()
    } catch (e) {
      showAlert("Failed to update", "error")
    }
  }

  // --- LOGIC FIX 2: Updated handleDelete to use callback pattern ---
  const handleDelete = (topicId: string) => {
    // We use the callback (2nd argument) instead of awaiting the result
    askConfirm("Delete this topic permanently?", async () => {
      const { error } = await supabase.from('topics').delete().eq('id', topicId)
      if (!error) {
        setAllTopics(prev => prev.filter(t => t.id !== topicId))
        showAlert("Topic deleted", "success")
      } else {
        showAlert("Failed to delete", "error")
      }
    })
  }

  const handleReactivate = async (topicId: string) => {
    const topic = allTopics.find(t => t.id === topicId)
    if (!topic) return

    const { error } = await supabase
      .from('topics')
      .update({ 
        status: 'active', 
        next_review: new Date().toISOString() 
      })
      .eq('id', topicId)
    
    if (!error) {
      fetchTopics()
      showAlert("Topic reactivated!", "success")
    } else {
      showAlert("Failed to reactivate", "error")
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-gray-500">Loading...</div>
    </div>
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-24">
      
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 mb-8">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft size={16} /> Dashboard
          </Link>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">Spaced Review</h1>
              <p className="text-lg text-gray-600">
                {due.length > 0 ? `${due.length} topics due now` : 'All caught up! 🎉'}
              </p>
            </div>

            <div className="flex w-full md:w-auto gap-3">
              {/* SEARCH */}
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search topics..."
                  className="input pl-10 w-full"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-danger-500">
                    <X size={18} />
                  </button>
                )}
              </div>
              
              {/* ADD BUTTON */}
              <button 
                onClick={() => setShowAdd(true)} 
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus size={18} /> <span className="hidden sm:inline">Add Topic</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        {/* EMPTY STATE */}
        {allTopics.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300">
            <Brain size={48} className="mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Topics Yet</h2>
            <p className="text-gray-600 mb-6">Add topics you want to remember using spaced repetition</p>
            <button 
              onClick={() => setShowAdd(true)}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <Plus size={18} /> Add Your First Topic
            </button>
          </div>
        )}

        {/* DUE NOW SECTION */}
        {!query && due.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-br from-danger-100 to-warning-100 rounded-xl">
                <AlertTriangle size={24} className="text-danger-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Due Now</h2>
                <p className="text-sm text-gray-600">{due.length} topics need review</p>
              </div>
            </div>

            {/* MAIN REVIEW CARD */}
            {activeTopic && (
              <ReviewQueueCard
                topic={activeTopic}
                onReview={(rating) => handleReview(activeTopic, rating)}
                onDelete={() => handleDelete(activeTopic.id)}
              />
            )}

            {/* TOPIC SELECTOR */}
            <TopicSelector
              topics={due}
              activeTopicId={activeTopic?.id || null}
              onSelect={setSelectedTopicId}
            />
          </section>
        )}

        {/* ALL CLEAR STATE */}
        {!query && due.length === 0 && allTopics.length > 0 && (
          <div className="text-center py-12 mb-12 bg-gradient-to-br from-success-50 to-success-100 rounded-2xl border border-success-200">
            <CheckCircle2 size={48} className="mx-auto mb-4 text-success-600" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">You're all caught up!</h2>
            <p className="text-gray-600">No topics due right now. Great work! 🎉</p>
          </div>
        )}

        {/* SCHEDULED SECTION */}
        <ScheduledTopicsList
          topics={scheduled}
          totalCount={totalScheduled}
          hasSearch={!!query.trim()}
        />

        {/* ARCHIVED SECTION */}
        <ArchivedTopicsList
          topics={archived}
          totalCount={totalArchived}
          hasSearch={!!query.trim()}
          onReactivate={handleReactivate}
        />
      </div>

      {/* ADD TOPIC MODAL */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900">Add Topic</h2>
                <button onClick={() => setShowAdd(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Form */}
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Topic Name</label>
                  <input 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="What do you want to remember?"
                    className="input w-full"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">Review Schedule</label>
                  <div className="space-y-2">
                    {SCHEDULE_PRESETS.map((preset, i) => (
                      <button
                        key={preset.name}
                        onClick={() => { setSelectedPreset(i); if (preset.val !== 'custom') setNewSchedule(preset.val) }}
                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                          selectedPreset === i 
                            ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-200' 
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">{preset.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{preset.desc}</div>
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom Interval Input */}
                  {selectedPreset === 3 && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <label className="block text-xs font-semibold text-gray-700 mb-2">
                        Custom Intervals (days, comma-separated)
                      </label>
                      <input 
                        value={customIntervals}
                        onChange={(e) => setCustomIntervals(e.target.value)}
                        placeholder="0, 1, 3, 7, 14, 30"
                        className="input w-full font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Example: 0, 1, 3, 7, 14, 30 means review today, then after 1 day, 3 days, etc.
                      </p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleAdd}
                  className="btn btn-primary w-full"
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