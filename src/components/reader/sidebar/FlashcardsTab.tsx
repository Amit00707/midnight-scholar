'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGenerateFlashcards,
  useDueFlashcards,
  useReviewFlashcard,
  useCreateFlashcard,
} from '@/lib/hooks/useFlashcardDeck';

interface FlashcardsTabProps {
  bookId: string;
  pageNumber: number;
  selectedText?: string;
}

export function FlashcardsTab({ bookId, pageNumber, selectedText }: FlashcardsTabProps) {
  const [flipped, setFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<'generate' | 'review' | 'create'>('generate');
  const [showCreate, setShowCreate] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [reviewedCount, setReviewedCount] = useState(0);
  const cardStartTime = useRef<number>(Date.now());

  // Hooks
  const generateMutation = useGenerateFlashcards();
  const { data: dueData, refetch: refetchDue } = useDueFlashcards(bookId);
  const reviewMutation = useReviewFlashcard();
  const createMutation = useCreateFlashcard();

  // Cards to display based on mode
  const generatedCards = generateMutation.data?.flashcards || [];
  const dueCards = dueData?.flashcards || [];
  const cards = mode === 'review' ? dueCards : generatedCards;
  const dueCount = dueData?.total || 0;

  useEffect(() => {
    setCurrentIndex(0);
    setFlipped(false);
    setReviewedCount(0);
  }, [pageNumber, mode]);

  // Track time spent on each card
  useEffect(() => {
    cardStartTime.current = Date.now();
  }, [currentIndex, flipped]);

  const handleGenerate = (useSelection: boolean = false) => {
    generateMutation.mutate({ 
      bookId, 
      pageNumber, 
      context: useSelection ? selectedText : undefined 
    });
    setMode('generate');
  };

  const handleReview = (rating: number) => {
    if (!cards[currentIndex]) return;

    const timeSpentMs = Date.now() - cardStartTime.current;

    reviewMutation.mutate(
      { cardId: cards[currentIndex].id, rating, timeSpentMs },
      {
        onSuccess: () => {
          setFlipped(false);
          setReviewedCount((prev) => prev + 1);
          setTimeout(() => {
            if (currentIndex < cards.length - 1) {
              setCurrentIndex((prev) => prev + 1);
            }
          }, 150);
        },
      }
    );
  };

  const handleCreateCard = () => {
    if (!newFront.trim() || !newBack.trim()) return;
    createMutation.mutate(
      { bookId, front: newFront, back: newBack, sourcePage: pageNumber },
      {
        onSuccess: () => {
          setNewFront('');
          setNewBack('');
          setShowCreate(false);
        },
      }
    );
  };

  const ratingLabels = ['Again', 'Hard', 'Good', 'Easy'];
  const ratingColors = [
    'bg-red-900/30 text-red-400 border-red-900/50',
    'bg-orange-900/30 text-orange-400 border-orange-900/50',
    'bg-blue-900/30 text-blue-400 border-blue-900/50',
    'bg-green-900/30 text-green-400 border-green-900/50',
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-lg font-serif text-[var(--accent)] font-bold flex items-center gap-2">
          ✨ Flashcards
        </h3>
        <p className="text-xs text-[var(--muted)] mt-1">
          SM-2 Spaced Repetition · {dueCount} due today
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('generate')}
          className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors ${
            mode === 'generate'
              ? 'bg-[var(--primary)] text-[#0C0A09] border-[var(--primary)] font-medium'
              : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]'
          }`}
        >
          Generate
        </button>
        <button
          onClick={() => { setMode('review'); refetchDue(); }}
          className={`flex-1 py-1.5 text-xs rounded-lg border transition-colors relative ${
            mode === 'review'
              ? 'bg-[var(--primary)] text-[#0C0A09] border-[var(--primary)] font-medium'
              : 'border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]'
          }`}
        >
          Review
          {dueCount > 0 && mode !== 'review' && (
            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {dueCount > 9 ? '9+' : dueCount}
            </span>
          )}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center relative">
        {/* Generate Mode — Initial State */}
        {mode === 'generate' && generatedCards.length === 0 && !generateMutation.isPending && (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <p className="text-[var(--muted)] text-sm mb-4">
              Generate flashcards from this page and save them to your deck.
            </p>
            <div className="flex flex-col gap-2 w-full px-4">
              <button
                onClick={() => handleGenerate(false)}
                className="px-4 py-2 bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--foreground)] rounded-lg font-medium text-sm hover:bg-[#292524]"
              >
                Generate from Full Page
              </button>
              
              {selectedText && (
                <button
                  onClick={() => handleGenerate(true)}
                  className="px-4 py-2 bg-[var(--accent)] text-[#0C0A09] rounded-lg font-bold text-sm hover:opacity-90 shadow-lg animate-pulse"
                >
                  ✨ Generate from Selection
                </button>
              )}
            </div>
          </div>
        )}

        {/* Generation Result Banner */}
        {mode === 'generate' && generateMutation.isSuccess && generateMutation.data && (
          <div className="w-full mb-3 px-3 py-2 bg-green-900/20 border border-green-900/40 rounded-lg text-xs text-green-400 text-center">
            ✅ Saved {generateMutation.data.new_count} new cards
            {generateMutation.data.duplicate_count > 0 && (
              <> · {generateMutation.data.duplicate_count} duplicates skipped</>
            )}
          </div>
        )}

        {/* Review Mode — Empty State */}
        {mode === 'review' && dueCards.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-center">
            <div className="text-3xl mb-3">🎉</div>
            <p className="text-[var(--foreground)] font-medium mb-1">All caught up!</p>
            <p className="text-[var(--muted)] text-xs">No flashcards due for review right now.</p>
          </div>
        )}

        {/* Loading State */}
        {(generateMutation.isPending) && (
          <div className="animate-pulse flex flex-col items-center justify-center w-full min-h-[250px] p-6 rounded-xl border bg-[#1C1917] border-[var(--border)]">
            <div className="h-4 bg-[#292524] rounded w-1/2 mb-4" />
            <div className="h-4 bg-[#292524] rounded w-3/4" />
            <p className="text-[var(--muted)] text-xs mt-4">Generating flashcards with AI...</p>
          </div>
        )}

        {/* Card Display */}
        {cards.length > 0 && currentIndex < cards.length && (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex + (flipped ? '-back' : '-front')}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setFlipped(!flipped)}
                className={`w-full min-h-[220px] p-6 rounded-xl border flex flex-col items-center justify-center text-center cursor-pointer shadow-lg relative
                  ${flipped
                    ? 'bg-[var(--primary)] text-[#0C0A09] border-[var(--primary)]'
                    : 'bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)]'
                  }`}
              >
                <span className="text-xs opacity-50 absolute top-3 left-3">
                  {flipped ? 'Answer' : 'Question'}
                </span>
                <span className="text-xs opacity-50 absolute top-3 right-3">
                  {currentIndex + 1}/{cards.length}
                </span>
                <p className="text-lg font-serif leading-relaxed">
                  {flipped ? cards[currentIndex].back : cards[currentIndex].front}
                </p>
                {!flipped && (
                  <p className="text-xs opacity-40 mt-4">Tap to reveal answer</p>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Rating Buttons (visible after flip) */}
            {flipped && (
              <div className="grid grid-cols-4 gap-2 mt-4 w-full">
                {ratingLabels.map((label, idx) => {
                  const preview = cards[currentIndex]?.interval_previews?.[idx];
                  return (
                    <button
                      key={label}
                      onClick={() => handleReview(idx)}
                      disabled={reviewMutation.isPending}
                      className={`py-2 rounded-lg border text-xs font-medium transition-colors disabled:opacity-40 ${ratingColors[idx]}`}
                    >
                      <div>{label}</div>
                      {preview && (
                        <div className="text-[10px] opacity-70 mt-0.5">{preview}</div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Session Progress */}
            {mode === 'review' && (
              <div className="w-full mt-4">
                <div className="flex justify-between text-[10px] text-[var(--muted)] mb-1">
                  <span>Progress</span>
                  <span>{reviewedCount}/{cards.length}</span>
                </div>
                <div className="w-full bg-[var(--border)] rounded-full h-1.5">
                  <div
                    className="bg-[var(--primary)] h-1.5 rounded-full transition-all"
                    style={{ width: `${(reviewedCount / cards.length) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Session Complete */}
        {mode === 'review' && dueCards.length > 0 && currentIndex >= dueCards.length - 1 && reviewedCount >= dueCards.length && (
          <div className="text-center mt-4 p-4 bg-[#1C1917] rounded-xl border border-[var(--border)]">
            <div className="text-2xl mb-2">🏆</div>
            <p className="font-bold text-[var(--foreground)]">Session Complete!</p>
            <p className="text-xs text-[var(--muted)] mt-1">
              Reviewed {reviewedCount} cards · +{reviewedCount * 5} XP
            </p>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="mt-4 pt-3 border-t border-[var(--border)] space-y-2">
        {/* Manual Card Creation Toggle */}
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="w-full text-xs text-[var(--muted)] hover:text-[var(--foreground)] transition-colors py-1"
        >
          {showCreate ? '✕ Cancel' : '+ Add card manually'}
        </button>

        {/* Manual Creation Form */}
        {showCreate && (
          <div className="space-y-2">
            <input
              value={newFront}
              onChange={(e) => setNewFront(e.target.value)}
              placeholder="Question (front)"
              className="w-full px-3 py-2 bg-[#0C0A09] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]"
            />
            <textarea
              value={newBack}
              onChange={(e) => setNewBack(e.target.value)}
              placeholder="Answer (back)"
              rows={2}
              className="w-full px-3 py-2 bg-[#0C0A09] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] resize-none"
            />
            <button
              onClick={handleCreateCard}
              disabled={!newFront.trim() || !newBack.trim() || createMutation.isPending}
              className="w-full py-2 bg-[var(--primary)] text-[#0C0A09] rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-40"
            >
              {createMutation.isPending ? 'Saving...' : 'Save Card'}
            </button>
          </div>
        )}

        {/* Regenerate button (generate mode) */}
        {mode === 'generate' && generatedCards.length > 0 && (
          <button
            onClick={() => handleGenerate()}
            disabled={generateMutation.isPending}
            className="w-full py-2 bg-[var(--surface-hover)] text-[var(--foreground)] rounded-lg text-xs"
          >
            Regenerate for this page
          </button>
        )}
      </div>
    </div>
  );
}
