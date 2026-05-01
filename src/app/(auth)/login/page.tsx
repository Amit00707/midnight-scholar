'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login(email, password);

    if (result.success) {
      window.location.href = '/dashboard';
    } else {
      setError(result.error || 'Invalid email or password');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-2xl"
      >
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-serif font-bold tracking-tight text-[var(--primary)]">
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Log in to continue your reading journey.
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400"
          >
            {error}
          </motion.div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full rounded-lg border border-[var(--border)] bg-[#0C0A09] px-4 py-3 text-[var(--foreground)] placeholder-[var(--muted)] focus:z-10 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] sm:text-sm shadow-inner"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full rounded-lg border border-[var(--border)] bg-[#0C0A09] px-4 py-3 text-[var(--foreground)] placeholder-[var(--muted)] focus:z-10 focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] sm:text-sm shadow-inner"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link href="/forgot-password" className="font-medium text-[var(--primary)] hover:text-amber-500 transition-colors">
                Forgot your password?
              </Link>
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[var(--surface)] px-2 text-[var(--muted)]">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button variant="secondary" onClick={() => console.log('OAuth Google')}>Google</Button>
              <Button variant="secondary" onClick={() => console.log('OAuth Apple')}>Apple</Button>
            </div>
          </div>
        </form>
        
        <p className="text-center text-sm text-[var(--muted)]">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-[var(--primary)] hover:text-amber-500">
            Sign up now
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
