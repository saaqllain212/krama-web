import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Metadata } from 'next'
import { Lock } from 'lucide-react'

// 👇 We now import the metadata separately from the heavy data loader
import { 
  getAllSyllabusPaths, 
  getSyllabusData, 
  SYLLABUS_METADATA 
} from '@/lib/syllabus-registry'

import RevisionCalculator from '@/components/public/RevisionCalculator'

type Props = {
  params: Promise<{ exam: string; subject: string }>
}

// 1. Static Params (Keeps build fast)
export async function generateStaticParams() {
  return getAllSyllabusPaths()
}

// 2. Metadata (Uses lightweight SYLLABUS_METADATA to avoid loading JSON)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { exam, subject } = await params
  
  // Quick lookup without loading the heavy JSON
  const meta = SYLLABUS_METADATA[exam]?.[subject]
  
  if (!meta) return { title: 'Not Found' }

  return {
    title: `${meta.title} Syllabus Checklist | Krama`,
    description: `Complete syllabus checklist for ${meta.title}. Track your coverage and revision progress with Krama.`,
  }
}

// 3. Main Page Component
export default async function PublicSyllabusPage({ params }: Props) {
  const { exam, subject } = await params

  // A. Check Metadata first (Fast fail)
  const meta = SYLLABUS_METADATA[exam]?.[subject]
  if (!meta) return notFound()

  // B. Load the Heavy JSON Data (Now using await)
  const syllabusNodes = await getSyllabusData(exam, subject)
  
  // If JSON is empty/missing despite metadata existing
  if (!syllabusNodes) return notFound()

  return (
    <div className="min-h-screen bg-[#FBF9F6] font-space text-[#1A1A1A]">
      
      {/* NAVBAR */}
      <nav className="border-b-2 border-black bg-white px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <Link href="/" className="text-xl font-black uppercase tracking-tighter">Krama</Link>
        <div className="flex gap-4">
          <Link href="/login" className="font-bold uppercase text-xs hover:underline">Log In</Link>
          <Link href="/signup" className="bg-amber-400 border-2 border-black px-4 py-2 rounded-full font-bold uppercase text-xs hover:bg-amber-500">
             Start Tracking
          </Link>
        </div>
      </nav>

      {/* HEADER */}
      <header className="px-6 py-12 md:py-20 max-w-4xl mx-auto text-center">
         <div className="inline-block bg-black text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest mb-4">
            Public Tracker
         </div>
         <h1 className="text-4xl md:text-6xl font-black uppercase leading-tight mb-6">
            {meta.title}
         </h1>
         {/* COPY: Preserved "Tactical" text */}
         <p className="text-lg md:text-xl text-stone-600 font-medium max-w-2xl mx-auto mb-8">
            The tactical checklist for {meta.title}. Stop using PDFs. Use a system that tracks your progress.
         </p>
      </header>

      {/* CONTENT */}
      <main className="px-6 pb-20 max-w-3xl mx-auto">
         
         {/* 1. THE LEAD MAGNET (Preserved) */}
         <RevisionCalculator />

         {/* 2. SYLLABUS LIST */}
         <div className="bg-white border-4 border-black p-8 rounded-2xl shadow-[8px_8px_0_0_#000] mb-12">
            <div className="space-y-6">
               {syllabusNodes.map((node: any) => (
                  <SyllabusItem key={node.id} node={node} />
               ))}
            </div>
            {/* LOCKED NOTICE (Preserved) */}
            <div className="mt-12 bg-stone-50 border-2 border-stone-200 p-6 rounded-xl flex flex-col items-center text-center gap-4">
               <Lock className="text-stone-400" size={24} />
               <p className="text-sm text-stone-500 font-bold">Checkboxes are read-only in public mode.</p>
            </div>
         </div>

      </main>

      {/* SIMPLE FOOTER */}
      <footer className="bg-white border-t-2 border-black py-12 text-center">
         <p className="font-black uppercase tracking-widest text-xs text-stone-400">© Krama Systems</p>
      </footer>

    </div>
  )
}

// 4. Recursive Item Component (Preserved exactly as is)
function SyllabusItem({ node }: { node: any }) {
  if (node.children && node.children.length > 0) {
    return (
      <div className="mb-4">
        <h4 className="font-black uppercase tracking-wide text-sm mb-3 border-b border-stone-100 pb-1">{node.title}</h4>
        <div className="pl-4 border-l-2 border-stone-100 space-y-3">
           {node.children.map((child: any) => (
              <SyllabusItem key={child.id} node={child} />
           ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-3 group opacity-70 hover:opacity-100 transition-opacity">
       <div className="mt-0.5 min-w-[20px]">
          <div className="w-5 h-5 border-2 border-stone-300 rounded bg-stone-100 flex items-center justify-center"></div>
       </div>
       <span className="font-bold text-sm leading-snug">{node.title}</span>
    </div>
  )
}