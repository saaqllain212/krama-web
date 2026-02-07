'use client'

// 1. Imports
import { useEasterEggs, EasterEggToast, StudentEasterEggs } from '@/components/EasterEggs'

// NEW: Import the TopBanner
import TopBanner from "./TopBanner"

import Navbar from "./Navbar"
import Hero from "./Hero"
import ExamSelector from "./ExamSelector"
import DualBrainPreview from "./DualBrainPreview"
import AIMCQSection from "./AIMCQSection"
import ProblemSection from "./ProblemSection"
import InteractiveConsole from "./InteractiveConsole" 
import Workflow from "./Workflow"
import ToolsGrid from "./ToolsGrid"
import MobileSection from "./MobileSection"
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
        
        {/* NEW: TopBanner placed above Navbar */}
        <TopBanner />

        {/* 4. Pass the click handler to Navbar */}
        <Navbar onLogoClick={handleLogoClick} />
        
        <main>
          {/* Hero Section - New gradient design */}
          <Hero />

          {/* Exam Selector */}
          <ExamSelector />
          
          {/* NEW: Dual Brain Preview */}
          <DualBrainPreview />

          {/* NEW: AI MCQ Generator */}
          <AIMCQSection />
          
          {/* The "Why" */}
          <ProblemSection /> 
          
          {/* The "How" - Interactive Tour */}
          <InteractiveConsole />

          {/* The Process - NEW ANIMATED TIMELINE */}
          <Workflow />

          {/* The Tools - NEW BENTO GRID */}
          <ToolsGrid />
          
          {/* Mobile App Teaser */}
          <MobileSection />

          {/* Pricing - Updated design */}
          <PricingCard />

          {/* Protocol Architect (Syllabus Helper) */}
          <SyllabusBuilderSection />

        </main>

        <Footer />
      </div>
    </>
  )
}