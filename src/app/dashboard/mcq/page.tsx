'use client'
import FeatureGate from '@/components/dashboard/FeatureGate'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, ArrowLeft, AlertCircle, CheckCircle2, Download, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { 
  getAllMCQSets, 
  getStorageStats, 
  downloadExport,
  type MCQSet,
  type StorageStats 
} from '@/lib/mcq/localStorage'

// Import MCQ components
import PDFUploader from '@/components/mcq/PDFUploader'
import APIKeyManager from '@/components/mcq/APIKeyManager'
import MCQGenerator from '@/components/mcq/MCQGenerator'
import QuizInterface from '@/components/mcq/QuizInterface'
import MCQHistory from '@/components/mcq/MCQHistory'
import StorageMonitor from '@/components/mcq/StorageMonitor'

type ViewMode = 'welcome' | 'generate' | 'quiz' | 'history'

export default function MCQPage() {
  return (
    <FeatureGate flag="feature_mcq_enabled" featureName="AI MCQ Generator">
      <MCQPageInner />
    </FeatureGate>
  )
}

function MCQPageInner() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  
  // User state
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('welcome')
  const [selectedMCQSet, setSelectedMCQSet] = useState<MCQSet | null>(null)
  
  // Storage state
  const [storageStats, setStorageStats] = useState<StorageStats | null>(null)
  const [mcqSets, setMCQSets] = useState<MCQSet[]>([])
  
  // Load user and check access
  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }
      
      setUser(user)
      setLoading(false)
      
      // Load storage stats
      refreshStorage()
    }
    
    loadUser()
  }, [])
  
  // Refresh storage stats and MCQ list
  const refreshStorage = () => {
    const stats = getStorageStats()
    const sets = getAllMCQSets()
    
    setStorageStats(stats)
    setMCQSets(sets)
  }
  
  // Handle MCQ generation complete
  const handleGenerationComplete = (newSet: MCQSet) => {
    refreshStorage()
    setSelectedMCQSet(newSet)
    setViewMode('quiz')
  }
  
  // Handle quiz complete
  const handleQuizComplete = () => {
    refreshStorage()
    setViewMode('history')
  }
  
  // Handle view MCQ set from history
  const handleViewMCQSet = (set: MCQSet) => {
    setSelectedMCQSet(set)
    setViewMode('quiz')
  }
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary-500 mx-auto mb-4 animate-pulse" />
          <p className="text-text-secondary">Loading MCQ Generator...</p>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-background-primary">
      <div className="container-custom py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-4xl font-bold gradient-text">AI MCQ Generator</h1>
              </div>
              <p className="text-text-secondary">
                Generate unlimited practice questions from your study materials
              </p>
            </div>
            
            {/* Storage Monitor */}
            {storageStats && (
              <StorageMonitor stats={storageStats} onRefresh={refreshStorage} />
            )}
          </div>
        </div>
        
        {/* Important Notice Banner */}
        <div className="card bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20 mb-8">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-500 mb-2">Important: Local Storage Only</h3>
              <p className="text-sm text-text-secondary mb-3">
                Your MCQ sets are stored locally in your browser (not in cloud). 
                This means:
              </p>
              <ul className="text-sm text-text-secondary space-y-1 mb-3">
                <li>• Questions are saved on this device only</li>
                <li>• Data won't sync across devices</li>
                <li>• Clearing browser data will delete your MCQs</li>
                <li>• Maximum 50 recent sets kept automatically</li>
              </ul>
              <button
                onClick={downloadExport}
                className="btn-secondary btn-sm flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export Backup (Recommended!)
              </button>
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          <button
            onClick={() => setViewMode('welcome')}
            className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              viewMode === 'welcome'
                ? 'bg-primary-500 text-white'
                : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
            }`}
          >
            Getting Started
          </button>
          <button
            onClick={() => setViewMode('generate')}
            className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              viewMode === 'generate'
                ? 'bg-primary-500 text-white'
                : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Generate MCQs
          </button>
          <button
            onClick={() => setViewMode('history')}
            className={`px-6 py-3 rounded-lg font-medium transition-all whitespace-nowrap ${
              viewMode === 'history'
                ? 'bg-primary-500 text-white'
                : 'bg-background-secondary text-text-secondary hover:bg-background-tertiary'
            }`}
          >
            My MCQs ({mcqSets.length})
          </button>
        </div>
        
        {/* Content Area */}
        <div className="space-y-8">
          {/* Welcome View */}
          {viewMode === 'welcome' && (
            <WelcomeView onStart={() => setViewMode('generate')} />
          )}
          
          {/* Generate View */}
          {viewMode === 'generate' && (
            <div className="space-y-6">
              <APIKeyManager />
              <MCQGenerator onComplete={handleGenerationComplete} />
            </div>
          )}
          
          {/* Quiz View */}
          {viewMode === 'quiz' && selectedMCQSet && (
            <QuizInterface 
              mcqSet={selectedMCQSet} 
              onComplete={handleQuizComplete}
              onBack={() => setViewMode('history')}
            />
          )}
          
          {/* History View */}
          {viewMode === 'history' && (
            <MCQHistory 
              mcqSets={mcqSets}
              onViewSet={handleViewMCQSet}
              onRefresh={refreshStorage}
            />
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// WELCOME VIEW COMPONENT
// ============================================

function WelcomeView({ onStart }: { onStart: () => void }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="card">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Welcome to AI MCQ Generator</h2>
          <p className="text-text-secondary text-lg">
            Transform your study PDFs into unlimited practice questions in seconds
          </p>
        </div>
        
        {/* How It Works */}
        <div className="space-y-6 mb-8">
          <h3 className="text-xl font-semibold">How It Works (4 Simple Steps):</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-500 font-bold">1</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Get Your API Key</h4>
                <p className="text-sm text-text-secondary">
                  Sign up for free Gemini API (2 minutes). No credit card needed. 
                  Free tier: ~250-1000 requests per day!
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-500 font-bold">2</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Upload Your PDF</h4>
                <p className="text-sm text-text-secondary">
                  Drag and drop your study material. Works with text-based PDFs 
                  (90% of PDFs work instantly!)
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-500 font-bold">3</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Choose Exam Pattern</h4>
                <p className="text-sm text-text-secondary">
                  Select SSC, UPSC, NEET, JEE, Banking, or any custom exam. 
                  AI adapts the question style automatically!
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary-500 font-bold">4</span>
              </div>
              <div>
                <h4 className="font-semibold mb-1">Practice & Track</h4>
                <p className="text-sm text-text-secondary">
                  Take the quiz, get instant feedback with explanations, 
                  and track your progress over time.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Features */}
        <div className="bg-background-secondary rounded-lg p-6 mb-8">
          <h3 className="font-semibold mb-4">What You Get:</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              'Unlimited question generation',
              'Exam-specific patterns (SSC, UPSC, etc.)',
              'Instant feedback & explanations',
              'Difficulty levels (Easy to Hard)',
              'Local storage (privacy-first)',
              'Export/import for backup',
              'No monthly subscriptions',
              'Works on your device'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success-500 flex-shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* CTA */}
        <div className="text-center">
          <button
            onClick={onStart}
            className="btn-primary btn-lg"
          >
            Get Started Now
          </button>
          <p className="text-sm text-text-secondary mt-3">
            No credit card required • Free Gemini API tier • Privacy-first
          </p>
        </div>
      </div>
    </div>
  )
}