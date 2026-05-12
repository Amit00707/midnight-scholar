'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: streakData } = useQuery({
    queryKey: ['streak'],
    queryFn: () => api.getStreak(),
    enabled: isAuthenticated,
  });

  const { data: pointsData } = useQuery({
    queryKey: ['points'],
    queryFn: () => api.getPoints(),
    enabled: isAuthenticated,
  });

  const { data: booksData } = useQuery({
    queryKey: ['libraryBooks'],
    queryFn: () => api.getBooks(),
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return <div className="text-center py-20 animate-pulse text-[var(--muted)]">Loading profile...</div>;
  }

  if (!isAuthenticated || !user) {
    return <div className="text-center py-20 text-[var(--muted)]">Please log in to view your profile.</div>;
  }

  const level = Math.max(1, Math.floor((pointsData?.total_points || 0) / 100));
  const finishedBooksCount = booksData?.filter((b: any) => b.progress?.percentage === 100).length || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Profile Header Block */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12 border-b border-[var(--border)] pb-12">
        <div className="w-32 h-32 rounded-full bg-[var(--primary)]/20 border-4 border-[var(--surface)] shadow-2xl flex items-center justify-center relative">
          <span className="text-4xl">🦉</span>
          <div className="absolute -bottom-2 -right-2 bg-[#2E224F] border border-[#7C3AED] px-2 py-1 rounded-md text-xs font-bold text-white shadow-lg">
            LVL {level}
          </div>
        </div>
        
        <div className="text-center md:text-left flex-1">
          <h1 className="text-4xl font-serif font-bold text-[var(--foreground)]">{user.name}</h1>
          <p className="text-[var(--primary)] font-medium mt-1 capitalize">{user.role}</p>
          <div className="flex flex-wrap gap-2 justify-center md:justify-start mt-4">
            <span className="px-3 py-1 bg-[var(--surface)] border border-[var(--border)] text-xs text-[var(--muted)] rounded-full">Midnight Scholar</span>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button variant="secondary">Edit Profile</Button>
          <Button variant="primary">Share</Button>
        </div>
      </div>

      {/* Stats Board */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        
        <div className="bg-[#1C1917] p-6 rounded-2xl border border-[var(--border)] text-center">
          <span className="block text-3xl mb-2">🔥</span>
          <h3 className="text-3xl font-mono font-bold text-[var(--foreground)]">{streakData?.current_streak || 0}</h3>
          <p className="text-xs text-[var(--muted)] uppercase tracking-wider mt-1">Day Streak</p>
        </div>
        
        <div className="bg-[#1C1917] p-6 rounded-2xl border border-[var(--border)] text-center">
          <span className="block text-3xl mb-2">📚</span>
          <h3 className="text-3xl font-mono font-bold text-[var(--foreground)]">{finishedBooksCount}</h3>
          <p className="text-xs text-[var(--muted)] uppercase tracking-wider mt-1">Books Finished</p>
        </div>

        <div className="bg-[#1C1917] p-6 rounded-2xl border border-[var(--border)] text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[#7C3AED]/5 pointer-events-none"></div>
          <span className="block text-3xl mb-2">✨</span>
          <h3 className="text-3xl font-mono font-bold text-[#A78BFA]">{pointsData?.total_points || 0}</h3>
          <p className="text-xs text-[#A78BFA]/70 uppercase tracking-wider mt-1">Wisdom Points</p>
        </div>

        <div className="bg-[#1C1917] p-6 rounded-2xl border border-[var(--border)] text-center">
          <span className="block text-3xl mb-2">🧠</span>
          <h3 className="text-3xl font-mono font-bold text-[var(--foreground)]">{booksData?.length || 0}</h3>
          <p className="text-xs text-[var(--muted)] uppercase tracking-wider mt-1">Total Books</p>
        </div>

      </div>
    </div>
  );
}
