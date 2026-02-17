import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google"; 
import "./globals.css";
import Script from 'next/script'; 

// Sentry Wrapper (Safety System)
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
  metadataBase: new URL('https://www.usekrama.com'),
  title: {
    default: "Krama | Strategic Study Tracker",
    template: "%s | Krama" 
  },
  description: "Don't just study harder, study smarter. Krama is the tactical operating system for JEE, NEET, UPSC & SSC aspirants.",
  
  openGraph: {
    title: "Krama | Strategic Study Tracker",
    description: "The tactical operating system for students.",
    url: "https://www.usekrama.com",
    siteName: "Krama",
    images: [
      {
        url: "/api/og?title=Strategic%20Study%20Tracker",
        width: 1200,
        height: 630,
        alt: "Krama Study Tracker",
      },
    ],
    locale: "en_US",
    type: "website",
  },

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
      <body className={`${spaceGrotesk.className} antialiased bg-gray-50 text-gray-900`}>
        
        {/* Watchtower: Error Monitoring */}
        <SentryWrapper />

        <PostHogProvider>
            <AlertProvider>
              <SyllabusProvider>
                {children}
              </SyllabusProvider>
            </AlertProvider>
        </PostHogProvider>

        {/* Razorpay Script */}
        <Script 
          id="razorpay-checkout-js"
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />

        {/* FIX: Removed duplicate CDN confetti script.
            canvas-confetti is already installed as npm dependency (v1.9.4).
            Import it directly in components that need it:
            import confetti from 'canvas-confetti'
        */}
        
      </body>
    </html>
  );
}