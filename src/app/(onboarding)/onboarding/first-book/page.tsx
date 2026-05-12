'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const interests = [
    'Philosophy', 'Science', 'Technology', 'History', 'Psychology',
    'Business', 'Fiction', 'Fantasy', 'Self-Help', 'Biography'
  ];

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  const handleComplete = () => {
    setIsSubmitting(true);
    // Save to localStorage so the dashboard uses real user preferences
    localStorage.setItem('midnight_scholar_interests', JSON.stringify(selectedInterests));
    setTimeout(() => {
      router.push('/dashboard');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Cinematic Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-700/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-700/10 blur-[120px] pointer-events-none"></div>

      <div className="max-w-2xl w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="inline-block py-1 px-3 rounded-full bg-amber-900/20 text-amber-500 border border-amber-900/30 text-xs font-bold tracking-widest uppercase mb-4">
            Welcome to Midnight Scholar
          </span>
          <h1 className="text-4xl md:text-5xl font-serif text-[var(--foreground)] mb-4">
            {step === 1 ? 'Tell us what fascinates you.' : 'Your sanctuary is ready.'}
          </h1>
          <p className="text-[var(--muted)] text-lg">
            {step === 1 
              ? 'Select at least 3 topics to personalize your AI recommendations.' 
              : 'We\'ve curated an initial collection based on your intellectual pursuits.'}
          </p>
        </motion.div>

        {step === 1 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-[#1C1917] border border-[var(--border)] rounded-2xl p-8 shadow-2xl"
          >
            <div className="flex flex-wrap justify-center gap-4 mb-10">
              {interests.map(interest => (
                <button
                  key={interest}
                  onClick={() => toggleInterest(interest)}
                  className={`px-6 py-3 rounded-full border transition-all ${
                    selectedInterests.includes(interest)
                      ? 'bg-[var(--primary)] border-[var(--primary)] text-[#0C0A09] font-bold shadow-[0_0_15px_rgba(217,119,6,0.4)]'
                      : 'bg-transparent border-[var(--border)] text-[var(--muted)] hover:border-amber-700/50 hover:text-[var(--foreground)]'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center mt-8 border-t border-[var(--border)] pt-6">
              <span className="text-sm text-[var(--muted)]">
                {selectedInterests.length} selected
              </span>
              <Button 
                variant="primary" 
                onClick={() => setStep(2)}
                disabled={selectedInterests.length < 3}
                className="px-8"
              >
                Continue →
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1C1917] border border-[var(--border)] rounded-2xl p-8 shadow-2xl text-center"
          >
            <div className="w-24 h-24 bg-amber-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-900/30">
              <span className="text-4xl">🏛️</span>
            </div>
            
            <h2 className="text-2xl font-serif text-[var(--foreground)] mb-4">
              The Library Doors Are Open
            </h2>
            <p className="text-[var(--muted)] mb-8 max-w-md mx-auto">
              Your dashboard has been personalized. Explore trending books, dive into your recommendations, and start reading smarter.
            </p>

            <Button 
              variant="primary" 
              onClick={handleComplete}
              disabled={isSubmitting}
              className="w-full md:w-auto px-12 h-14 text-lg"
            >
              {isSubmitting ? 'Entering...' : 'Enter Dashboard'}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
