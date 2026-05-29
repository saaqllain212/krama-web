'use client'

import { useEasterEggs, EasterEggToast, StudentEasterEggs } from '@/components/EasterEggs'
import dynamic from 'next/dynamic'

// Above fold — eager loaded
import TopBanner from './TopBanner'
import Navbar from './Navbar'
import Hero from './Hero'

// Below fold — lazy loaded for performance
const ProblemSection        = dynamic(() => import('./ProblemSection'),         { ssr: false })
const InteractiveConsole    = dynamic(() => import('./InteractiveConsole'),     { ssr: false })
const ExamSelector          = dynamic(() => import('./ExamSelector'),           { ssr: false })
const ToolsGrid             = dynamic(() => import('./ToolsGrid'),              { ssr: false })
const StudyBuddySection     = dynamic(() => import('./StudyBuddySection'),      { ssr: false })
const DualBrainPreview      = dynamic(() => import('./DualBrainPreview'),       { ssr: false })
const AIMCQSection          = dynamic(() => import('./AIMCQSection'),           { ssr: false })
const TestimonialsSection   = dynamic(() => import('./TestimonialsSection'),    { ssr: false })
const PricingCard           = dynamic(() => import('./PricingCard'),            { ssr: false })
const MobileSection         = dynamic(() => import('./MobileSection'),          { ssr: false })
const SyllabusBuilderSection = dynamic(() => import('./SyllabusBuilderSection'), { ssr: false })
const Workflow              = dynamic(() => import('./Workflow'),               { ssr: false })
const Footer                = dynamic(() => import('./Footer'),                 { ssr: false })

export default function LandingPage() {
  const { activeEgg, handleLogoClick } = useEasterEggs()

  return (
    <>
      <EasterEggToast egg={activeEgg} />
      <StudentEasterEggs />

      {/*
        VISUAL RHYTHM — Dark/Light alternation:
        dark  → Hero          (gray-950)
        dark  → ProblemSection(gray-950/900)
        white → InteractiveConsole
        dark  → ExamSelector  (gray-950)
        white → ToolsGrid
        dark  → StudyBuddy    (gray-950)
        white → DualBrainPreview
        dark  → AIMCQSection  (gray-950)
        white → Testimonials
        dark  → Pricing       (gray-950)
        white → MobileSection
        dark  → Workflow      (gray-950)
        white → SyllabusBuilder
        dark  → Footer        (gray-950)
      */}

      <div className="flex min-h-screen flex-col text-gray-900">
        <TopBanner />
        <Navbar onLogoClick={handleLogoClick} />

        <main>
          {/* 1. Dark hero — pain-first, free badge, live mockup, exam ticker */}
          <Hero />

          {/* 2. Dark problem — 4 pain cards before showing solution */}
          <ProblemSection />

          {/* 3. White — 3-step interactive walkthrough */}
          <InteractiveConsole />

          {/* 4. Dark — exam self-identification */}
          <ExamSelector />

          {/* 5. White — all 8 features, all free */}
          <ToolsGrid />

          {/* 6. Dark — Study Buddy new feature highlight */}
          <StudyBuddySection />

          {/* 7. White — Dual companions */}
          <DualBrainPreview />

          {/* 8. Dark — AI MCQ generator */}
          <AIMCQSection />

          {/* 9. White — testimonials (social proof before price) */}
          <TestimonialsSection />

          {/* 10. Dark — pricing: ₹0 now, honest about future */}
          <PricingCard />

          {/* 11. White — mobile PWA install */}
          <MobileSection />

          {/* 12. Dark — 3-step workflow summary */}
          <Workflow />

          {/* 13. White — syllabus builder interactive demo */}
          <SyllabusBuilderSection />
        </main>

        {/* 14. Dark footer */}
        <Footer />
      </div>
    </>
  )
}
