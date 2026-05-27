'use client'

import { useEasterEggs, EasterEggToast, StudentEasterEggs } from '@/components/EasterEggs'
import dynamic from 'next/dynamic'

// Above fold — eager
import TopBanner from './TopBanner'
import Navbar from './Navbar'
import Hero from './Hero'

// Below fold — lazy loaded
const ProblemSection        = dynamic(() => import('./ProblemSection'),        { ssr: false })
const InteractiveConsole    = dynamic(() => import('./InteractiveConsole'),    { ssr: false })
const ExamSelector          = dynamic(() => import('./ExamSelector'),          { ssr: false })
const ToolsGrid             = dynamic(() => import('./ToolsGrid'),             { ssr: false })
const StudyBuddySection     = dynamic(() => import('./StudyBuddySection'),     { ssr: false })
const DualBrainPreview      = dynamic(() => import('./DualBrainPreview'),      { ssr: false })
const AIMCQSection          = dynamic(() => import('./AIMCQSection'),          { ssr: false })
const TestimonialsSection   = dynamic(() => import('./TestimonialsSection'),   { ssr: false })
const PricingCard           = dynamic(() => import('./PricingCard'),           { ssr: false })
const MobileSection         = dynamic(() => import('./MobileSection'),         { ssr: false })
const SyllabusBuilderSection = dynamic(() => import('./SyllabusBuilderSection'), { ssr: false })
const Footer                = dynamic(() => import('./Footer'),                { ssr: false })

export default function LandingPage() {
  const { activeEgg, handleLogoClick } = useEasterEggs()
  return (
    <>
      <EasterEggToast egg={activeEgg} />
      <StudentEasterEggs />
      <div className="flex min-h-screen flex-col bg-white text-gray-900">

        {/* Sticky free access banner */}
        <TopBanner />
        <Navbar onLogoClick={handleLogoClick} />

        <main>
          {/* 1. Hero — pain-first headline, live mockup, free badge, exam tags */}
          <Hero />

          {/* 2. Problem — 4 relatable pain points BEFORE showing solution */}
          <ProblemSection />

          {/* 3. How it works — 3-step interactive tabs */}
          <InteractiveConsole />

          {/* 4. Exam selector — students self-identify with their exam */}
          <ExamSelector />

          {/* 5. All 8 features — every tool, all free, Study Buddy marked New */}
          <ToolsGrid />

          {/* 6. Study Buddy — dedicated section, new feature highlight */}
          <StudyBuddySection />

          {/* 7. Dual Companions — unique gamification USP */}
          <DualBrainPreview />

          {/* 8. AI MCQ — zero cost angle */}
          <AIMCQSection />

          {/* 9. Testimonials — social proof before price */}
          <TestimonialsSection />

          {/* 10. Pricing — ₹0 now, honest about future ₹149 */}
          <PricingCard />

          {/* 11. Mobile PWA */}
          <MobileSection />

          {/* 12. Syllabus builder interactive demo */}
          <SyllabusBuilderSection />
        </main>

        <Footer />
      </div>
    </>
  )
}
