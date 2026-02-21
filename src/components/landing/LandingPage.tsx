'use client'

import { useEasterEggs, EasterEggToast, StudentEasterEggs } from '@/components/EasterEggs'
import dynamic from 'next/dynamic'

// Above the fold - eagerly loaded
import TopBanner from "./TopBanner"
import Navbar from "./Navbar"
import Hero from "./Hero"

// Below the fold - lazy loaded for performance
const ExamSelector = dynamic(() => import("./ExamSelector"), { ssr: false })
const ProblemSection = dynamic(() => import("./ProblemSection"), { ssr: false })
const InteractiveConsole = dynamic(() => import("./InteractiveConsole"), { ssr: false })
const ToolsGrid = dynamic(() => import("./ToolsGrid"), { ssr: false })
const DualBrainPreview = dynamic(() => import("./DualBrainPreview"), { ssr: false })
const AIMCQSection = dynamic(() => import("./AIMCQSection"), { ssr: false })
const PricingCard = dynamic(() => import("./PricingCard"), { ssr: false })
const MobileSection = dynamic(() => import("./MobileSection"), { ssr: false })
const SyllabusBuilderSection = dynamic(() => import("./SyllabusBuilderSection"), { ssr: false })
const Footer = dynamic(() => import("./Footer"), { ssr: false })

export default function LandingPage() {
  const { eggs, activeEgg, handleLogoClick, handleCoffeeType } = useEasterEggs()

  return (
    <>
      <EasterEggToast egg={activeEgg} />
      <StudentEasterEggs />
      
      <div className="flex min-h-screen flex-col bg-white text-gray-900">
        
        <TopBanner />
        <Navbar onLogoClick={handleLogoClick} />
        
        <main>
          {/* 1. Hero — hook them */}
          <Hero />

          {/* 2. The Problem — why they need this */}
          <ProblemSection /> 
          
          {/* 3. The Solution — interactive walkthrough of the 3-step process */}
          <InteractiveConsole />

          {/* 4. Who is this for — exam selector */}
          <ExamSelector />

          {/* 5. All Features — bento grid */}
          <ToolsGrid />

          {/* 6. Dual Companions — unique selling point */}
          <DualBrainPreview />

          {/* 7. AI MCQ Generator — another USP */}
          <AIMCQSection />

          {/* 8. Pricing — clear CTA */}
          <PricingCard />

          {/* 9. Mobile PWA — install on phone */}
          <MobileSection />

          {/* 10. Syllabus Builder — value before signup */}
          <SyllabusBuilderSection />
        </main>

        <Footer />
      </div>
    </>
  )
}
