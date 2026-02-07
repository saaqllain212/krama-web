'use client'

import { useState } from 'react'
import { Sparkles, Loader2, AlertCircle, Settings2, Info } from 'lucide-react'
import PDFUploader from './PDFUploader'
import { getCurrentAPIConfig } from './APIKeyManager'
import { generateMCQs, estimateCost, type MCQGenerationOptions } from '@/lib/mcq/apiClient'
import { saveMCQSet, type MCQSet } from '@/lib/mcq/localStorage'
import { createClient } from '@/lib/supabase/client'
import { type PDFExtractionResult } from '@/lib/mcq/pdfExtractor'

// Exam pattern options
const EXAM_PATTERNS = [
  'SSC (Staff Selection)',
  'UPSC (Civil Services)',
  'NEET (Medical)',
  'JEE (Engineering)',
  'Banking Exams (SBI, IBPS, RBI)',
  'Railway (RRB)',
  'State PSC',
  'General/Academic'
]

interface MCQGeneratorProps {
  onComplete: (mcqSet: MCQSet) => void
}

export default function MCQGenerator({ onComplete }: MCQGeneratorProps) {
  const supabase = createClient()
  
  // PDF state
  const [pdfResult, setPdfResult] = useState<PDFExtractionResult | null>(null)
  
  // Form state
  const [title, setTitle] = useState('')
  const [examPattern, setExamPattern] = useState('SSC (Staff Selection)')
  const [customPattern, setCustomPattern] = useState('')
  const [useCustomPattern, setUseCustomPattern] = useState(false)
  const [numQuestions, setNumQuestions] = useState(10)
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('medium')
  
  // Generation state
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Handle PDF extraction
  const handlePDFExtracted = (result: PDFExtractionResult) => {
    setPdfResult(result)
    setError(null)
    
    // Auto-generate title from PDF name
    if (result.fileName && !title) {
      const cleanName = result.fileName
        .replace('.pdf', '')
        .replace(/[_-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
      setTitle(cleanName.substring(0, 50))
    }
  }
  
  // Generate MCQs
  const handleGenerate = async () => {
    // Validate inputs
    if (!pdfResult || !pdfResult.success) {
      setError('Please upload and extract a PDF first')
      return
    }
    
    if (!title.trim()) {
      setError('Please enter a title for this MCQ set')
      return
    }
    
    // Get API config
    const apiConfig = getCurrentAPIConfig()
    if (!apiConfig) {
      setError('Please configure your API key first')
      return
    }
    
    setGenerating(true)
    setError(null)
    
    try {
      // Prepare generation options
      const finalPattern = useCustomPattern && customPattern.trim() 
        ? customPattern.trim() 
        : examPattern
      
      const options: MCQGenerationOptions = {
        text: pdfResult.text,
        examPattern: finalPattern,
        numQuestions,
        difficulty,
        apiProvider: apiConfig.provider,
        apiKey: apiConfig.apiKey,
        modelName: apiConfig.modelName
      }
      
      // Generate MCQs
      const result = await generateMCQs(options)
      
      if (!result.success || result.questions.length === 0) {
        throw new Error(result.error || 'Failed to generate questions')
      }
      
      // Create MCQ set
      const mcqSet: MCQSet = {
        id: crypto.randomUUID(),
        title: title.trim(),
        examPattern: finalPattern,
        pdfName: pdfResult.fileName,
        difficulty,
        questions: result.questions,
        createdAt: new Date().toISOString()
      }
      
      // Save to LocalStorage
      const saved = saveMCQSet(mcqSet)
      if (!saved) {
        throw new Error('Failed to save MCQ set to local storage')
      }
      
      // Save metadata to Supabase
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('mcq_metadata').insert({
          user_id: user.id,
          title: mcqSet.title,
          exam_pattern: mcqSet.examPattern,
          pdf_filename: mcqSet.pdfName,
          question_count: mcqSet.questions.length,
          difficulty: mcqSet.difficulty
        })
        
        // Update user stats
        await supabase.rpc('increment', {
          table_name: 'user_mcq_settings',
          column_name: 'total_mcqs_generated',
          user_id: user.id
        }).catch(() => {
          // Create settings if doesn't exist
          supabase.from('user_mcq_settings').upsert({
            user_id: user.id,
            total_mcqs_generated: 1
          })
        })
      }
      
      // Success!
      onComplete(mcqSet)
      
    } catch (err) {
      console.error('Generation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate MCQs')
    } finally {
      setGenerating(false)
    }
  }
  
  // Get API config for cost estimation
  const apiConfig = getCurrentAPIConfig()
  const costEstimate = apiConfig 
    ? estimateCost(apiConfig.provider, numQuestions, pdfResult?.text.length || 0)
    : null
  
  return (
    <div className="space-y-6">
      {/* Step 1: Upload PDF */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold">
            1
          </div>
          <h3 className="text-lg font-semibold">Upload Study Material</h3>
        </div>
        
        <PDFUploader onTextExtracted={handlePDFExtracted} />
      </div>
      
      {/* Step 2: Configure Questions */}
      {pdfResult?.success && (
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center text-sm font-bold">
              2
            </div>
            <h3 className="text-lg font-semibold">Configure Questions</h3>
          </div>
          
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2">
                MCQ Set Title <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input w-full"
                placeholder="e.g., Ancient History - Stone Age Questions"
                maxLength={100}
              />
              <p className="text-xs text-text-tertiary mt-1">
                Give a descriptive title to find it later
              </p>
            </div>
            
            {/* Exam Pattern */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Exam Pattern
              </label>
              <select
                value={useCustomPattern ? 'custom' : examPattern}
                onChange={(e) => {
                  if (e.target.value === 'custom') {
                    setUseCustomPattern(true)
                  } else {
                    setUseCustomPattern(false)
                    setExamPattern(e.target.value)
                  }
                }}
                className="input w-full"
              >
                {EXAM_PATTERNS.map(pattern => (
                  <option key={pattern} value={pattern}>{pattern}</option>
                ))}
                <option value="custom">✏️ Custom Exam Type...</option>
              </select>
              
              {/* Custom Pattern Input */}
              {useCustomPattern && (
                <input
                  type="text"
                  value={customPattern}
                  onChange={(e) => setCustomPattern(e.target.value)}
                  className="input w-full mt-2"
                  placeholder="e.g., Bihar PSC, GATE, CAT, NDA..."
                  maxLength={50}
                />
              )}
              
              <p className="text-xs text-text-tertiary mt-1">
                AI will adapt question style to match this exam pattern
              </p>
            </div>
            
            {/* Number of Questions & Difficulty */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Number of Questions
                </label>
                <input
                  type="number"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Math.max(1, Math.min(100, parseInt(e.target.value) || 10)))}
                  className="input w-full"
                  min={1}
                  max={100}
                />
                <p className="text-xs text-text-tertiary mt-1">
                  Recommended: 10-20 for focused practice
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">
                  Difficulty Level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as any)}
                  className="input w-full"
                >
                  <option value="easy">Easy - Basic Recall</option>
                  <option value="medium">Medium - Conceptual</option>
                  <option value="hard">Hard - Analytical</option>
                  <option value="mixed">Mixed - All Levels</option>
                </select>
              </div>
            </div>
            
            {/* Cost Estimate */}
            {costEstimate && (
              <div className="p-4 bg-background-secondary rounded-lg">
                <div className="flex items-start gap-2">
                  <Info className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-1">Cost Estimate:</p>
                    <p className="text-sm text-text-secondary">
                      {costEstimate.note}
                      {costEstimate.estimatedCost > 0 && (
                        <span className="font-mono ml-2">
                          ~{costEstimate.currency} ${costEstimate.estimatedCost.toFixed(4)}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Error Display */}
      {error && (
        <div className="flex items-start gap-2 p-4 bg-danger-500/10 border border-danger-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-danger-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-danger-500">Generation Failed</p>
            <p className="text-sm text-text-secondary mt-1">{error}</p>
          </div>
        </div>
      )}
      
      {/* Generate Button */}
      {pdfResult?.success && (
        <button
          onClick={handleGenerate}
          disabled={generating || !title.trim() || (!apiConfig)}
          className="btn-primary btn-lg w-full flex items-center justify-center gap-2"
        >
          {generating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating {numQuestions} questions...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate MCQs
            </>
          )}
        </button>
      )}
    </div>
  )
}