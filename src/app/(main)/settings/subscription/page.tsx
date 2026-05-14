'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';
import { Check, Zap, Crown, BookOpen } from 'lucide-react';
import Link from 'next/link';

const PLANS = [
  {
    id: 'free',
    name: 'Scholar',
    price: 0,
    period: 'forever',
    icon: <BookOpen size={24} />,
    color: 'border-stone-700',
    badge: null,
    features: [
      'Unlimited book browsing',
      'Basic PDF reader',
      'Up to 10 flashcards/month',
      'Community social feed',
      '3 AI summaries/day',
    ],
    missing: [
      'Unlimited AI features',
      'Advanced spaced repetition',
      'Teacher tools',
      'Priority support',
    ],
  },
  {
    id: 'pro',
    name: 'Midnight Pro',
    price: 9,
    period: 'month',
    icon: <Zap size={24} />,
    color: 'border-amber-600',
    badge: 'Most Popular',
    features: [
      'Everything in Scholar',
      'Unlimited AI summaries',
      'Unlimited flashcard generation',
      'Smart quiz generation',
      'Keyword extraction',
      'AI Doubt Solver',
      'Reading analytics',
      'Priority support',
    ],
    missing: [],
  },
  {
    id: 'scholar_plus',
    name: 'Scholar+',
    price: 19,
    period: 'month',
    icon: <Crown size={24} />,
    color: 'border-violet-600',
    badge: 'Best Value',
    features: [
      'Everything in Midnight Pro',
      'Teacher dashboard',
      'Classroom management',
      'Student progress tracking',
      'Assignment creation',
      'Bulk flashcard export',
      'API access',
      'Dedicated support',
    ],
    missing: [],
  },
];

export default function SubscriptionPage() {
  const { user } = useAuth();
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  async function handleSubscribe(planId: string) {
    if (planId === 'free') return;
    setLoading(planId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('ms_access_token')}`,
        },
        body: JSON.stringify({ plan_id: planId === 'pro' ? 1 : 2 }),
      });
      const data = await res.json();
      if (data.checkout_url) {
        window.open(data.checkout_url, '_blank');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(null);
    }
  }

  const getPrice = (price: number) => {
    if (price === 0) return 'Free';
    const discounted = billing === 'yearly' ? Math.round(price * 0.8) : price;
    return `$${discounted}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-900/10 border border-amber-900/20 text-amber-500 text-xs font-bold tracking-widest uppercase mb-6"
        >
          <Crown size={14} /> Upgrade Your Scholarship
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-[var(--foreground)] mb-4">
          Choose Your Plan
        </h1>
        <p className="text-[var(--muted)] text-lg max-w-xl mx-auto">
          Unlock the full power of AI-assisted reading. Cancel anytime.
        </p>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <span className={`text-sm font-medium ${billing === 'monthly' ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>
            Monthly
          </span>
          <button
            onClick={() => setBilling(b => b === 'monthly' ? 'yearly' : 'monthly')}
            className={`relative w-12 h-6 rounded-full transition-colors ${billing === 'yearly' ? 'bg-amber-600' : 'bg-stone-700'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${billing === 'yearly' ? 'translate-x-[26px]' : 'translate-x-0.5'}`} />
          </button>
          <span className={`text-sm font-medium ${billing === 'yearly' ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>
            Yearly
            <span className="ml-2 px-2 py-0.5 rounded-full bg-green-900/30 text-green-400 text-xs font-bold">
              Save 20%
            </span>
          </span>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`relative bg-[#1C1917] border-2 ${plan.color} rounded-3xl p-8 flex flex-col ${
              plan.id === 'pro' ? 'shadow-[0_0_40px_rgba(217,119,6,0.15)]' : ''
            }`}
          >
            {/* Badge */}
            {plan.badge && (
              <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                plan.id === 'pro' ? 'bg-amber-600 text-black' : 'bg-violet-600 text-white'
              }`}>
                {plan.badge}
              </div>
            )}

            {/* Plan Header */}
            <div className="mb-6">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${
                plan.id === 'free' ? 'bg-stone-800 text-stone-400' :
                plan.id === 'pro' ? 'bg-amber-900/30 text-amber-500' :
                'bg-violet-900/30 text-violet-400'
              }`}>
                {plan.icon}
              </div>
              <h3 className="text-xl font-bold text-[var(--foreground)] mb-1">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-[var(--foreground)]">
                  {getPrice(plan.price)}
                </span>
                {plan.price > 0 && (
                  <span className="text-[var(--muted)] text-sm">/{billing === 'yearly' ? 'mo, billed yearly' : 'month'}</span>
                )}
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-[var(--foreground)]">
                  <Check size={16} className="text-green-400 shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
              {plan.missing.map(f => (
                <li key={f} className="flex items-start gap-2 text-sm text-[var(--muted)] line-through opacity-50">
                  <span className="w-4 shrink-0">✕</span>
                  {f}
                </li>
              ))}
            </ul>

            {/* CTA */}
            <Button
              variant={plan.id === 'free' ? 'secondary' : 'primary'}
              className="w-full"
              disabled={plan.id === 'free' || loading === plan.id}
              onClick={() => handleSubscribe(plan.id)}
            >
              {loading === plan.id ? 'Redirecting...' :
               plan.id === 'free' ? 'Current Plan' :
               `Get ${plan.name}`}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-serif font-bold text-[var(--foreground)] text-center mb-8">
          Common Questions
        </h2>
        <div className="space-y-4">
          {[
            { q: 'Can I cancel anytime?', a: 'Yes, cancel anytime from your settings. You keep access until the end of your billing period.' },
            { q: 'Is there a free trial?', a: 'The Scholar plan is free forever. Pro plans include a 7-day free trial.' },
            { q: 'What payment methods are accepted?', a: 'All major credit cards, debit cards, and PayPal via Stripe.' },
            { q: 'Can I switch plans?', a: 'Yes, upgrade or downgrade anytime. Changes take effect immediately.' },
          ].map((item, i) => (
            <div key={i} className="bg-[#1C1917] border border-[var(--border)] rounded-2xl p-6">
              <h3 className="font-bold text-[var(--foreground)] mb-2">{item.q}</h3>
              <p className="text-sm text-[var(--muted)]">{item.a}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-[var(--muted)] mt-8">
          Questions? <Link href="/social" className="text-amber-500 hover:underline">Contact us</Link> or visit our community.
        </p>
      </div>
    </div>
  );
}
