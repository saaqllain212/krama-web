'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { reviewTopic, type Topic } from '@/lib/logic'
import { ArrowLeft, Plus, Clock, CheckCircle2, AlertTriangle, Trash2, Search, RotateCw } from 'lucide-react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAlert } from '@/context/AlertContext'

// PRESETS (Renamed for Tactical Vibe)
const SCHEDULE_PRESETS = [
  { name: "Standard", val: "0, 1, 3, 7, 14, 30" },
  { name: "Aggressive", val: "0, 1, 2, 3, 4, 5" },
  { name: "One-Off", val: "0" },
]

export default function ReviewPage() {
  const supabase = createClient()
  const { showAlert, askConfirm } = useAlert()
  
  // RAW DATA
  const [allTopics, setAllTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)

  // FILTERED STATE
  const [query, setQuery] = useState('')

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

  // --- FILTER LOGIC (Global Search + Split) ---
  const getLists = () => {
    const now = new Date()
    
    // 1. Filter by Search Query
    let filtered = allTopics
    if (query.trim()) {
      filtered = allTopics.filter(t => t.title.toLowerCase().includes(query.toLowerCase()))
    }

    // 2. Split into Buckets
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

    // 3. Apply Hard Lock (Top 8) ONLY if NOT searching
    // If searching, user wants to see matches, so we show them all.
    if (!query.trim()) {
      return {
        due: due.slice(0, 8), // Show max 8
        scheduled: scheduled.slice(0, 8),
        archived: archived.slice(0, 8),
        counts: { due: due.length, scheduled: scheduled.length, archived: archived.length }
      }
    }

    return {
      due, scheduled, archived,
      counts: { due: due.length, scheduled: scheduled.length, archived: archived.length }
    }
  }

  const { due, scheduled, archived, counts } = getLists()

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

    if (error) {
      showAlert('System Error: Could not add topic.', 'error')
    } else {
      showAlert('Topic Initialized.', 'success')
      setNewTitle("")
      setShowAdd(false)
      fetchTopics()
    }
  }

  const handleReview = async (topic: Topic) => {
    try {
      const result = await reviewTopic(supabase, topic)
      
      if (result.completed) {
        showAlert(`"${topic.title}" Archived.`, 'neutral')
      } else {
        showAlert(`Reviewed. Next: ${result.nextGap} days.`, 'success')
      }
      
      fetchTopics()
    } catch (e) {
      showAlert('Review failed.', 'error')
    }
  }

  const handleDelete = (id: string) => {
    askConfirm("Permanently delete this topic and its schedule?", async () => {
       await supabase.from('topics').delete().eq('id', id)
       fetchTopics()
       showAlert("Topic Deleted.", 'neutral')
    })
  }

  // --- VISUALS ---
  const getProgressVisual = (t: Topic) => {
    // Visualizer: [x] [x] [o] [ ]
    const schedule = t.custom_intervals 
      ? t.custom_intervals.split(',').map(Number)
      : [0, 1, 3, 7, 14, 30] 
    
    return (
      <div className="flex gap-1 mt-2">
        {schedule.slice(0, 5).map((gap, i) => {
           let color = 'bg-stone-200' // Future
           if (gap < t.last_gap) color = 'bg-black' // Done
           if (gap === t.last_gap) color = 'bg-amber-500' // Current
           return <div key={i} className={`h-1.5 w-4 rounded-full ${color}`} />
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FBF9F6] p-6 md:p-12 text-black">
      
      {/* HEADER & SEARCH */}
      <div className="max-w-7xl mx-auto mb-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <Link href="/dashboard" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black mb-4">
              <ArrowLeft size={14} /> Dashboard
            </Link>
            <h1 className="text-4xl font-black tracking-tighter uppercase">
              Review Command
            </h1>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto">
             {/* GLOBAL SEARCH */}
             <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black/30" size={16} />
                <input 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="SEARCH ALL ZONES..."
                  className="w-full bg-white border-2 border-black/10 rounded-full py-3 pl-10 pr-4 text-xs font-bold uppercase tracking-wide focus:border-black focus:outline-none transition-colors"
                />
             </div>

             <button 
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-black text-white px-6 py-3 font-bold uppercase tracking-widest hover:bg-stone-800 transition-all shadow-[4px_4px_0_0_#ca8a04] active:translate-y-1 active:shadow-none whitespace-nowrap"
            >
              <Plus size={18} /> Initialize
            </button>
          </div>
        </div>
      </div>

      {/* THE THREE ZONES */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        
        {/* 1. CRITICAL QUEUE (Due) */}
        <div className="md:col-span-5 space-y-4">
           <div className="flex items-center justify-between border-b-2 border-red-200 pb-2 mb-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-red-900 flex items-center gap-2">
                <AlertTriangle size={16} /> Critical Queue
              </h2>
              <span className="bg-red-100 text-red-900 text-xs font-bold px-2 py-1">{counts.due}</span>
           </div>

           {due.length === 0 ? (
             <div className="p-8 border-2 border-dashed border-stone-200 text-center text-black/40 font-bold uppercase text-xs tracking-widest">
               {query ? "No matches." : "All systems normal."}
             </div>
           ) : (
             <AnimatePresence>
               {due.map(topic => (
                 <motion.div 
                   key={topic.id}
                   layout
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, x: -50 }}
                   className="bg-white border-2 border-black p-6 shadow-[6px_6px_0_0_#1c1917] relative group"
                 >
                    <div className="flex justify-between items-start mb-4">
                      <span className="bg-stone-100 text-black/60 text-[10px] font-bold uppercase px-2 py-1 tracking-widest">
                        Interval: {topic.last_gap}d
                      </span>
                      {/* Delete on Due Cards too */}
                      <button onClick={() => handleDelete(topic.id)} className="text-stone-300 hover:text-red-500 transition-colors">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                    
                    <h3 className="text-xl font-black uppercase leading-tight mb-6 line-clamp-2">
                      {topic.title}
                    </h3>

                    <button 
                      onClick={() => handleReview(topic)}
                      className="w-full flex items-center justify-center gap-2 bg-amber-400 border-2 border-black py-3 font-bold uppercase text-xs tracking-widest hover:bg-amber-500 transition-colors"
                    >
                      <RotateCw size={16} /> Mark Reviewed
                    </button>
                 </motion.div>
               ))}
             </AnimatePresence>
           )}
           {/* Hint if hidden items */}
           {!query && counts.due > 8 && (
             <div className="text-center text-xs font-bold text-red-900/40 uppercase tracking-widest py-2">
               + {counts.due - 8} more critical
             </div>
           )}
        </div>

        {/* 2. SCHEDULED (Future) */}
        <div className="md:col-span-4 space-y-4">
           <div className="flex items-center justify-between border-b-2 border-emerald-200 pb-2 mb-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-emerald-900 flex items-center gap-2">
                <Clock size={16} /> Scheduled
              </h2>
              <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2 py-1">{counts.scheduled}</span>
           </div>

           <div className="space-y-3">
             {scheduled.map(topic => (
               <div key={topic.id} className="group bg-white border border-stone-200 p-4 opacity-70 hover:opacity-100 transition-all hover:border-black/20 hover:shadow-sm">
                 <div className="flex justify-between items-start">
                   <div className="text-sm font-bold text-black line-clamp-1">{topic.title}</div>
                   {/* DELETE OPTION ADDED HERE */}
                   <button 
                     onClick={() => handleDelete(topic.id)} 
                     className="text-stone-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                   >
                     <Trash2 size={14} />
                   </button>
                 </div>
                 
                 <div className="flex justify-between items-end mt-2">
                    {getProgressVisual(topic)}
                    <span className="text-[10px] font-bold uppercase text-stone-400">
                      {topic.next_review ? new Date(topic.next_review).toLocaleDateString(undefined, { month: 'short', day: 'numeric'}) : '-'}
                    </span>
                 </div>
               </div>
             ))}
             {scheduled.length === 0 && (
                <div className="text-xs font-bold text-stone-300 uppercase text-center py-4">No scheduled items</div>
             )}
             {!query && counts.scheduled > 8 && (
               <div className="text-center text-xs font-bold text-emerald-900/40 uppercase tracking-widest py-2">
                 + {counts.scheduled - 8} more
               </div>
             )}
           </div>
        </div>

        {/* 3. ARCHIVED (Completed) */}
        <div className="md:col-span-3 space-y-4">
           <div className="flex items-center justify-between border-b-2 border-stone-200 pb-2 mb-4">
              <h2 className="text-sm font-black uppercase tracking-widest text-stone-500 flex items-center gap-2">
                <CheckCircle2 size={16} /> Archived
              </h2>
              <span className="bg-stone-100 text-stone-500 text-xs font-bold px-2 py-1">{counts.archived}</span>
           </div>
           
           <div className="space-y-2">
             {archived.map(topic => (
               <div key={topic.id} className="flex items-center justify-between text-stone-400 text-xs font-bold border-b border-stone-100 py-2 group">
                  <span className="line-through truncate pr-2">{topic.title}</span>
                  <button onClick={() => handleDelete(topic.id)} className="hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>
               </div>
             ))}
             {!query && counts.archived > 8 && (
               <div className="text-center text-xs font-bold text-stone-300 uppercase tracking-widest py-2">
                 + {counts.archived - 8} more
               </div>
             )}
           </div>
        </div>

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