'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';

export default function StudentLoginPage() {
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

    if (result.success && result.role === 'student') {
      window.location.href = '/dashboard';
      return;
    }

    setError(result.success ? 'This account is not a student account.' : result.error || 'Invalid credentials');
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md space-y-8 rounded-2xl border border-(--border) bg-(--surface) p-8 shadow-2xl">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-serif font-bold tracking-tight text-(--primary)">Student Sign In</h2>
          <p className="mt-2 text-sm text-(--muted)">Access your student dashboard and assignments.</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </motion.div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input id="email-address" name="email" type="email" autoComplete="email" required className="relative block w-full rounded-lg border border-(--border) bg-[#0C0A09] px-4 py-3 text-(--foreground) placeholder-(--muted) focus:z-10 focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary) sm:text-sm shadow-inner" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input id="password" name="password" type="password" autoComplete="current-password" required className="relative block w-full rounded-lg border border-(--border) bg-[#0C0A09] px-4 py-3 text-(--foreground) placeholder-(--muted) focus:z-10 focus:border-(--primary) focus:outline-none focus:ring-1 focus:ring-(--primary) sm:text-sm shadow-inner" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>{isSubmitting ? 'Signing in...' : 'Sign In'}</Button>

          <p className="text-center text-sm text-(--muted)">Don't have an account? <Link href="/student/signup" className="font-medium text-(--primary) hover:text-amber-500">Sign up as student</Link></p>
        </form>
      </motion.div>
    </div>
  );
}
