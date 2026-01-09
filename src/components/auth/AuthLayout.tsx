import Link from 'next/link'
import BookStack from './BookStack'

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle: string
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full">
      
      {/* LEFT SIDE: Brand & Visual (Hidden on mobile) */}
      <div className="relative hidden w-1/2 flex-col justify-between bg-brand p-12 lg:flex">
        {/* Logo */}
        <Link href="/" className="text-2xl font-black uppercase tracking-tight text-black">
          Krama
        </Link>

        {/* The Art */}
        <div className="flex flex-1 items-center justify-center">
          <BookStack />
        </div>

        {/* Quote */}
        <div className="max-w-md text-xl font-bold leading-tight tracking-tight">
          "The syllabus is finite. Your time is not. Manage it."
        </div>
      </div>

      {/* RIGHT SIDE: The Form */}
      <div className="flex w-full flex-col justify-center bg-white px-8 py-12 lg:w-1/2 lg:px-24">
        {/* Mobile Logo (Visible only on mobile) */}
        <Link href="/" className="mb-12 block text-2xl font-black uppercase tracking-tight lg:hidden">
          Krama
        </Link>

        <div className="mx-auto w-full max-w-md">
          <h1 className="text-4xl font-bold tracking-tighter">{title}</h1>
          <p className="mt-3 text-lg font-medium text-black/60">{subtitle}</p>

          <div className="mt-10">
            {children}
          </div>
        </div>
      </div>
      
    </div>
  )
}