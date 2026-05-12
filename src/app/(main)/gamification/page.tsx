'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';

interface LeaderboardEntry {
  user_id: number;
  score: number;
  name?: string; // Add name if returned by backend, else we just use ID
}

export default function GamificationPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res: any = await api.getLeaderboard();
        setLeaderboard(res.leaderboard || []);
      } catch (err) {
        console.error('Failed to load leaderboard', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 flex justify-center text-[var(--muted)]">
        Loading rankings...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif text-[var(--foreground)] mb-2">Global Leaderboard</h1>
        <p className="text-[var(--muted)]">Rankings reset at the end of the month.</p>
      </div>

      <div className="bg-[#1C1917] border border-[var(--border)] rounded-2xl p-6 shadow-2xl">
        <div className="flex justify-between text-xs text-[var(--muted)] uppercase font-bold tracking-widest border-b border-[var(--border)] pb-4 mb-4 px-4">
          <span>Rank</span>
          <span>Scholar</span>
          <span>Wisdom Score</span>
        </div>
        
        <div className="space-y-2">
          {leaderboard.length === 0 ? (
            <div className="text-center py-8 text-[var(--muted)]">No rankings yet. Start reading!</div>
          ) : (
            leaderboard.map((user, index) => {
              const rank = index + 1;
              return (
                <div 
                  key={user.user_id} 
                  className={`flex items-center justify-between p-4 rounded-xl border bg-[#0C0A09] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--muted)]`}
                >
                  <div className="w-8 font-mono font-bold">{rank}</div>
                  <div className="flex-1 flex items-center gap-3">
                    <span className="text-xl">{rank === 1 ? '🏛️' : rank === 2 ? '🦉' : '📚'}</span>
                    <span className="font-bold">{user.name || `Scholar #${user.user_id}`}</span>
                    {rank === 1 && <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-500 border border-yellow-500/50">Grandmaster</span>}
                  </div>
                  <div className="font-mono font-bold tracking-wider">{user.score.toLocaleString()}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
      
      <p className="text-center text-xs text-[var(--muted)] mt-8">
        Earn Wisdom Scores by passing Flashcards, reading consistently, and actively highlighting PDFs.
      </p>
    </div>
  );
}
