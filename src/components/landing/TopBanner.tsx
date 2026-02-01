import Link from 'next/link'

export default function TopBanner() {
  return (
    <div className="bg-black px-4 py-3 text-center text-white border-b border-white/10">
      <p className="text-xs font-bold uppercase tracking-widest md:text-sm flex items-center justify-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1">
          🚀 <span className="text-white/60">Launch Offer:</span>
        </span>
        <span className="text-brand">First 100 Users</span> 
        <span className="text-white/40">get flat ₹150 OFF!</span>
        <span className="hidden md:inline text-white/20">|</span>
        <span className="flex items-center gap-2">
          Use Code: 
          <code className="bg-brand text-black px-2 py-0.5 font-black tracking-wider">NEW2026</code>
        </span>
      </p>
    </div>
  )
}