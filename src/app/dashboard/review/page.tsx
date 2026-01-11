'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { reviewTopic, type Topic } from '@/lib/logic'
import { ArrowLeft, Plus, Clock, CheckCircle2, AlertTriangle, Trash2, Search, Zap, Check, RefreshCcw, CalendarDays } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAlert } from '@/context/AlertContext'

// --- CONSTANTS ---
const SCHEDULE_PRESETS = [
  { name: "Standard", val: "0, 1, 3, 7, 14, 30, 60" },
  { name: "Aggressive", val: "0, 1, 2, 3, 4, 5" },
  { name: "One-Off", val: "0" },
]

export default function ReviewPage() {
  const supabase = createClient()
  const { showAlert, askConfirm } = useAlert()
  
  const [allTopics, setAllTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  // SELECTION STATE (For Carousel)
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)

  // MODAL
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newSchedule, setNewSchedule] = useState(SCHEDULE_PRESETS[0].val)

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

  // --- FILTER LOGIC (With Tactical Limits) ---
  const getLists = () => {
    const now = new Date()
    
    // 1. Search Filter
    let filtered = allTopics
    if (query.trim()) {
      filtered = allTopics.filter(t => t.title.toLowerCase().includes(query.toLowerCase()))
    }

    // 2. Buckets
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

    // 3. Apply Limits (Performance Optimization)
    // If NOT searching, we cap the lists at 20 items to keep the DOM light.
    const rawScheduledCount = scheduled.length
    const rawArchivedCount = archived.length

    const displayScheduled = query ? scheduled : scheduled.slice(0, 20)
    const displayArchived = query ? archived : archived.slice(0, 20)

    return { 
        due, 
        scheduled: displayScheduled, 
        archived: displayArchived,
        rawScheduledCount,
        rawArchivedCount
    }
  }

  const { due, scheduled, archived, rawScheduledCount, rawArchivedCount } = getLists()
  const activeTopic = due.find(t => t.id === selectedTopicId) || due[0]

  // --- ACTIONS ---
  const handleAdd = async () => {
    if (!newTitle.trim()) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('topics').insert({
      user_id: user.id,
      title: newTitle,
      custom_intervals: newSchedule,
      last_gap: 0,
      next_review: new Date().toISOString()
    })

    if (error) showAlert('Error adding topic.', 'error')
    else {
      showAlert('Topic Initialized.', 'success')
      setNewTitle("")
      setShowAdd(false)
      fetchTopics()
    }
  }

  const handleReview = async (topic: Topic, rating: 0 | 1 | 2) => {
    try {
      const result = await reviewTopic(supabase, topic, rating)
      
      if (result.completed) {
        showAlert(`"${topic.title}" Archived.`, 'neutral')
      } else {
        const msgs = ["Reset to Day 0", "See you in a bit", "Easy win! Skipped ahead."]
        showAlert(msgs[rating], 'success')
      }
      
      if (selectedTopicId === topic.id) setSelectedTopicId(null)
      fetchTopics()
    } catch (e) {
      showAlert('Review failed.', 'error')
    }
  }

  const handleDelete = (id: string) => {
    askConfirm("Permanently delete this topic?", async () => {
       await supabase.from('topics').delete().eq('id', id)
       fetchTopics()
       showAlert("Deleted.", 'neutral')
    })
  }

  // --- HELPERS ---
  const formatDate = (dateStr: string | null) => {
     if(!dateStr) return '-'
     const d = new Date(dateStr)
     const today = new Date()
     const diff = Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
     
     if(diff === 0) return 'Tomorrow'
     if(diff < 7) return d.toLocaleDateString(undefined, { weekday: 'long' })
     return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  // LOGIC: Calculate Future Flight Path for Tooltip
  const getFlightPath = (t: Topic) => {
     const schedule = t.custom_intervals 
        ? t.custom_intervals.split(',').map(Number) 
        : [0, 1, 3, 7, 14, 30, 60]
     
     // Robust Index Finding
     let currentIndex = schedule.indexOf(t.last_gap)
     if (currentIndex === -1) {
         currentIndex = schedule.findIndex(n => n > t.last_gap) - 1
         if (currentIndex < 0) currentIndex = 0
     }
     
     const futureGaps = schedule.slice(currentIndex + 1, currentIndex + 4)
     
     if (futureGaps.length === 0) return "Max Interval Reached"

     return futureGaps.map(gap => {
        const d = new Date()
        d.setDate(d.getDate() + gap)
        return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
     }).join(' → ')
  }

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-black pb-20 font-space">
      
      {/* HEADER */}
      <div className="bg-white border-b-2 border-black sticky top-0 z-20 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-4 w-full md:w-auto">
              <Link href="/dashboard">
                 <ArrowLeft className="text-stone-400 hover:text-black transition-colors" />
              </Link>
              <h1 className="text-xl font-black uppercase tracking-tighter">Review Command</h1>
           </div>

           <div className="flex w-full md:w-auto gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" size={16} />
                <input 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="SEARCH DATABASE..."
                  className="w-full bg-stone-100 rounded-full py-2 pl-10 pr-4 text-xs font-bold uppercase tracking-wide focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <button onClick={() => setShowAdd(true)} className="bg-black text-white px-4 py-2 rounded-full font-bold uppercase text-xs hover:bg-stone-800 flex items-center gap-2">
                <Plus size={16} /> <span className="hidden sm:inline">Add Topic</span>
              </button>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-16">

        {/* ZONE 1: THE ARENA (Critical Queue) */}
        {!query && (
            <section>
              <div className="flex items-center gap-3 mb-6">
                 <div className="bg-red-100 p-2 rounded-full"><AlertTriangle size={20} className="text-red-600"/></div>
                 <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Critical Queue</h2>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">{due.length} Missions Pending</p>
                 </div>
              </div>

              {due.length === 0 ? (
                 <div className="p-12 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center text-stone-400 bg-white/50">
                    <CheckCircle2 size={48} className="mb-4 text-stone-200" />
                    <span className="font-black uppercase tracking-widest">All Clear</span>
                 </div>
              ) : (
                 <div className="flex flex-col gap-6">
                    
                    {/* A. MAIN STAGE (Focus Card) */}
                    <AnimatePresence mode='wait'>
                       <motion.div 
                         key={activeTopic.id}
                         initial={{ opacity: 0, x: 20 }}
                         animate={{ opacity: 1, x: 0 }}
                         exit={{ opacity: 0, x: -20 }}
                         transition={{ duration: 0.2 }}
                         className="bg-[#FFFDF5] border-4 border-black p-6 md:p-10 shadow-[8px_8px_0_0_#000] rounded-xl relative"
                       >
                          {/* Card Header */}
                          <div className="flex justify-between items-start mb-8">
                             <div className="bg-black text-white text-[10px] font-black uppercase px-3 py-1 rounded tracking-widest">
                                Interval: {activeTopic.last_gap} days
                             </div>
                             <button onClick={() => handleDelete(activeTopic.id)} className="text-stone-300 hover:text-red-500 transition-colors">
                                <Trash2 size={20} />
                             </button>
                          </div>

                          {/* Big Title */}
                          <h3 className="text-3xl md:text-5xl font-black uppercase leading-none mb-12 break-words text-black tracking-tight">
                             {activeTopic.title}
                          </h3>

                          {/* Combat Actions */}
                          <div className="grid grid-cols-3 gap-4">
                             <button onClick={() => handleReview(activeTopic, 0)} className="group flex flex-col items-center gap-2 p-4 border-2 border-stone-200 bg-white hover:border-red-500 hover:bg-red-50 rounded-xl transition-all">
                                <RefreshCcw className="text-stone-400 group-hover:text-red-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 group-hover:text-red-600">Reset</span>
                             </button>
                             <button onClick={() => handleReview(activeTopic, 1)} className="group flex flex-col items-center gap-2 p-4 border-2 border-stone-200 bg-white hover:border-blue-500 hover:bg-blue-50 rounded-xl transition-all">
                                <Check className="text-stone-400 group-hover:text-blue-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 group-hover:text-blue-600">Good</span>
                             </button>
                             <button onClick={() => handleReview(activeTopic, 2)} className="group flex flex-col items-center gap-2 p-4 border-2 border-stone-200 bg-white hover:border-green-500 hover:bg-green-50 rounded-xl transition-all">
                                <Zap className="text-stone-400 group-hover:text-green-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 group-hover:text-green-600">Easy</span>
                             </button>
                          </div>
                       </motion.div>
                    </AnimatePresence>

                    {/* B. SELECTOR STRIP (Carousel) */}
                    {due.length > 1 && (
                      <div className="overflow-x-auto pb-4 pt-2">
                         <div className="flex gap-3 w-max">
                            {due.map(t => (
                               <button 
                                 key={t.id}
                                 onClick={() => setSelectedTopicId(t.id)}
                                 className={`flex-shrink-0 px-4 py-3 rounded-lg border-2 text-left w-48 transition-all ${
                                    activeTopic.id === t.id 
                                    ? 'bg-black text-white border-black shadow-lg scale-105' 
                                    : 'bg-white text-stone-500 border-stone-200 hover:border-black'
                                 }`}
                               >
                                  <div className="text-[10px] font-black uppercase opacity-60 mb-1 tracking-widest">Priority Task</div>
                                  <div className="font-bold text-sm truncate">{t.title}</div>
                               </button>
                            ))}
                         </div>
                      </div>
                    )}
                 </div>
              )}
            </section>
        )}

        {/* ZONE 2: TIMELINE (Scheduled) */}
        {scheduled.length > 0 && (
           <section>
              <div className="flex items-center gap-3 mb-6 border-t-2 border-stone-100 pt-10">
                 <div className="bg-emerald-100 p-2 rounded-full"><Clock size={20} className="text-emerald-600"/></div>
                 <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Timeline</h2>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-widest">Upcoming Missions</p>
                 </div>
              </div>

              <div className="overflow-x-auto pb-6">
                 <div className="flex gap-6 w-max">
                    {scheduled.map(t => (
                       <div key={t.id} className="w-64 flex-shrink-0 bg-white border border-stone-200 p-5 rounded-xl hover:shadow-lg hover:border-emerald-400 transition-all relative group cursor-help overflow-hidden">
                          
                          {/* DELETE BTN */}
                          <div className="absolute top-4 right-4 z-20">
                             <button onClick={() => handleDelete(t.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-stone-300 hover:text-red-500">
                                <Trash2 size={16}/>
                             </button>
                          </div>

                          {/* 1. DEFAULT CONTENT (Fades Out on Hover) */}
                          <div className="group-hover:opacity-5 transition-opacity duration-300">
                              <div className="text-emerald-600 text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
                                 <CalendarDays size={12}/> {formatDate(t.next_review)}
                              </div>

                              <div className="font-black text-lg leading-tight text-black mb-4 line-clamp-2 h-12">
                                 {t.title}
                              </div>

                              <div className="flex gap-1">
                                 {(t.custom_intervals ? t.custom_intervals.split(',') : [0,1,3,7,14,30]).slice(0,6).map((g,i) => {
                                    const val = Number(g)
                                    return <div key={i} className={`h-1.5 w-1.5 rounded-full ${val < t.last_gap ? 'bg-black' : 'bg-stone-200'}`} />
                                 })}
                              </div>
                          </div>

                          {/* 2. HOVER OVERLAY (Fades In on Hover) */}
                          <div className="absolute inset-0 flex flex-col justify-center items-center p-4 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/50 backdrop-blur-sm z-10">
                             <div className="font-black uppercase tracking-widest mb-2 text-stone-400 text-[10px]">Projected Flight Path</div>
                             <div className="font-mono text-xs font-bold text-emerald-700 leading-relaxed bg-emerald-50 p-2 rounded border border-emerald-100">
                                {getFlightPath(t)}
                             </div>
                          </div>

                       </div>
                    ))}
                    
                    {/* LIMIT INDICATOR (Ghost Card) */}
                    {!query && rawScheduledCount > 20 && (
                        <div className="w-48 flex-shrink-0 border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center p-6 text-center">
                            <span className="font-black text-stone-300 text-3xl mb-2">+{rawScheduledCount - 20}</span>
                            <span className="text-[10px] font-bold uppercase text-stone-400 tracking-widest">More Missions<br/>Hidden</span>
                            <span className="mt-4 bg-stone-100 text-stone-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase">Use Search</span>
                        </div>
                    )}
                 </div>
              </div>
           </section>
        )}

        {/* ZONE 3: ARCHIVE (Completed) */}
        {archived.length > 0 && (
           <section>
              <div className="flex items-center gap-3 mb-6 border-t-2 border-stone-100 pt-10">
                 <div className="bg-stone-200 p-2 rounded-full"><CheckCircle2 size={20} className="text-stone-600"/></div>
                 <h2 className="text-2xl font-black uppercase tracking-tight text-stone-400">Archive</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {archived.map(t => (
                    <div key={t.id} className="flex justify-between items-center p-4 bg-stone-200 border-2 border-transparent hover:border-stone-300 rounded-lg group transition-colors">
                       <span className="font-bold text-stone-600 line-through break-words text-sm pr-4 opacity-70 group-hover:opacity-100">
                          {t.title}
                       </span>
                       <button onClick={() => handleDelete(t.id)} className="text-stone-400 hover:text-red-500 transition-colors">
                          <Trash2 size={16}/>
                       </button>
                    </div>
                 ))}
              </div>
              
              {/* LIMIT INDICATOR (Footer) */}
              {!query && rawArchivedCount > 20 && (
                  <div className="text-center mt-6 p-4 border-t border-stone-100">
                      <p className="text-xs font-bold uppercase text-stone-400 tracking-widest">
                          + {rawArchivedCount - 20} Older items archived (Use Search to find)
                      </p>
                  </div>
              )}
           </section>
        )}
        
        {/* SEARCH RESULTS OVERRIDE */}
        {query && (
           <div className="mt-8">
              <h3 className="font-black uppercase mb-4">Search Results ({due.length + scheduled.length + archived.length})</h3>
              <div className="space-y-2">
                 {[...due, ...scheduled, ...archived].map(t => (
                    <div key={t.id} className="bg-white p-4 border border-black flex justify-between items-center">
                       <div>
                          <div className="font-bold">{t.title}</div>
                          <div className="text-xs uppercase text-stone-500">{t.status === 'completed' ? 'Archived' : `Next: ${formatDate(t.next_review)}`}</div>
                       </div>
                       <div className="flex gap-2">
                          {t.status === 'active' && <button onClick={() => handleReview(t, 1)} className="px-3 py-1 bg-black text-white text-xs font-bold uppercase hover:bg-stone-800">Review</button>}
                          <button onClick={() => handleDelete(t.id)} className="px-3 py-1 border border-stone-200 text-xs font-bold uppercase hover:bg-red-50 hover:text-red-600">Delete</button>
                       </div>
                    </div>
                 ))}
                 {[...due, ...scheduled, ...archived].length === 0 && <div className="text-stone-400 italic font-bold">No matches found.</div>}
              </div>
           </div>
        )}

      </div>

      {/* ADD MODAL */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               exit={{ scale: 0.9, opacity: 0 }}
               className="bg-[#FBF9F6] border-4 border-black p-8 max-w-md w-full shadow-[12px_12px_0_0_#000]"
             >
                <h2 className="text-xl font-black uppercase mb-6">Initialize Topic</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Topic Name</label>
                    <input 
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g. Organic Chemistry Reactions"
                      className="w-full bg-white border-2 border-stone-200 p-3 font-bold outline-none focus:border-black transition-colors"
                      autoFocus
                    />
                  </div>

                  <div>
                     <label className="block text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Review Protocol</label>
                     <div className="flex gap-2 mb-2">
                        {SCHEDULE_PRESETS.map(p => (
                          <button 
                            key={p.name}
                            onClick={() => setNewSchedule(p.val)}
                            className={`px-3 py-1 text-[10px] font-bold uppercase border ${newSchedule === p.val ? 'bg-black text-white border-black' : 'bg-white text-stone-500 border-stone-200'}`}
                          >
                            {p.name}
                          </button>
                        ))}
                     </div>
                     <input 
                       value={newSchedule}
                       onChange={(e) => setNewSchedule(e.target.value)}
                       className="w-full bg-white border-2 border-stone-200 p-2 font-mono text-xs outline-none focus:border-black"
                     />
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                   <button onClick={() => setShowAdd(false)} className="flex-1 py-3 font-bold uppercase text-xs border-2 border-stone-200 text-stone-400 hover:text-black hover:border-black">Cancel</button>
                   <button onClick={handleAdd} className="flex-1 py-3 font-bold uppercase text-xs bg-amber-400 border-2 border-black hover:bg-amber-500">Initialize</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}