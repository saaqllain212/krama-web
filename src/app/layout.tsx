import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google"; 
import "./globals.css";
import Script from 'next/script'; 

// Context Providers
import { AlertProvider } from '@/context/AlertContext'; 
import { SyllabusProvider } from '@/context/SyllabusContext'; 
// 1. NEW IMPORT: PostHog Analytics
import { PostHogProvider } from '@/components/providers/PostHogProvider';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: '--font-space',
  weight: ['300', '400', '500', '600', '700'] 
});

// --- SEO UPGRADE: THE IDENTITY CARD ---
export const metadata: Metadata = {
  title: {
    default: "Krama | Strategic Study Tracker",
    template: "%s | Krama"
  },
  description: "Don't just study harder, study smarter. Krama is the tactical operating system for JEE, NEET, UPSC & SSC aspirants to track progress, automate spaced repetition, and analyze mock tests.",
  keywords: [
    "Spaced Repetition App", 
    "JEE Revision Tracker", 
    "NEET Study Planner", 
    "UPSC Mock Test Logger", 
    "SSC CGL Strategy", 
    "Competitive Exam Tracker", 
    "Study Productivity Tool"
  ],
  openGraph: {
    title: "The Tactical OS for Competitive Exams",
    description: "Stop forgetting what you studied. Track, Revise, and Conquer your exam with Krama.",
    url: "https://www.usekrama.com",
    siteName: "Krama",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Krama | Strategic Study Tracker",
    description: "The syllabus-first operating system for serious aspirants.",
  },
  icons: {
    icon: "/favicon.ico", 
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.className} antialiased bg-[#FBF9F6] text-[#1A1A1A]`}>
        
        {/* 2. WRAP EVERYTHING WITH POSTHOG */}
        <PostHogProvider>
          
          {/* EXISTING PROVIDERS */}
          <AlertProvider>
            <SyllabusProvider>
              {children}
            </SyllabusProvider>
          </AlertProvider>

        </PostHogProvider>

        {/* RAZORPAY SCRIPT */}
        <Script 
          id="razorpay-checkout-js"
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
        
      </body>
    </html>
  );
}