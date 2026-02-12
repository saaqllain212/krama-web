'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Upload, Zap, BookOpen, Calendar, Loader2, FileJson, ExternalLink, Terminal, AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useSyllabus } from '@/context/SyllabusContext'
import { useAppConfig } from '@/context/AppConfigContext'

export default function OnboardingModal() {
  const supabase = createClient()
  const router = useRouter()
  const { setActiveExam } = useSyllabus()
  const { config: appConfig } = useAppConfig()

  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [selectedExam, setSelectedExam] = useState<string | null>(null)
  const [examDate, setExamDate] = useState('')
  // FIX: Use default from app_config instead of hardcoded 6
  const [dailyHours, setDailyHours] = useState(appConfig.default_daily_goal_hours || 6)

  useEffect(() => {
    const checkDatabase = async (userId: string) => {
      try {
        const { data: settings } = await supabase
          .from('syllabus_settings')
          .select('active_exam_id')
          .eq('user_id', userId)
          .maybeSingle()

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
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        checkDatabase(session.user.id)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleExamSelect = (examId: string) => {
    setErrorMessage(null)
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
    setErrorMessage(null)
    const file = e.target.files?.[0]
    if (!file) return

    if (file.type !== "application/json") {
      setErrorMessage("Invalid file type. Please upload a .json file.")
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
      setErrorMessage("Invalid JSON format. File must contain an array of topics.")
    }
  }

  const validateDateStep = () => {
    if (!examDate) {
        setErrorMessage("Please select a valid target date.")
        return
    }
    setErrorMessage(null)
    setStep(3)
  }

  const handleFinish = async () => {
    setSaving(true)
    setErrorMessage(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("No User")

      await supabase.from('syllabus_settings').upsert({
        user_id: user.id,
        active_exam_id: selectedExam,
        daily_goal_hours: dailyHours,
        target_date: examDate, 
        custom_title: selectedExam === 'focus' ? 'FOCUS PROTOCOL' : selectedExam?.toUpperCase()
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
      setErrorMessage("Setup failed. Please check your connection.")
    } finally {
      setSaving(false)
    }
  }

  if (loading || !isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white p-6 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2">
             <Zap size={20} className="text-white/80" /> Let&apos;s Get You Started
          </h2>
          <div className="text-sm font-medium text-white/60">
            Step {step} of 3
          </div>
        </div>

        {/* BODY */}
        <div className="p-8 md:p-12 overflow-y-auto">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: TARGET */}
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold mb-2 text-gray-900">Choose Your Exam</h3>
                  <p className="text-gray-500">Select the exam you&apos;re preparing for.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {['upsc', 'ssc', 'bank', 'rbi', 'jee', 'neet'].map(id => (
                    <button 
                      key={id}
                      onClick={() => handleExamSelect(id)}
                      className="group p-4 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 hover:shadow-md transition-all text-left"
                    >
                      <BookOpen className="mb-2 text-gray-400 group-hover:text-primary-500" />
                      <div className="font-bold text-lg text-gray-900">{id.toUpperCase()}</div>
                      <div className="text-xs text-gray-400">Standard Syllabus</div>
                    </button>
                  ))}
                </div>

                {/* CUSTOM UPLOAD CARD */}
                <div className="group relative p-6 rounded-xl border border-gray-200 hover:border-primary-300 hover:bg-primary-50 hover:shadow-md transition-all text-left">
                    <input type="file" accept=".json" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                    <div className="mb-4 text-gray-400 group-hover:text-primary-500 flex justify-between items-start">
                      <div>
                          <Upload size={24} className={selectedExam === 'custom' ? 'hidden' : 'block'} />
                          <FileJson size={24} className={selectedExam === 'custom' ? 'block text-green-600' : 'hidden'} />
                      </div>
                    </div>
                    <div className="font-bold text-xl text-gray-900">Custom JSON</div>
                    <div className="text-xs text-gray-400">
                      {selectedExam === 'custom' ? 'File Loaded ✓' : 'Upload your syllabus file'}
                    </div>
                </div>

                {/* ERROR */}
                {errorMessage && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200 text-red-600 text-sm">
                        <AlertCircle size={16} /> {errorMessage}
                    </div>
                )}

                {/* PROTOCOL ARCHITECT BANNER */}
                <div className="mt-6 bg-amber-50 rounded-xl border border-amber-200 p-4 flex items-start gap-3">
                   <div className="bg-amber-100 p-2 rounded-full shrink-0">
                      <Terminal size={16} className="text-amber-700" />
                   </div>
                   <div>
                      <h4 className="font-semibold text-sm text-amber-900 mb-1">Don&apos;t have a JSON file?</h4>
                      <p className="text-xs text-amber-800/80 leading-relaxed mb-2">
                         Build one easily using our <strong>Syllabus Builder</strong> tool on the home page.
                      </p>
                      <a 
                        href="/" 
                        target="_blank" 
                        className="inline-flex items-center gap-1 text-xs font-semibold text-amber-900 hover:underline"
                      >
                        Go to Home Page <ExternalLink size={10} />
                      </a>
                   </div>
                </div>

                <button onClick={() => handleExamSelect('focus')} className="w-full mt-4 p-4 rounded-xl border border-gray-200 bg-gray-900 text-white hover:bg-gray-800 transition-all flex items-center justify-center gap-3 shadow-md">
                  <Zap className="text-primary-400" />
                  <span className="font-semibold">Pure Focus Mode (No Syllabus)</span>
                </button>
              </motion.div>
            )}

            {/* STEP 2: TIMELINE */}
            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-8"
              >
                <div>
                  <h3 className="text-3xl font-bold mb-2 text-gray-900">Set Your Target Date</h3>
                  <p className="text-gray-500">When is your exam?</p>
                </div>
                <div className="max-w-xs mx-auto relative">
                   <Calendar className="absolute top-4 left-4 text-gray-400 pointer-events-none" />
                   <input type="date" required value={examDate} onChange={(e) => setExamDate(e.target.value)} className="w-full bg-gray-50 rounded-xl border border-gray-200 p-4 pl-12 text-xl font-bold outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all" />
                </div>
                
                {errorMessage && (
                    <div className="max-w-xs mx-auto flex items-center justify-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200 text-red-600 text-sm">
                        <AlertCircle size={16} /> {errorMessage}
                    </div>
                )}

                <button onClick={validateDateStep} className="bg-gray-900 text-white rounded-xl px-8 py-3 font-semibold hover:bg-gray-800 transition-all">Confirm Date</button>
                <button onClick={() => setStep(1)} className="block mx-auto text-sm text-gray-400 hover:text-gray-700 mt-4">← Back</button>
              </motion.div>
            )}

            {/* STEP 3: COMMITMENT */}
            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-8"
              >
                 <div>
                  <h3 className="text-3xl font-bold mb-2 text-gray-900">Daily Study Goal</h3>
                  <p className="text-gray-500">How many hours can you study each day?</p>
                </div>
                <div className="max-w-md mx-auto bg-gray-50 rounded-2xl p-8 border border-gray-200">
                   <div className="text-6xl font-bold mb-2 text-gray-900">{dailyHours} <span className="text-lg text-gray-400">hrs</span></div>
                   <div className="text-sm font-semibold text-primary-500 mb-8">
                      {dailyHours < 4 ? 'Light Study' : dailyHours < 8 ? 'Focused Preparation' : 'Intensive Mode'}
                   </div>
                   <input type="range" min="1" max="14" step="1" value={dailyHours} onChange={(e) => setDailyHours(parseInt(e.target.value))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-500" />
                   <div className="flex justify-between text-xs text-gray-400 mt-2">
                      <span>1 hr</span>
                      <span>14 hrs</span>
                   </div>
                </div>
                
                {errorMessage && (
                    <div className="flex items-center justify-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200 text-red-600 text-sm">
                        <AlertCircle size={16} /> {errorMessage}
                    </div>
                )}

                <button onClick={handleFinish} disabled={saving} className="w-full max-w-md bg-primary-500 text-white rounded-xl px-8 py-4 font-semibold hover:bg-primary-600 transition-all flex items-center justify-center gap-2 shadow-lg">
                  {saving ? <Loader2 className="animate-spin"/> : <><Check size={20} /> Start Studying</>}
                </button>
                <button onClick={() => setStep(selectedExam === 'focus' ? 1 : 2)} className="block mx-auto text-sm text-gray-400 hover:text-gray-700 mt-4">← Back</button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
