'use client'
import { Share, MoreVertical, PlusSquare, Download } from 'lucide-react'

function AppleLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 814 1000" xmlns="http://www.w3.org/2000/svg">
      <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 376.3 0 282.5 0 225.5 0 127.4 52.8 71.4 97.1 37.1c50-38.8 103.3-48.8 155.7-48.8 55.6 0 104.4 21.9 149.5 21.9 44.3 0 100.7-24.5 158.5-24.5zM(M603.2 72c39.4-48.5 72.6-110.8 72.6-173.1 0-8.9-.6-17.8-2.2-25.4-68.4 2.6-148.4 45.7-196.8 102.5-36.4 40.8-72 106.7-72 174.2 0 9.5 1.6 19 2.2 22.1 4.5.6 9.5 1.3 14.5 1.3 62.2 0 136.7-41.7 181.7-101.6z"/>
    </svg>
  )
}

function AndroidLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.523 15.341c-.065.35-.24.668-.503.903l-2.046 1.845v1.73c0 .394-.32.713-.714.713s-.714-.32-.714-.713v-1.366l-.546.492-.546-.492v1.366c0 .394-.32.713-.714.713s-.714-.32-.714-.713v-1.73L8.98 16.244c-.263-.235-.438-.553-.503-.903l-.365-1.96c-.01-.05-.014-.1-.014-.151V8.46a.493.493 0 0 1 .493-.493h6.818a.493.493 0 0 1 .493.493v5.73c0 .051-.005.101-.014.151l-.365 1.96zM15.5 5.586l.93-1.641a.49.49 0 0 0-.182-.663.49.49 0 0 0-.663.182l-.97 1.71A6.476 6.476 0 0 0 12 4.875c-.919 0-1.79.193-2.615.299l-.97-1.71a.49.49 0 0 0-.663-.182.49.49 0 0 0-.182.663l.93 1.641C7.11 6.511 6.082 7.818 6 9.375h12c-.082-1.557-1.11-2.864-2.5-3.789zM10.25 7.875a.625.625 0 1 1 0-1.25.625.625 0 0 1 0 1.25zm3.5 0a.625.625 0 1 1 0-1.25.625.625 0 0 1 0 1.25z"/>
    </svg>
  )
}

export default function MobileSection() {
  return (
    <section className="bg-gradient-to-b from-gray-900 to-black py-24 text-white relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="mx-auto max-w-6xl px-6 md:px-12 relative z-10">
        <div className="mb-14 text-center">
          <div className="inline-block bg-gradient-to-r from-primary-500 to-cyan-500 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white rounded-full shadow-lg shadow-primary-500/30 mb-5">
            Works on Mobile
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
            Study anywhere.<br/>
            <span className="bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent">
              No app store needed.
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-lg font-medium text-white/60">
            Krama works directly in your phone browser — like a real app but without the download. Add it to your home screen in 2 taps.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 max-w-3xl mx-auto">
          {[
            { logo: <AppleLogo className="h-8 w-8 fill-current"/>, logoColor:'text-red-600', bg:'hover:border-primary-400/50 hover:shadow-primary-500/10', glow:'from-primary-500/10', title:'iPhone / iPad', steps:[{icon:<Share className="h-5 w-5 text-primary-400"/>, text:<>Tap the <span className="text-white font-bold">Share</span> button in Safari</>},{icon:<PlusSquare className="h-5 w-5 text-primary-400"/>, text:<>Tap <span className="text-white font-bold">Add to Home Screen</span></>}] },
            { logo: <AndroidLogo className="h-9 w-9 fill-current"/>, logoColor:'text-[#3DDC84]', bg:'hover:border-green-400/50 hover:shadow-green-500/10', glow:'from-green-500/10', title:'Android', steps:[{icon:<MoreVertical className="h-5 w-5 text-green-400"/>, text:<>Tap the <span className="text-white font-bold">⋮ menu</span> in Chrome</>},{icon:<Download className="h-5 w-5 text-green-400"/>, text:<>Tap <span className="text-white font-bold">Add to Home Screen</span></>}] },
          ].map((card,i)=>(
            <div key={i} className={`group relative overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm p-8 rounded-2xl transition-all hover:shadow-xl ${card.bg}`}>
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{backgroundImage:`linear-gradient(to bottom right, var(--tw-gradient-stops))`}}/>
              <div className="relative z-10">
                <div className="mb-6 flex items-center gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-white ${card.logoColor} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {card.logo}
                  </div>
                  <h3 className="text-xl font-black">{card.title}</h3>
                </div>
                <div className="space-y-4 text-sm font-semibold text-white/60">
                  {card.steps.map((step,j)=>(
                    <div key={j} className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-lg border border-white/10">{step.icon}</div>
                      <span>{j+1}. {step.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="text-center mt-8 text-sm text-white/30 font-medium">Works offline too — no internet needed during study sessions</p>
      </div>
    </section>
  )
}
