'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Upload, Zap, BookOpen, Calendar, Loader2, FileJson, ExternalLink, Terminal } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSyllabus } from '@/context/SyllabusContext'

export default function OnboardingModal() {
  const supabase = createClient()
  const router = useRouter()
  const { setActiveExam } = useSyllabus()

  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // DATA STATE
  const [selectedExam, setSelectedExam] = useState<string | null>(null)
  const [examDate, setExamDate] = useState('')
  const [dailyHours, setDailyHours] = useState(6)

  useEffect(() => {
    const checkDatabase = async (userId: string) => {
      try {
        const { data: settings } = await supabase
          .from('syllabus_settings')
          .select('active_exam_id')
          .eq('user_id', userId)
          .maybeSingle()

        // ✅ CRITICAL FIX: Only open if database is completely empty. 
        // We removed the 'localStorage' check so it doesn't pop up when you switch tabs.
        if (!settings?.active_exam_id) {
          setIsOpen(true)
        }
      } catch (error) {
        console.error("Onboarding Check Failed", error)
      } finally {
        setLoading(false)
      }
    }

    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await checkDatabase(user.id)
      } else {
        setLoading(false)
      }
    }
    init()
    
    // We keep the auth listener to ensure it runs on login
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        checkDatabase(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // ... (REST OF THE FILE REMAINS EXACTLY THE SAME)
  // Just copy the rest of your handleExamSelect, handleFileUpload, handleFinish, and the return JSX from your previous file.
  // If you want me to paste the full file again to be safe, let me know, but this useEffect is the only logic change needed.

  const handleExamSelect = (examId: string) => {
    setSelectedExam(examId)
    if (examId === 'focus') {
      setStep(3)
    } else if (examId === 'custom') {
      // Stay on step 1
    } else {
      setStep(2)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "application/json") {
      alert("Please upload a .json file") 
      return
    }

    const text = await file.text()
    try {
      const json = JSON.parse(text)
      if (!Array.isArray(json)) throw new Error("Invalid Format")
      
      localStorage.setItem('krama_custom_syllabus_data', text)
      setSelectedExam('custom')
      setStep(2)
    } catch (err) {
      alert("Invalid JSON format. Must be an array of topics.")
    }
  }

  const handleFinish = async () => {
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No User")

      await supabase.from('syllabus_settings').upsert({
        user_id: user.id,
        active_exam_id: selectedExam,
        daily_goal_hours: dailyHours,
      }, { onConflict: 'user_id' })

      if (selectedExam === 'focus') {
         localStorage.setItem('krama-exam-name', 'FOCUS PROTOCOL')
         localStorage.setItem('krama-exam-date', '') 
      } else if (examDate) {
         localStorage.setItem('krama-exam-date', examDate)
         localStorage.setItem('krama-exam-name', selectedExam?.toUpperCase() || 'EXAM')
      }

      if (selectedExam) setActiveExam(selectedExam)

      setIsOpen(false)
      window.location.reload()

    } catch (e) {
      console.error(e)
      alert("Setup failed. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading || !isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-900/95 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl bg-[#FBF9F6] border-4 border-black shadow-[12px_12px_0_0_#ccff00] overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="bg-black text-white p-6 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-black uppercase tracking-widest flex items-center gap-2">
             <Zap size={20} className="text-[#ccff00]" /> System Setup
          </h2>
          <div className="text-xs font-bold text-white/50 uppercase tracking-widest">
            Step {step} / 3
          </div>
        </div>

        <div className="p-8 md:p-12 overflow-y-auto">
          <AnimatePresence mode="wait">
            
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-black uppercase mb-2">Identify Target</h3>
                  <p className="text-stone-500 font-medium">Select the protocol you wish to load.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['upsc', 'ssc', 'bank'].map(id => (
                    <button 
                      key={id}
                      onClick={() => handleExamSelect(id)}
                      className="group p-6 border-2 border-black/10 hover:border-black hover:bg-white hover:shadow-[4px_4px_0_0_#000] transition-all text-left"
                    >
                      <BookOpen className="mb-4 text-black/40 group-hover:text-black" />
                      <div className="font-black uppercase text-xl">{id}</div>
                      <div className="text-xs font-bold text-stone-400 uppercase">Standard Syllabus</div>
                    </button>
                  ))}

                  <div className="group relative p-6 border-2 border-black/10 hover:border-black hover:bg-white hover:shadow-[4px_4px_0_0_#000] transition-all text-left">
                     
                     <input type="file" accept=".json" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />

                     <div className="mb-4 text-black/40 group-hover:text-black flex justify-between items-start">
                        <div>
                           <Upload size={24} className={selectedExam === 'custom' ? 'hidden' : 'block'} />
                           <FileJson size={24} className={selectedExam === 'custom' ? 'block text-green-600' : 'hidden'} />
                        </div>
                     </div>
                     
                     <div className="font-black uppercase text-xl">Custom JSON</div>
                     <div className="text-xs font-bold text-stone-400 uppercase">
                       {selectedExam === 'custom' ? 'File Loaded' : 'Upload File'}
                     </div>

                  </div>
                </div>

                <div className="mt-6 bg-amber-50 border border-amber-200 p-4 flex items-start gap-3">
                   <div className="bg-amber-100 p-2 rounded-full shrink-0">
                      <Terminal size={16} className="text-amber-700" />
                   </div>
                   <div>
                      <h4 className="font-bold text-xs uppercase text-amber-900 mb-1">Don&apos;t have a JSON file?</h4>
                      <p className="text-[11px] text-amber-800/80 leading-relaxed mb-2">
                         You can build one easily using our <strong>Protocol Architect</strong> tool.
                      </p>
                      <a 
                        href="/" 
                        target="_blank" 
                        className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-black hover:underline decoration-2 underline-offset-4"
                      >
                        Go to Home Page & Scroll to Bottom <ExternalLink size={10} />
                      </a>
                   </div>
                </div>

                <button onClick={() => handleExamSelect('focus')} className="w-full mt-4 p-4 border-2 border-black bg-black text-white hover:bg-stone-800 transition-all flex items-center justify-center gap-3 shadow-[4px_4px_0_0_#ccff00]">
                  <Zap className="text-[#ccff00]" />
                  <span className="font-black uppercase tracking-widest">Pure Focus Mode (No Syllabus)</span>
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-8"
              >
                <div>
                  <h3 className="text-3xl font-black uppercase mb-2">Set Timeline</h3>
                  <p className="text-stone-500 font-medium">When is D-Day?</p>
                </div>
                <div className="max-w-xs mx-auto relative">
                   <Calendar className="absolute top-4 left-4 text-black/30 pointer-events-none" />
                   <input type="date" required value={examDate} onChange={(e) => setExamDate(e.target.value)} className="w-full bg-white border-4 border-black p-4 pl-12 text-xl font-bold uppercase outline-none focus:shadow-[4px_4px_0_0_#000] transition-all" />
                </div>
                <button onClick={() => examDate ? setStep(3) : alert('Date Required')} className="bg-black text-white px-8 py-3 font-bold uppercase hover:bg-stone-800 transition-all">Confirm Date</button>
                <button onClick={() => setStep(1)} className="block mx-auto text-xs font-bold text-stone-400 uppercase hover:text-black mt-4">Back</button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-8"
              >
                 <div>
                  <h3 className="text-3xl font-black uppercase mb-2">The Contract</h3>
                  <p className="text-stone-500 font-medium">What is your daily deep work target?</p>
                </div>
                <div className="max-w-md mx-auto bg-white p-8 border-2 border-black/5 shadow-sm">
                   <div className="text-6xl font-black mb-2">{dailyHours} <span className="text-lg text-stone-400">HRS</span></div>
                   <div className="text-xs font-black uppercase tracking-widest text-amber-500 mb-8">
                      {dailyHours < 4 ? 'Maintenance Mode' : dailyHours < 8 ? 'Serious Aspirant' : 'Monk Mode'}
                   </div>
                   <input type="range" min="1" max="14" step="1" value={dailyHours} onChange={(e) => setDailyHours(parseInt(e.target.value))} className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-black" />
                   <div className="flex justify-between text-[10px] font-bold uppercase text-stone-400 mt-2">
                      <span>1 Hr</span>
                      <span>14 Hrs</span>
                   </div>
                </div>
                <button onClick={handleFinish} disabled={saving} className="w-full max-w-md bg-[#ccff00] text-black border-2 border-black px-8 py-4 font-black uppercase hover:bg-black hover:text-[#ccff00] transition-all flex items-center justify-center gap-2 shadow-[4px_4px_0_0_#000]">
                  {saving ? <Loader2 className="animate-spin"/> : <><Check size={20} /> Initialize System</>}
                </button>
                <button onClick={() => setStep(selectedExam === 'focus' ? 1 : 2)} className="block mx-auto text-xs font-bold text-stone-400 uppercase hover:text-black mt-4">Back</button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}