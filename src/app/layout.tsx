import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google"; 
import "./globals.css";

// 1. Import the AlertProvider we just created
import { AlertProvider } from '@/context/AlertContext'; 

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
        {/* 2. Wrap the entire app so popups work everywhere */}
        <AlertProvider>
          {children}
        </AlertProvider>
      </body>
    </html>
  );
}