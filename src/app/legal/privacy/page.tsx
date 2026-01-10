export default function PrivacyPage() {
  return (
    <article className="prose prose-stone max-w-none">
      <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Privacy Policy</h1>
      <p className="font-bold text-stone-500">Last Updated: {new Date().toLocaleDateString()}</p>

      <h3>1. Information We Collect</h3>
      <p>
        We collect only the information necessary to provide our service:
      </p>
      <ul>
        <li><strong>Account Info:</strong> Name and Email address (for authentication via Supabase).</li>
        <li><strong>Usage Data:</strong> Study logs, syllabus progress, and mock test scores.</li>
        <li><strong>Payment Info:</strong> We do not store your credit card details. All payments are processed securely by Razorpay.</li>
      </ul>

      <h3>2. How We Use Your Data</h3>
      <p>
        We use your data solely to:
      </p>
      <ul>
        <li>Provide and maintain the Service.</li>
        <li>Track your study progress and generate analytics.</li>
        <li>Send you important account updates (we hate spam too).</li>
      </ul>

      <h3>3. Data Security</h3>
      <p>
        We prioritize the security of your data. We use industry-standard encryption (SSL) and secure database practices (Supabase RLS) to protect your personal information.
      </p>

      <h3>4. Third-Party Services</h3>
      <p>
        We may use third-party services such as Supabase (for hosting/database) and Razorpay (for payments). 
        These services have their own privacy policies.
      </p>

      <h3>5. Contact</h3>
      <p>
        If you have questions about your data, contact us at: <strong>usekrama.contact@gmail.com</strong>
      </p>
    </article>
  )
}