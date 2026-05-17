'use client';

import React, { useState, useEffect } from 'react';
import { useFlashcardStats } from '@/lib/hooks/useFlashcardDeck';
import { api } from '@/lib/api/client';

export function RevisionTab() {
  const { data: stats, isLoading } = useFlashcardStats();

  if (isLoading) {
    return (
      <div className="flex h-full flex-col">
        <div className="mb-6 border-b border-[var(--border)] pb-4">
          <h3 className="text-lg font-serif text-[var(--accent)] font-bold flex items-center gap-2">
            ✨ Smart Revision
          </h3>
          <p className="text-xs text-[var(--muted)] mt-1">Loading stats...</p>
        </div>
        <div className="space-y-4 animate-pulse">
          <div className="h-20 bg-[#292524] rounded-lg" />
          <div className="h-20 bg-[#292524] rounded-lg" />
        </div>
      </div>
    );
  }

  const dueToday = stats?.due_today || 0;
  const totalCards = stats?.total_cards || 0;
  const reviewedToday = stats?.cards_reviewed_today || 0;
  const retentionRate = stats?.retention_rate || 0;
  const matureCards = stats?.mature_cards || 0;
  const youngCards = stats?.young_cards || 0;
  const newCards = stats?.new_cards || 0;
  const avgEase = stats?.average_ease || 2.5;
  const books = stats?.books || [];

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 border-b border-[var(--border)] pb-4">
        <h3 className="text-lg font-serif text-[var(--accent)] font-bold flex items-center gap-2">
          ✨ Smart Revision
        </h3>
        <p className="text-xs text-[var(--muted)] mt-1">Spaced Repetition Analytics</p>
      </div>

      {/* Overview Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-[#1C1917] border border-[var(--border)] rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-[var(--primary)]">{dueToday}</p>
          <p className="text-[10px] text-[var(--muted)] mt-0.5">Due Today</p>
        </div>
        <div className="bg-[#1C1917] border border-[var(--border)] rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-400">{reviewedToday}</p>
          <p className="text-[10px] text-[var(--muted)] mt-0.5">Reviewed Today</p>
        </div>
        <div className="bg-[#1C1917] border border-[var(--border)] rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-400">{retentionRate}%</p>
          <p className="text-[10px] text-[var(--muted)] mt-0.5">Retention (30d)</p>
        </div>
        <div className="bg-[#1C1917] border border-[var(--border)] rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-[var(--foreground)]">{totalCards}</p>
          <p className="text-[10px] text-[var(--muted)] mt-0.5">Total Cards</p>
        </div>
      </div>

      {/* Card Maturity Breakdown */}
      <div className="mb-6">
        <h4 className="text-sm font-bold text-[var(--foreground)] mb-3">Card Maturity</h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-[var(--muted)]">New (unseen)</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-[var(--border)] rounded-full h-1.5">
                <div
                  className="bg-blue-400 h-1.5 rounded-full"
                  style={{ width: totalCards > 0 ? `${(newCards / totalCards) * 100}%` : '0%' }}
                />
              </div>
              <span className="text-xs text-blue-400 w-8 text-right">{newCards}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-[var(--muted)]">Learning (&lt;21d)</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-[var(--border)] rounded-full h-1.5">
                <div
                  className="bg-orange-400 h-1.5 rounded-full"
                  style={{ width: totalCards > 0 ? `${(youngCards / totalCards) * 100}%` : '0%' }}
                />
              </div>
              <span className="text-xs text-orange-400 w-8 text-right">{youngCards}</span>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-[var(--muted)]">Mature (&gt;21d)</span>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-[var(--border)] rounded-full h-1.5">
                <div
                  className="bg-green-400 h-1.5 rounded-full"
                  style={{ width: totalCards > 0 ? `${(matureCards / totalCards) * 100}%` : '0%' }}
                />
              </div>
              <span className="text-xs text-green-400 w-8 text-right">{matureCards}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ease Factor */}
      <div className="mb-6 p-3 bg-[#1C1917] border border-[var(--border)] rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-xs text-[var(--muted)]">Avg. Ease Factor</span>
          <span className={`text-sm font-bold ${avgEase >= 2.5 ? 'text-green-400' : avgEase >= 2.0 ? 'text-orange-400' : 'text-red-400'}`}>
            {avgEase.toFixed(2)}
          </span>
        </div>
        <p className="text-[10px] text-[var(--muted)] mt-1">
          {avgEase >= 2.5 ? 'Cards are comfortable — nice pace!' : avgEase >= 2.0 ? 'Some cards need more repetition.' : 'Many cards are challenging — keep reviewing!'}
        </p>
      </div>

      {/* Consistency Chart */}
      <div className="mb-8">
        <h4 className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider mb-3">Reading Consistency</h4>
        <div className="flex items-end gap-1 h-12">
          {[40, 70, 20, 90, 100, 60, 80].map((h, i) => (
            <div 
              key={i} 
              className="flex-1 rounded-t-sm bg-gradient-to-t from-[var(--primary)] to-amber-400 opacity-60 hover:opacity-100 transition-opacity"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="flex justify-between mt-1 text-[10px] text-[var(--muted)] font-mono">
          <span>MON</span>
          <span>SUN</span>
        </div>
      </div>

      {/* Weak Topics / Hotspots */}
      <WeakTopicsList />

      {/* Per-Book Breakdown */}
      {books.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-[var(--muted)] mb-3">Cards by Book</h4>
          <div className="space-y-2">
            {books.map((book: any) => (
              <div
                key={book.book_id}
                className="border border-[var(--border)] bg-[var(--surface)] p-3 rounded-lg"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs text-[var(--foreground)] font-medium truncate max-w-[60%]">
                    Book #{book.book_id}
                  </span>
                  <div className="flex gap-3">
                    <span className="text-[10px] text-[var(--muted)]">{book.card_count} cards</span>
                    {book.due_count > 0 && (
                      <span className="text-[10px] text-red-400 font-bold">{book.due_count} due</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalCards === 0 && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="text-3xl mb-3">📚</div>
          <p className="text-[var(--foreground)] font-medium mb-1">No flashcards yet</p>
          <p className="text-xs text-[var(--muted)]">
            Generate flashcards while reading to start building your deck.
          </p>
        </div>
      )}
    </div>
  );
}

function WeakTopicsList() {
  const [weakTopics, setWeakTopics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    async function load() {
      try {
        const res = await api.getWeakTopics();
        setWeakTopics(res.weak_topics || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return null;
  if (weakTopics.length === 0) return null;

  return (
    <div className="mb-6">
      <h4 className="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
        ⚠️ Attention Needed
      </h4>
      <div className="space-y-2">
        {weakTopics.map((topic, i) => (
          <div key={i} className="bg-red-500/10 border border-red-900/30 p-3 rounded-lg flex justify-between items-center">
            <div>
              <p className="text-xs font-bold text-red-200">Book #{topic.book_id}</p>
              <p className="text-[10px] text-red-300/70">Struggling on Page {topic.page_number}</p>
            </div>
            <div className="text-xs font-bold text-red-400">
              {topic.struggle_score} failures
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
