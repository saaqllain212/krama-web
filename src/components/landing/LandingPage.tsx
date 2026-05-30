'use client'
import { useEasterEggs, EasterEggToast, StudentEasterEggs } from '@/components/EasterEggs'
import dynamic from 'next/dynamic'

// Above fold — eager
import TopBanner from './TopBanner'
import Navbar from './Navbar'
import Hero from './Hero'

// Below fold — lazy
const SectionTwo   = dynamic(() => import('./SectionTwo'),   { ssr: false })
const SectionThree = dynamic(() => import('./SectionThree'), { ssr: false })
const SectionFour  = dynamic(() => import('./SectionFour'),  { ssr: false })
const SectionFive  = dynamic(() => import('./SectionFive'),  { ssr: false })
const SectionSix   = dynamic(() => import('./SectionSix'),   { ssr: false })

export default function LandingPage() {
  const { activeEgg, handleLogoClick } = useEasterEggs()
  return (
    <>
      <EasterEggToast egg={activeEgg}/>
      <StudentEasterEggs/>
      <div className="flex min-h-screen flex-col text-gray-900 overflow-x-hidden">
        <TopBanner/>
        <Navbar onLogoClick={handleLogoClick}/>
        <main>
          {/* 01 — Hero: dark, serif headline, live clock, mockup */}
          <Hero/>
          {/* 02+03 — Problem + How it Works: off-white, editorial grid */}
          <SectionTwo/>
          {/* 04 — All 8 features + companions + AI MCQ + buddy + mobile: dark, H-scroll */}
          <SectionThree/>
          {/* 05 — Exam selector + syllabus builder: off-white, tabs */}
          <SectionFour/>
          {/* 06 — Testimonials dual ticker: dark */}
          <SectionFive/>
          {/* 07 — Pricing + Footer: off-white */}
          <SectionSix/>
        </main>
      </div>
    </>
  )
}
