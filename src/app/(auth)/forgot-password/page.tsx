'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { apiFetch } from '@/lib/api/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await apiFetch('/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md p-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-xl text-center"
      >
        <div className="text-4xl mb-4">🔑</div>
        <h2 className="text-2xl font-serif text-[var(--primary)] mb-2">Reset Your Password</h2>

        {!submitted ? (
          <>
            <p className="text-sm text-[var(--muted)] mb-6">
              Enter your email address and we'll send you a reset link.
            </p>

            {error && (
              <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            <form onSubmit={handleReset} className="space-y-4">
              <input
                type="email"
                required
                className="block w-full rounded-lg border border-[var(--border)] bg-[#0C0A09] px-4 py-3 text-[var(--foreground)] placeholder-[var(--muted)] focus:border-[var(--primary)] focus:outline-none"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending...' : 'Send Reset Link'}
              </Button>
            </form>
          </>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-4">
            <div className="text-5xl mb-4">✉️</div>
            <p className="text-green-400 font-medium mb-2">Reset link sent!</p>
            <p className="text-sm text-[var(--muted)]">
              If <span className="text-[var(--foreground)]">{email}</span> is registered, you'll receive a reset link shortly.
            </p>
          </motion.div>
        )}

        <div className="mt-8">
          <Link href="/login" className="text-sm font-medium text-[var(--muted)] hover:text-[var(--primary)] transition-colors">
            ← Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
