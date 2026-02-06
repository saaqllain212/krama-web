'use client'

interface WeekHeatmapProps {
  weekData: number[] // Array of 7 numbers (minutes per day)
  goalMinutes?: number
}

export default function WeekHeatmap({ weekData, goalMinutes = 360 }: WeekHeatmapProps) {
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
  const today = new Date().getDay()
  const adjustedToday = today === 0 ? 6 : today - 1 // Convert Sunday=0 to index 6

  const getIntensity = (minutes: number) => {
    if (minutes === 0) return 'bg-gray-200'
    const percentage = (minutes / goalMinutes) * 100
    if (percentage >= 100) return 'bg-success-500'
    if (percentage >= 75) return 'bg-success-400'
    if (percentage >= 50) return 'bg-success-300'
    if (percentage >= 25) return 'bg-success-200'
    return 'bg-success-100'
  }

  return (
    <div className="flex items-center gap-2">
      {weekData.map((minutes, index) => {
        const isToday = index === adjustedToday
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60
        
        return (
          <div key={index} className="flex flex-col items-center gap-1 group relative">
            <div 
              className={`w-8 h-8 rounded-lg ${getIntensity(minutes)} transition-all
                ${isToday ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
                group-hover:scale-110`}
            />
            <span className={`text-[10px] font-medium ${isToday ? 'text-gray-900' : 'text-gray-500'}`}>
              {dayLabels[index]}
            </span>
            
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
              <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                {hours > 0 && `${hours}h `}{mins}m
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}