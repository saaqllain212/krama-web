'use client'

import { useState, useMemo } from 'react'
import { Terminal, Bot, FileJson, X, Copy, Check, ArrowRight, Code, List, ChevronRight, ChevronDown, Folder, FileText, Download, Eye, RotateCcw } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// =====================================================
// TYPES
// =====================================================
type SyllabusNode = {
  id: string
  title: string
  type: 'branch' | 'leaf'
  status?: string
  children?: SyllabusNode[]
}

// =====================================================
// SMART PARSER — handles indentation, numbering, bullets
// Supports 3-5 levels of nesting like the actual exam data
// =====================================================
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60)
}

function makeId(parentPath: string, title: string): string {
  const slug = slugify(title)
  return parentPath ? `${parentPath}_${slug}` : `root_${slug}`
}

function getIndentLevel(line: string): number {
  // Count leading whitespace (tabs = 2 levels, 2-4 spaces = 1 level)
  const match = line.match(/^(\s*)/)
  if (!match) return 0
  const ws = match[1]
  const tabs = (ws.match(/\t/g) || []).length
  const spaces = ws.replace(/\t/g, '').length
  return tabs * 2 + Math.floor(spaces / 2)
}

function cleanTitle(text: string): string {
  return text
    .replace(/^[\s]*/, '')                    // leading whitespace
    .replace(/^[-•*▸▹►◆○●→]\s*/, '')        // bullets
    .replace(/^\d+[\.\)]\s*/, '')             // "1." or "1)"
    .replace(/^[A-Z][\.\)]\s*/, '')           // "A." or "A)"
    .replace(/^(?:Unit|Chapter|Section|Part|Paper|Module)\s*[\d:.\-]+\s*/i, '') // "Unit 1:", "Chapter 3."
    .trim()
}

function isHeadingLine(rawLine: string): boolean {
  const trimmed = rawLine.trim()
  // Lines starting with numbers like "1. Topic" or "Unit X" at root indent are headings
  if (/^\d+[\.\)]\s/.test(trimmed)) return true
  if (/^[A-Z][\.\)]\s/.test(trimmed)) return true
  if (/^(?:Unit|Chapter|Section|Part|Paper|Module|Stage|Tier)\s/i.test(trimmed)) return true
  // ALL CAPS lines are headings
  if (trimmed.length > 3 && trimmed === trimmed.toUpperCase() && /[A-Z]/.test(trimmed)) return true
  return false
}

function isBulletLine(rawLine: string): boolean {
  const trimmed = rawLine.trim()
  return /^[-•*▸▹►◆○●→]\s/.test(trimmed)
}

function parseTextToTree(text: string): SyllabusNode[] {
  const lines = text.split('\n').filter(l => l.trim().length > 0)
  if (lines.length === 0) return []

  // Strategy: Use indentation + heading detection to build nested tree
  // Each line gets an effective "level" based on indent + context
  
  type ParsedLine = { title: string; level: number; isHeading: boolean; raw: string }
  
  const parsed: ParsedLine[] = []
  
  for (const line of lines) {
    const indent = getIndentLevel(line)
    const title = cleanTitle(line)
    if (!title) continue
    
    const heading = isHeadingLine(line.trim())
    const bullet = isBulletLine(line.trim())
    
    // Heading at indent 0 = level 0 (top branch)
    // Heading at indent N = level N  
    // Bullet at indent N = level N+1 (always a leaf candidate)
    // Plain text at indent N = level N
    let level = indent
    if (bullet && indent === 0) level = 1 // bullets at root are sub-items
    
    parsed.push({ title, level, isHeading: heading && !bullet, raw: line })
  }
  
  if (parsed.length === 0) return []

  // Normalize levels to be 0-based and consecutive
  const levels = [...new Set(parsed.map(p => p.level))].sort((a, b) => a - b)
  const levelMap = new Map<number, number>()
  levels.forEach((l, i) => levelMap.set(l, i))
  parsed.forEach(p => { p.level = levelMap.get(p.level) || 0 })

  // Build tree recursively
  function buildTree(items: ParsedLine[], startIdx: number, parentLevel: number, parentPath: string): { nodes: SyllabusNode[]; nextIdx: number } {
    const nodes: SyllabusNode[] = []
    let i = startIdx

    while (i < items.length) {
      const item = items[i]
      
      // If this item is at a lower level than our parent, we're done with this branch
      if (item.level < parentLevel) break
      
      // If same level or deeper, process it
      if (item.level === parentLevel) {
        const nodeId = makeId(parentPath, item.title)
        
        // Look ahead: does the next item have a deeper level?
        const hasChildren = (i + 1 < items.length) && items[i + 1].level > parentLevel
        
        if (hasChildren || item.isHeading) {
          // This is a branch
          const { nodes: children, nextIdx } = buildTree(items, i + 1, parentLevel + 1, nodeId)
          
          if (children.length > 0) {
            nodes.push({ id: nodeId, title: item.title, type: 'branch', children })
          } else {
            // No children found despite being a heading — make it a leaf
            nodes.push({ id: nodeId, title: item.title, type: 'leaf', status: 'locked' })
          }
          i = nextIdx
        } else {
          // This is a leaf
          nodes.push({ id: nodeId, title: item.title, type: 'leaf', status: 'locked' })
          i++
        }
      } else {
        // Deeper than expected — shouldn't happen with normalization but handle gracefully
        i++
      }
    }

    return { nodes, nextIdx: i }
  }

  const { nodes } = buildTree(parsed, 0, 0, 'root')
  
  // If everything ended up as leaves at root, wrap in a "General" branch
  if (nodes.length > 0 && nodes.every(n => n.type === 'leaf')) {
    return [{ id: 'root_custom-syllabus', title: 'Custom Syllabus', type: 'branch', children: nodes }]
  }
  
  return nodes
}

