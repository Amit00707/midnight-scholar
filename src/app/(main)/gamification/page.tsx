'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';

interface LeaderboardEntry {
  user_id: number;
  score: number;
  name?: string;
}

interface UserStats {
  points: number;
  streak: number;
  longestStreak: number;
}

export default function GamificationPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userStats, setUserStats] = useState<UserStats>({ points: 0, streak: 0, longestStreak: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [leaderboardRes, streakRes, pointsRes]: any = await Promise.all([
          api.getLeaderboard(),
          api.getStreak(),
          api.getPoints()
        ]);
        
        setLeaderboard(leaderboardRes.leaderboard || []);
        setUserStats({
          points: pointsRes.total_points || 0,
          streak: streakRes.current_streak || 0,
          longestStreak: streakRes.longest_streak || 0
        });
      } catch (err) {
        console.error('Failed to load gamification data', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 flex justify-center text-[var(--muted)]">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-48 bg-[#292524] rounded-lg"></div>
          <p>Syncing your wisdom journey...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-serif text-[var(--foreground)] mb-2 font-bold italic">The Scholar's Hall</h1>
        <p className="text-[var(--muted)]">Track your progress and climb the ranks of knowledge.</p>
      </div>

      {/* User Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-[#1C1917] border border-amber-900/30 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 text-4xl opacity-20 group-hover:scale-110 transition-transform">🔥</div>
          <p className="text-xs text-amber-500 font-bold uppercase tracking-widest mb-1">Current Streak</p>
          <h2 className="text-4xl font-mono font-bold text-white">{userStats.streak} Days</h2>
          <p className="text-xs text-[var(--muted)] mt-2">Longest: {userStats.longestStreak} days</p>
        </div>

        <div className="bg-[#1C1917] border border-blue-900/30 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 text-4xl opacity-20 group-hover:scale-110 transition-transform">💎</div>
          <p className="text-xs text-blue-500 font-bold uppercase tracking-widest mb-1">Wisdom Points</p>
          <h2 className="text-4xl font-mono font-bold text-white">{userStats.points.toLocaleString()}</h2>
          <p className="text-xs text-[var(--muted)] mt-2">Earned from quizzes & reading</p>
        </div>

        <div className="bg-[#1C1917] border border-purple-900/30 p-6 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 text-4xl opacity-20 group-hover:scale-110 transition-transform">🏆</div>
          <p className="text-xs text-purple-500 font-bold uppercase tracking-widest mb-1">Global Rank</p>
          <h2 className="text-4xl font-mono font-bold text-white">#{leaderboard.findIndex(u => u.score <= userStats.points) + 1 || '—'}</h2>
          <p className="text-xs text-[var(--muted)] mt-2">Top 10% of Scholars</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Leaderboard */}
        <div className="lg:col-span-2">
          <h3 className="text-xl font-serif text-[var(--foreground)] mb-6 flex items-center gap-2">
            <span className="text-amber-500">⚜️</span> Global Rankings
          </h3>
          <div className="bg-[#1C1917] border border-[var(--border)] rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between text-[10px] text-[var(--muted)] uppercase font-bold tracking-widest border-b border-[var(--border)] pb-4 mb-4 px-4">
              <span className="w-8">Rank</span>
              <span className="flex-1 ml-4">Scholar</span>
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
                      className={`flex items-center justify-between p-4 rounded-xl border bg-[#0C0A09] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--muted)] transition-all
                        ${rank === 1 ? 'border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.05)]' : ''}`}
                    >
                      <div className={`w-8 font-mono font-bold ${rank <= 3 ? 'text-amber-500' : 'text-[var(--muted)]'}`}>{rank}</div>
                      <div className="flex-1 flex items-center gap-3 ml-4">
                        <span className="text-xl">
                          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '📚'}
                        </span>
                        <span className="font-medium">{user.name || `Scholar #${user.user_id}`}</span>
                      </div>
                      <div className="font-mono font-bold tracking-wider text-sm">{user.score.toLocaleString()}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Milestones / How to earn */}
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-serif text-[var(--foreground)] mb-6 flex items-center gap-2">
              <span className="text-blue-500">⚡</span> Quick Earn
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-[#1C1917] border border-[var(--border)] rounded-xl">
                <p className="text-sm font-bold text-white mb-1">Daily Quiz</p>
                <p className="text-xs text-[var(--muted)]">Pass any page quiz to earn +50 points.</p>
              </div>
              <div className="p-4 bg-[#1C1917] border border-[var(--border)] rounded-xl">
                <p className="text-sm font-bold text-white mb-1">Reading Streak</p>
                <p className="text-xs text-[var(--muted)]">Read 10 pages daily for +100 streak bonus.</p>
              </div>
              <div className="p-4 bg-[#1C1917] border border-[var(--border)] rounded-xl">
                <p className="text-sm font-bold text-white mb-1">Tutor Helper</p>
                <p className="text-xs text-[var(--muted)]">Correct an AI doubt to earn +20 points.</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-amber-950/20 border border-amber-900/30 rounded-2xl">
            <h4 className="text-amber-500 font-bold text-sm mb-2 uppercase tracking-tight">Pro Tip</h4>
            <p className="text-xs text-amber-200/70 leading-relaxed">
              Consistently highlighting and saving notes in the reader boosts your "Scholarship" index, which increases your score multiplier!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
