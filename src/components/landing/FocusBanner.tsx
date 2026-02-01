export default function FocusBanner() {
  return (
    <section className="px-6 py-24 md:px-12">
      <div className="mx-auto max-w-5xl border-2 border-black bg-brand px-8 py-16 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:py-20 relative overflow-hidden">
        
        {/* Subtle Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 50px,
            rgba(0,0,0,0.1) 50px,
            rgba(0,0,0,0.1) 100px
          )`
        }} />

        <div className="relative z-10">
          <h2 className="text-4xl font-bold tracking-tighter text-black md:text-6xl lg:text-7xl">
            Focus Mode by Default
          </h2>
          
          <p className="mx-auto mt-8 max-w-2xl text-base font-medium leading-relaxed text-black/70 md:text-lg">
            Most study apps add MORE distractions. Krama removes them. <br className="hidden md:block" />
            <span className="text-black font-bold">One tool at a time. One task at a time.</span>
          </p>
        </div>
      </div>
    </section>
  )
}