'use client'

import { useState, useEffect, useMemo } from 'react'
import { ArrowLeft, ChevronRight, Folder, Check, Home, Upload, FileJson, AlertCircle, RefreshCw, Search, X, Download, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { useSyllabus } from '@/context/SyllabusContext'
import { SyllabusNode } from '@/types/syllabus'
import { motion, AnimatePresence } from 'framer-motion'
import { useAlert } from '@/context/AlertContext'

// --- HELPER: Find path for search ---
const findPathToNode = (nodes: SyllabusNode[], targetId: string, currentPath: SyllabusNode[] = []): SyllabusNode[] | null => {
  for (const node of nodes) {
    if (node.id === targetId) return currentPath
    if (node.children) {
      const result = findPathToNode(node.children, targetId, [...currentPath, node])
      if (result) return result
    }
  }
  return null
}

const flattenNodes = (nodes: SyllabusNode[]): SyllabusNode[] => {
  let flat: SyllabusNode[] = []
  for (const node of nodes) {
    flat.push(node)
    if (node.children) flat = flat.concat(flattenNodes(node.children))
  }
  return flat
}

export default function SyllabusPage() {
  const { activeExam, setActiveExam, data, setData, completedIds, toggleNode, stats, loading } = useSyllabus()
  const { showAlert, askConfirm } = useAlert()
  
  const [path, setPath] = useState<SyllabusNode[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // --- CUSTOM UPLOAD & TEMPLATE LOGIC ---
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string)
        if (!Array.isArray(json) || !json[0]?.id) throw new Error("Invalid Format")
        setData(json)
        localStorage.setItem('krama_custom_syllabus_data', JSON.stringify(json))
        showAlert("Custom Protocol Loaded", "success")
      } catch (err) {
        showAlert("Invalid JSON. Please use the template.", "error")
      }
    }
    reader.readAsText(file)
  }

  // Generate a dummy template for the user
  const downloadTemplate = () => {
    const template = [
      {
        "id": "root_subject",
        "title": "My Subject (Example)",
        "type": "branch",
        "children": [
          { "id": "chapter_1", "title": "Chapter 1", "type": "leaf" },
          { "id": "chapter_2", "title": "Chapter 2", "type": "leaf" }
        ]
      }
    ]
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = "syllabus_template.json"
    a.click()
  }

  // Load Custom Data Logic
  useEffect(() => {
    if (activeExam === 'custom' && data.length === 0) {
      const saved = localStorage.getItem('krama_custom_syllabus_data')
      if (saved) setData(JSON.parse(saved))
    }
  }, [activeExam, data.length, setData])

  const handleChangeProtocol = () => {
    askConfirm("Switch protocols? Progress is safe.", () => {
       setActiveExam('') 
       setPath([])
       setSearchQuery('')
    })
  }

  // --- SEARCH LOGIC ---
  const allNodes = useMemo(() => activeExam ? flattenNodes(data) : [], [data, activeExam])
  const searchResults = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return []
    return allNodes.filter(node => 
      node.title.toLowerCase().includes(searchQuery.toLowerCase()) && node.type === 'leaf'
    )
  }, [searchQuery, allNodes])

  const handleSearchResultClick = (node: SyllabusNode) => {
    const fullPath = findPathToNode(data, node.id)
    if (fullPath) {
      setPath(fullPath)
      setSearchQuery('')
    }
  }


  if (loading) return <div className="min-h-screen bg-[#FBF9F6] p-12 flex items-center justify-center font-bold animate-pulse">LOADING INTEL...</div>

  // --- RENDER 2: SELECTION SCREEN ---
  if (!activeExam) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] p-6 md:p-12 text-black">
        <Link href="/dashboard" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black mb-8">
           <ArrowLeft size={14} /> Dashboard
        </Link>
        
        {/* WARNING BANNER */}
        <div className="max-w-4xl mx-auto mb-12 bg-amber-50 border border-amber-200 p-4 flex items-start gap-3 rounded-md">
           <AlertTriangle className="text-amber-600 shrink-0" size={20} />
           <p className="text-sm text-amber-900 leading-relaxed">
             <span className="font-bold">Disclaimer:</span> The syllabi provided below are representative structures based on notifications. 
             They may not reflect the absolute latest official updates. Always verify with official exam notifications (UPSC/SSC/IBPS) before finalizing your preparation strategy.
           </p>
        </div>

        <div className="max-w-4xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-4">Select Protocol</h1>
          <p className="text-black/60 font-medium">Select your active front. Switching protocols preserves your progress.</p>
        </div>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
           <button onClick={() => setActiveExam('upsc')} className="group relative bg-white border-2 border-black p-8 text-left hover:bg-black hover:text-white transition-all shadow-[8px_8px_0_0_#000] hover:translate-y-1 hover:shadow-none">
              <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Standard Issue</div>
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">UPSC CSE</h2>
              <p className="text-sm font-medium opacity-80">Prelims + Mains (GS & Optionals).</p>
           </button>

           <button onClick={() => setActiveExam('ssc')} className="group relative bg-white border-2 border-black p-8 text-left hover:bg-black hover:text-white transition-all shadow-[8px_8px_0_0_#000] hover:translate-y-1 hover:shadow-none">
              <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Standard Issue</div>
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">SSC CGL</h2>
              <p className="text-sm font-medium opacity-80">Full Syllabus (Tier I & II).</p>
           </button>

           <button onClick={() => setActiveExam('bank')} className="group relative bg-white border-2 border-black p-8 text-left hover:bg-black hover:text-white transition-all shadow-[8px_8px_0_0_#000] hover:translate-y-1 hover:shadow-none">
              <div className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">Standard Issue</div>
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Bank PO</h2>
              <p className="text-sm font-medium opacity-80">IBPS / SBI PO Syllabus.</p>
           </button>

           <button onClick={() => setActiveExam('custom')} className="group relative bg-amber-100 border-2 border-amber-400 border-dashed p-8 text-left hover:bg-amber-400 hover:text-black transition-all">
              <div className="text-xs font-bold uppercase tracking-widest text-amber-700 group-hover:text-black mb-2 flex items-center gap-2">
                 <Upload size={14}/> Custom Operation
              </div>
              <h2 className="text-3xl font-black uppercase tracking-tighter mb-4 text-amber-900 group-hover:text-black">Upload JSON</h2>
              <p className="text-sm font-medium text-amber-800 group-hover:text-black">Bring your own syllabus file.</p>
           </button>
        </div>
      </div>
    )
  }

  // --- RENDER 3: CUSTOM UPLOAD SCREEN ---
  if (activeExam === 'custom' && data.length === 0) {
    return (
       <div className="min-h-screen bg-[#FBF9F6] p-12 flex flex-col items-center justify-center text-center">
          <div className="bg-white border-4 border-black p-12 max-w-lg w-full shadow-[12px_12px_0_0_#000]">
             <FileJson size={48} className="mx-auto mb-6 text-black/20" />
             <h2 className="text-2xl font-black uppercase mb-4">Initialize Custom Protocol</h2>
             
             <label className="block w-full cursor-pointer bg-black text-white font-bold uppercase py-4 hover:bg-stone-800 transition-colors mb-4">
                Select JSON File
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
             </label>

             {/* TEMPLATE DOWNLOAD BUTTON */}
             <button onClick={downloadTemplate} className="flex items-center justify-center gap-2 w-full text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black mb-6">
                <Download size={14} /> Download Structure Template
             </button>
             
             <button onClick={() => setActiveExam('')} className="text-xs font-bold uppercase tracking-widest text-red-500 hover:text-red-700">Cancel Operation</button>
          </div>
       </div>
    )
  }

  // --- RENDER 4: WAR ROOM ---
  const currentLevelNodes = path.length === 0 ? data : path[path.length - 1].children || []
  const isChecked = (id: string) => completedIds.includes(id)

  return (
    <div className="min-h-screen bg-[#FBF9F6] p-6 md:p-12 text-black">
      
      {/* HEADER */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6">
          <div className="w-full md:w-auto">
            <div className="flex items-center gap-4 mb-2">
               <Link href="/dashboard" className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40 hover:text-black">
                 <ArrowLeft size={14} /> Dashboard
               </Link>
               <span className="text-black/20">|</span>
               <button onClick={handleChangeProtocol} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-black/40 hover:text-red-600 transition-colors">
                 <RefreshCw size={12} /> Switch Protocol
               </button>
            </div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">
              {activeExam === 'upsc' ? 'UPSC' : activeExam === 'ssc' ? 'SSC' : activeExam === 'bank' ? 'Bank' : 'Custom'} War Room
            </h1>
          </div>

          <div className="relative w-full md:w-80">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search topics..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border-2 border-black p-3 pl-10 font-bold placeholder-black/30 focus:outline-none focus:shadow-[4px_4px_0_0_#000] transition-all"
              />
              <Search className="absolute left-3 top-3.5 text-black/40" size={18} />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3.5 hover:text-red-600">
                  <X size={18} />
                </button>
              )}
            </div>

            {searchQuery.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border-2 border-black shadow-xl z-50 max-h-60 overflow-y-auto">
                {searchResults.length === 0 ? (
                  <div className="p-4 text-sm text-black/40 font-bold">No intel found.</div>
                ) : (
                  searchResults.map(node => (
                    <button 
                      key={node.id}
                      onClick={() => handleSearchResultClick(node)}
                      className="w-full text-left p-3 hover:bg-black hover:text-white border-b border-black/5 last:border-0 flex items-center justify-between group"
                    >
                      <span className="font-bold text-sm truncate">{node.title}</span>
                      {isChecked(node.id) && <Check size={14} className="opacity-50" />}
                    </button>
                  ))
                )}
              </div>
            )}
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