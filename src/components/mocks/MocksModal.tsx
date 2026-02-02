'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { X, Save, Clock, AlertCircle } from 'lucide-react'
import { MockLogEntry } from '@/lib/analytics'
import { motion, AnimatePresence } from 'framer-motion'
import { useAlert } from '@/context/AlertContext'
import { useXP } from '@/context/XPContext'

type Props = {
  open: boolean
  onClose: () => void
  examId: string
  onSuccess: () => void
}

export default function MocksModal({ open, onClose, examId, onSuccess }: Props) {
  const supabase = createClient()
  const { showAlert } = useAlert()
  const { recordMock } = useXP()
  const [loading, setLoading] = useState(false)

  // FORM STATE
  const [name, setName] = useState('')
  const [score, setScore] = useState('')
  const [maxScore, setMaxScore] = useState('200')
  const [accuracy, setAccuracy] = useState('')
  const [stress, setStress] = useState('5')
  const [fatigue, setFatigue] = useState('5')
  const [timeOfDay, setTimeOfDay] = useState('morning')
  const [note, setNote] = useState('')

  // AUTOPSY STATE
  const [silly, setSilly] = useState('')
  const [conceptual, setConceptual] = useState('')
  const [unattempted, setUnattempted] = useState('')

  if (!open) return null

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    const words = text.trim().split(/\s+/)
    if (words.length <= 30 || text.length < note.length) {
      setNote(text)
    }
  }

  const resetForm = () => {
    setName('')
    setScore('')
    setMaxScore('200')
    setAccuracy('')
    setNote('')
    setSilly('')
    setConceptual('')
    setUnattempted('')
    setStress('5')
    setFatigue('5')
    setTimeOfDay('morning')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim()) {
      showAlert("Please enter a test name", "error")
      return
    }
    if (!score) {
      showAlert("Please enter your score", "error")
      return
    }
    
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not logged in")

      const newLog: MockLogEntry = {
        id: crypto.randomUUID(),
        d: new Date().toISOString(),
        n: name.trim(),
        s: Number(score),
        m: Number(maxScore),
        a: accuracy ? Number(accuracy) : undefined,
        st: Number(stress),
        fa: Number(fatigue),
        nt: note.trim(),
        t: timeOfDay,
        si: silly ? Number(silly) : undefined,
        co: conceptual ? Number(conceptual) : undefined,
        ua: unattempted ? Number(unattempted) : undefined,
      }

      const { data: existing } = await supabase
        .from('mock_logs')
        .select('logs')
        .eq('user_id', user.id)
        .eq('exam_id', examId)
        .maybeSingle()

      const currentLogs = existing?.logs ? (existing.logs as MockLogEntry[]) : []
      const updatedLogs = [...currentLogs, newLog]

      const { error: saveError } = await supabase
        .from('mock_logs')
        .upsert({
          user_id: user.id,
          exam_id: examId,
          logs: updatedLogs as any
        })

      if (saveError) throw saveError

      // Award XP for logging a mock
      await recordMock()

      showAlert(`Test "${name}" logged!`, 'success')
      onSuccess()
      onClose()
      resetForm()

    } catch (err: any) {
      console.error('Save error:', err)
      showAlert(err.message || "Failed to save", "error")
    } finally {
      setLoading(false)
    }
  }

  const scorePercent = score && maxScore ? Math.round((Number(score) / Number(maxScore)) * 100) : 0

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white w-full max-w-lg border-2 border-black shadow-[8px_8px_0_0_#000] overflow-hidden flex flex-col max-h-[90vh]"
        >
          
          {/* HEADER */}
          <div className="bg-stone-100 p-5 border-b-2 border-black flex justify-between items-center shrink-0">
            <div>
              <h2 className="text-xl font-black">Log Mock Test</h2>
              <p className="text-xs font-bold text-black/40 uppercase">{examId}</p>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 hover:bg-red-100 hover:text-red-600 transition-colors"
            >
              <X size={22} />
            </button>
          </div>

          {/* SCROLLABLE FORM */}
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-5">
            
            {/* TEST NAME */}
            <div>
              <label className="block text-sm font-bold mb-2">Test Name *</label>
              <input 
                required
                placeholder="e.g. Vision IAS Prelims Test 1"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border-2 border-black p-3 font-bold focus:outline-none focus:shadow-[3px_3px_0_0_#000] transition-all"
              />
            </div>

            {/* SCORE ROW */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Score *</label>
                <input 
                  required 
                  type="number"
                  placeholder="90"
                  value={score}
                  onChange={e => setScore(e.target.value)}
                  className="w-full border-2 border-black p-3 font-bold text-xl focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Max Score</label>
                <input 
                  required 
                  type="number"
                  value={maxScore}
                  onChange={e => setMaxScore(e.target.value)}
                  className="w-full border-2 border-black p-3 font-bold text-xl focus:outline-none bg-stone-50"
                />
              </div>
            </div>

            {/* SCORE PREVIEW */}
            {score && maxScore && (
              <div className={`p-4 border-2 text-center ${
                scorePercent >= 60 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
              }`}>
                <div className={`text-3xl font-black ${scorePercent >= 60 ? 'text-green-700' : 'text-red-700'}`}>
                  {scorePercent}%
                </div>
                <div className="text-xs font-bold text-black/40">{score} / {maxScore}</div>
              </div>
            )}

            {/* MISTAKE AUTOPSY */}
            <div className="bg-red-50 p-4 border-2 border-red-200">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={16} className="text-red-500" />
                <label className="text-sm font-bold text-red-800">Mistake Analysis (marks lost)</label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1 text-black/50">Silly</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={silly} 
                    onChange={e => setSilly(e.target.value)} 
                    className="w-full border-2 border-red-200 p-2 font-bold text-sm focus:outline-none focus:border-red-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-black/50">Concept</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={conceptual} 
                    onChange={e => setConceptual(e.target.value)} 
                    className="w-full border-2 border-red-200 p-2 font-bold text-sm focus:outline-none focus:border-red-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1 text-black/50">Skipped</label>
                  <input 
                    type="number" 
                    placeholder="0" 
                    value={unattempted} 
                    onChange={e => setUnattempted(e.target.value)} 
                    className="w-full border-2 border-red-200 p-2 font-bold text-sm focus:outline-none focus:border-red-400"
                  />
                </div>
              </div>
            </div>

            {/* ACCURACY & TIME */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold mb-2">Accuracy %</label>
                <input 
                  type="number"
                  placeholder="Optional"
                  value={accuracy}
                  onChange={e => setAccuracy(e.target.value)}
                  className="w-full border-2 border-black/30 p-3 font-bold focus:outline-none focus:border-black"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Time of Day</label>
                <div className="relative">
                  <select 
                    value={timeOfDay}
                    onChange={e => setTimeOfDay(e.target.value)}
                    className="w-full border-2 border-black/30 p-3 font-bold focus:outline-none appearance-none bg-white focus:border-black"
                  >
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                    <option value="night">Night</option>
                  </select>
                  <Clock size={16} className="absolute right-3 top-3.5 pointer-events-none text-black/30"/>
                </div>
              </div>
            </div>

            {/* SLIDERS */}
            <div className="grid grid-cols-2 gap-6 bg-stone-50 p-4 border border-stone-200">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-bold">Stress</label>
                  <span className="text-sm font-black">{stress}/10</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10"
                  value={stress}
                  onChange={e => setStress(e.target.value)}
                  className="w-full h-2 bg-stone-300 rounded-lg appearance-none cursor-pointer accent-black"
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-sm font-bold">Fatigue</label>
                  <span className="text-sm font-black">{fatigue}/10</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10"
                  value={fatigue}
                  onChange={e => setFatigue(e.target.value)}
                  className="w-full h-2 bg-stone-300 rounded-lg appearance-none cursor-pointer accent-black"
                />
              </div>
            </div>

            {/* NOTE */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-bold">Quick Note</label>
                <span className="text-xs font-bold text-black/40">
                  {note.trim().split(/\s+/).filter(Boolean).length}/30
                </span>
              </div>
              <textarea 
                rows={2}
                placeholder="Key takeaways (30 words max)"
                value={note}
                onChange={handleNoteChange}
                className="w-full border-2 border-black/30 p-3 font-medium text-sm focus:outline-none focus:border-black resize-none"
              />
            </div>

            {/* SUBMIT */}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-black text-white font-black py-4 hover:bg-stone-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                'Saving...'
              ) : (
                <>
                  <Save size={18} /> Save Test
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
