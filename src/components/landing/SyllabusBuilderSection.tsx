'use client'

import { useState } from 'react'
import { Terminal, Bot, FileJson, X, Copy, Check, ArrowRight, Code, List } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function SyllabusBuilderSection() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai')
  const [copied, setCopied] = useState(false)

  // --- MANUAL PARSER STATE ---
  const [manualText, setManualText] = useState('')
  const [parseStatus, setParseStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  // --- AI PROMPT ---
  const SYSTEM_PROMPT = `Act as a Curriculum Engineer. I will give you a syllabus text. Your goal is to break it down into the smallest possible actionable study topics (Atomic Leaves).

CRITICAL RULES:
1. No Summarization: Do not group topics. If the text lists "Utilitarianism, Rights, Justice", create 3 separate leaf nodes.
2. Granularity: Every comma-separated concept in the text must be its own "leaf".
3. Structure:
   - Use "branch" for major headings (Paper I, Section A, etc).
   - Use "leaf" for the actual topics.
   - All status must be "locked".
4. Output: Strict JSON array [] only.

My Syllabus:
[PASTE TEXT HERE]`

  const handleCopy = () => {
    navigator.clipboard.writeText(SYSTEM_PROMPT)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // --- SMART PARSER LOGIC ---
  const handleSmartParse = () => {
    try {
      if (!manualText.trim()) return

      const lines = manualText.split('\n')
      const result: any[] = []
      let currentBranch: any = null

      for (const line of lines) {
        const clean = line.trim()
        if (!clean) continue

        const isLeaf = clean.startsWith('-') || clean.startsWith('•') || clean.startsWith('*')

        if (isLeaf) {
          const title = clean.replace(/^[-•*]\s*/, '')
          const leafNode = {
            id: `leaf_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            title: title,
            type: 'leaf',
            status: 'locked'
          }

          if (currentBranch) {
            currentBranch.children.push(leafNode)
          } else {
            currentBranch = {
              id: `branch_${Date.now()}`,
              title: "General Section",
              type: 'branch',
              children: [leafNode]
            }
            result.push(currentBranch)
          }

        } else {
          currentBranch = {
            id: `branch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            title: clean,
            type: 'branch',
            children: []
          }
          result.push(currentBranch)
        }
      }

      const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'syllabus.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      setParseStatus('success')
      setTimeout(() => setParseStatus('idle'), 3000)

    } catch (e) {
      console.error(e)
      setParseStatus('error')
    }
  }

  return (
    <>
      {/* --- THE CARD (Visible on Landing Page) --- */}
      <section className="bg-white px-6 py-24 md:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden bg-gray-900 p-8 md:p-12 rounded-2xl text-white shadow-large">
            
            {/* Background Decor */}
            <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/4 opacity-10">
               <FileJson size={300} strokeWidth={0.5} />
            </div>

            {/* Gradient Orbs */}
            <div className="absolute top-10 right-10 w-64 h-64 bg-primary-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white">
                  <Terminal size={14} /> Protocol Architect
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Build Your Custom Syllabus
                </h2>
                <p className="text-lg text-white/60">
                  Don&apos;t know how to create a JSON file? Use our Protocol Architect to convert your syllabus into a Krama-compatible file in seconds.
                </p>
              </div>

              <button 
                onClick={() => setIsOpen(true)}
                className="btn btn-primary group flex items-center gap-3 whitespace-nowrap"
              >
                Launch Architect <ArrowRight className="transition-transform group-hover:translate-x-1" size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- THE MODAL --- */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-large"
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-20 flex items-center justify-between bg-gray-900 p-6 rounded-t-2xl text-white">
                <h3 className="flex items-center gap-2 text-lg font-bold">
                  <Terminal className="text-primary-400" size={20} /> Protocol Architect
                </h3>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X size={22} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 md:p-12">
                
                {/* Tabs */}
                <div className="flex gap-6 mb-8 border-b border-gray-200">
                   <button 
                     onClick={() => setActiveTab('ai')}
                     className={`pb-4 text-sm font-semibold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'ai' ? 'text-primary-600 border-primary-500' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                   >
                     <Bot size={18} /> Method 1: AI Generator
                   </button>
                   <button 
                     onClick={() => setActiveTab('manual')}
                     className={`pb-4 text-sm font-semibold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'manual' ? 'text-primary-600 border-primary-500' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                   >
                     <Code size={18} /> Method 2: Quick Paste
                   </button>
                </div>

                {activeTab === 'ai' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">Copy Your Syllabus</h4>
                          <p className="text-gray-500 text-sm">Open your exam PDF or website. Highlight the topics you want to track and Copy (Ctrl+C).</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">Copy Our System Prompt</h4>
                          <p className="text-gray-500 text-sm">We wrote a prompt for ChatGPT. Copy the code box on the right.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg">Generate & Upload</h4>
                          <p className="text-gray-500 text-sm">Paste into ChatGPT. Save the output as <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-semibold text-gray-900">syllabus.json</code> and upload it in Krama.</p>
                        </div>
                      </div>
                    </div>

                    {/* The Prompt Box */}
                    <div className="relative">
                       <div className="absolute -top-3 left-4 bg-primary-500 px-3 py-1 text-xs font-semibold text-white rounded-full shadow-sm">
                         System Prompt
                       </div>
                       <div className="bg-gray-900 border border-gray-700 p-6 pt-8 rounded-xl">
                          <textarea 
                            readOnly
                            value={SYSTEM_PROMPT}
                            className="w-full h-64 bg-transparent text-green-400 font-mono text-xs resize-none outline-none leading-relaxed"
                          />
                          <button 
                            onClick={handleCopy}
                            className="w-full mt-4 btn btn-primary flex items-center justify-center gap-2"
                          >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                            {copied ? 'Prompt Copied!' : 'Copy to Clipboard'}
                          </button>
                       </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                     <div className="bg-primary-50 border border-primary-100 p-4 text-xs text-primary-900 font-medium flex gap-3 rounded-xl">
                        <List size={20} className="shrink-0 text-primary-500" />
                        <div>
                          <span className="font-bold">Instructions:</span> 
                          <ul className="list-disc list-inside mt-1 space-y-1">
                             <li>Type your <strong>Headings</strong> on a new line (e.g., &quot;History&quot;).</li>
                             <li>Start your <strong>Topics</strong> with a dash (e.g., &quot;- Ancient India&quot;).</li>
                             <li>We will automatically generate the JSON for you.</li>
                          </ul>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* INPUT AREA */}
                        <div>
                          <div className="mb-2 flex justify-between items-end">
                             <label className="text-xs font-semibold text-gray-500">Paste List Here</label>
                             <button onClick={() => setManualText('')} className="text-[10px] font-semibold text-danger-500 hover:underline">Clear</button>
                          </div>
                          <textarea 
                            value={manualText}
                            onChange={(e) => setManualText(e.target.value)}
                            placeholder={`Phase 1: History\n- Ancient India\n- Medieval India\n\nPhase 2: Geography\n- Climate Patterns\n- River Systems`}
                            className="input h-64 font-mono text-sm resize-none"
                          />
                        </div>

                        {/* ACTION AREA */}
                        <div className="flex flex-col justify-center space-y-6">
                           <div className="text-sm text-gray-600">
                              Once you click convert, we will instantly generate a <span className="font-bold text-gray-900">syllabus.json</span> file. 
                              <br/><br/>
                              You can then upload this file in your dashboard to start tracking immediately.
                           </div>
                           
                           <button 
                             onClick={handleSmartParse}
                             disabled={!manualText.trim()}
                             className="btn btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                             {parseStatus === 'success' ? <Check size={20} /> : <ArrowRight size={20} />}
                             {parseStatus === 'success' ? 'File Generated!' : 'Convert & Download'}
                           </button>

                           {parseStatus === 'success' && (
                             <motion.p 
                               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                               className="text-center text-xs font-semibold text-success-600"
                             >
                               Success! Check your downloads folder.
                             </motion.p>
                           )}
                        </div>
                     </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
