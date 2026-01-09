import AuthLayout from "@/components/auth/AuthLayout";
import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <AuthLayout 
      title="Start your trial." 
      subtitle="Join the students who stopped procrastinating."
    >
      <SignupForm />
    </AuthLayout>
  )
}