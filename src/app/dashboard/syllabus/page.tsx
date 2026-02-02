'use client'

import { useState, useMemo } from 'react'
import { ArrowLeft, ChevronRight, Folder, Check, Home, FileJson, AlertCircle, RefreshCw, Search, X, Download, AlertTriangle, BookOpen, Layers, Minus, FolderOpen } from 'lucide-react'
import Link from 'next/link'
import { useSyllabus } from '@/context/SyllabusContext'
import { SyllabusNode } from '@/types/syllabus'
import { motion, AnimatePresence } from 'framer-motion'
import { useAlert } from '@/context/AlertContext'

// --- CONSTANTS ---
const OPTIONAL_SUBJECTS = [
  { id: 'opt_anthro', label: 'Anthropology' },
  { id: 'opt_economics', label: 'Economics' },
  { id: 'opt_geography', label: 'Geography' },
  { id: 'opt_history', label: 'History' },
  { id: 'opt_psir', label: 'PSIR' },
  { id: 'opt_pubad', label: 'Public Administration' },
  { id: 'opt_socio', label: 'Sociology' },
]

const EXAM_OPTIONS = [
  { id: 'upsc', name: 'UPSC CSE', desc: 'Prelims + Mains (GS & Optionals)' },
  { id: 'ssc', name: 'SSC CGL', desc: 'Full Syllabus (Tier I & II)' },
  { id: 'bank', name: 'Bank PO', desc: 'IBPS / SBI PO Syllabus' },
  { id: 'jee', name: 'JEE', desc: 'Mains + Advanced (NTA)' },
  { id: 'neet', name: 'NEET UG', desc: 'Medical Entrance (NTA)' },
  { id: 'rbi', name: 'RBI Grade B', desc: 'Officer Scale Syllabus' },
]

// --- HELPERS ---
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

const getAllLeafIds = (node: SyllabusNode): string[] => {
  if (node.type === 'leaf') return [node.id]
  if (!node.children) return []
  return node.children.flatMap(getAllLeafIds)
}

const getExamLabel = (id: string | null) => {
  const exam = EXAM_OPTIONS.find(e => e.id === id)
  return exam?.name || id?.toUpperCase() || 'Custom'
}

