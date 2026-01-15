'use client'

import Navbar from "./Navbar"
import Hero from "./Hero"
import ExamSelector from "./ExamSelector"
import ProblemSection from "./ProblemSection"
// 👇 1. IMPORT THE NEW SENTINEL COMPONENT
import SentinelSection from "./SentinelSection" 
import InteractiveConsole from "./InteractiveConsole" 
import Workflow from "./Workflow"
import FocusBanner from "./FocusBanner" 
import ToolsGrid from "./ToolsGrid"
import MobileSection from "./MobileSection"
import PricingCard from "./PricingCard"
import Footer from "./Footer"
import TopBanner from "./TopBanner"
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

        {/* 3. Exam Selector */}
        {/* This puts the exam buttons right below the main headline */}
        <ExamSelector />
        
        {/* The "Why" */}
        <ProblemSection /> 

        {/* ⚡ 4. NEW: The Sentinel Section (Inserted Here) */}
        <SentinelSection />
        
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

        {/* Protocol Architect (Syllabus Helper) */}
        <SyllabusBuilderSection />

      </main>

      <Footer />
    </div>
  )
}