export default function RefundPage() {
  return (
    <article className="prose prose-stone max-w-none">
      <h1 className="text-3xl font-black uppercase tracking-tight mb-8 text-red-600">Refund & Cancellation Policy</h1>
      <p className="font-bold text-stone-500">Last Updated: {new Date().toLocaleDateString()}</p>

      <h3>1. No Refunds Policy</h3>
      <p>
        Krama provides immediate access to digital goods (software, syllabus tracking tools, and analytics). 
        Due to the nature of digital products, <strong>all sales are final. We do not offer refunds once a subscription or lifetime purchase is processed.</strong>
      </p>

      <h3>2. Why No Refunds?</h3>
      <p>
        Once you purchase access, our system instantly incurs costs to provision your account, database storage, and access to premium features. 
        Please utilize the <strong>Free Trial</strong> or Free Tier to ensure Krama meets your needs before purchasing.
      </p>

      <h3>3. Cancellations</h3>
      <p>
        If you are on a recurring subscription plan (e.g., Monthly/Yearly), you may cancel your subscription at any time via your Dashboard Settings.
        <br/><br/>
        Upon cancellation, you will retain access to premium features until the end of your current billing cycle. You will not be charged for the next cycle.
      </p>

      <h3>4. Contact for Issues</h3>
      <p>
        If you believe there has been a billing error (e.g., double charge), please contact us immediately at <strong>usekrama.contact@gmail.com</strong> and we will resolve it promptly.
      </p>
    </article>
  )
}