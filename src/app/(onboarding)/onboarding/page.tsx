'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/Button';
import { Check } from 'lucide-react';

const INTERESTS = [
  { id: 'philosophy', label: 'Philosophy', icon: '🏛️' },
  { id: 'science', label: 'Science', icon: '⚛️' },
  { id: 'history', label: 'History', icon: '📜' },
  { id: 'psychology', label: 'Psychology', icon: '🧠' },
  { id: 'technology', label: 'Technology', icon: '💻' },
  { id: 'fiction', label: 'Fiction', icon: '🖋️' },
  { id: 'business', label: 'Business', icon: '📈' },
  { id: 'art', label: 'Art & Culture', icon: '🎨' },
  { id: 'mathematics', label: 'Mathematics', icon: '∑' },
  { id: 'biology', label: 'Biology', icon: '🧬' },
  { id: 'economics', label: 'Economics', icon: '💰' },
  { id: 'literature', label: 'Literature', icon: '📚' },
];

const GOALS = [
  { id: 'study', label: 'Academic Study', icon: '🎓', desc: 'Exams, research, coursework' },
  { id: 'career', label: 'Career Growth', icon: '🚀', desc: 'Skills, industry knowledge' },
  { id: 'curiosity', label: 'Pure Curiosity', icon: '🔭', desc: 'Explore ideas freely' },
  { id: 'habit', label: 'Build a Habit', icon: '🔥', desc: 'Read consistently every day' },
];

