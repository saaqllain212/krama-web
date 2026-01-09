export default function BookStack() {
  return (
    <div className="relative flex flex-col items-center justify-center">
      {/* Book 1 (Bottom) */}
      <div className="absolute top-12 h-16 w-64 rotate-[-3deg] border-neo bg-white p-3 shadow-neo transition-transform hover:rotate-0 hover:scale-105">
        <div className="h-full w-full border-2 border-dashed border-black/20" />
      </div>

      {/* Book 2 (Middle) */}
      <div className="absolute top-6 z-10 h-16 w-60 rotate-[2deg] border-neo bg-black p-3 shadow-neo transition-transform hover:rotate-0 hover:scale-105">
        <div className="flex h-full items-center justify-center text-sm font-bold tracking-widest text-white uppercase">
          General Studies
        </div>
      </div>

      {/* Book 3 (Top) */}
      <div className="z-20 h-16 w-56 rotate-[-1deg] border-neo bg-white p-3 shadow-neo transition-transform hover:rotate-0 hover:scale-105">
        <div className="flex h-full items-center justify-center text-xs font-bold tracking-widest text-black/40 uppercase">
          Vol. 2026
        </div>
      </div>
    </div>
  )
}