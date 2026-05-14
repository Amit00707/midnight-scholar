'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useDueFlashcards,
  useFlashcardDeck,
  useFlashcardStats,
  useReviewFlashcard,
  useDeleteFlashcard,
  useSuspendFlashcard,
  useCreateFlashcard,
} from '@/lib/hooks/useFlashcardDeck';
import { useAuth } from '@/lib/auth-context';

export default function FlashcardDeckPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'review' | 'deck' | 'stats'>('review');
  const [deckPage, setDeckPage] = useState(1);
  const [flipped, setFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewedCount, setReviewedCount] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newBookId, setNewBookId] = useState('');

  // Data hooks
  const { data: dueData, isLoading: dueLoading } = useDueFlashcards();
  const { data: deckData, isLoading: deckLoading } = useFlashcardDeck(undefined, deckPage);
  const { data: stats } = useFlashcardStats();
  const reviewMutation = useReviewFlashcard();
  const deleteMutation = useDeleteFlashcard();
  const suspendMutation = useSuspendFlashcard();
  const createMutation = useCreateFlashcard();

  const dueCards = dueData?.flashcards || [];
  const deckCards = deckData?.flashcards || [];
  const totalDeck = deckData?.total || 0;

  if (authLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-[var(--muted)] text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  const handleReview = (rating: number) => {
    if (!dueCards[currentIndex]) return;
    reviewMutation.mutate(
      { cardId: dueCards[currentIndex].id, rating },
      {
        onSuccess: () => {
          setFlipped(false);
          setReviewedCount(prev => prev + 1);
          setTimeout(() => {
            if (currentIndex < dueCards.length - 1) {
              setCurrentIndex(prev => prev + 1);
            }
          }, 150);
        },
      }
    );
  };

  const handleCreateCard = () => {
    if (!newFront.trim() || !newBack.trim() || !newBookId.trim()) return;
    createMutation.mutate(
      { bookId: newBookId, front: newFront, back: newBack },
      {
        onSuccess: () => {
          setNewFront('');
          setNewBack('');
          setNewBookId('');
          setShowCreateModal(false);
        },
      }
    );
  };

  const ratingLabels = ['Again', 'Hard', 'Good', 'Easy'];
  const ratingColors = [
    'bg-red-900/30 text-red-400 border-red-900/50 hover:bg-red-900/50',
    'bg-orange-900/30 text-orange-400 border-orange-900/50 hover:bg-orange-900/50',
    'bg-blue-900/30 text-blue-400 border-blue-900/50 hover:bg-blue-900/50',
    'bg-green-900/30 text-green-400 border-green-900/50 hover:bg-green-900/50',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="flex justify-between items-end mb-8 border-b border-[var(--border)] pb-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-[var(--foreground)]">
            Flashcard Deck
          </h1>
          <p className="text-[var(--muted)] mt-2">
            {stats?.due_today || 0} cards due · {stats?.total_cards || 0} total
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-[var(--primary)] text-[#0C0A09] rounded-lg font-medium text-sm hover:opacity-90"
        >
          + New Card
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-[#1C1917] rounded-xl p-1 border border-[var(--border)]">
        {(['review', 'deck', 'stats'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'bg-[var(--primary)] text-[#0C0A09]'
                : 'text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            {tab === 'review' ? `Review (${stats?.due_today || 0})` : tab === 'deck' ? `Deck (${totalDeck})` : 'Stats'}
          </button>
        ))}
      </div>

      {/* ═══════════════ REVIEW TAB ═══════════════ */}
      {activeTab === 'review' && (
        <div className="flex flex-col items-center">
          {dueLoading ? (
            <div className="animate-pulse w-full max-w-lg">
              <div className="h-64 bg-[#1C1917] rounded-2xl border border-[var(--border)]" />
            </div>
          ) : dueCards.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-2xl font-serif text-[var(--foreground)] mb-2">All caught up!</h2>
              <p className="text-[var(--muted)]">No cards due for review. Come back later!</p>
            </div>
          ) : currentIndex < dueCards.length ? (
            <div className="w-full max-w-lg">
              {/* Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex + (flipped ? '-b' : '-f')}
                  initial={{ rotateY: 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: -90, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  onClick={() => setFlipped(!flipped)}
                  className={`w-full min-h-[300px] p-8 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer shadow-xl relative
                    ${flipped
                      ? 'bg-[var(--primary)] text-[#0C0A09] border-[var(--primary)]'
                      : 'bg-[#1C1917] border-[var(--border)] text-[var(--foreground)]'
                    }`}
                >
                  <span className="text-xs opacity-50 absolute top-4 left-4">
                    {flipped ? 'Answer' : 'Question'}
                  </span>
                  <span className="text-xs opacity-50 absolute top-4 right-4">
                    {currentIndex + 1}/{dueCards.length}
                  </span>
                  <p className="text-xl font-serif leading-relaxed max-w-md">
                    {flipped ? dueCards[currentIndex].back : dueCards[currentIndex].front}
                  </p>
                  {!flipped && (
                    <p className="text-xs opacity-40 mt-6">Click to reveal answer</p>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Rating Buttons */}
              {flipped && (
                <div className="grid grid-cols-4 gap-3 mt-6">
                  {ratingLabels.map((label, idx) => {
                    const preview = dueCards[currentIndex]?.interval_previews?.[idx];
                    return (
                      <button
                        key={label}
                        onClick={() => handleReview(idx)}
                        disabled={reviewMutation.isPending}
                        className={`py-3 rounded-xl border font-medium transition-all disabled:opacity-40 ${ratingColors[idx]}`}
                      >
                        <div className="text-sm">{label}</div>
                        {preview && <div className="text-xs opacity-70 mt-0.5">{preview}</div>}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-between text-xs text-[var(--muted)] mb-1.5">
                  <span>Session Progress</span>
                  <span>{reviewedCount}/{dueCards.length}</span>
                </div>
                <div className="w-full bg-[var(--border)] rounded-full h-2">
                  <div
                    className="bg-[var(--primary)] h-2 rounded-full transition-all"
                    style={{ width: `${(reviewedCount / dueCards.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Session Complete */
            <div className="text-center py-16">
              <div className="text-5xl mb-4">🏆</div>
              <h2 className="text-2xl font-serif text-[var(--foreground)] mb-2">Session Complete!</h2>
              <p className="text-[var(--muted)]">
                Reviewed {reviewedCount} cards · Earned +{reviewedCount * 5} XP
              </p>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ DECK TAB ═══════════════ */}
      {activeTab === 'deck' && (
        <div>
          {deckLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-20 bg-[#1C1917] rounded-xl border border-[var(--border)]" />
              ))}
            </div>
          ) : deckCards.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-[var(--foreground)] font-medium mb-1">Your deck is empty</p>
              <p className="text-sm text-[var(--muted)]">Generate flashcards while reading to fill it up.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deckCards.map((card: any) => {
                const isDue = new Date(card.next_review) <= new Date();
                return (
                  <div
                    key={card.id}
                    className={`bg-[#1C1917] border rounded-xl p-4 transition-colors ${
                      card.is_suspended ? 'border-[var(--border)] opacity-50' : isDue ? 'border-amber-800/50' : 'border-[var(--border)]'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 mr-4">
                        <p className="text-sm text-[var(--foreground)] font-medium">{card.front}</p>
                        <p className="text-xs text-[var(--muted)] mt-1 line-clamp-1">{card.back}</p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button
                          onClick={() => suspendMutation.mutate(card.id)}
                          className="text-xs px-2 py-1 rounded border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                          title={card.is_suspended ? 'Unsuspend' : 'Suspend'}
                        >
                          {card.is_suspended ? '▶' : '⏸'}
                        </button>
                        <button
                          onClick={() => { if (confirm('Delete this card?')) deleteMutation.mutate(card.id); }}
                          className="text-xs px-2 py-1 rounded border border-red-900/50 text-red-400 hover:bg-red-900/20"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-2 text-[10px] text-[var(--muted)]">
                      <span>EF: {card.ease_factor?.toFixed(1)}</span>
                      <span>Interval: {card.interval}d</span>
                      <span>Reps: {card.repetitions}</span>
                      <span className={`${card.source === 'manual' ? 'text-blue-400' : 'text-purple-400'}`}>
                        {card.source === 'manual' ? 'Manual' : 'AI'}
                      </span>
                      {isDue && !card.is_suspended && (
                        <span className="text-amber-400 font-bold">DUE</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Pagination */}
              {totalDeck > 50 && (
                <div className="flex justify-center gap-3 pt-4">
                  <button
                    onClick={() => setDeckPage(p => Math.max(1, p - 1))}
                    disabled={deckPage === 1}
                    className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-sm disabled:opacity-30"
                  >
                    ← Prev
                  </button>
                  <span className="text-sm text-[var(--muted)] py-1.5">
                    Page {deckPage} of {Math.ceil(totalDeck / 50)}
                  </span>
                  <button
                    onClick={() => setDeckPage(p => p + 1)}
                    disabled={deckPage >= Math.ceil(totalDeck / 50)}
                    className="px-3 py-1.5 rounded-lg border border-[var(--border)] text-sm disabled:opacity-30"
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ STATS TAB ═══════════════ */}
      {activeTab === 'stats' && stats && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Cards', value: stats.total_cards, color: 'text-[var(--foreground)]' },
              { label: 'Due Today', value: stats.due_today, color: 'text-amber-400' },
              { label: 'Reviewed Today', value: stats.cards_reviewed_today, color: 'text-green-400' },
              { label: 'Retention', value: `${stats.retention_rate}%`, color: 'text-blue-400' },
            ].map(stat => (
              <div key={stat.label} className="bg-[#1C1917] border border-[var(--border)] rounded-xl p-4 text-center">
                <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-[var(--muted)] mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Card Maturity */}
          <div className="bg-[#1C1917] border border-[var(--border)] rounded-xl p-6">
            <h3 className="text-lg font-serif text-[var(--foreground)] mb-4">Card Maturity</h3>
            <div className="space-y-3">
              {[
                { label: 'New (unseen)', count: stats.new_cards, color: 'bg-blue-400' },
                { label: 'Learning (<21d)', count: stats.young_cards, color: 'bg-orange-400' },
                { label: 'Mature (>21d)', count: stats.mature_cards, color: 'bg-green-400' },
                { label: 'Suspended', count: stats.suspended_cards, color: 'bg-gray-500' },
              ].map(row => (
                <div key={row.label} className="flex items-center gap-3">
                  <span className="text-sm text-[var(--muted)] w-32">{row.label}</span>
                  <div className="flex-1 bg-[var(--border)] rounded-full h-2">
                    <div
                      className={`${row.color} h-2 rounded-full transition-all`}
                      style={{ width: stats.total_cards > 0 ? `${(row.count / stats.total_cards) * 100}%` : '0%' }}
                    />
                  </div>
                  <span className="text-sm text-[var(--foreground)] w-10 text-right">{row.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Avg Ease Factor */}
          <div className="bg-[#1C1917] border border-[var(--border)] rounded-xl p-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--muted)]">Average Ease Factor</span>
              <span className={`text-xl font-bold ${
                stats.average_ease >= 2.5 ? 'text-green-400' : stats.average_ease >= 2.0 ? 'text-orange-400' : 'text-red-400'
              }`}>
                {stats.average_ease.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Per-Book */}
          {stats.books?.length > 0 && (
            <div className="bg-[#1C1917] border border-[var(--border)] rounded-xl p-6">
              <h3 className="text-lg font-serif text-[var(--foreground)] mb-4">Cards by Book</h3>
              <div className="space-y-3">
                {stats.books.map((book: any) => (
                  <div key={book.book_id} className="flex justify-between items-center py-2 border-b border-[var(--border)] last:border-0">
                    <span className="text-sm text-[var(--foreground)]">Book #{book.book_id}</span>
                    <div className="flex gap-4 text-xs">
                      <span className="text-[var(--muted)]">{book.card_count} cards</span>
                      {book.due_count > 0 && (
                        <span className="text-amber-400 font-bold">{book.due_count} due</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════ CREATE MODAL ═══════════════ */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-[#1C1917] border border-[var(--border)] rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-lg font-serif text-[var(--foreground)] mb-4">Create Flashcard</h3>
              <div className="space-y-3">
                <input
                  value={newBookId}
                  onChange={e => setNewBookId(e.target.value)}
                  placeholder="Book ID"
                  className="w-full px-3 py-2 bg-[#0C0A09] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]"
                />
                <input
                  value={newFront}
                  onChange={e => setNewFront(e.target.value)}
                  placeholder="Question (front)"
                  className="w-full px-3 py-2 bg-[#0C0A09] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder:text-[var(--muted)]"
                />
                <textarea
                  value={newBack}
                  onChange={e => setNewBack(e.target.value)}
                  placeholder="Answer (back)"
                  rows={3}
                  className="w-full px-3 py-2 bg-[#0C0A09] border border-[var(--border)] rounded-lg text-sm text-[var(--foreground)] placeholder:text-[var(--muted)] resize-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 py-2 rounded-lg border border-[var(--border)] text-[var(--muted)] text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateCard}
                    disabled={!newFront.trim() || !newBack.trim() || !newBookId.trim() || createMutation.isPending}
                    className="flex-1 py-2 bg-[var(--primary)] text-[#0C0A09] rounded-lg text-sm font-medium disabled:opacity-40"
                  >
                    {createMutation.isPending ? 'Saving...' : 'Create'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
