'use client'

import Navbar from "./Navbar"
import Hero from "./Hero"
import ProblemSection from "./ProblemSection"
import InteractiveConsole from "./InteractiveConsole" 
import Workflow from "./Workflow"
import FocusBanner from "./FocusBanner" 
import ToolsGrid from "./ToolsGrid"
import MobileSection from "./MobileSection"
import PricingCard from "./PricingCard"
import Footer from "./Footer"
import TopBanner from "./TopBanner"
// ✅ IMPORT THE NEW ARCHITECT SECTION
import SyllabusBuilderSection from "./SyllabusBuilderSection"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FBF9F6] text-black">
      
      {/* 1. Launch Banner */}
      <TopBanner />

      {/* 2. Navigation */}
      <Navbar />
      
      <main>
        <Hero />
        
        {/* The "Why" */}
        <ProblemSection /> 
        
        {/* The "How" - Interactive Tour */}
        <InteractiveConsole />

        {/* Visual Break */}
        <FocusBanner />

        {/* The Process */}
        <Workflow />

        {/* The Tools */}
        <ToolsGrid />
        
        {/* Mobile App Teaser */}
        <MobileSection />

        {/* Pricing */}
        <PricingCard />

        {/* ✅ NEW: PROTOCOL ARCHITECT (Syllabus Helper) */}
        <SyllabusBuilderSection />

      </main>

      <Footer />
    </div>
  )
}