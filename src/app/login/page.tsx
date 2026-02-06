'use client'

import { useState } from 'react'
import AuthLayout from "@/components/auth/AuthLayout"
import LoginForm from "@/components/auth/LoginForm"

export default function LoginPage() {
  const [mascotState, setMascotState] = useState<'idle' | 'watching' | 'typing-email' | 'typing-password' | 'success' | 'error'>('watching')

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Pick up where you left off."
      mode="login"
      mascotState={mascotState}
    >
      <LoginForm onMascotStateChange={setMascotState} />
    </AuthLayout>
  )
}