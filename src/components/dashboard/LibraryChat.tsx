'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Loader2, BookOpen, ChevronRight, X } from 'lucide-react';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';

export function LibraryChat() {
  const [query, setQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<{ answer: string; suggested_books: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const res = await api.libraryChat(query);
      setResponse(res);
      setQuery('');
    } catch (err: any) {
      setError(err.message || 'Failed to connect to the library assistant.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#1C1917] border border-[var(--border)] rounded-2xl overflow-hidden shadow-2xl relative">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-violet-600/10 blur-[60px] pointer-events-none"></div>
      
      <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center">
            <Sparkles size={16} className="text-violet-400" />
          </div>
          <h3 className="text-lg font-serif text-[var(--foreground)] font-bold">Library AI Assistant</h3>
        </div>

        <p className="text-sm text-[var(--muted)] mb-6">
          Ask questions across your entire library. Find connections, summarize themes, or get book recommendations.
        </p>

        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., 'Compare the themes of justice in my philosophy books'"
            className="w-full bg-[#0C0A09] border border-[var(--border)] rounded-xl px-4 py-3 pr-12 text-sm text-[var(--foreground)] focus:outline-none focus:border-violet-500 transition-colors"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={!query.trim() || isSubmitting}
            className="absolute right-2 top-1.5 p-2 text-violet-400 hover:text-violet-300 disabled:opacity-30 transition-colors"
          >
            {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </form>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-4 p-3 bg-red-900/20 border border-red-900/30 rounded-lg text-xs text-red-400 flex justify-between items-center"
            >
              <span>{error}</span>
              <button onClick={() => setError(null)}><X size={14} /></button>
            </motion.div>
          )}

          {response && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 border-t border-[var(--border)] pt-6"
            >
              <div className="space-y-4">
                <div className="bg-[#0C0A09] border border-[var(--border)] rounded-xl p-4 text-sm text-[var(--foreground)] leading-relaxed relative">
                  <div className="absolute -top-3 left-4 bg-[#1C1917] px-2 text-[10px] uppercase tracking-widest text-[var(--muted)] font-bold">Assistant Answer</div>
                  {response.answer}
                </div>

                {response.suggested_books.length > 0 && (
                  <div>
                    <h4 className="text-[10px] uppercase tracking-widest text-[var(--muted)] font-bold mb-3 px-1">Relevant Books</h4>
                    <div className="flex flex-wrap gap-2">
                      {response.suggested_books.map((book, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 bg-[#2E224F]/30 border border-[#7C3AED]/30 px-3 py-1.5 rounded-full text-[11px] text-[#A78BFA]">
                          <BookOpen size={12} />
                          {book}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <Button variant="ghost" size="sm" onClick={() => setResponse(null)} className="text-xs">
                    Clear Chat
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-[#0C0A09]/50 border-t border-[var(--border)] p-3 flex justify-center">
         <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] text-[var(--muted)] uppercase font-bold tracking-tighter">
            <span className="flex items-center gap-1 shrink-0"><ChevronRight size={10} className="text-violet-500" /> Cross-Book Analysis</span>
            <span className="flex items-center gap-1 shrink-0"><ChevronRight size={10} className="text-violet-500" /> Intellectual Synthesis</span>
         </div>
      </div>
    </div>
  );
}
