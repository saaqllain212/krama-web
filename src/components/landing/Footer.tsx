import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t-2 border-black bg-white px-6 py-12 md:px-12">
      <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
        <div className="flex items-center gap-2 font-black uppercase tracking-tight">
          Krama
        </div>

        <div className="font-mono text-xs text-black/60">
          &copy; {new Date().getFullYear()} Krama Systems. Built for students.
        </div>

        <div className="flex gap-6 font-mono text-xs font-medium uppercase">
           <Link href="#" className="hover:underline">Twitter</Link>
           <Link href="#" className="hover:underline">Email</Link>
        </div>
      </div>
    </footer>
  )
}