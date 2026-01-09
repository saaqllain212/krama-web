export default function Workflow() {
  return (
    <section className="border-t-[3px] border-black bg-[#FBF9F6] py-24">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        <h2 className="mb-16 text-center text-4xl font-bold uppercase tracking-tight md:text-5xl">
          How it works
        </h2>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <Step 
            num="01" 
            title="Input Syllabus" 
            desc="Break your massive exam syllabus into small, atomic topics. Track completion visually."
          />
          <Step 
            num="02" 
            title="Focus Session" 
            desc="Pick one topic. Start the timer. Work deeply for 25 minutes. No distractions allowed."
          />
          <Step 
            num="03" 
            title="Spaced Review" 
            desc="The algorithm brings that topic back tomorrow, then in 3 days, then 7. You never forget."
          />
        </div>
      </div>
    </section>
  )
}

function Step({ num, title, desc }: { num: string, title: string, desc: string }) {
  return (
    <div className="group relative border-neo bg-white p-8 shadow-neo transition-all hover:-translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <div className="absolute -top-6 left-6 border-2 border-black bg-brand px-4 py-2 text-xl font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
        {num}
      </div>
      <h3 className="mt-6 text-2xl font-bold uppercase tracking-tight">{title}</h3>
      <p className="mt-4 text-lg font-medium text-black/60 leading-relaxed">
        {desc}
      </p>
    </div>
  )
}