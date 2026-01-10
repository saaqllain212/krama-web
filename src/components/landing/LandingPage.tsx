import Navbar from "./Navbar";
import Hero from "./Hero";
import ProblemSection from "./ProblemSection";
import InteractiveConsole from "./InteractiveConsole"; // <--- 1. Import New Section
import Workflow from "./Workflow";
import FocusBanner from "./FocusBanner"; // <--- 2. Restored FocusBanner
import ToolsGrid from "./ToolsGrid";
import MobileSection from "./MobileSection";
import PricingCard from "./PricingCard";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FBF9F6] text-black">
      <Navbar />
      
      <main>
        <Hero />
        
        {/* The "Why" */}
        <ProblemSection /> 
        
        {/* The "How" - New Interactive Tour */}
        <InteractiveConsole />

        {/* The "Visual Break" */}
        <FocusBanner />

        {/* The "Process" */}
        <Workflow />

        {/* The "What" */}
        <ToolsGrid />
        
        {/* The "Mobile App" */}
        <MobileSection />

        <PricingCard />
      </main>

      <Footer />
    </div>
  )
}