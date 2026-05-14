'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: 'easeOut' as const },
  }),
};

export default function LandingPage() {
  return (
    <div className="w-full relative overflow-hidden">
      
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-700/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-700/10 blur-[120px] pointer-events-none"></div>

      {/* ─── Hero ─── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-32 sm:pb-24 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="max-w-4xl mx-auto"
        >
          <span className="inline-block py-1 px-3 rounded-full bg-amber-900/20 text-amber-500 border border-amber-900/30 text-[10px] sm:text-sm font-bold tracking-widest uppercase mb-6">
            The Digital Library Reimagined
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-serif text-stone-100 mb-6 leading-tight">
            Read smarter, not harder.<br />
            <span className="text-amber-500 italic">Understand everything.</span>
          </h1>
          <p className="text-lg sm:text-xl text-stone-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Midnight Scholar is an AI-powered reading sanctuary. We extract flashcards, generate dynamic quizzes, and answer context-aware questions from any PDF you upload.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup">
              <button className="h-14 px-8 text-lg w-full sm:w-auto bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg shadow-[0_0_20px_rgba(217,119,6,0.4)] transition-colors">
                Start Reading For Free
              </button>
            </Link>
            <Link href="/login">
              <button className="h-14 px-8 text-lg w-full sm:w-auto bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold rounded-lg border border-stone-700 transition-colors">
                Sign In
              </button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="bg-[#0C0A09] border-y border-stone-800 py-24 relative z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs text-amber-500 uppercase font-bold tracking-[0.2em]">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-serif text-stone-100 mt-3">Three steps to mastery</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '01', icon: '📖', title: 'Upload Any PDF', desc: 'Drag & drop textbooks, papers, or novels. Our reader renders them beautifully with Focus Mode.' },
              { step: '02', icon: '✨', title: 'AI Analyzes It', desc: 'Summaries, keywords, flashcards, and quizzes are auto-generated from every page you read.' },
              { step: '03', icon: '🧠', title: 'Learn & Retain', desc: 'Spaced repetition reviews your flashcards at optimal intervals. You\'ll remember 95%+ of what you read.' },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="relative bg-[#1C1917] border border-stone-800 rounded-2xl p-8 text-center group hover:border-amber-900/50 transition-colors"
              >
                <span className="absolute top-4 right-4 text-xs font-mono text-stone-600">{item.step}</span>
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-serif text-stone-100 mb-3">{item.title}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Feature Grid ─── */}
      <section className="bg-stone-900/50 border-b border-stone-800 py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-xs text-violet-400 uppercase font-bold tracking-[0.2em]">Powerful Features</span>
            <h2 className="text-3xl md:text-4xl font-serif text-stone-100 mt-3">Everything a scholar needs</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: '🎯', title: 'Focus Mode', desc: 'Black out distractions. Just you and the text. Deep reading that sticks.', color: 'amber' },
              { icon: '✨', title: 'AI Doubt Solver', desc: 'Ask questions about the exact page you\'re on. AI understands your context perfectly.', color: 'violet' },
              { icon: '🧠', title: 'Spaced Repetition', desc: 'SM-2 algorithm schedules flashcard reviews at optimal intervals for 95%+ retention.', color: 'amber' },
              { icon: '📝', title: 'Smart Quizzes', desc: 'Auto-generated MCQs test your understanding. Earn XP and track your accuracy.', color: 'violet' },
              { icon: '🔑', title: 'Keyword Extraction', desc: 'AI identifies key terms, defines them, and rates their importance on every page.', color: 'amber' },
              { icon: '🏆', title: 'Gamification & XP', desc: 'Earn wisdom points, maintain streaks, unlock badges, and compete on the leaderboard.', color: 'violet' },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
              >
                <div className={`h-12 w-12 rounded-xl bg-${feature.color}-900/20 flex items-center justify-center text-2xl mb-6`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-serif text-stone-100 mb-3">{feature.title}</h3>
                <p className="text-stone-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats Bar ─── */}
      <section className="bg-[#0C0A09] border-b border-stone-800 py-16 relative z-10">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: '9+', label: 'AI-Powered Tools' },
            { value: 'SM-2', label: 'Spaced Repetition Engine' },
            { value: '95%', label: 'Target Retention' },
            { value: '∞', label: 'Free PDF Uploads' },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-3xl md:text-4xl font-serif font-bold text-[var(--primary)]">{stat.value}</p>
              <p className="text-xs text-stone-500 uppercase tracking-wider mt-2">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 relative z-10">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-5xl font-serif text-stone-100 mb-6">
              Ready to become a<br /><span className="text-amber-500 italic">Midnight Scholar?</span>
            </h2>
            <p className="text-stone-400 mb-10 max-w-lg mx-auto leading-relaxed">
              Join thousands of students who read smarter, retain more, and ace their exams. Free forever — no credit card required.
            </p>
            <Link href="/signup">
              <button className="h-14 px-10 text-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-lg shadow-[0_0_30px_rgba(217,119,6,0.3)] transition-all hover:shadow-[0_0_40px_rgba(217,119,6,0.5)]">
                Create Free Account →
              </button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
