'use client'

import { Sparkles, Upload, Key, Target, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AIMCQBanner() {
  const router = useRouter()
  
  return (
    <div className="card bg-gradient-to-br from-primary-500 to-purple-600 text-white border-none shadow-large hover:shadow-glow-primary transition-all">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        {/* Left: Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold">AI MCQ Generator</h3>
          </div>
          
          <p className="text-white/90 mb-4 max-w-xl">
            Upload your study PDFs and generate unlimited practice questions with your own Gemini or Claude API key. 
            <span className="font-semibold"> All processing happens locally on your device.</span>
          </p>

          {/* Features */}
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4 text-white/80" />
              <span className="text-white/90">Local PDF Upload</span>
            </div>
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-white/80" />
              <span className="text-white/90">Free Gemini API</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-white/80" />
              <span className="text-white/90">SSC/UPSC/NEET Patterns</span>
            </div>
          </div>
        </div>

        {/* Right: CTA */}
        <div className="flex flex-col items-center md:items-end gap-3">
          <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-2">
            <span className="text-sm font-bold uppercase tracking-wider">Now Live!</span>
          </div>
          
          <button 
            onClick={() => router.push('/dashboard/mcq')}
            className="btn bg-white text-primary-600 hover:bg-gray-50 flex items-center gap-2 shadow-large"
          >
            Generate MCQs
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <p className="text-xs text-white/70">
            Unlimited questions • LocalStorage • Privacy-first
          </p>
        </div>
      </div>
    </div>
  )
}