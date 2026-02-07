'use client'

import { useState } from 'react'
import { ArrowLeft, ChevronRight, ChevronLeft, Check, X, AlertCircle, Trophy, Target, Clock } from 'lucide-react'
import { type MCQSet } from '@/lib/mcq/localStorage'
import { createClient } from '@/lib/supabase/client'

interface QuizInterfaceProps {
  mcqSet: MCQSet
  onComplete: () => void
  onBack: () => void
}

interface Answer {
  questionIndex: number
  selectedOption: number
  isCorrect: boolean
}

export default function QuizInterface({ mcqSet, onComplete, onBack }: QuizInterfaceProps) {
  const supabase = createClient()
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [startTime] = useState(Date.now())
  
  const currentQuestion = mcqSet.questions[currentQuestionIndex]
  const totalQuestions = mcqSet.questions.length
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1
  
  // Get existing answer for current question
  const existingAnswer = answers.find(a => a.questionIndex === currentQuestionIndex)
  
  // Handle option selection
  const handleSelectOption = (optionIndex: number) => {
    if (showResult) return // Can't change after showing result
    setSelectedOption(optionIndex)
  }
  
  // Submit answer for current question
  const handleSubmitAnswer = () => {
    if (selectedOption === null) return
    
    const isCorrect = selectedOption === currentQuestion.correctAnswer
    
    // Save answer
    const newAnswer: Answer = {
      questionIndex: currentQuestionIndex,
      selectedOption,
      isCorrect
    }
    
    setAnswers(prev => {
      const filtered = prev.filter(a => a.questionIndex !== currentQuestionIndex)
      return [...filtered, newAnswer]
    })
    
    setShowResult(true)
  }
  
  // Move to next question
  const handleNext = () => {
    if (isLastQuestion) {
      // Quiz complete
      handleCompleteQuiz()
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
      setSelectedOption(null)
      setShowResult(false)
    }
  }
  
  // Move to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
      
      // Load previous answer if exists
      const prevAnswer = answers.find(a => a.questionIndex === currentQuestionIndex - 1)
      if (prevAnswer) {
        setSelectedOption(prevAnswer.selectedOption)
        setShowResult(true)
      } else {
        setSelectedOption(null)
        setShowResult(false)
      }
    }
  }
  
  // Complete quiz
  const handleCompleteQuiz = async () => {
    const correctCount = answers.filter(a => a.isCorrect).length
    const percentage = (correctCount / totalQuestions) * 100
    const timeTaken = Math.floor((Date.now() - startTime) / 1000)
    
    setQuizCompleted(true)
    
    // Save attempt to Supabase
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('mcq_attempts').insert({
        user_id: user.id,
        exam_pattern: mcqSet.examPattern,
        total_questions: totalQuestions,
        correct_answers: correctCount,
        score_percentage: percentage,
        time_taken_seconds: timeTaken,
        xp_earned: Math.floor(correctCount * 5) // 5 XP per correct answer
      })
      
      // Update total quizzes taken
      await supabase.from('user_mcq_settings')
        .upsert({
          user_id: user.id,
          total_quizzes_taken: 1
        }, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        })
    }
  }
  
  // Calculate progress
  const answeredCount = answers.length
  const progress = (answeredCount / totalQuestions) * 100
  
  if (quizCompleted) {
    const correctCount = answers.filter(a => a.isCorrect).length
    const percentage = (correctCount / totalQuestions) * 100
    const timeTaken = Math.floor((Date.now() - startTime) / 1000)
    const minutes = Math.floor(timeTaken / 60)
    const seconds = timeTaken % 60
    
    return (
      <div className="max-w-3xl mx-auto">
        <div className="card">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Quiz Complete!</h2>
            <p className="text-text-secondary">
              {mcqSet.title}
            </p>
          </div>
          
          {/* Score Card */}
          <div className="bg-gradient-to-r from-primary-500/10 to-purple-600/10 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text mb-1">
                  {correctCount}/{totalQuestions}
                </div>
                <div className="text-sm text-text-secondary">Correct Answers</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text mb-1">
                  {percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-text-secondary">Score</div>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text mb-1">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-text-secondary">Time Taken</div>
              </div>
            </div>
          </div>
          
          {/* Performance Message */}
          <div className={`p-4 rounded-lg mb-6 ${
            percentage >= 80 ? 'bg-success-500/10 border border-success-500/20' :
            percentage >= 60 ? 'bg-warning-500/10 border border-warning-500/20' :
            'bg-danger-500/10 border border-danger-500/20'
          }`}>
            <p className="text-center font-medium">
              {percentage >= 80 ? '🎉 Excellent work! Keep it up!' :
               percentage >= 60 ? '👍 Good effort! Review the mistakes and try again.' :
               '💪 Don\'t give up! Practice makes perfect.'}
            </p>
          </div>
          
          {/* Detailed Results */}
          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-lg">Detailed Results:</h3>
            
            {mcqSet.questions.map((question, index) => {
              const answer = answers.find(a => a.questionIndex === index)
              const isCorrect = answer?.isCorrect
              
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    isCorrect
                      ? 'border-success-500/20 bg-success-500/5'
                      : 'border-danger-500/20 bg-danger-500/5'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isCorrect ? 'bg-success-500' : 'bg-danger-500'
                    }`}>
                      {isCorrect ? (
                        <Check className="w-4 h-4 text-white" />
                      ) : (
                        <X className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium mb-2">
                        Q{index + 1}: {question.question}
                      </p>
                      
                      {/* Show options */}
                      <div className="space-y-2 mb-3">
                        {question.options.map((option, optIndex) => (
                          <div
                            key={optIndex}
                            className={`p-2 rounded text-sm ${
                              optIndex === question.correctAnswer
                                ? 'bg-success-500/10 border border-success-500/20 font-medium'
                                : optIndex === answer?.selectedOption && !isCorrect
                                ? 'bg-danger-500/10 border border-danger-500/20'
                                : 'bg-background-secondary'
                            }`}
                          >
                            <span className="font-medium mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                            {option}
                            {optIndex === question.correctAnswer && (
                              <span className="ml-2 text-success-500">✓ Correct</span>
                            )}
                            {optIndex === answer?.selectedOption && !isCorrect && (
                              <span className="ml-2 text-danger-500">✗ Your answer</span>
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Explanation */}
                      <div className="p-3 bg-background-secondary rounded">
                        <p className="text-sm">
                          <span className="font-medium">Explanation: </span>
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onBack}
              className="btn-secondary flex-1"
            >
              Back to My MCQs
            </button>
            <button
              onClick={onComplete}
              className="btn-primary flex-1"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-primary-500" />
              <span>
                {answeredCount}/{totalQuestions} answered
              </span>
            </div>
          </div>
        </div>
        
        <h2 className="text-xl font-bold mb-2">{mcqSet.title}</h2>
        <p className="text-sm text-text-secondary mb-4">
          {mcqSet.examPattern} • {mcqSet.difficulty}
        </p>
        
        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-text-secondary mb-2">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-background-tertiary rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Question Card */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="px-3 py-1 bg-primary-500/10 text-primary-500 rounded-full text-sm font-medium">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </div>
          
          {showResult && (
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              selectedOption === currentQuestion.correctAnswer
                ? 'bg-success-500/10 text-success-500'
                : 'bg-danger-500/10 text-danger-500'
            }`}>
              {selectedOption === currentQuestion.correctAnswer ? 'Correct!' : 'Incorrect'}
            </div>
          )}
        </div>
        
        <h3 className="text-lg font-semibold mb-6">
          {currentQuestion.question}
        </h3>
        
        {/* Options */}
        <div className="space-y-3 mb-6">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedOption === index
            const isCorrect = index === currentQuestion.correctAnswer
            const showAsCorrect = showResult && isCorrect
            const showAsWrong = showResult && isSelected && !isCorrect
            
            return (
              <button
                key={index}
                onClick={() => handleSelectOption(index)}
                disabled={showResult}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  showAsCorrect
                    ? 'border-success-500 bg-success-500/10'
                    : showAsWrong
                    ? 'border-danger-500 bg-danger-500/10'
                    : isSelected
                    ? 'border-primary-500 bg-primary-500/5'
                    : 'border-border-primary hover:border-border-secondary bg-background-secondary'
                } ${showResult ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium flex-shrink-0 ${
                    showAsCorrect
                      ? 'bg-success-500 text-white'
                      : showAsWrong
                      ? 'bg-danger-500 text-white'
                      : isSelected
                      ? 'bg-primary-500 text-white'
                      : 'bg-background-tertiary text-text-secondary'
                  }`}>
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span className="flex-1">{option}</span>
                  
                  {showAsCorrect && (
                    <Check className="w-5 h-5 text-success-500" />
                  )}
                  {showAsWrong && (
                    <X className="w-5 h-5 text-danger-500" />
                  )}
                </div>
              </button>
            )
          })}
        </div>
        
        {/* Explanation (shown after answer) */}
        {showResult && (
          <div className="p-4 bg-primary-500/5 border border-primary-500/20 rounded-lg mb-6">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Explanation:
            </h4>
            <p className="text-sm text-text-secondary">
              {currentQuestion.explanation}
            </p>
          </div>
        )}
        
        {/* Navigation */}
        <div className="flex gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          
          {!showResult ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedOption === null}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}