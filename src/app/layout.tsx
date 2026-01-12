import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google"; 
import "./globals.css";
import Script from 'next/script'; 

// 👇 Sentry Wrapper (Safety System)
import SentryWrapper from "@/components/SentryWrapper";

// Context Providers
import { AlertProvider } from '@/context/AlertContext'; 
import { SyllabusProvider } from '@/context/SyllabusContext'; 
import { PostHogProvider } from '@/components/providers/PostHogProvider';

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: '--font-space',
  weight: ['300', '400', '500', '600', '700'] 
});

export const metadata: Metadata = {
  title: {
    default: "Krama | Strategic Study Tracker",
    template: "%s | Krama" 
  },
  description: "Don't just study harder, study smarter. Krama is the tactical operating system for JEE, NEET, UPSC & SSC aspirants.",
  
  // 👇 NEW: OPERATION BILLBOARD (Viral Images)
  openGraph: {
    title: "Krama | Strategic Study Tracker",
    description: "The tactical operating system for students.",
    url: "https://krama.in",
    siteName: "Krama",
    images: [
      {
        url: "/api/og?title=Strategic%20Study%20Tracker", // Points to your new API
        width: 1200,
        height: 630,
        alt: "Krama Study Tracker",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  // 👆 END NEW SECTION

  manifest: "/manifest.json", 
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.className} antialiased bg-[#FBF9F6] text-[#1A1A1A]`}>
        
        {/* Watchtower: Error Monitoring */}
        <SentryWrapper />

        <PostHogProvider>
            <AlertProvider>
              <SyllabusProvider>
                {children}
              </SyllabusProvider>
            </AlertProvider>
        </PostHogProvider>

        <Script 
          id="razorpay-checkout-js"
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
        
      </body>
    </html>
  );
}