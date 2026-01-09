export default function FocusBanner() {
  return (
    <section className="px-6 py-24 md:px-12">
      <div className="mx-auto max-w-5xl border-neo bg-brand px-8 py-16 text-center shadow-neo md:py-20">
        <h2 className="text-5xl font-bold tracking-tighter text-black md:text-7xl">
          Focus Mode by Default
        </h2>
        
        <p className="mx-auto mt-8 max-w-3xl font-mono text-base font-medium leading-relaxed text-black md:text-lg">
          Most study apps add MORE distractions. Krama removes <br className="hidden md:block" />
          them. One tool at a time. One task at a time.
        </p>
      </div>
    </section>
  )
}