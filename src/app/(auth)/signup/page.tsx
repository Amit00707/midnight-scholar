'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';

export default function SignupPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'student' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await signup(formData.name, formData.email, formData.password, formData.role);

    if (result.success) {
      window.location.href = '/onboarding';
    } else {
      setError(result.error || 'Registration failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-2xl"
      >
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-serif font-bold tracking-tight text-[var(--primary)]">
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Join the library and unlock intelligent reading.
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

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <input
              name="name"
              type="text"
              required
              className="relative block w-full rounded-lg border border-[var(--border)] bg-[#0C0A09] px-4 py-3 text-[var(--foreground)] placeholder-[var(--muted)] focus:border-[var(--primary)] focus:outline-none shadow-inner"
              placeholder="Full Name"
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
            <input
              name="email"
              type="email"
              required
              className="relative block w-full rounded-lg border border-[var(--border)] bg-[#0C0A09] px-4 py-3 text-[var(--foreground)] placeholder-[var(--muted)] focus:border-[var(--primary)] focus:outline-none shadow-inner"
              placeholder="Email address"
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="relative block w-full rounded-lg border border-[var(--border)] bg-[#0C0A09] px-4 py-3 text-[var(--foreground)] placeholder-[var(--muted)] focus:border-[var(--primary)] focus:outline-none shadow-inner"
              placeholder="Password (8+ characters)"
              onChange={(e) => setFormData({...formData, password: e.target.value})}
            />

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-sm text-[var(--muted)]">I am a:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'student'})}
                  className={`p-3 rounded-lg border transition-all ${
                    formData.role === 'student'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                      : 'border-[var(--border)] bg-[#0C0A09] text-[var(--muted)] hover:border-amber-500/50'
                  }`}
                >
                  <div className="text-lg mb-1">🎓</div>
                  <div className="font-medium">Student</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, role: 'teacher'})}
                  className={`p-3 rounded-lg border transition-all ${
                    formData.role === 'teacher'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                      : 'border-[var(--border)] bg-[#0C0A09] text-[var(--muted)] hover:border-amber-500/50'
                  }`}
                >
                  <div className="text-lg mb-1">👨‍🏫</div>
                  <div className="font-medium">Teacher</div>
                </button>
              </div>
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Register Account'}
          </Button>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-[var(--surface)] px-2 text-[var(--muted)]">Or sign up with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button variant="secondary" type="button">Google</Button>
              <Button variant="secondary" type="button">Apple</Button>
            </div>
          </div>
        </form>
        
        <p className="text-center text-sm text-[var(--muted)]">
          Already a scholar?{' '}
          <Link href="/login" className="font-medium text-[var(--primary)] hover:text-amber-500">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
