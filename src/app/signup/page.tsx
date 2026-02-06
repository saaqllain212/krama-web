'use client'

import { useState } from 'react'
import AuthLayout from "@/components/auth/AuthLayout"
import SignupForm from "@/components/auth/SignupForm"

export default function SignupPage() {
  const [mascotState, setMascotState] = useState<'idle' | 'watching' | 'typing-name' | 'typing-email' | 'typing-password' | 'celebrating'>('watching')

  return (
    <AuthLayout 
      title="Start your journey" 
      subtitle="Join hundreds of students studying smarter."
      mode="signup"
      mascotState={mascotState}
    >
      <SignupForm onMascotStateChange={setMascotState} />
    </AuthLayout>
  )
}