const DAILY_GOALS = [
  { id: '10', label: '10 min / day', desc: 'Light reader' },
  { id: '20', label: '20 min / day', desc: 'Steady pace' },
  { id: '30', label: '30 min / day', desc: 'Dedicated scholar' },
  { id: '60', label: '1 hour / day', desc: 'Deep diver' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedGoal, setSelectedGoal] = useState('');
  const [selectedDailyGoal, setSelectedDailyGoal] = useState('20');

  const steps = [
    { title: 'What are you curious about?', subtitle: 'Pick at least 3 topics you love.' },
    { title: 'What brings you here?', subtitle: 'We\'ll tailor your experience to your goal.' },
    { title: 'How much time can you commit?', subtitle: 'Even 10 minutes a day builds a powerful habit.' },
  ];

  function toggleInterest(id: string) {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  }

  function handleFinish() {
    // Save to localStorage
    localStorage.setItem('midnight_scholar_interests', JSON.stringify(selectedInterests));
    localStorage.setItem('midnight_scholar_goal', selectedGoal);
    localStorage.setItem('ms_reading_goal', JSON.stringify({
      pagesPerDay: parseInt(selectedDailyGoal),
      minutesPerDay: parseInt(selectedDailyGoal),
    }));
    router.push('/dashboard');
  }

  function canProceed() {
    if (step === 0) return selectedInterests.length >= 3;
    if (step === 1) return !!selectedGoal;
    if (step === 2) return !!selectedDailyGoal;
    return false;
  }

  return (
    <div className="min-h-screen bg-[var(--background)] flex flex-col items-center justify-center px-4 py-12">
      {/* Progress Bar */}
      <div className="w-full max-w-2xl mb-10">
        <div className="flex items-center justify-between mb-3">
          {steps.map((_, i) => (
            <React.Fragment key={i}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                i < step
                  ? 'bg-amber-600 border-amber-600 text-black'
                  : i === step
                    ? 'border-amber-600 text-amber-500'
                    : 'border-stone-700 text-stone-600'
              }`}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-all ${i < step ? 'bg-amber-600' : 'bg-stone-800'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
        <p className="text-xs text-[var(--muted)] text-center">Step {step + 1} of {steps.length}</p>
      </div>

      {/* Card */}
      <div className="w-full max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="bg-[#1C1917] border border-[var(--border)] rounded-3xl p-8 shadow-2xl"
          >
            {/* Header */}
            <div className="text-center mb-8">
              {step === 0 && <div className="text-5xl mb-4">📚</div>}
              {step === 1 && <div className="text-5xl mb-4">🎯</div>}
              {step === 2 && <div className="text-5xl mb-4">⏱️</div>}
              <h2 className="text-3xl font-serif font-bold text-[var(--foreground)] mb-2">
                {steps[step].title}
              </h2>
              <p className="text-[var(--muted)]">{steps[step].subtitle}</p>
            </div>

            {/* Step 0 — Interests */}
            {step === 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {INTERESTS.map(interest => {
                  const selected = selectedInterests.includes(interest.id);
                  return (
                    <button
                      key={interest.id}
                      onClick={() => toggleInterest(interest.id)}
                      className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                        selected
                          ? 'border-amber-600 bg-amber-900/20 shadow-[0_0_15px_rgba(217,119,6,0.2)]'
                          : 'border-[var(--border)] bg-[#0C0A09] hover:border-stone-600'
                      }`}
                    >
                      <span className="text-2xl">{interest.icon}</span>
                      <span className={`text-xs font-bold ${selected ? 'text-amber-400' : 'text-[var(--muted)]'}`}>
                        {interest.label}
                      </span>
                      {selected && (
                        <div className="w-4 h-4 rounded-full bg-amber-600 flex items-center justify-center">
                          <Check size={10} className="text-black" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 1 — Goals */}
            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {GOALS.map(goal => {
                  const selected = selectedGoal === goal.id;
                  return (
                    <button
                      key={goal.id}
                      onClick={() => setSelectedGoal(goal.id)}
                      className={`p-6 rounded-2xl border-2 text-left transition-all ${
                        selected
                          ? 'border-amber-600 bg-amber-900/20'
                          : 'border-[var(--border)] bg-[#0C0A09] hover:border-stone-600'
                      }`}
                    >
                      <div className="text-3xl mb-3">{goal.icon}</div>
                      <h3 className={`font-bold mb-1 ${selected ? 'text-amber-400' : 'text-[var(--foreground)]'}`}>
                        {goal.label}
                      </h3>
                      <p className="text-xs text-[var(--muted)]">{goal.desc}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 2 — Daily Goal */}
            {step === 2 && (
              <div className="grid grid-cols-2 gap-4">
                {DAILY_GOALS.map(goal => {
                  const selected = selectedDailyGoal === goal.id;
                  return (
                    <button
                      key={goal.id}
                      onClick={() => setSelectedDailyGoal(goal.id)}
                      className={`p-6 rounded-2xl border-2 text-center transition-all ${
                        selected
                          ? 'border-amber-600 bg-amber-900/20'
                          : 'border-[var(--border)] bg-[#0C0A09] hover:border-stone-600'
                      }`}
                    >
                      <p className={`text-xl font-bold mb-1 ${selected ? 'text-amber-400' : 'text-[var(--foreground)]'}`}>
                        {goal.label}
                      </p>
                      <p className="text-xs text-[var(--muted)]">{goal.desc}</p>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-[var(--border)]">
              <button
                onClick={() => step > 0 ? setStep(s => s - 1) : router.push('/dashboard')}
                className="text-[var(--muted)] hover:text-[var(--foreground)] transition-colors text-sm"
              >
                {step === 0 ? 'Skip for now' : '← Back'}
              </button>

              <Button
                variant="primary"
                disabled={!canProceed()}
                onClick={() => {
                  if (step < steps.length - 1) {
                    setStep(s => s + 1);
                  } else {
                    handleFinish();
                  }
                }}
                className="px-8"
              >
                {step < steps.length - 1 ? 'Continue →' : 'Start Reading 🚀'}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Welcome message */}
      {user && (
        <p className="mt-6 text-sm text-[var(--muted)]">
          Welcome, <span className="text-amber-500 font-bold">{user.name}</span>! Let's set up your experience.
        </p>
      )}
    </div>
  );
}
