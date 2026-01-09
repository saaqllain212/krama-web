import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google"; 
import "./globals.css";

// 1. Import BOTH Providers
import { AlertProvider } from '@/context/AlertContext'; 
import { SyllabusProvider } from '@/context/SyllabusContext'; 

const spaceGrotesk = Space_Grotesk({ 
  subsets: ["latin"],
  variable: '--font-space',
  weight: ['300', '400', '500', '600', '700'] 
});

export const metadata: Metadata = {
  title: "Krama | Spaced Repetition",
  description: "Master your syllabus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.className} antialiased bg-[#FBF9F6] text-[#1A1A1A]`}>
        {/* 2. Nest the Providers. 
            AlertProvider is outer (UI), SyllabusProvider is inner (Data). 
        */}
        <AlertProvider>
          <SyllabusProvider>
            {children}
          </SyllabusProvider>
        </AlertProvider>
      </body>
    </html>
  );
}