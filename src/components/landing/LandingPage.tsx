'use client'

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
  return (
    <div className="flex min-h-screen flex-col bg-white text-gray-900">
      
      {/* Navigation */}
      <Navbar />
      
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
  )
}