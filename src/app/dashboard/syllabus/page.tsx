'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, ChevronRight, Folder, Check, Home, Upload, FileJson, AlertCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useSyllabus } from '@/context/SyllabusContext'
import { SyllabusNode } from '@/types/syllabus'
import { motion, AnimatePresence } from 'framer-motion'
import { useAlert } from '@/context/AlertContext'

export default function SyllabusPage() {
  const { activeExam, setActiveExam, data, setData, completedIds, toggleNode, stats, loading } = useSyllabus()
  const { showAlert, askConfirm } = useAlert()
  
  // NAVIGATION STATE (Drill Down)
  const [path, setPath] = useState<SyllabusNode[]>([])

  // --- CUSTOM UPLOAD LOGIC ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)
        // Basic Validation
        if (!Array.isArray(json) || !json[0]?.id) {
          throw new Error("Invalid Format")
        }
        setData(json)
        // Persist Custom Data to LocalStorage (so they don't upload every time)
        localStorage.setItem('krama_custom_syllabus_data', JSON.stringify(json))
        showAlert("Custom Protocol Loaded", "success")
      } catch (err) {
        showAlert("Invalid JSON Structure", "error")
      }
    }
    reader.readAsText(file)
  }

  // Load Custom Data from LS on mount if in custom mode
  useEffect(() => {
    if (activeExam === 'custom' && data.length === 0) {
      const saved = localStorage.getItem('krama_custom_syllabus_data')
      if (saved) setData(JSON.parse(saved))
    }
  }, [activeExam, data.length, setData])


  // --- RESET LOGIC ---
  const handleChangeProtocol = () => {
    askConfirm("Abort current campaign? Progress will be saved.", () => {
       setActiveExam('') // Reset to selection screen
       setPath([])       // Reset drill down
    })
  }

  // --- RENDER 1: LOADING ---
  if (loading) return <div className="min-h-screen bg-[#FBF9F6] p-12 flex items-center justify-center font-bold animate-pulse">LOADING INTEL...</div>

  // --- RENDER 2: SELECTION SCREEN (Mission Select) ---
  if (!activeExam) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] p-6 md:p-12 text-black">
        <Link href="/dashboard" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black mb-8">
           <ArrowLeft size={14} /> Dashboard
        </Link>
        
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-4">Select Protocol</h1>
          <p className="text-black/60 font-medium">Choose your primary theater of operations. You can switch later.</p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* PRESET: UPSC */}
           <button onClick={() => setActiveExam('upsc')} className="group relative bg-white border-2 border-black p-8 text-left hover:bg-black hover:text-white transition-all shadow-[8px_8px_0_0_#000] hover:translate-y-1 hover:shadow-none">
              <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Standard Issue</div>
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">UPSC CSE</h2>
              <p className="text-sm font-medium opacity-80">General Studies Paper I loaded. Comprehensive coverage.</p>
           </button>

           {/* PRESET: SSC (Placeholder) */}
           <button onClick={() => setActiveExam('ssc')} className="group relative bg-white border-2 border-black/10 p-8 text-left hover:border-black transition-all grayscale opacity-60 hover:opacity-100 hover:grayscale-0">
              <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Coming Soon</div>
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">SSC CGL</h2>
              <p className="text-sm font-medium opacity-80">Data structure currently being compiled.</p>
           </button>

           {/* PRESET: BANK (Placeholder) */}
           <button className="group relative bg-white border-2 border-black/10 p-8 text-left transition-all grayscale opacity-40 cursor-not-allowed">
              <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Locked</div>
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Bank PO</h2>
              <p className="text-sm font-medium opacity-80">Requires Clearance Level 2.</p>
           </button>

           {/* CUSTOM UPLOAD */}
           <button onClick={() => setActiveExam('custom')} className="group relative bg-amber-100 border-2 border-amber-400 border-dashed p-8 text-left hover:bg-amber-400 hover:text-black transition-all">
              <div className="text-xs font-bold uppercase tracking-widest text-amber-700 group-hover:text-black mb-2 flex items-center gap-2">
                 <Upload size={14}/> Custom Operation
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 text-amber-900 group-hover:text-black">Upload JSON</h2>
              <p className="text-sm font-medium text-amber-800 group-hover:text-black">Bring your own syllabus file. Local storage only.</p>
           </button>
        </div>
      </div>
    )
  }

  // --- RENDER 3: WAR ROOM (The Drill Down) ---
  
  // Custom Mode Empty State
  if (activeExam === 'custom' && data.length === 0) {
    return (
       <div className="min-h-screen bg-[#FBF9F6] p-12 flex flex-col items-center justify-center text-center">
          <div className="bg-white border-4 border-black p-12 max-w-lg w-full shadow-[12px_12px_0_0_#000]">
             <FileJson size={48} className="mx-auto mb-6 text-black/20" />
             <h2 className="text-2xl font-black uppercase mb-4">Initialize Custom Protocol</h2>
             <p className="text-sm text-black/60 mb-8 font-bold">Upload a valid JSON file structure to begin tracking.</p>
             
             <label className="block w-full cursor-pointer bg-black text-white font-bold uppercase py-4 hover:bg-stone-800 transition-colors">
                Select File
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
             </label>
             
             <button onClick={() => setActiveExam('')} className="mt-4 text-xs font-bold uppercase tracking-widest text-black/40 hover:text-red-600">Cancel</button>
          </div>
       </div>
    )
  }

  // The Actual List Logic
  const currentLevelNodes = path.length === 0 
    ? data 
    : path[path.length - 1].children || []

  // Check Helper
  const isChecked = (id: string) => completedIds.includes(id)

  return (
    <div className="min-h-screen bg-[#FBF9F6] p-6 md:p-12 text-black">
      
      {/* HEADER */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
               <Link href="/dashboard" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black">
                 <ArrowLeft size={14} /> Dashboard
               </Link>
               <span className="text-black/20">|</span>
               <button onClick={handleChangeProtocol} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40 hover:text-red-600 transition-colors">
                 <RefreshCw size={12} /> Change Protocol
               </button>
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">
              {activeExam === 'upsc' ? 'UPSC War Room' : 'Custom Ops'}
            </h1>
          </div>
          <div className="text-right">
             <div className="text-xs font-bold uppercase tracking-widest text-black/40">Conquest Status</div>
             <div className="text-4xl font-black tracking-tighter text-black">
               {stats.percentage}%
               <span className="text-base text-black/40 ml-2 align-baseline font-bold">
                 ({stats.completedLeaves} / {stats.totalLeaves})
               </span>
             </div>
          </div>
        </div>

        {/* BREADCRUMBS */}
        <div className="flex items-center gap-2 overflow-x-auto text-sm font-bold uppercase tracking-wide border-b-2 border-black/10 pb-4 mb-4 scrollbar-hide">
          <button 
            onClick={() => setPath([])}
            className={`flex items-center gap-1 hover:text-amber-600 transition-colors ${path.length === 0 ? 'text-black' : 'text-black/40'}`}
          >
            <Home size={14} /> Root
          </button>
          
          {path.map((node, index) => (
            <div key={node.id} className="flex items-center gap-2 whitespace-nowrap">
              <ChevronRight size={14} className="text-black/20" />
              <button 
                onClick={() => setPath(path.slice(0, index + 1))}
                className={`hover:text-amber-600 transition-colors ${index === path.length - 1 ? 'text-black' : 'text-black/40'}`}
              >
                {node.title.replace(/^\d+\.\s*/, '').substring(0, 20) + (node.title.length > 20 ? '...' : '')}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* THE LIST */}
      <div className="max-w-4xl mx-auto pb-20">
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {currentLevelNodes.length === 0 ? (
              <div className="py-12 text-center border-2 border-dashed border-black/10 text-black/40 font-bold uppercase tracking-widest">
                <AlertCircle className="mx-auto mb-2 opacity-50" />
                Empty Sector
              </div>
            ) : (
              currentLevelNodes.map((node) => (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.1 }}
                >
                  {node.type === 'branch' ? (
                    // BRANCH ROW
                    <div 
                      onClick={() => setPath([...path, node])}
                      className="group flex items-center justify-between p-5 bg-white border-2 border-black/5 hover:border-black cursor-pointer shadow-sm hover:shadow-[4px_4px_0_0_#000] transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-amber-100 text-amber-700 p-2 rounded-md group-hover:bg-black group-hover:text-white transition-colors">
                          <Folder size={20} />
                        </div>
                        <span className="text-lg font-bold uppercase tracking-tight">
                          {node.title}
                        </span>
                      </div>
                      <ChevronRight className="text-black/20 group-hover:text-black transition-colors" />
                    </div>

                  ) : (
                    // LEAF ROW
                    <div 
                      onClick={() => toggleNode(node.id)}
                      className={`group flex items-center gap-4 p-5 border-2 cursor-pointer transition-all
                        ${isChecked(node.id) 
                          ? 'bg-black border-black text-white' 
                          : 'bg-white border-black/5 hover:border-black text-black'
                        }`}
                    >
                      <div className={`w-6 h-6 border-2 flex items-center justify-center transition-all
                        ${isChecked(node.id) ? 'border-amber-400 bg-amber-400 text-black' : 'border-black/20 group-hover:border-black'}`}
                      >
                        {isChecked(node.id) && <Check size={16} strokeWidth={4} />}
                      </div>

                      <span className={`text-base font-bold uppercase tracking-tight select-none ${isChecked(node.id) ? 'line-through decoration-amber-500 decoration-2 text-white/50' : ''}`}>
                        {node.title}
                      </span>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}