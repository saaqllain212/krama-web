'use client'

// 1. Imports
import { useEasterEggs, EasterEggToast, StudentEasterEggs } from '@/components/EasterEggs'

// NEW: Import the TopBanner
import TopBanner from "./TopBanner"

import Navbar from "./Navbar"
import Hero from "./Hero"
import ExamSelector from "./ExamSelector"
import ProblemSection from "./ProblemSection"
import InteractiveConsole from "./InteractiveConsole" 
import ToolsGrid from "./ToolsGrid"
import PricingCard from "./PricingCard"
import Footer from "./Footer"
import SyllabusBuilderSection from "./SyllabusBuilderSection"

export default function LandingPage() {
  // 2. Initialize the Easter Egg hook
  const { eggs, activeEgg, handleLogoClick, handleCoffeeType } = useEasterEggs()

  return (
    <>

      {/* 3. Add the Toast and Secret Component */}
      <EasterEggToast egg={activeEgg} />
      <StudentEasterEggs />
      
      <div className="flex min-h-screen flex-col bg-white text-gray-900">
        
        <TopBanner />
        <Navbar onLogoClick={handleLogoClick} />
        
        <main>
          {/* 1. Hero — hook them */}
          <Hero />

          {/* 2. Who is this for — exam selector */}
          <ExamSelector />
          
          {/* 3. The Problem — why they need this */}
          <ProblemSection /> 
          
          {/* 4. The Solution — interactive walkthrough of the 3-step process */}
          <InteractiveConsole />

          {/* 5. All Features — bento grid + AI MCQ + companions */}
          <ToolsGrid />

          {/* 6. Pricing — clear CTA */}
          <PricingCard />

          {/* 7. Syllabus Builder — interactive tool that adds value even before signup */}
          <SyllabusBuilderSection />

        </main>

        <Footer />
      </div>
    </>
  )
}