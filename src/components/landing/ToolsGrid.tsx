import { Timer, Calendar, CheckSquare, TrendingUp } from 'lucide-react'

export default function ToolsGrid() {
  return (
    <section className="bg-[#FBF9F6] px-6 py-24 md:px-12">
      <h2 className="mb-16 text-center text-4xl font-bold uppercase tracking-tight md:text-5xl">
        The Tools
      </h2>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Pomodoro */}
        <ToolCard 
          icon={<Timer className="h-8 w-8" />}
          title="Pomodoro"
          desc="Focus timer. 25 min sessions."
        >
          <div className="mt-6 text-4xl font-bold tracking-tighter">25:00</div>
        </ToolCard>

        {/* Card 2: Spaced Review */}
        <ToolCard 
          icon={<Calendar className="h-8 w-8" />}
          title="Spaced Review"
          desc="Never forget. Smart reminders."
        >
          <div className="mt-6 space-y-2 text-sm font-medium font-mono text-black/60">
            <div className="flex items-center gap-2">
              <span className="text-black">[ ]</span> Ch 3 - Today
            </div>
            <div className="flex items-center gap-2">
              <span className="text-black/40">[ ]</span> Ch 1 - In 3 days
            </div>
            <div className="flex items-center gap-2">
              <span className="text-black/40">[ ]</span> Ch 5 - In 7 days
            </div>
          </div>
        </ToolCard>

        {/* Card 3: Syllabus Map */}
        <ToolCard 
          icon={<CheckSquare className="h-8 w-8" />}
          title="Syllabus Map"
          desc="Track what's left. Check it off."
        >
           <div className="mt-6 space-y-2 text-sm font-medium font-mono text-black/60">
            <div className="flex items-center gap-2">
              <span className="text-black">[x]</span> Algebra
            </div>
            <div className="flex items-center gap-2">
              <span className="text-black">[x]</span> Calculus
            </div>
            <div className="flex items-center gap-2">
              <span className="text-black/40">[ ]</span> Geometry
            </div>
          </div>
        </ToolCard>

        {/* Card 4: Mock Logger */}
        <ToolCard 
          icon={<TrendingUp className="h-8 w-8" />}
          title="Mock Logger"
          desc="Log tests. See progress."
        >
           <div className="mt-6 space-y-2 text-sm font-medium font-mono text-black/60">
            <div className="flex justify-between">
              <span>Jan 9:</span>
              <span className="text-black">85/100</span>
            </div>
            <div className="flex justify-between text-black/40">
              <span>Jan 6:</span>
              <span>78/100</span>
            </div>
            <div className="flex justify-between text-black/40">
              <span>Jan 3:</span>
              <span>72/100</span>
            </div>
          </div>
        </ToolCard>
      </div>
    </section>
  )
}

function ToolCard({ icon, title, desc, children }: { icon: any, title: string, desc: string, children: React.ReactNode }) {
  return (
    <div className="flex flex-col border-neo bg-white p-8 shadow-neo transition-transform hover:-translate-y-1">
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="mt-2 text-sm font-medium text-black/60 leading-relaxed">
        {desc}
      </p>
      <div className="mt-auto pt-4">
        {children}
      </div>
    </div>
  )
}