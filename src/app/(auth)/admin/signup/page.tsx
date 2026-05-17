'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';

export default function AdminSignupPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await signup(formData.name, formData.email, formData.password, 'admin');

    if (result.success) {
      window.location.href = '/admin/dashboard';
    } else {
      setError(result.error || 'Registration failed');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md space-y-8 rounded-2xl border border-red-500/20 bg-(--surface) p-8 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10 text-red-400">
            <Shield size={22} />
          </div>
          <h2 className="text-3xl font-serif font-bold tracking-tight text-red-400">Create Admin Account</h2>
          <p className="mt-2 text-sm text-(--muted)">Creating an admin account gives full access. Use only for trusted users.</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </motion.div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <input name="name" type="text" required className="relative block w-full rounded-lg border border-(--border) bg-[#0C0A09] px-4 py-3 text-(--foreground) placeholder-(--muted) focus:border-(--primary) focus:outline-none shadow-inner" placeholder="Full Name" onChange={(e) => setFormData({...formData, name: e.target.value})} />
            <input name="email" type="email" required className="relative block w-full rounded-lg border border-(--border) bg-[#0C0A09] px-4 py-3 text-(--foreground) placeholder-(--muted) focus:border-(--primary) focus:outline-none shadow-inner" placeholder="Email address" onChange={(e) => setFormData({...formData, email: e.target.value})} />
            <input name="password" type="password" required minLength={8} className="relative block w-full rounded-lg border border-(--border) bg-[#0C0A09] px-4 py-3 text-(--foreground) placeholder-(--muted) focus:border-(--primary) focus:outline-none shadow-inner" placeholder="Password (8+ characters)" onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>

          <Button type="submit" variant="primary" className="w-full bg-red-600 hover:bg-red-500" disabled={isSubmitting}>{isSubmitting ? 'Creating Admin...' : 'Create Admin Account'}</Button>

          <p className="text-center text-sm text-(--muted)">Already an admin? <Link href="/admin/login" className="font-medium text-red-400 hover:text-red-300">Sign in</Link></p>
        </form>
      </motion.div>
    </div>
  );
}
