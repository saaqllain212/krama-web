import { Share, MoreVertical, PlusSquare, Download } from 'lucide-react'

export default function MobileSection() {
  return (
    <section className="bg-black py-24 text-white relative overflow-hidden">
      {/* Background gradient effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      
      <div className="mx-auto max-w-6xl px-6 md:px-12 relative z-10">
        
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="inline-block bg-gradient-to-r from-primary-500 to-cyan-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white rounded-full shadow-lg shadow-primary-500/30 mb-6">
            Mobile Ready
          </div>
          <h2 className="mt-6 text-4xl font-bold tracking-tight md:text-5xl">
            Works on your phone. <br />
            <span className="bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent">
              No App Store required.
            </span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-white/60">
            Krama is built as a Progressive Web App (PWA). Install it directly from your browser for a full-screen, native experience.
          </p>
        </div>

        {/* The Instructions Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          
          {/* iOS Card */}
          <div className="group relative overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm p-8 rounded-2xl transition-all hover:border-primary-400/50 hover:shadow-xl hover:shadow-primary-500/10">
            {/* Gradient glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10">
              <div className="mb-6 flex items-center gap-4 text-white">
                {/* Apple Logo: RED inside White Box */}
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-600 shadow-lg shadow-white/10 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                  <AppleLogo className="h-8 w-8 fill-current" />
                </div>
                <h3 className="text-xl font-bold tracking-wide">iPhone / iPad</h3>
              </div>
              
              <div className="space-y-4 text-sm font-medium text-white/60">
                <div className="flex items-center gap-3 group/item">
                  <div className="p-2 bg-primary-500/20 rounded-lg border border-primary-500/30 group-hover/item:bg-primary-500/30 transition-colors">
                    <Share className="h-5 w-5 text-primary-400" />
                  </div>
                  <span className="group-hover/item:text-white/80 transition-colors">
                    1. Tap the <span className="text-white font-semibold">Share</span> button in Safari
                  </span>
                </div>
                <div className="flex items-center gap-3 group/item">
                  <div className="p-2 bg-primary-500/20 rounded-lg border border-primary-500/30 group-hover/item:bg-primary-500/30 transition-colors">
                    <PlusSquare className="h-5 w-5 text-primary-400" />
                  </div>
                  <span className="group-hover/item:text-white/80 transition-colors">
                    2. Scroll down & tap <span className="text-white font-semibold">Add to Home Screen</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom gradient line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-cyan-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </div>

          {/* Android Card */}
          <div className="group relative overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm p-8 rounded-2xl transition-all hover:border-green-400/50 hover:shadow-xl hover:shadow-green-500/10">
            {/* Gradient glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            <div className="relative z-10">
              <div className="mb-6 flex items-center gap-4 text-white">
                {/* Android Logo: GREEN inside White Box */}
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#3DDC84] shadow-lg shadow-white/10 group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                  <AndroidLogo className="h-9 w-9 fill-current" />
                </div>
                <h3 className="text-xl font-bold tracking-wide">Android</h3>
              </div>

              <div className="space-y-4 text-sm font-medium text-white/60">
                <div className="flex items-center gap-3 group/item">
                  <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/30 group-hover/item:bg-green-500/30 transition-colors">
                    <MoreVertical className="h-5 w-5 text-green-400" />
                  </div>
                  <span className="group-hover/item:text-white/80 transition-colors">
                    1. Tap the <span className="text-white font-semibold">Menu (3 dots)</span> in Chrome
                  </span>
                </div>
                <div className="flex items-center gap-3 group/item">
                  <div className="p-2 bg-green-500/20 rounded-lg border border-green-500/30 group-hover/item:bg-green-500/30 transition-colors">
                    <Download className="h-5 w-5 text-green-400" />
                  </div>
                  <span className="group-hover/item:text-white/80 transition-colors">
                    2. Tap <span className="text-white font-semibold">Install App</span> or Add to Home
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom gradient line */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-emerald-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
          </div>

        </div>
      </div>
    </section>
  )
}

/* --- LOGO COMPONENTS (SVG) --- */

function AppleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 384 512" className={className}>
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z" />
    </svg>
  )
}

function AndroidLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 576 512" className={className}>
      <path d="M420.55,301.93a24,24,0,1,1,24-24,24,24,0,0,1-24,24m-165.1,0a24,24,0,1,1,24-24,24,24,0,0,1-24,24m116.55-106.81L387.9,128.6a8,8,0,0,0-11.31,11.31l44.3,44.3a176.63,176.63,0,0,0-132.8,0l44.3-44.3a8,8,0,0,0-11.31-11.31l-44.1,46.51a152,152,0,0,0-94,142.44H493.35A152,152,0,0,0,372,195.12Z" />
    </svg>
  )
}