export default function SyllabusPage() {
  const { 
    activeExam, setActiveExam, 
    optionalSubject, setOptionalSubject, resetOptionalSelection,
    data, setData, 
    completedIds, toggleNode, 
    loading 
  } = useSyllabus()
  
  const { showAlert, askConfirm } = useAlert()
  
  const [path, setPath] = useState<SyllabusNode[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  // --- CUSTOM UPLOAD ---
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
        showAlert("Custom syllabus loaded!", "success")
      } catch (err) {
        showAlert("Invalid JSON format. Use the template.", "error")
      }
    }
    reader.readAsText(file)
  }

  const downloadTemplate = () => {
    const template = [{ "id": "root", "title": "Example Subject", "type": "branch", "children": [{ "id": "topic1", "title": "Topic 1", "type": "leaf" }] }]
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = "syllabus_template.json"
    a.click()
  }

  const handleChangeProtocol = () => {
    askConfirm("Switch exam? Your progress is saved separately for each exam.", () => {
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
    ).slice(0, 15)
  }, [searchQuery, allNodes])

  const handleSearchResultClick = (node: SyllabusNode) => {
    const fullPath = findPathToNode(data, node.id)
    if (fullPath) {
      setPath(fullPath)
      setSearchQuery('')
    }
  }

  // --- BRANCH STATUS ---
  const getBranchStatus = (node: SyllabusNode) => {
    const leaves = getAllLeafIds(node)
    if (leaves.length === 0) return 'none'
    const completedCount = leaves.filter(id => completedIds.includes(id)).length
    if (completedCount === leaves.length) return 'full'
    if (completedCount > 0) return 'partial'
    return 'none'
  }

  const getBranchProgress = (node: SyllabusNode) => {
    const leaves = getAllLeafIds(node)
    if (leaves.length === 0) return { done: 0, total: 0, percent: 0 }
    const done = leaves.filter(id => completedIds.includes(id)).length
    return { done, total: leaves.length, percent: Math.round((done / leaves.length) * 100) }
  }

  // --- LOADING ---
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-bold text-black/50">Loading syllabus...</p>
        </div>
      </div>
    )
  }

  // === RENDER 1: EXAM SELECTION ===
  if (!activeExam) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] text-black">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-black/40 hover:text-black transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Dashboard
        </Link>
        
        {/* DISCLAIMER */}
        <div className="mb-8 bg-amber-50 border-2 border-amber-200 p-4 flex items-start gap-3">
          <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <p className="text-sm text-amber-900 leading-relaxed">
            <span className="font-bold">Note:</span> Syllabi are representative structures based on official notifications. 
            Always verify with official sources before finalizing your strategy.
          </p>
        </div>

        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-3">Choose Your Exam</h1>
          <p className="text-black/50 font-medium">Progress is saved separately for each exam</p>
        </div>

        {/* EXAM GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {EXAM_OPTIONS.map(exam => (
            <button 
              key={exam.id}
              onClick={() => setActiveExam(exam.id)} 
              className="group bg-white border-2 border-black p-6 text-left hover:bg-black hover:text-white transition-all shadow-[4px_4px_0_0_#000] hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px]"
            >
              <h2 className="text-2xl font-black mb-1">{exam.name}</h2>
              <p className="text-sm font-medium opacity-70">{exam.desc}</p>
            </button>
          ))}
        </div>

        {/* CUSTOM OPTION */}
        <button 
          onClick={() => setActiveExam('custom')} 
          className="w-full bg-stone-100 border-2 border-dashed border-black/30 p-6 text-left hover:border-black hover:bg-stone-50 transition-all"
        >
          <div className="flex items-center gap-3">
            <FileJson size={24} className="text-black/40" />
            <div>
              <h2 className="text-xl font-black">Upload Custom Syllabus</h2>
              <p className="text-sm font-medium text-black/50">Bring your own JSON file</p>
            </div>
          </div>
        </button>
      </div>
    )
  }

  // === RENDER 2: OPTIONAL SELECTION (UPSC) ===
  if (activeExam === 'upsc' && !optionalSubject) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] text-black flex flex-col items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          <BookOpen size={48} className="mx-auto mb-6 text-black/20" />
          <h1 className="text-3xl font-black mb-3">Select Your Optional</h1>
          <p className="text-black/50 mb-8">This filters your syllabus for accurate progress tracking</p>
          
          <div className="grid grid-cols-1 gap-3 mb-8">
            {OPTIONAL_SUBJECTS.map((opt) => (
              <button 
                key={opt.id} 
                onClick={() => setOptionalSubject(opt.id)}
                className="p-4 bg-white border-2 border-black/10 hover:border-black hover:bg-black hover:text-white transition-all font-bold text-left"
              >
                {opt.label}
              </button>
            ))}
          </div>
          
          <button 
            onClick={() => setActiveExam('')} 
            className="text-sm font-bold text-red-500 hover:text-red-700"
          >
            ← Go Back
          </button>
        </div>
      </div>
    )
  }

  // === RENDER 3: CUSTOM UPLOAD ===
  if (activeExam === 'custom' && data.length === 0) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex flex-col items-center justify-center px-4">
        <div className="bg-white border-2 border-black p-8 max-w-md w-full shadow-[6px_6px_0_0_#000] text-center">
          <FileJson size={48} className="mx-auto mb-6 text-black/20" />
          <h2 className="text-2xl font-black mb-2">Upload Syllabus</h2>
          <p className="text-black/50 text-sm mb-6">Upload a JSON file with your custom syllabus structure</p>
          
          <label className="block w-full cursor-pointer bg-black text-white font-bold py-4 hover:bg-stone-800 transition-colors mb-4">
            Select JSON File
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
          
          <button 
            onClick={downloadTemplate} 
            className="flex items-center justify-center gap-2 w-full text-sm font-bold text-black/50 hover:text-black mb-6"
          >
            <Download size={16} /> Download Template
          </button>
          
          <button 
            onClick={() => setActiveExam('')} 
            className="text-sm font-bold text-red-500 hover:text-red-700"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // === RENDER 4: MAIN SYLLABUS VIEW ===
  const currentLevelNodes = path.length === 0 ? data : path[path.length - 1].children || []
  const isChecked = (id: string) => completedIds.includes(id)

  // Overall progress
  const allLeaves = flattenNodes(data).filter(n => n.type === 'leaf')
  const completedCount = allLeaves.filter(n => completedIds.includes(n.id)).length
  const progressPercent = allLeaves.length > 0 ? Math.round((completedCount / allLeaves.length) * 100) : 0

  return (
    <div className="min-h-screen bg-[#FBF9F6] text-black pb-20">
      
      {/* HEADER */}
      <div className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <div>
            <Link 
              href="/dashboard" 
              className="inline-flex items-center gap-2 text-sm font-bold text-black/40 hover:text-black transition-colors mb-3"
            >
              <ArrowLeft size={16} /> Dashboard
            </Link>
            
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight">Syllabus</h1>
              <span className="bg-black text-white text-xs font-bold px-3 py-1.5">
                {getExamLabel(activeExam)}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handleChangeProtocol} 
              className="flex items-center gap-2 px-4 py-2.5 border-2 border-black/20 text-sm font-bold text-black/60 hover:border-black hover:text-black transition-all"
            >
              <RefreshCw size={16} /> Switch
            </button>
            
            {activeExam === 'upsc' && optionalSubject && (
              <button 
                onClick={() => askConfirm("Change optional subject?", () => { resetOptionalSelection(); setPath([]) })}
                className="flex items-center gap-2 px-4 py-2.5 border-2 border-black/20 text-sm font-bold text-black/60 hover:border-black hover:text-black transition-all"
              >
                <Layers size={16} /> Optional
              </button>
            )}
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="bg-white border-2 border-black p-4 mb-4 shadow-[3px_3px_0_0_#000]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-black/60">Overall Progress</span>
            <span className="text-lg font-black">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-black/10 overflow-hidden">
            <div 
              className="h-full bg-brand transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-2 text-xs font-bold text-black/40">
            {completedCount} of {allLeaves.length} topics completed
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30" size={18} />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics..."
            className="w-full bg-white border-2 border-black p-4 pl-12 font-bold text-sm focus:outline-none focus:shadow-[3px_3px_0_0_#000] transition-all placeholder:text-black/30"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30 hover:text-red-500"
            >
              <X size={18} />
            </button>
          )}
          
          {/* SEARCH DROPDOWN */}
          <AnimatePresence>
            {searchResults.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 z-30 mt-2 bg-white border-2 border-black shadow-[4px_4px_0_0_#000] max-h-72 overflow-y-auto"
              >
                {searchResults.map(node => (
                  <button 
                    key={node.id}
                    onClick={() => handleSearchResultClick(node)}
                    className={`w-full p-4 text-left border-b border-black/10 last:border-b-0 flex items-center justify-between transition-colors ${
                      isChecked(node.id) ? 'bg-stone-100' : 'hover:bg-brand'
                    }`}
                  >
                    <span className={`font-bold text-sm ${isChecked(node.id) ? 'line-through text-black/40' : ''}`}>
                      {node.title}
                    </span>
                    {isChecked(node.id) && <Check size={16} className="text-green-600" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* BREADCRUMBS */}
      {path.length > 0 && (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 -mx-1 px-1">
          <button 
            onClick={() => setPath([])}
            className="shrink-0 p-2.5 bg-white border-2 border-black hover:bg-brand transition-colors"
          >
            <Home size={18} />
          </button>
          {path.map((node, i) => (
            <div key={node.id} className="flex items-center gap-2 shrink-0">
              <ChevronRight size={16} className="text-black/30" />
              <button 
                onClick={() => setPath(path.slice(0, i + 1))}
                className="px-3 py-2 bg-white border-2 border-black/20 hover:border-black text-sm font-bold truncate max-w-[180px] transition-colors"
              >
                {node.title}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* THE LIST */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {currentLevelNodes.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-16 text-center border-2 border-dashed border-black/20"
            >
              <AlertCircle className="mx-auto mb-3 text-black/20" size={40} />
              <p className="font-bold text-black/40">No topics in this section</p>
            </motion.div>
          ) : (
            currentLevelNodes.map((node, index) => {
              const status = node.type === 'branch' ? getBranchStatus(node) : 'none'
              const progress = node.type === 'branch' ? getBranchProgress(node) : null
              
              return (
                <motion.div
                  key={node.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15, delay: index * 0.02 }}
                >
                  {node.type === 'branch' ? (
                    // === FOLDER ===
                    <div 
                      className={`group bg-white border-2 transition-all cursor-pointer ${
                        status === 'full' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-black/10 hover:border-black hover:shadow-[4px_4px_0_0_#000]'
                      }`}
                    >
                      <div className="flex items-center p-4 md:p-5">
                        {/* Folder Icon */}
                        <div 
                          onClick={() => setPath([...path, node])}
                          className={`shrink-0 p-2.5 mr-4 transition-colors ${
                            status === 'full' 
                              ? 'bg-green-500 text-white' 
                              : 'bg-stone-100 text-stone-600 group-hover:bg-black group-hover:text-white'
                          }`}
                        >
                          {status === 'full' ? <FolderOpen size={22} /> : <Folder size={22} />}
                        </div>
                        
                        {/* Title & Progress */}
                        <div 
                          className="flex-1 min-w-0 mr-4"
                          onClick={() => setPath([...path, node])}
                        >
                          <h3 className={`font-bold text-base md:text-lg leading-tight truncate ${
                            status === 'full' ? 'text-green-800' : 'text-black'
                          }`}>
                            {node.title}
                          </h3>
                          {progress && (
                            <div className="flex items-center gap-3 mt-1.5">
                              <div className="flex-1 h-1.5 bg-black/10 max-w-[120px] overflow-hidden">
                                <div 
                                  className={`h-full transition-all ${status === 'full' ? 'bg-green-500' : 'bg-brand'}`}
                                  style={{ width: `${progress.percent}%` }}
                                />
                              </div>
                              <span className="text-xs font-bold text-black/40">
                                {progress.done}/{progress.total}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Checkbox */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleNode(node.id) }} 
                          className={`shrink-0 w-7 h-7 border-2 flex items-center justify-center transition-all mr-2 ${
                            status === 'full' 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : status === 'partial' 
                                ? 'bg-stone-200 border-stone-300 text-black' 
                                : 'border-black/20 hover:border-black'
                          }`}
                        >
                          {status === 'full' && <Check size={16} strokeWidth={3} />}
                          {status === 'partial' && <Minus size={16} strokeWidth={3} />}
                        </button>
                        
                        {/* Arrow */}
                        <ChevronRight 
                          className="shrink-0 text-black/20 group-hover:text-black transition-colors" 
                          size={20}
                          onClick={() => setPath([...path, node])}
                        />
                      </div>
                    </div>
                  ) : (
                    // === TOPIC (LEAF) ===
                    <div 
                      onClick={() => toggleNode(node.id)}
                      className={`group flex items-center p-4 md:p-5 border-2 cursor-pointer transition-all ${
                        isChecked(node.id) 
                          ? 'bg-black border-black text-white' 
                          : 'bg-white border-black/10 hover:border-black'
                      }`}
                    >
                      {/* Checkbox */}
                      <div className={`shrink-0 w-7 h-7 border-2 flex items-center justify-center mr-4 transition-all ${
                        isChecked(node.id) 
                          ? 'border-brand bg-brand text-black' 
                          : 'border-black/20 group-hover:border-black'
                      }`}>
                        {isChecked(node.id) && <Check size={16} strokeWidth={3} />}
                      </div>
                      
                      {/* Title */}
                      <span className={`font-bold text-base flex-1 select-none ${
                        isChecked(node.id) ? 'line-through decoration-brand decoration-2 text-white/60' : ''
                      }`}>
                        {node.title}
                      </span>
                    </div>
                  )}
                </motion.div>
              )
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
