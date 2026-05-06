export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-6 py-16 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-[var(--primary)]">Terms of Service</h1>
      <p className="text-[var(--muted)] mb-4 text-sm">Last updated: May 2026</p>

      <section className="space-y-6 text-[var(--foreground)]">
        <div>
          <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
          <p className="text-[var(--muted)]">By accessing and using Midnight Scholar, you agree to be bound by these Terms of Service. If you do not agree, please do not use our platform.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">2. Use of Service</h2>
          <p className="text-[var(--muted)]">Midnight Scholar provides an AI-powered e-book library platform. You agree to use the service only for lawful purposes and in accordance with these terms.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">3. User Accounts</h2>
          <p className="text-[var(--muted)]">You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">4. Intellectual Property</h2>
          <p className="text-[var(--muted)]">All content, features, and functionality of Midnight Scholar are owned by us and are protected by applicable intellectual property laws.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">5. Termination</h2>
          <p className="text-[var(--muted)]">We reserve the right to terminate or suspend your account at our sole discretion, without notice, for conduct that we believe violates these Terms.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">6. Contact</h2>
          <p className="text-[var(--muted)]">For questions about these Terms, please contact us at support@midnightscholar.app</p>
        </div>
      </section>
    </main>
  );
}
