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
      const result = []
      let currentBranch = null

      for (let line of lines) {
        const clean = line.trim()
        if (!clean) continue

        // Check if it's a Leaf (starts with dash or bullet)
        const isLeaf = clean.startsWith('-') || clean.startsWith('•') || clean.startsWith('*')

        if (isLeaf) {
          // It's a Topic
          const title = clean.replace(/^[-•*]\s*/, '') // Remove the dash
          const leafNode = {
            id: `leaf_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            title: title,
            type: 'leaf',
            status: 'locked'
          }

          if (currentBranch) {
            // @ts-ignore
            currentBranch.children.push(leafNode)
          } else {
            // Edge case: Topic before any heading -> Create "General" branch
            currentBranch = {
              id: `branch_${Date.now()}`,
              title: "General Section",
              type: 'branch',
              children: [leafNode]
            }
            // @ts-ignore
            result.push(currentBranch)
          }

        } else {
          // It's a Heading (Branch)
          currentBranch = {
            id: `branch_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            title: clean,
            type: 'branch',
            children: []
          }
          result.push(currentBranch)
        }
      }

      // Download the result
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
      <section className="bg-white px-4 py-24 border-t-2 border-black">
        <div className="mx-auto max-w-5xl">
          <div className="relative overflow-hidden border-4 border-black bg-stone-900 p-8 md:p-12 text-white shadow-[12px_12px_0_0_#ccff00]">
            
            {/* Background Decor */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 opacity-20">
               <FileJson size={400} strokeWidth={0.5} />
            </div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#ccff00] bg-[#ccff00]/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-[#ccff00]">
                  <Terminal size={12} /> Architect Tool
                </div>
                <h2 className="text-4xl font-black uppercase tracking-tighter">
                  Build Your Protocol
                </h2>
                <p className="text-lg font-medium text-stone-400">
                  Don't know how to create a JSON file? Use our <span className="text-white font-bold">Protocol Architect</span> to convert your PDF syllabus into a Krama-compatible file in seconds.
                </p>
              </div>

              <button 
                onClick={() => setIsOpen(true)}
                className="group flex items-center gap-3 bg-[#ccff00] px-8 py-4 text-black font-black uppercase tracking-widest hover:bg-white transition-colors"
              >
                Launch Architect <ArrowRight className="transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* --- THE MODAL (Hidden by default) --- */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#FBF9F6] border-4 border-white shadow-2xl"
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-20 flex items-center justify-between bg-black p-6 text-white">
                <h3 className="flex items-center gap-2 text-xl font-black uppercase tracking-widest">
                  <Terminal className="text-[#ccff00]" /> Protocol Architect
                </h3>
                <button onClick={() => setIsOpen(false)} className="hover:text-[#ccff00] transition-colors">
                  <X size={28} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-8 md:p-12">
                
                {/* Tabs */}
                <div className="flex gap-6 mb-8 border-b-2 border-black/10">
                   <button 
                     onClick={() => setActiveTab('ai')}
                     className={`pb-4 text-sm font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'ai' ? 'text-black border-b-4 border-[#ccff00]' : 'text-stone-400 hover:text-black'}`}
                   >
                     <Bot size={18} /> Method 1: AI Generator
                   </button>
                   <button 
                     onClick={() => setActiveTab('manual')}
                     className={`pb-4 text-sm font-black uppercase tracking-widest flex items-center gap-2 transition-all ${activeTab === 'manual' ? 'text-black border-b-4 border-[#ccff00]' : 'text-stone-400 hover:text-black'}`}
                   >
                     <Code size={18} /> Method 2: Quick Paste
                   </button>
                </div>

                {activeTab === 'ai' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">1</div>
                        <div>
                          <h4 className="font-bold uppercase text-lg">Copy Your Syllabus</h4>
                          <p className="text-stone-500 text-sm">Open your exam PDF or website. Highlight the topics you want to track and Copy (Ctrl+C).</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">2</div>
                        <div>
                          <h4 className="font-bold uppercase text-lg">Copy Our System Prompt</h4>
                          <p className="text-stone-500 text-sm">We wrote a code for ChatGPT. Copy the black box on the right.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold">3</div>
                        <div>
                          <h4 className="font-bold uppercase text-lg">Generate & Upload</h4>
                          <p className="text-stone-500 text-sm">Paste into ChatGPT. It will give you a code. Save that code as <code className="bg-stone-200 px-1 font-bold text-black">syllabus.json</code> and upload it in Krama.</p>
                        </div>
                      </div>
                    </div>

                    {/* The Prompt Box */}
                    <div className="relative group">
                       <div className="absolute -top-3 left-4 bg-[#ccff00] px-3 py-1 text-xs font-black uppercase tracking-widest border-2 border-black shadow-sm">
                         System Prompt
                       </div>
                       <div className="bg-stone-900 border-4 border-black p-6 pt-8 rounded-sm shadow-[8px_8px_0_0_#000]">
                          <textarea 
                            readOnly
                            value={SYSTEM_PROMPT}
                            className="w-full h-64 bg-transparent text-green-400 font-mono text-xs resize-none outline-none leading-relaxed"
                          />
                          <button 
                            onClick={handleCopy}
                            className="w-full mt-4 bg-white py-3 font-bold uppercase hover:bg-[#ccff00] transition-colors flex items-center justify-center gap-2"
                          >
                            {copied ? <Check size={16} /> : <Copy size={16} />}
                            {copied ? 'Prompt Copied!' : 'Copy to Clipboard'}
                          </button>
                       </div>
                    </div>
                  </div>
                ) : (
                  // ✅ METHOD 2: QUICK PASTE (NOW ACTIVE)
                  <div className="space-y-6">
                     <div className="bg-amber-50 border border-amber-200 p-4 text-xs text-amber-900 font-medium flex gap-3 rounded-sm">
                        <List size={20} className="shrink-0" />
                        <div>
                          <span className="font-bold uppercase">Instructions:</span> 
                          <ul className="list-disc list-inside mt-1 space-y-1">
                             <li>Type your <strong>Headings</strong> on a new line (e.g., "History").</li>
                             <li>Start your <strong>Topics</strong> with a dash (e.g., "- Ancient India").</li>
                             <li>We will automatically generate the code for you.</li>
                          </ul>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* INPUT AREA */}
                        <div>
                          <div className="mb-2 flex justify-between items-end">
                             <label className="text-xs font-bold uppercase text-stone-500">Paste List Here</label>
                             <button onClick={() => setManualText('')} className="text-[10px] font-bold uppercase text-red-500 hover:underline">Clear</button>
                          </div>
                          <textarea 
                            value={manualText}
                            onChange={(e) => setManualText(e.target.value)}
                            placeholder={`Phase 1: History\n- Ancient India\n- Medieval India\n\nPhase 2: Geography\n- Climate Patterns\n- River Systems`}
                            className="w-full h-64 bg-white border-2 border-black/10 p-4 font-mono text-sm focus:border-black outline-none placeholder:text-black/20 resize-none transition-all focus:shadow-[4px_4px_0_0_#000]"
                          />
                        </div>

                        {/* ACTION AREA */}
                        <div className="flex flex-col justify-center space-y-6">
                           <div className="text-sm text-stone-600">
                              Once you click convert, we will instantly generate a <span className="font-bold text-black bg-stone-200 px-1">syllabus.json</span> file. 
                              <br/><br/>
                              You can then upload this file in your dashboard to start tracking immediately.
                           </div>
                           
                           <button 
                             onClick={handleSmartParse}
                             disabled={!manualText.trim()}
                             className="w-full bg-black text-white py-5 font-black uppercase tracking-widest hover:bg-[#ccff00] hover:text-black transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-[6px_6px_0_0_#ccff00]"
                           >
                             {parseStatus === 'success' ? <Check size={20} /> : <ArrowRight size={20} />}
                             {parseStatus === 'success' ? 'File Generated!' : 'Convert & Download'}
                           </button>

                           {parseStatus === 'success' && (
                             <motion.p 
                               initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                               className="text-center text-xs font-bold uppercase text-green-600"
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