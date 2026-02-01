import { Timer, Calendar, CheckSquare, TrendingUp } from 'lucide-react'

const TOOLS = [
  {
    icon: <Timer className="h-7 w-7" />,
    title: 'Pomodoro',
    desc: 'Focus timer with 25 min deep work sessions.',
    preview: (
      <div className="mt-6 text-5xl font-bold tracking-tighter tabular-nums">25:00</div>
    ),
  },
  {
    icon: <Calendar className="h-7 w-7" />,
    title: 'Spaced Review',
    desc: 'Never forget with smart reminders.',
    preview: (
      <div className="mt-6 space-y-2 text-xs font-medium font-mono">
        <div className="flex items-center gap-2 text-black">
          <span className="text-brand font-bold">→</span> Ch 3 - Today
        </div>
        <div className="flex items-center gap-2 text-black/40">
          <span>○</span> Ch 1 - In 3 days
        </div>
        <div className="flex items-center gap-2 text-black/40">
          <span>○</span> Ch 5 - In 7 days
        </div>
      </div>
    ),
  },
  {
    icon: <CheckSquare className="h-7 w-7" />,
    title: 'Syllabus Map',
    desc: 'Track progress. Check topics off.',
    preview: (
      <div className="mt-6 space-y-2 text-xs font-medium font-mono">
        <div className="flex items-center gap-2 text-black/40 line-through">
          <span>✓</span> Algebra
        </div>
        <div className="flex items-center gap-2 text-black/40 line-through">
          <span>✓</span> Calculus
        </div>
        <div className="flex items-center gap-2 text-black font-bold">
          <span className="text-brand">→</span> Geometry
        </div>
      </div>
    ),
  },
  {
    icon: <TrendingUp className="h-7 w-7" />,
    title: 'Mock Logger',
    desc: 'Log tests and track your progress.',
    preview: (
      <div className="mt-6 space-y-2 text-xs font-medium font-mono">
        <div className="flex justify-between text-black">
          <span>Jan 9:</span>
          <span className="font-bold text-green-600">85/100 ↑</span>
        </div>
        <div className="flex justify-between text-black/50">
          <span>Jan 6:</span>
          <span>78/100</span>
        </div>
        <div className="flex justify-between text-black/40">
          <span>Jan 3:</span>
          <span>72/100</span>
        </div>
      </div>
    ),
  },
]

export default function ToolsGrid() {
  return (
    <section className="bg-[#FBF9F6] px-6 py-24 md:px-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block border-2 border-black bg-black text-white px-4 py-1 text-xs font-black uppercase tracking-widest mb-6 shadow-[3px_3px_0px_0px_rgba(204,255,0,1)]">
            Your Arsenal
          </div>
          <h2 className="text-4xl font-bold uppercase tracking-tight md:text-5xl">
            The Tools
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map((tool) => (
            <div 
              key={tool.title}
              className="group flex flex-col border-2 border-black bg-white p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
            >
              {/* Icon */}
              <div className="mb-4 text-black/30 group-hover:text-brand transition-colors">
                {tool.icon}
              </div>
              
              {/* Title & Desc */}
              <h3 className="text-lg font-bold tracking-tight">{tool.title}</h3>
              <p className="mt-1 text-xs font-medium text-black/50 leading-relaxed">
                {tool.desc}
              </p>
              
              {/* Preview */}
              <div className="mt-auto pt-4 border-t border-black/5">
                {tool.preview}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}