export default function TermsPage() {
  return (
    <article className="prose prose-stone max-w-none">
      <h1 className="text-3xl font-black uppercase tracking-tight mb-8">Terms of Service</h1>
      <p className="font-bold text-stone-500">Last Updated: {new Date().toLocaleDateString()}</p>

      <h3>1. Introduction</h3>
      <p>
        Welcome to Krama. By accessing our website and using our services, you agree to be bound by these Terms of Service. 
        If you do not agree to these terms, please do not use our services.
      </p>

      <h3>2. License to Use</h3>
      <p>
        We grant you a limited, non-exclusive, non-transferable license to use Krama for your personal study and productivity tracking. 
        You agree not to reproduce, duplicate, copy, sell, or exploit any portion of the Service without express written permission by us.
      </p>

      <h3>3. User Accounts</h3>
      <p>
        You are responsible for maintaining the security of your account and password. Krama cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.
      </p>

      <h3>4. Acceptable Use</h3>
      <p>
        You must not use the Service for any illegal or unauthorized purpose. You must not violate any laws in your jurisdiction (including but not limited to copyright laws).
        Scraping our syllabus data or attempting to reverse-engineer our code is strictly prohibited.
      </p>

      <h3>5. Disclaimer of Warranties</h3>
      <p>
        The Service is provided on an "as is" and "as available" basis. We do not warrant that the service will be uninterrupted, timely, secure, or error-free.
      </p>

      <h3>6. Contact Us</h3>
      <p>
        For any questions regarding these Terms, please contact us at: <br/>
        <strong>usekrama.contact@gmail.com</strong>
      </p>
    </article>
  )
}