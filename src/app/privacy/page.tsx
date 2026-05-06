export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] px-6 py-16 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-[var(--primary)]">Privacy Policy</h1>
      <p className="text-[var(--muted)] mb-4 text-sm">Last updated: May 2026</p>

      <section className="space-y-6 text-[var(--foreground)]">
        <div>
          <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
          <p className="text-[var(--muted)]">We collect information you provide directly to us, such as your name, email address, and password when you create an account.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">2. How We Use Your Information</h2>
          <p className="text-[var(--muted)]">We use the information we collect to provide, maintain, and improve our services, process transactions, and send you technical notices and support messages.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">3. Data Security</h2>
          <p className="text-[var(--muted)]">We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">4. Cookies</h2>
          <p className="text-[var(--muted)]">We use cookies and similar tracking technologies to track activity on our service and hold certain information to improve your experience.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">5. Third-Party Services</h2>
          <p className="text-[var(--muted)]">We may employ third-party companies and individuals to facilitate our service. These third parties have access to your information only to perform tasks on our behalf.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">6. Contact Us</h2>
          <p className="text-[var(--muted)]">If you have questions about this Privacy Policy, please contact us at privacy@midnightscholar.app</p>
        </div>
      </section>
    </main>
  );
}
