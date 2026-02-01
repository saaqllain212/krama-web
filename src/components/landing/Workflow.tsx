import { BookOpen, Timer, RefreshCw } from 'lucide-react'

const STEPS = [
  {
    num: '01',
    icon: <BookOpen size={24} />,
    title: 'Input Syllabus',
    desc: 'Break your massive exam syllabus into small, atomic topics. Track completion visually with our interactive checklist.',
  },
  {
    num: '02',
    icon: <Timer size={24} />,
    title: 'Focus Session',
    desc: 'Pick one topic. Start the timer. Work deeply for 25 minutes. The system ensures no distractions allowed.',
  },
  {
    num: '03',
    icon: <RefreshCw size={24} />,
    title: 'Spaced Review',
    desc: 'The algorithm brings that topic back tomorrow, then in 3 days, then 7. You never forget what matters.',
  },
]

export default function Workflow() {
  return (
    <section className="border-t-2 border-black bg-[#FBF9F6] py-24">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-block border-2 border-black bg-white px-4 py-1 text-xs font-black uppercase tracking-widest mb-6 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
            The Process
          </div>
          <h2 className="text-4xl font-bold uppercase tracking-tight md:text-5xl">
            How it works
          </h2>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <div 
              key={step.num}
              className="group relative border-2 border-black bg-white p-8 shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,1)]"
            >
              {/* Number Badge */}
              <div className="absolute -top-5 left-6 border-2 border-black bg-brand px-4 py-2 text-lg font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {step.num}
              </div>
              
              {/* Icon */}
              <div className="mt-6 mb-4 text-black/30 group-hover:text-brand transition-colors">
                {step.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold uppercase tracking-tight mb-3">{step.title}</h3>
              <p className="text-sm font-medium text-black/60 leading-relaxed">
                {step.desc}
              </p>

              {/* Connector Line (hidden on last item and mobile) */}
              {index < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 border-t-2 border-dashed border-black/20" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}