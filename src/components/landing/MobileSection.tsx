import { Share, MoreVertical, PlusSquare, Download } from 'lucide-react'

export default function MobileSection() {
  return (
    <section className="bg-black py-24 text-white">
      <div className="mx-auto max-w-6xl px-6 md:px-12">
        
        {/* Header */}
        <div className="mb-16 text-center">
          <div className="inline-block border-2 border-brand bg-brand px-3 py-1 text-xs font-bold uppercase tracking-widest text-black">
            Mobile Ready
          </div>
          <h2 className="mt-6 text-4xl font-bold uppercase tracking-tight md:text-5xl">
            Works on your phone. <br />
            <span className="text-brand">No App Store required.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg font-medium text-white/60">
            Krama is built as a Progressive Web App (PWA). Install it directly from your browser for a full-screen, native experience.
          </p>
        </div>

        {/* The Instructions Grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          
          {/* iOS Card */}
          <div className="group relative overflow-hidden border-2 border-white/20 bg-white/5 p-8 transition-all hover:border-brand">
            <div className="mb-6 flex items-center gap-4 text-white">
              {/* Apple Logo: RED inside White Box */}
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-red-600 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                <AppleLogo className="h-8 w-8 fill-current" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-wider">iPhone / iPad</h3>
            </div>
            
            <div className="space-y-4 text-sm font-medium text-white/60">
              <div className="flex items-center gap-3">
                <Share className="h-5 w-5 text-brand" />
                <span>1. Tap the <span className="text-white">Share</span> button in Safari</span>
              </div>
              <div className="flex items-center gap-3">
                <PlusSquare className="h-5 w-5 text-brand" />
                <span>2. Scroll down & tap <span className="text-white">Add to Home Screen</span></span>
              </div>
            </div>
          </div>

          {/* Android Card */}
          <div className="group relative overflow-hidden border-2 border-white/20 bg-white/5 p-8 transition-all hover:border-brand">
            <div className="mb-6 flex items-center gap-4 text-white">
              {/* Android Logo: GREEN inside White Box */}
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#3DDC84] shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)]">
                <AndroidLogo className="h-9 w-9 fill-current" />
              </div>
              <h3 className="text-xl font-bold uppercase tracking-wider">Android</h3>
            </div>

            <div className="space-y-4 text-sm font-medium text-white/60">
              <div className="flex items-center gap-3">
                <MoreVertical className="h-5 w-5 text-brand" />
                <span>1. Tap the <span className="text-white">Menu (3 dots)</span> in Chrome</span>
              </div>
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-brand" />
                <span>2. Tap <span className="text-white">Install App</span> or Add to Home</span>
              </div>
            </div>
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