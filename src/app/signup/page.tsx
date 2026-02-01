import AuthLayout from "@/components/auth/AuthLayout";
import SignupForm from "@/components/auth/SignupForm";

export default function SignupPage() {
  return (
    <AuthLayout 
      title="Start your free trial" 
      subtitle="14 days free. No credit card required."
      mode="signup"
    >
      <SignupForm />
    </AuthLayout>
  )
}