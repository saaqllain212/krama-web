'use client'

import { useState, useMemo } from 'react'
import { ArrowLeft, ChevronRight, Folder, Check, Home, FileJson, RefreshCw, Search, X, Download, BookOpen, Layers, FolderOpen, CheckCircle } from 'lucide-react'
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
  { id: 'upsc', name: 'UPSC CSE', desc: 'Prelims + Mains (GS & Optionals)', color: 'from-primary-500 to-primary-600' },
  { id: 'ssc', name: 'SSC CGL', desc: 'Full Syllabus (Tier I & II)', color: 'from-success-500 to-success-600' },
  { id: 'bank', name: 'Bank PO', desc: 'IBPS / SBI PO Syllabus', color: 'from-purple-500 to-purple-600' },
  { id: 'jee', name: 'JEE', desc: 'Mains + Advanced (NTA)', color: 'from-orange-500 to-orange-600' },
  { id: 'neet', name: 'NEET UG', desc: 'Medical Entrance (NTA)', color: 'from-cyan-500 to-cyan-600' },
  { id: 'rbi', name: 'RBI Grade B', desc: 'Officer Scale Syllabus', color: 'from-pink-500 to-pink-600' },
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading syllabus...</div>
      </div>
    )
  }

  // === RENDER 1: EXAM SELECTION ===
  if (!activeExam) {
    return (
      <div className="min-h-screen bg-gray-50 px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-8"
          >
            <ArrowLeft size={16} /> Dashboard
          </Link>

          <div className="text-center mb-12">
            <BookOpen size={56} className="mx-auto mb-6 text-primary-500" />
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Select Your Exam</h1>
            <p className="text-lg text-gray-600">Choose your syllabus to start tracking progress</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {EXAM_OPTIONS.map((exam) => (
              <motion.button
                key={exam.id}
                onClick={() => setActiveExam(exam.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative overflow-hidden bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-primary-400 hover:shadow-lg transition-all text-left"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${exam.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
                <h2 className="text-2xl font-bold text-gray-900 mb-2 relative z-10">{exam.name}</h2>
                <p className="text-sm text-gray-600 relative z-10">{exam.desc}</p>
              </motion.button>
            ))}
          </div>

          <button 
            onClick={() => setActiveExam('custom')} 
            className="w-full bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-6 text-left hover:border-primary-400 hover:bg-white transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-xl group-hover:bg-primary-50 transition-colors">
                <FileJson size={28} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Upload Custom Syllabus</h2>
                <p className="text-sm text-gray-600">Bring your own JSON file</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    )
  }

  // === RENDER 2: OPTIONAL SELECTION (UPSC) ===
  if (activeExam === 'upsc' && !optionalSubject) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        <div className="max-w-lg w-full">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-primary-100 rounded-full mb-4">
              <Layers size={32} className="text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Select Your Optional</h1>
            <p className="text-gray-600">This filters your syllabus for accurate progress tracking</p>
          </div>
          
          <div className="space-y-3 mb-8">
            {OPTIONAL_SUBJECTS.map((opt) => (
              <motion.button
                key={opt.id}
                onClick={() => setOptionalSubject(opt.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full p-4 bg-white rounded-xl border-2 border-gray-200 hover:border-primary-500 hover:bg-primary-50 transition-all font-semibold text-gray-900 text-left"
              >
                {opt.label}
              </motion.button>
            ))}
          </div>
          
          <button 
            onClick={() => setActiveExam('')} 
            className="w-full text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
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
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-6">
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 max-w-md w-full shadow-lg text-center">
          <FileJson size={56} className="mx-auto mb-6 text-primary-500" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Syllabus</h2>
          <p className="text-gray-600 text-sm mb-6">Upload a JSON file with your custom syllabus structure</p>
          
          <label className="block w-full cursor-pointer btn btn-primary mb-4">
            Select JSON File
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
          
          <button 
            onClick={downloadTemplate} 
            className="flex items-center justify-center gap-2 w-full text-sm font-semibold text-gray-600 hover:text-gray-900 mb-6"
          >
            <Download size={16} /> Download Template
          </button>
          
          <button 
            onClick={() => setActiveExam('')} 
            className="text-sm font-semibold text-gray-500 hover:text-gray-900"
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
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 mb-6">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft size={16} /> Dashboard
          </Link>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Syllabus</h1>
              <span className="bg-gradient-to-r from-primary-500 to-purple-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                {getExamLabel(activeExam)}
              </span>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={handleChangeProtocol} 
                className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:border-primary-500 hover:text-primary-600 transition-all"
              >
                <RefreshCw size={16} /> Switch
              </button>
              
              {activeExam === 'upsc' && optionalSubject && (
                <button 
                  onClick={() => askConfirm("Change optional subject?", () => { resetOptionalSelection(); setPath([]) })}
                  className="flex items-center gap-2 px-4 py-2 border-2 border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:border-primary-500 hover:text-primary-600 transition-all"
                >
                  <Layers size={16} /> Optional
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        {/* PROGRESS BAR */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-600">Overall Progress</span>
            <span className="text-2xl font-bold text-gray-900">{progressPercent}%</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary-500 to-success-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="mt-3 text-xs font-medium text-gray-500">
            {completedCount} of {allLeaves.length} topics completed
          </div>
        </div>

        {/* SEARCH */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics..."
            className="input pl-11 w-full"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-danger-500">
              <X size={18} />
            </button>
          )}

          {/* SEARCH RESULTS DROPDOWN */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg max-h-64 overflow-y-auto z-10">
              {searchResults.map((node) => (
                <button
                  key={node.id}
                  onClick={() => handleSearchResultClick(node)}
                  className="w-full px-4 py-3 text-left hover:bg-primary-50 transition-colors border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    {isChecked(node.id) && <CheckCircle size={16} className="text-success-500" />}
                    <span className="font-medium text-gray-900">{node.title}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* BREADCRUMB */}
        {path.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6 text-sm">
            <button 
              onClick={() => setPath([])} 
              className="flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg border border-gray-200 hover:border-primary-500 transition-colors font-medium text-gray-700"
            >
              <Home size={14} /> Root
            </button>
            {path.map((node, i) => (
              <div key={node.id} className="flex items-center gap-2">
                <ChevronRight size={16} className="text-gray-400" />
                <button
                  onClick={() => setPath(path.slice(0, i + 1))}
                  className="px-3 py-1.5 bg-white rounded-lg border border-gray-200 hover:border-primary-500 transition-colors font-medium text-gray-700 truncate max-w-[200px]"
                >
                  {node.title}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* NODES LIST */}
        <div className="space-y-3">
          {currentLevelNodes.map((node) => {
            const status = node.type === 'branch' ? getBranchStatus(node) : null
            const progress = node.type === 'branch' ? getBranchProgress(node) : null
            const checked = node.type === 'leaf' && isChecked(node.id)

            return (
              <motion.div
                key={node.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all overflow-hidden"
              >
                {node.type === 'branch' ? (
                  // BRANCH
                  <button
                    onClick={() => setPath([...path, node])}
                    className="w-full p-5 flex items-center justify-between text-left group"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className={`p-2.5 rounded-lg ${
                        status === 'full' ? 'bg-success-100' :
                        status === 'partial' ? 'bg-primary-100' :
                        'bg-gray-100'
                      }`}>
                        {status === 'full' ? (
                          <FolderOpen size={20} className="text-success-600" />
                        ) : (
                          <Folder size={20} className={status === 'partial' ? 'text-primary-600' : 'text-gray-400'} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors truncate">
                          {node.title}
                        </h3>
                        {progress && progress.total > 0 && (
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 max-w-[200px] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  status === 'full' ? 'bg-success-500' :
                                  status === 'partial' ? 'bg-primary-500' :
                                  'bg-gray-300'
                                }`}
                                style={{ width: `${progress.percent}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-500">
                              {progress.done}/{progress.total}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-gray-400 group-hover:text-primary-600 transition-colors" />
                  </button>
                ) : (
                  // LEAF
                  <button
                    onClick={() => toggleNode(node.id)}
                    className="w-full p-5 flex items-center gap-4"
                  >
                    <div className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                      checked 
                        ? 'bg-success-500 border-success-500' 
                        : 'border-gray-300 hover:border-primary-500'
                    }`}>
                      {checked && <Check size={14} className="text-white" />}
                    </div>
                    <span className={`font-medium transition-colors ${
                      checked ? 'text-gray-500 line-through' : 'text-gray-900'
                    }`}>
                      {node.title}
                    </span>
                  </button>
                )}
              </motion.div>
            )
          })}
        </div>

        {currentLevelNodes.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-300">
            <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600">No topics found</p>
          </div>
        )}
      </div>
    </div>
  )
}