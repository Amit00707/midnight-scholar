import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-[var(--border)] bg-[#0C0A09] py-12 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-10 text-center sm:text-left">
          {/* Brand */}
          <div className="flex flex-col items-center sm:items-start col-span-1 sm:col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--primary)] text-[#0C0A09] font-bold text-sm">
                M
              </div>
              <span className="font-serif text-lg font-medium text-[var(--foreground)]">
                Midnight Scholar
              </span>
            </div>
            <p className="text-sm text-[var(--muted)] leading-relaxed max-w-[200px]">
              AI-powered reading platform for students who want to understand and retain everything.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5">
              <li><Link href="/library" className="text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors">Library</Link></li>
              <li><Link href="/flashcards" className="text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors">Flashcards</Link></li>
              <li><Link href="/gamification" className="text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors">Leaderboard</Link></li>
              <li><Link href="/social" className="text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors">Community</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-4">Resources</h4>
            <ul className="space-y-2.5">
              <li><Link href="/search" className="text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors">Search Books</Link></li>
              <li><Link href="/dashboard" className="text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors">Dashboard</Link></li>
              <li><Link href="/settings" className="text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors">Settings</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2.5">
              <li><Link href="/privacy" className="text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-[var(--muted)] hover:text-[var(--primary)] transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[var(--border)] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--muted)]">
            © {new Date().getFullYear()} Midnight Scholar. Built with ❤️ for scholars everywhere.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
