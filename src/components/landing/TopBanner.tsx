import Link from 'next/link'

export default function TopBanner() {
  return (
    <div className="bg-gray-900 px-4 py-3 text-center text-white">
      <p className="text-xs font-medium md:text-sm flex items-center justify-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1">
          🚀 <span className="text-white/60">Launch Offer:</span>
        </span>
        <span className="text-primary-400 font-semibold">First 100 Users</span> 
        <span className="text-white/40">get flat ₹150 OFF!</span>
        <span className="hidden md:inline text-white/20">|</span>
        <span className="flex items-center gap-2">
          Use Code: 
          <code className="bg-primary-500 text-white px-2 py-0.5 font-bold tracking-wider rounded">NEW2026</code>
        </span>
      </p>
    </div>
  )
}
