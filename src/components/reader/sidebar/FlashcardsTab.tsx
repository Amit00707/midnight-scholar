'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFlashcards } from '@/lib/hooks/useAI';

interface FlashcardsTabProps {
  bookId: string;
  pageNumber: number;
}

export function FlashcardsTab({ bookId, pageNumber }: FlashcardsTabProps) {
  const [flipped, setFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { data, isLoading, error } = useFlashcards(bookId, pageNumber);

  const cards = data?.flashcards || [];

  useEffect(() => {
    setCurrentIndex(0);
    setFlipped(false);
  }, [pageNumber]); // Reset when page changes

  const handleNext = () => {
    setFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev + 1) % cards.length), 150);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-serif text-[var(--accent)] font-bold flex items-center gap-2">
          ✨ Flashcards
        </h3>
        <p className="text-xs text-[var(--muted)] mt-1">Spaced Repetition Active</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative perspective-[1000px]">
        {isLoading ? (
          <div className="animate-pulse flex flex-col items-center justify-center w-full min-h-[250px] p-6 rounded-xl border bg-[#1C1917] border-[var(--border)]">
             <div className="h-4 bg-[#292524] rounded w-1/2 mb-4"></div>
             <div className="h-4 bg-[#292524] rounded w-3/4"></div>
          </div>
        ) : error ? (
          <div className="text-red-400 text-sm text-center">Failed to generate flashcards.</div>
        ) : cards.length === 0 ? (
          <div className="text-[var(--muted)] text-sm text-center">No flashcards available for this page.</div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex + (flipped ? '-back' : '-front')}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setFlipped(!flipped)}
                className={`w-full min-h-[250px] p-6 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer shadow-lg
                  ${flipped ? 'bg-[var(--primary)] text-[#0C0A09] border-[var(--primary)]' : 'bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)]'}`}
              >
                <span className="text-xs opacity-50 absolute top-4">{flipped ? 'Answer' : 'Question'}</span>
                <p className="text-xl font-serif">
                  {flipped ? cards[currentIndex].back : cards[currentIndex].front}
                </p>
              </motion.div>
            </AnimatePresence>

            <div className="flex gap-4 mt-8 w-full">
              <button 
                disabled={!flipped}
                onClick={handleNext}
                className="flex-1 py-2 rounded-lg bg-red-900/30 text-red-400 border border-red-900/50 disabled:opacity-30"
              >
                Hard
              </button>
              <button 
                disabled={!flipped}
                onClick={handleNext}
                className="flex-1 py-2 rounded-lg bg-green-900/30 text-green-400 border border-green-900/50 disabled:opacity-30"
              >
                Easy (4d)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
