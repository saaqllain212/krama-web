import Link from 'next/link'

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between border-b-2 border-black bg-white px-6 py-5 md:px-12">
      {/* Logo */}
      <div className="text-2xl font-black uppercase tracking-tight">
        Krama
      </div>

      {/* CTA Button */}
      <Link 
        href="/signup"
        className="font-bold border-2 border-black bg-brand px-6 py-2 text-sm uppercase text-black shadow-neo transition-transform hover:-translate-y-0.5 hover:translate-x-0.5 active:translate-y-0 active:translate-x-0 active:shadow-none"
      >
        Start Free Trial
      </Link>
    </nav>
  )
}