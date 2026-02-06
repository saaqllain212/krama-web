'use client'

import { FileText, Key, Target, Zap, Upload, Settings } from 'lucide-react'

export default function AIMCQSection() {
  return (
    <section className="relative px-6 py-24 md:px-12 lg:px-16 bg-white overflow-hidden">
      
      {/* Background Decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-primary-100 via-purple-100 to-cyan-100 rounded-full blur-3xl opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-100 to-purple-100 px-4 py-2 rounded-full mb-6">
            <Zap className="w-4 h-4 text-primary-600" />
            <span className="text-xs font-semibold text-primary-700 uppercase tracking-wider">AI-Powered</span>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4 md:text-5xl">
            AI MCQ Generator
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your study material. Get instant practice questions. 
            <br />
            All processing happens <span className="font-semibold text-primary-600">locally on your device</span>.
          </p>
        </div>

        {/* How It Works */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          
          {/* Step 1 */}
          <div className="card text-center group hover:border-primary-300">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow-primary group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">1. Upload PDF</h3>
            <p className="text-gray-600">
              Drop your notes, textbook chapters, or study material. Everything stays on your laptop.
            </p>
          </div>

          {/* Step 2 */}
          <div className="card text-center group hover:border-purple-300">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow-primary group-hover:scale-110 transition-transform">
              <Settings className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">2. Configure</h3>
            <p className="text-gray-600">
              Select your exam type (JEE, NEET, UPSC, etc.) and difficulty level. Use your own Claude/Gemini API key.
            </p>
          </div>

          {/* Step 3 */}
          <div className="card text-center group hover:border-success-300">
            <div className="w-16 h-16 bg-gradient-to-br from-success-400 to-success-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow-success group-hover:scale-110 transition-transform">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">3. Practice</h3>
            <p className="text-gray-600">
              Get AI-generated MCQs tailored to your material. Practice, track scores, improve.
            </p>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="card bg-gradient-to-br from-gray-50 to-white max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            
            {/* Left: Key Features */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Why It's Different</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-success-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FileText className="w-4 h-4 text-success-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Local Processing</p>
                    <p className="text-sm text-gray-600">Your PDFs never leave your device. Total privacy.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Key className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Your Own API Key</p>
                    <p className="text-sm text-gray-600">Bring your Claude or Gemini key. You're in control.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Target className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Exam-Specific</p>
                    <p className="text-sm text-gray-600">Questions tailored for JEE, NEET, UPSC, SSC, Banking exams.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Coming Soon Badge */}
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-purple-500 px-6 py-3 rounded-full mb-4 shadow-lg">
                  <Zap className="w-5 h-5 text-white" />
                  <span className="text-sm font-bold text-white uppercase tracking-wider">Launching Soon</span>
                </div>
                <p className="text-sm text-gray-600 max-w-xs mx-auto">
                  Currently in beta testing with select students. Join the waitlist to get early access!
                </p>
                <button className="btn btn-secondary mt-6">
                  Join Waitlist
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Note */}
        <div className="mt-12 text-center">
          <p className="text-xs text-gray-500 max-w-2xl mx-auto">
            <span className="font-semibold">Privacy First:</span> We don't store your PDFs or generated questions. 
            Everything runs in your browser using your own API credentials. Zero data collection.
          </p>
        </div>
      </div>
    </section>
  )
}