// =====================================================
// TREE PREVIEW COMPONENT
// =====================================================
function TreeNode({ node, depth = 0 }: { node: SyllabusNode; depth?: number }) {
  const [open, setOpen] = useState(depth < 2)
  const isBranch = node.type === 'branch' && node.children && node.children.length > 0
  
  return (
    <div className={depth > 0 ? 'ml-4' : ''}>
      <div 
        className={`flex items-center gap-2 py-1 px-2 rounded-md text-sm ${
          isBranch ? 'text-gray-900 font-medium cursor-pointer hover:bg-gray-100' : 'text-gray-500'
        }`}
        onClick={() => isBranch && setOpen(!open)}
      >
        {isBranch ? (
          open ? <ChevronDown size={14} className="text-gray-400 flex-shrink-0" /> : <ChevronRight size={14} className="text-gray-400 flex-shrink-0" />
        ) : (
          <div className="w-3.5 flex-shrink-0" />
        )}
        {isBranch ? (
          <Folder size={14} className="text-primary-500 flex-shrink-0" />
        ) : (
          <FileText size={14} className="text-gray-300 flex-shrink-0" />
        )}
        <span className="truncate">{node.title}</span>
      </div>
      {isBranch && open && (
        <div>
          {node.children!.map((child, i) => (
            <TreeNode key={child.id || i} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function countNodes(nodes: SyllabusNode[]): { branches: number; leaves: number } {
  let branches = 0, leaves = 0
  for (const n of nodes) {
    if (n.type === 'branch') {
      branches++
      if (n.children) {
        const sub = countNodes(n.children)
        branches += sub.branches
        leaves += sub.leaves
      }
    } else {
      leaves++
    }
  }
  return { branches, leaves }
}

// =====================================================
// MAIN COMPONENT
// =====================================================
export default function SyllabusBuilderSection() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'manual' | 'ai'>('manual') // Default to Quick Paste — more useful
  const [copied, setCopied] = useState(false)

  // --- MANUAL PARSER STATE ---
  const [manualText, setManualText] = useState('')
  const [parseStatus, setParseStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [showPreview, setShowPreview] = useState(false)
  
  // Live parse for preview
  const parsedTree = useMemo(() => {
    if (!manualText.trim()) return []
    try { return parseTextToTree(manualText) } 
    catch { return [] }
  }, [manualText])
  
  const stats = useMemo(() => countNodes(parsedTree), [parsedTree])

  // --- AI PROMPT ---
  const SYSTEM_PROMPT = `Act as a Curriculum Engineer. I will give you a syllabus text. Break it into the smallest possible study topics.

RULES:
1. Every comma-separated concept = separate leaf node.
2. Use "branch" for headings/sections, "leaf" for study topics.
3. Nest properly: Paper > Section > Chapter > Topic (up to 4-5 levels).
4. All leaf nodes must have "status": "locked".
5. Use slugified path-based IDs: "root_section-name_topic-name".
6. Output: Strict JSON array [] only. No markdown, no explanation.

Example output:
[{"id":"root_history","title":"History","type":"branch","children":[{"id":"root_history_ancient-india","title":"Ancient India","type":"branch","children":[{"id":"root_history_ancient-india_indus-valley","title":"Indus Valley Civilization","type":"leaf","status":"locked"}]}]}]

My Syllabus:
[PASTE TEXT HERE]`

  const handleCopy = () => {
    navigator.clipboard.writeText(SYSTEM_PROMPT)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // --- DOWNLOAD LOGIC ---
  const handleDownload = () => {
    try {
      if (parsedTree.length === 0) return

      const blob = new Blob([JSON.stringify(parsedTree, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'syllabus.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setParseStatus('success')
      setTimeout(() => setParseStatus('idle'), 3000)
    } catch (e) {
      console.error(e)
      setParseStatus('error')
    }
  }

  const EXAMPLE_TEXT = `Indian History
  Ancient India
    - Indus Valley Civilization
    - Vedic Period
    - Mauryan Empire
    - Gupta Period
  Medieval India
    - Delhi Sultanate
    - Mughal Empire
    - Bhakti and Sufi Movements
  Modern India
    - British East India Company
    - Indian National Movement
    - Gandhi and Non-Cooperation
    - Independence and Partition

Indian Geography
  Physical Geography
    - Physiographic divisions
    - Drainage systems
    - Climate and monsoons
  Human Geography
    - Population distribution
    - Urbanization trends
    - Migration patterns`

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
                <p className="text-lg text-white/60 leading-relaxed">
                  Taking an exam we don&apos;t have? Paste your syllabus topics and we&apos;ll turn them into a trackable checklist in seconds. Works with any exam.
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
              className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-large"
            >
              {/* Modal Header */}
              <div className="sticky top-0 z-20 flex items-center justify-between bg-gray-900 p-5 sm:p-6 rounded-t-2xl text-white">
                <h3 className="flex items-center gap-2 text-lg font-bold">
                  <Terminal className="text-primary-400" size={20} /> Protocol Architect
                </h3>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                  <X size={22} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 sm:p-8 md:p-10">
                
                {/* Tabs */}
                <div className="flex gap-6 mb-8 border-b border-gray-200">
                   <button 
                     onClick={() => setActiveTab('manual')}
                     className={`pb-4 text-sm font-semibold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'manual' ? 'text-primary-600 border-primary-500' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                   >
                     <Code size={18} /> Quick Paste
                   </button>
                   <button 
                     onClick={() => setActiveTab('ai')}
                     className={`pb-4 text-sm font-semibold flex items-center gap-2 transition-all border-b-2 ${activeTab === 'ai' ? 'text-primary-600 border-primary-500' : 'text-gray-400 border-transparent hover:text-gray-600'}`}
                   >
                     <Bot size={18} /> AI-Powered (ChatGPT)
                   </button>
                </div>

                {activeTab === 'manual' ? (
                  <div className="space-y-6">
                     {/* Instructions */}
                     <div className="bg-primary-50 border border-primary-100 p-4 text-sm text-primary-900 font-medium flex gap-3 rounded-xl">
                        <List size={20} className="shrink-0 text-primary-500 mt-0.5" />
                        <div>
                          <span className="font-bold">How it works:</span> 
                          <p className="mt-1.5 text-primary-800 leading-relaxed">
                            Paste your syllabus with <strong>indentation</strong> to show hierarchy. Section headings at the left, sub-topics indented with spaces/tabs, and individual topics with dashes (-). We auto-detect the structure up to 5 levels deep.
                          </p>
                        </div>
                     </div>

                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* INPUT AREA */}
                        <div>
                          <div className="mb-2 flex justify-between items-end">
                             <label className="text-xs font-semibold text-gray-500">Paste Your Syllabus</label>
                             <div className="flex items-center gap-3">
                                <button 
                                  onClick={() => setManualText(EXAMPLE_TEXT)} 
                                  className="text-[11px] font-semibold text-primary-500 hover:text-primary-700 transition-colors"
                                >
                                  Load example
                                </button>
                                <button 
                                  onClick={() => { setManualText(''); setShowPreview(false) }} 
                                  className="text-[11px] font-semibold text-gray-400 hover:text-danger-500 transition-colors flex items-center gap-1"
                                >
                                  <RotateCcw size={10} /> Clear
                                </button>
                             </div>
                          </div>
                          <textarea 
                            value={manualText}
                            onChange={(e) => { setManualText(e.target.value); setParseStatus('idle') }}
                            placeholder={`Indian History\n  Ancient India\n    - Indus Valley Civilization\n    - Vedic Period\n  Medieval India\n    - Delhi Sultanate\n    - Mughal Empire\n\nGeography\n  - Physiographic divisions\n  - Climate and monsoons`}
                            className="input h-72 font-mono text-[13px] resize-none leading-relaxed"
                            spellCheck={false}
                          />
                          
                          {/* Stats bar */}
                          {manualText.trim() && (
                            <div className="mt-2 flex items-center justify-between">
                              <div className="text-[11px] text-gray-400 font-medium">
                                {stats.branches} sections · {stats.leaves} topics detected
                              </div>
                              <button 
                                onClick={() => setShowPreview(!showPreview)}
                                className="text-[11px] font-semibold text-primary-500 hover:text-primary-700 flex items-center gap-1 transition-colors"
                              >
                                <Eye size={12} /> {showPreview ? 'Hide' : 'Show'} preview
                              </button>
                            </div>
                          )}
                        </div>

                        {/* PREVIEW / ACTION AREA */}
                        <div className="flex flex-col">
                          {showPreview && parsedTree.length > 0 ? (
                            <div className="flex-1">
                              <label className="text-xs font-semibold text-gray-500 mb-2 block">Live Preview</label>
                              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 h-72 overflow-y-auto">
                                {parsedTree.map((node, i) => (
                                  <TreeNode key={node.id || i} node={node} />
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 flex flex-col justify-center space-y-5">
                               <div className="text-sm text-gray-600 leading-relaxed">
                                  <p className="font-semibold text-gray-900 mb-2">Tips for best results:</p>
                                  <ul className="space-y-2 text-gray-500">
                                    <li className="flex items-start gap-2">
                                      <span className="text-primary-500 mt-0.5">→</span>
                                      Use <strong className="text-gray-700">indentation</strong> (spaces or tabs) to show sub-sections
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <span className="text-primary-500 mt-0.5">→</span>
                                      Start individual topics with <strong className="text-gray-700">dashes (-)</strong> or bullets (•)
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <span className="text-primary-500 mt-0.5">→</span>
                                      Numbered headings like <strong className="text-gray-700">&quot;1. History&quot;</strong> are auto-detected as sections
                                    </li>
                                    <li className="flex items-start gap-2">
                                      <span className="text-primary-500 mt-0.5">→</span>
                                      Works with copy-paste from PDFs, websites, or typed notes
                                    </li>
                                  </ul>
                               </div>
                            </div>
                          )}
                           
                          <button 
                            onClick={handleDownload}
                            disabled={parsedTree.length === 0}
                            className="btn btn-primary w-full flex items-center justify-center gap-3 disabled:opacity-30 disabled:cursor-not-allowed mt-4"
                          >
                            {parseStatus === 'success' ? <Check size={18} /> : <Download size={18} />}
                            {parseStatus === 'success' ? 'Downloaded! Upload in Dashboard →' : `Download syllabus.json (${stats.leaves} topics)`}
                          </button>

                          {parseStatus === 'success' && (
                            <motion.p 
                              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                              className="text-center text-xs font-semibold text-success-600 mt-2"
                            >
                              ✓ Go to Dashboard → Syllabus Map → Upload Custom File
                            </motion.p>
                          )}
                        </div>
                     </div>
                  </div>
                ) : (
                  /* AI TAB */
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-sm">1</div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-base">Copy your syllabus text</h4>
                          <p className="text-gray-500 text-sm leading-relaxed mt-1">Open your exam PDF or official website. Select all the topics you want to track and copy them.</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-sm">2</div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-base">Paste into ChatGPT</h4>
                          <p className="text-gray-500 text-sm leading-relaxed mt-1">Copy our prompt (right side), open <a href="https://chat.openai.com" target="_blank" rel="noopener" className="text-primary-600 font-semibold hover:underline">chat.openai.com</a>, paste the prompt, then paste your syllabus where it says [PASTE TEXT HERE].</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-shrink-0 w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center font-bold text-sm">3</div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-base">Save & upload</h4>
                          <p className="text-gray-500 text-sm leading-relaxed mt-1">Copy ChatGPT&apos;s output, save it as <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-semibold text-gray-900">syllabus.json</code>, then upload in your Krama dashboard under Syllabus Map.</p>
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                        <strong>Tip:</strong> The AI method produces better results for complex syllabi with many nested levels. Use Quick Paste for simpler lists.
                      </div>
                    </div>

                    {/* The Prompt Box */}
                    <div className="relative">
                       <div className="absolute -top-3 left-4 bg-primary-500 px-3 py-1 text-xs font-semibold text-white rounded-full shadow-sm z-10">
                         System Prompt
                       </div>
                       <div className="bg-gray-900 border border-gray-700 p-5 pt-8 rounded-xl">
                          <textarea 
                            readOnly
                            value={SYSTEM_PROMPT}
                            className="w-full h-64 bg-transparent text-green-400 font-mono text-[11px] resize-none outline-none leading-relaxed"
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
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
