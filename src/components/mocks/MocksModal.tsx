'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Save, Clock, AlertCircle } from 'lucide-react'
import { MockLogEntry } from '@/lib/analytics'

type Props = {
  open: boolean
  onClose: () => void
  examId: string
  onSuccess: () => void
}

export default function MocksModal({ open, onClose, examId, onSuccess }: Props) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // FORM STATE
  const [name, setName] = useState('')
  const [score, setScore] = useState('')
  const [maxScore, setMaxScore] = useState('200')
  const [accuracy, setAccuracy] = useState('')
  const [stress, setStress] = useState('5')
  const [fatigue, setFatigue] = useState('5')
  
  // TIME STATE
  const [timeOfDay, setTimeOfDay] = useState('morning')
  
  // NOTE STATE
  const [note, setNote] = useState('')

  // NEW: AUTOPSY STATE
  const [silly, setSilly] = useState('')
  const [conceptual, setConceptual] = useState('')
  const [unattempted, setUnattempted] = useState('')

  if (!open) return null

  // Word Count Helper
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    const words = text.trim().split(/\s+/)
    // Allow typing if under 30 words OR if deleting characters
    if (words.length <= 30 || text.length < note.length) {
       setNote(text)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Unauthorized")

      // 1. Create the new log object
      const newLog: MockLogEntry = {
        id: crypto.randomUUID(),
        d: new Date().toISOString(),
        n: name,
        s: Number(score),
        m: Number(maxScore),
        a: accuracy ? Number(accuracy) : undefined,
        st: Number(stress),
        fa: Number(fatigue),
        nt: note,
        t: timeOfDay,
        // New Autopsy Fields
        si: silly ? Number(silly) : undefined,
        co: conceptual ? Number(conceptual) : undefined,
        ua: unattempted ? Number(unattempted) : undefined,
      }

      // 2. Fetch existing logs
      const { data: existing } = await supabase
        .from('mock_logs')
        .select('logs')
        .eq('user_id', user.id)
        .eq('exam_id', examId)
        .maybeSingle()

      const currentLogs = existing?.logs ? (existing.logs as any[]) : []
      const updatedLogs = [...currentLogs, newLog]

      // 3. Save back to DB
      const { error: saveError } = await supabase
        .from('mock_logs')
        .upsert({
          user_id: user.id,
          exam_id: examId,
          logs: updatedLogs as any
        })

      if (saveError) throw saveError

      onSuccess()
      onClose()
      
      // Reset Form
      setName('')
      setScore('')
      setNote('')
      setAccuracy('')
      setSilly('')
      setConceptual('')
      setUnattempted('')

    } catch (err: any) {
      setError(err.message || "Failed to save log")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/90 backdrop-blur-sm p-4">
      <div className="bg-[#FDFBF7] w-full max-w-lg border-4 border-black shadow-[10px_10px_0_0_#000] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="bg-stone-100 p-6 border-b-4 border-black flex justify-between items-center">
          <h2 className="text-2xl font-black uppercase tracking-tighter">Log Entry</h2>
          <button onClick={onClose} className="hover:text-red-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* SCROLLABLE FORM */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
          
          <div>
            <label className="block text-xs font-bold uppercase mb-2">Test Name</label>
            <input 
              required
              placeholder="e.g. Vision IAS Abhyaas 1"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full border-2 border-black p-3 font-bold focus:bg-stone-50 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-bold uppercase mb-2">Score</label>
               <input 
                 required type="number"
                 placeholder="90"
                 value={score}
                 onChange={e => setScore(e.target.value)}
                 className="w-full border-2 border-black p-3 font-bold text-lg outline-none"
               />
             </div>
             <div>
               <label className="block text-xs font-bold uppercase mb-2">Max Score</label>
               <input 
                 required type="number"
                 value={maxScore}
                 onChange={e => setMaxScore(e.target.value)}
                 className="w-full border-2 border-black p-3 font-bold text-lg outline-none bg-stone-100"
               />
             </div>
          </div>

          {/* MISTAKE AUTOPSY (NEW SECTION) */}
          <div className="bg-red-50 p-4 border-2 border-red-100 rounded-sm">
             <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={14} className="text-red-500" />
                <label className="text-xs font-black uppercase text-red-900">Mistake Autopsy (Marks Lost)</label>
             </div>
             <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1 text-stone-500">Silly</label>
                  <input type="number" placeholder="0" value={silly} onChange={e => setSilly(e.target.value)} className="w-full border-2 border-stone-200 p-2 font-bold text-sm outline-none focus:border-red-400"/>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1 text-stone-500">Concept</label>
                  <input type="number" placeholder="0" value={conceptual} onChange={e => setConceptual(e.target.value)} className="w-full border-2 border-stone-200 p-2 font-bold text-sm outline-none focus:border-red-400"/>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-1 text-stone-500">Unattempted</label>
                  <input type="number" placeholder="0" value={unattempted} onChange={e => setUnattempted(e.target.value)} className="w-full border-2 border-stone-200 p-2 font-bold text-sm outline-none focus:border-red-400"/>
                </div>
             </div>
          </div>

          {/* TIME & ACCURACY */}
          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-xs font-bold uppercase mb-2">Accuracy % (Optional)</label>
               <input 
                 type="number"
                 placeholder="75"
                 value={accuracy}
                 onChange={e => setAccuracy(e.target.value)}
                 className="w-full border-2 border-black p-3 font-bold outline-none"
               />
             </div>
             <div>
               <label className="block text-xs font-bold uppercase mb-2">Time of Day</label>
               <div className="relative">
                  <select 
                    value={timeOfDay}
                    onChange={e => setTimeOfDay(e.target.value)}
                    className="w-full border-2 border-black p-3 font-bold outline-none appearance-none bg-white"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="night">Night</option>
                  </select>
                  <Clock size={16} className="absolute right-3 top-3.5 pointer-events-none text-stone-400"/>
               </div>
             </div>
          </div>

          {/* SLIDERS */}
          <div className="grid grid-cols-2 gap-6 bg-stone-100 p-4 border-2 border-stone-200">
             <div>
               <label className="block text-xs font-bold uppercase mb-2">Stress (1-10)</label>
               <input 
                 type="range" min="1" max="10"
                 value={stress}
                 onChange={e => setStress(e.target.value)}
                 className="w-full accent-black h-2 bg-stone-300 rounded-lg appearance-none cursor-pointer"
               />
               <div className="text-right font-black text-sm">{stress}/10</div>
             </div>
             <div>
               <label className="block text-xs font-bold uppercase mb-2">Fatigue (1-10)</label>
               <input 
                 type="range" min="1" max="10"
                 value={fatigue}
                 onChange={e => setFatigue(e.target.value)}
                 className="w-full accent-black h-2 bg-stone-300 rounded-lg appearance-none cursor-pointer"
               />
               <div className="text-right font-black text-sm">{fatigue}/10</div>
             </div>
          </div>

          {/* LIMITED TEXT AREA */}
          <div>
            <div className="flex justify-between mb-2">
               <label className="block text-xs font-bold uppercase">Analysis Note</label>
               <span className="text-xs font-bold text-stone-400">{note.trim().split(/\s+/).filter(Boolean).length}/30 Words</span>
            </div>
            <textarea 
              rows={3}
              placeholder="Analysis limited to 30 words to keep database light."
              value={note}
              onChange={handleNoteChange}
              className="w-full border-2 border-black p-3 font-medium outline-none text-sm resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 text-sm font-bold">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-black text-white font-black uppercase py-4 hover:bg-stone-800 transition-all flex items-center justify-center gap-2"
          >
             {loading ? 'Processing...' : <><Save size={18} /> Save Entry</>}
          </button>

        </form>
      </div>
    </div>
  )
}