'use client'

import { useMemo } from 'react'
import { Brain, TrendingUp, TrendingDown, Minus } from 'lucide-react'

type MockLogEntry = {
  d: string
  s: number
  m: number
}

type PredictedScoreCardProps = {
  logs: MockLogEntry[]
}

export default function PredictedScoreCard({ logs }: PredictedScoreCardProps) {
  const prediction = useMemo(() => {
    if (logs.length < 3) return null
    
    // Get last 10 scores (or all if less than 10)
    const recentLogs = logs.slice(-10)
    const scores = recentLogs.map(l => Math.round((l.s / l.m) * 100))
    
    // Simple Linear Regression
    // y = mx + b (where x is test number, y is score)
    const n = scores.length
    const sumX = (n * (n + 1)) / 2 // 1 + 2 + 3 + ... + n
    const sumY = scores.reduce((a, b) => a + b, 0)
    const sumXY = scores.reduce((sum, y, i) => sum + (i + 1) * y, 0)
    const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6 // 1² + 2² + 3² + ... + n²
    
    // Calculate slope (trend)
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
    
    // Predict next score (n + 1)
    const predictedScore = Math.round(slope * (n + 1) + intercept)
    
    // Calculate confidence (based on R²)
    const yMean = sumY / n
    const ssTotal = scores.reduce((sum, y) => sum + Math.pow(y - yMean, 2), 0)
    const ssPredicted = scores.reduce((sum, y, i) => {
      const predicted = slope * (i + 1) + intercept
      return sum + Math.pow(y - predicted, 2)
    }, 0)
    const rSquared = 1 - (ssPredicted / ssTotal)
    const confidence = Math.max(0, Math.min(100, Math.round(rSquared * 100)))
    
    // Determine trend
    const currentScore = scores[scores.length - 1]
    const change = predictedScore - currentScore
    let trend: 'up' | 'down' | 'stable' = 'stable'
    if (change > 2) trend = 'up'
    else if (change < -2) trend = 'down'
    
    // Cap prediction between 0-100
    const cappedPrediction = Math.max(0, Math.min(100, predictedScore))
    
    return {
      predictedScore: cappedPrediction,
      currentScore,
      change,
      trend,
      confidence,
      sampleSize: n
    }
  }, [logs])
  
  if (!prediction) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="h-[200px] flex flex-col items-center justify-center text-center">
          <Brain size={32} className="text-gray-300 mb-2" />
          <div className="text-sm text-gray-400 font-medium">
            Need 3+ tests to predict
          </div>
        </div>
      </div>
    )
  }
  
  const getTrendColor = () => {
    if (prediction.trend === 'up') return 'from-green-500 to-emerald-600'
    if (prediction.trend === 'down') return 'from-red-500 to-rose-600'
    return 'from-blue-500 to-cyan-600'
  }
  
  const getTrendIcon = () => {
    if (prediction.trend === 'up') return <TrendingUp size={20} className="text-white" />
    if (prediction.trend === 'down') return <TrendingDown size={20} className="text-white" />
    return <Minus size={20} className="text-white" />
  }
  
  const getTrendMessage = () => {
    if (prediction.trend === 'up') return 'Upward trajectory! Keep pushing.'
    if (prediction.trend === 'down') return 'Downward trend. Review mistakes.'
    return 'Stable performance. Stay consistent.'
  }
  
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-2 bg-gradient-to-br ${getTrendColor()} rounded-lg`}>
          <Brain className="text-white" size={20} />
        </div>
        <div>
          <h3 className="font-bold text-gray-900">Predicted Next Score</h3>
          <p className="text-xs text-gray-500">AI-free math prediction</p>
        </div>
      </div>
      
      {/* Main Prediction */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center gap-3 mb-3">
          <div className={`p-3 bg-gradient-to-br ${getTrendColor()} rounded-xl`}>
            {getTrendIcon()}
          </div>
          <div className="text-6xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {prediction.predictedScore}%
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Current: {prediction.currentScore}% 
          <span className={`ml-2 font-bold ${
            prediction.change > 0 ? 'text-green-600' : prediction.change < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {prediction.change > 0 ? '+' : ''}{prediction.change}%
          </span>
        </div>
      </div>
      
      {/* Confidence Meter */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-semibold text-gray-600 mb-2">
          <span>Confidence</span>
          <span>{prediction.confidence}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div 
            className={`h-full bg-gradient-to-r ${getTrendColor()} transition-all duration-500`}
            style={{ width: `${prediction.confidence}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Based on last {prediction.sampleSize} tests
        </p>
      </div>
      
      {/* Advice */}
      <div className={`p-3 rounded-lg text-xs bg-gradient-to-r ${
        prediction.trend === 'up' 
          ? 'from-green-50 to-emerald-50 border border-green-200 text-green-900'
          : prediction.trend === 'down'
            ? 'from-red-50 to-rose-50 border border-red-200 text-red-900'
            : 'from-blue-50 to-cyan-50 border border-blue-200 text-blue-900'
      }`}>
        <span className="font-bold">📊 Analysis:</span> {getTrendMessage()}
      </div>
      
      {/* How it works */}
      <details className="mt-4 text-xs text-gray-500">
        <summary className="cursor-pointer font-semibold hover:text-gray-700">
          How this works
        </summary>
        <p className="mt-2 leading-relaxed">
          Uses linear regression on your last {prediction.sampleSize} tests to detect trends and project your next score. 
          No AI needed—just pure mathematics! Higher confidence means more consistent performance.
        </p>
      </details>
    </div>
  )
}