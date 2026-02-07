'use client'

import { useState } from 'react'
import { Play, Trash2, Download, Search, Filter, Calendar, Target } from 'lucide-react'
import { 
  type MCQSet,
  deleteMCQSet,
  downloadExport,
  searchMCQSets,
  filterByExamPattern,
  filterByDifficulty
} from '@/lib/mcq/localStorage'
import { format } from 'date-fns'

interface MCQHistoryProps {
  mcqSets: MCQSet[]
  onViewSet: (set: MCQSet) => void
  onRefresh: () => void
}

export default function MCQHistory({ mcqSets, onViewSet, onRefresh }: MCQHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPattern, setSelectedPattern] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')
  
  // Get unique exam patterns
  const uniquePatterns = Array.from(new Set(mcqSets.map(s => s.examPattern)))
  
  // Filter sets
  let filteredSets = mcqSets
  
  if (searchQuery.trim()) {
    filteredSets = searchMCQSets(searchQuery)
  }
  
  if (selectedPattern !== 'all') {
    filteredSets = filteredSets.filter(s => s.examPattern === selectedPattern)
  }
  
  if (selectedDifficulty !== 'all') {
    filteredSets = filteredSets.filter(s => s.difficulty === selectedDifficulty)
  }
  
  // Handle delete
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this MCQ set?')) {
      deleteMCQSet(id)
      onRefresh()
    }
  }
  
  if (mcqSets.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="w-16 h-16 bg-background-secondary rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-text-tertiary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No MCQ Sets Yet</h3>
        <p className="text-text-secondary mb-6">
          Generate your first MCQ set to start practicing
        </p>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="card">
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-2xl font-bold gradient-text mb-1">
              {mcqSets.length}
            </div>
            <div className="text-sm text-text-secondary">Total Sets</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold gradient-text mb-1">
              {mcqSets.reduce((sum, set) => sum + set.questions.length, 0)}
            </div>
            <div className="text-sm text-text-secondary">Total Questions</div>
          </div>
          
          <div>
            <div className="text-2xl font-bold gradient-text mb-1">
              {uniquePatterns.length}
            </div>
            <div className="text-sm text-text-secondary">Exam Patterns</div>
          </div>
        </div>
      </div>
      
      {/* Search and Filters */}
      <div className="card">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input w-full pl-10"
                placeholder="Search by title or exam pattern..."
              />
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={selectedPattern}
              onChange={(e) => setSelectedPattern(e.target.value)}
              className="input min-w-[200px]"
            >
              <option value="all">All Patterns</option>
              {uniquePatterns.map(pattern => (
                <option key={pattern} value={pattern}>{pattern}</option>
              ))}
            </select>
            
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="input"
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
              <option value="mixed">Mixed</option>
            </select>
          </div>
          
          {/* Export All */}
          <button
            onClick={downloadExport}
            className="btn-secondary flex items-center gap-2 whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            Export All
          </button>
        </div>
        
        {filteredSets.length < mcqSets.length && (
          <div className="mt-4 text-sm text-text-secondary">
            Showing {filteredSets.length} of {mcqSets.length} sets
          </div>
        )}
      </div>
      
      {/* MCQ Sets List */}
      <div className="grid gap-4">
        {filteredSets.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-text-secondary">No MCQ sets match your filters</p>
          </div>
        ) : (
          filteredSets.map(set => (
            <div key={set.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-2">{set.title}</h3>
                  
                  <div className="flex flex-wrap gap-3 mb-3">
                    <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                      <Target className="w-4 h-4" />
                      <span>{set.examPattern}</span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-sm text-text-secondary">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(set.createdAt), 'MMM d, yyyy')}</span>
                    </div>
                    
                    <div className="px-2 py-0.5 bg-primary-500/10 text-primary-500 rounded text-xs font-medium">
                      {set.questions.length} questions
                    </div>
                    
                    <div className={`px-2 py-0.5 rounded text-xs font-medium ${
                      set.difficulty === 'easy' ? 'bg-success-500/10 text-success-500' :
                      set.difficulty === 'medium' ? 'bg-warning-500/10 text-warning-500' :
                      set.difficulty === 'hard' ? 'bg-danger-500/10 text-danger-500' :
                      'bg-background-tertiary text-text-secondary'
                    }`}>
                      {set.difficulty}
                    </div>
                  </div>
                  
                  {set.pdfName && (
                    <p className="text-sm text-text-tertiary">
                      From: {set.pdfName}
                    </p>
                  )}
                </div>
                
                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onViewSet(set)}
                    className="btn-primary btn-sm flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Start Quiz
                  </button>
                  
                  <button
                    onClick={() => handleDelete(set.id)}
                    className="btn-ghost btn-sm p-2 text-danger-500 hover:bg-danger-500/10"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}