import Link from 'next/link'

export default function TopBanner() {
  return (
    <div className="bg-black px-4 py-3 text-center text-white">
      <p className="text-xs font-bold uppercase tracking-widest md:text-sm">
        🚀 Launch Offer: <span className="text-yellow-400">First 100 Users</span> get flat ₹150 OFF! 
        <span className="mx-2 text-white/40">|</span>
        Use Code: <span className="bg-yellow-400 px-2 py-0.5 text-black">NEW2026</span>
      </p>
    </div>
  )
}