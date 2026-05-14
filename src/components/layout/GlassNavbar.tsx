'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';

export function GlassNavbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[#1C1917]/80 backdrop-blur-md"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--primary)] text-[#0C0A09] font-bold">
              M
            </div>
            <span className="font-serif text-xl font-medium tracking-tight text-[var(--foreground)]">
              Midnight Scholar
            </span>
          </Link>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6">
          <Link href="/explore" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--primary)] transition-colors">
            Explore
          </Link>
          <Link href="/library" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--primary)] transition-colors">
            Library
          </Link>
          <Link href="/dashboard" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--primary)] transition-colors">
            Dashboard
          </Link>
          <Link href="/social" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--primary)] transition-colors">
            Community
          </Link>
          {user?.role === 'teacher' && (
            <Link href="/teacher" className="text-sm font-medium text-amber-500 hover:text-amber-400 transition-colors">
              Teacher Portal
            </Link>
          )}
          <Link href="/flashcards" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--primary)] transition-colors">
            Flashcards
          </Link>
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-[#292524] animate-pulse" />
          ) : isAuthenticated && user ? (
            /* ── Logged-In State ── */
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-[var(--primary)] flex items-center justify-center text-[#0C0A09] text-sm font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm text-[var(--foreground)] font-medium hidden sm:block max-w-[120px] truncate">
                  {user.name}
                </span>
                <svg className="w-3 h-3 text-[var(--muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-56 bg-[#1C1917] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden z-50"
                    onMouseLeave={() => setProfileOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-[var(--border)]">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">{user.name}</p>
                      <p className="text-xs text-[var(--muted)] capitalize">{user.role}</p>
                    </div>
                    <div className="py-1">
                      <Link href="/dashboard" className="block px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors" onClick={() => setProfileOpen(false)}>
                        📊 Dashboard
                      </Link>
                      <Link href="/social" className="block px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors" onClick={() => setProfileOpen(false)}>
                        🤝 Community
                      </Link>
                      {user?.role === 'teacher' && (
                        <Link href="/teacher" className="block px-4 py-2.5 text-sm text-amber-500 hover:bg-amber-900/20 transition-colors" onClick={() => setProfileOpen(false)}>
                          🎓 Teacher Portal
                        </Link>
                      )}
                      {user?.role === 'admin' && (
                        <>
                          <Link href="/admin/dashboard" className="block px-4 py-2.5 text-sm text-red-500 hover:bg-red-900/20 transition-colors" onClick={() => setProfileOpen(false)}>
                            🛡️ Admin Dashboard
                          </Link>
                          <Link href="/admin/monitoring" className="block px-4 py-2.5 text-sm text-red-500 hover:bg-red-900/20 transition-colors" onClick={() => setProfileOpen(false)}>
                            🖥️ System Monitoring
                          </Link>
                        </>
                      )}
                      <Link href="/profile" className="block px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors" onClick={() => setProfileOpen(false)}>
                        👤 Profile
                      </Link>
                      <Link href="/flashcards" className="block px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors" onClick={() => setProfileOpen(false)}>
                        🧠 Flashcards
                      </Link>
                      <Link href="/settings" className="block px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors" onClick={() => setProfileOpen(false)}>
                        ⚙️ Settings
                      </Link>
                    </div>
                    <div className="border-t border-[var(--border)] py-1">
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 transition-colors"
                      >
                        🚪 Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* ── Guest State ── */
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button variant="primary" size="sm">Start Reading</Button>
              </Link>
            </>
          )}

          {/* Mobile Hamburger */}
          <button
            className="md:hidden ml-2 text-[var(--muted)] hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] md:hidden bg-[#0C0A09]/95 backdrop-blur-xl flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[var(--primary)] text-[#0C0A09] font-bold flex items-center justify-center">M</div>
                <span className="font-serif text-lg text-white">Midnight Scholar</span>
              </div>
              <button 
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-full bg-stone-900 text-stone-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-8 px-6 space-y-2">
              {[
                { href: '/dashboard', label: '📊 Dashboard' },
                { href: '/explore', label: '🧭 Explore' },
                { href: '/library', label: '📚 My Library' },
                { href: '/flashcards', label: '🧠 Flashcards' },
                { href: '/social', label: '🤝 Community' },
                { href: '/search', label: '🔍 Search Books' },
              ].map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className="block px-4 py-4 text-lg font-serif text-stone-300 hover:text-[var(--primary)] hover:bg-stone-900/50 rounded-xl transition-all"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </nav>

            <div className="p-6 border-t border-stone-800 bg-stone-950/50">
              {!isAuthenticated ? (
                <div className="flex flex-col gap-3">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="ghost" className="w-full h-12">Sign In</Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)}>
                    <Button variant="primary" className="w-full h-12">Start Reading</Button>
                  </Link>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center text-stone-950 font-bold">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{user?.name}</p>
                      <p className="text-xs text-stone-500 capitalize">{user?.role}</p>
                    </div>
                  </div>
                  <button onClick={logout} className="p-3 text-red-400 hover:bg-red-900/10 rounded-xl transition-colors">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
