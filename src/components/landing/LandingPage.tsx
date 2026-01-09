import Navbar from "./Navbar";
import Hero from "./Hero";
import ProblemSection from "./ProblemSection";
import Workflow from "./Workflow";
import FocusBanner from "./FocusBanner";
import ToolsGrid from "./ToolsGrid";
import MobileSection from "./MobileSection"; // <--- Import New Section
import PricingCard from "./PricingCard";
import Footer from "./Footer";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#FBF9F6] text-black">
      <Navbar />
      <Hero />
      <ProblemSection /> 
      <FocusBanner />
      <Workflow />
      <ToolsGrid />
      
      {/* Insert Mobile Section Here */}
      <MobileSection />

      <PricingCard />
      <Footer />
    </div>
  )
}