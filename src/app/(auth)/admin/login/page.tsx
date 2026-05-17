'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';

export default function AdminLoginPage() {
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

    if (result.success && result.role === 'admin') {
      window.location.href = '/admin/dashboard';
      return;
    }

    setError(result.success ? 'This account is not an admin account.' : result.error || 'Invalid admin credentials');
    setIsSubmitting(false);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8 rounded-2xl border border-red-500/20 bg-(--surface) p-8 shadow-2xl"
      >
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-400">
            <Shield size={22} />
          </div>
          <h2 className="text-3xl font-serif font-bold tracking-tight text-red-400">Admin Portal</h2>
          <p className="mt-2 text-sm text-(--muted)">Sign in with an admin account to manage the system.</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200 flex items-start gap-2"
          >
            <ShieldAlert size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4 rounded-md shadow-sm">
            <div>
              <label htmlFor="admin-email" className="sr-only">Email address</label>
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="relative block w-full rounded-lg border border-(--border) bg-[#0C0A09] px-4 py-3 text-(--foreground) placeholder-(--muted) focus:z-10 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm shadow-inner"
                placeholder="Admin email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="sr-only">Password</label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="relative block w-full rounded-lg border border-(--border) bg-[#0C0A09] px-4 py-3 text-(--foreground) placeholder-(--muted) focus:z-10 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm shadow-inner"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full bg-red-600 hover:bg-red-500" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Enter Admin Console'}
          </Button>

          <p className="text-center text-sm text-(--muted)">
            Regular user?{' '}
            <Link href="/login" className="font-medium text-(--primary) hover:text-amber-500">
              Go back to student login
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}