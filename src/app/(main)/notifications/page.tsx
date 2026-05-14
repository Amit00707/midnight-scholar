'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import Link from 'next/link';

interface Notification {
  id: string;
  type: 'flashcard' | 'badge' | 'streak' | 'system';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function NotificationsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const { data: flashcardStats } = useQuery({
    queryKey: ['flashcardStats'],
    queryFn: () => api.getFlashcardStats(),
    enabled: isAuthenticated,
  });

  const { data: streakData } = useQuery({
    queryKey: ['streak'],
    queryFn: () => api.getStreak(),
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return <div className="text-center py-20 animate-pulse text-[var(--muted)]">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div className="text-center py-20 text-[var(--muted)]">Please log in to view notifications.</div>;
  }

  // Generate contextual notifications from live data
  const notifications: Notification[] = [];

  if (flashcardStats?.due_today > 0) {
    notifications.push({
      id: 'fc-due',
      type: 'flashcard',
      title: 'Flashcards Due',
      message: `You have ${flashcardStats.due_today} flashcard${flashcardStats.due_today > 1 ? 's' : ''} waiting for review. Don't break your retention streak!`,
      time: 'Now',
      read: false,
    });
  }

  if (streakData?.current_streak !== undefined && streakData.current_streak >= 7) {
    notifications.push({
      id: 'streak-7',
      type: 'streak',
      title: '🔥 Streak Milestone!',
      message: `Incredible! You've maintained a ${streakData.current_streak}-day reading streak. Keep it alive!`,
      time: 'Today',
      read: false,
    });
  }

  if (flashcardStats?.mature_cards >= 10) {
    notifications.push({
      id: 'mastery-10',
      type: 'badge',
      title: '✅ Mastery Milestone',
      message: `You've mastered ${flashcardStats.mature_cards} flashcards! Your long-term memory is growing.`,
      time: 'Today',
      read: true,
    });
  }

  if (flashcardStats?.retention_rate >= 90) {
    notifications.push({
      id: 'retention-high',
      type: 'badge',
      title: '🧠 High Retention',
      message: `Your retention rate is ${flashcardStats.retention_rate}%. You're in the top tier of scholars!`,
      time: 'Today',
      read: true,
    });
  }

  // Always show a welcome/system notification
  notifications.push({
    id: 'welcome',
    type: 'system',
    title: 'Welcome to Midnight Scholar',
    message: 'Explore the library, read PDFs with AI assistance, and build your knowledge with spaced repetition flashcards.',
    time: 'Earlier',
    read: true,
  });

  const iconMap: Record<string, string> = {
    flashcard: '🧠',
    badge: '🏆',
    streak: '🔥',
    system: '📢',
  };

  const colorMap: Record<string, string> = {
    flashcard: 'border-amber-900/50 bg-amber-900/10',
    badge: 'border-violet-900/50 bg-violet-900/10',
    streak: 'border-orange-900/50 bg-orange-900/10',
    system: 'border-[var(--border)] bg-[#1C1917]',
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-[var(--foreground)]">Notifications</h1>
        <p className="text-[var(--muted)] mt-2">Stay on top of your learning journey.</p>
      </div>

      <div className="space-y-4">
        {notifications.map(notif => (
          <div
            key={notif.id}
            className={`rounded-2xl border p-5 shadow-lg transition-all hover:shadow-xl ${colorMap[notif.type]} ${
              !notif.read ? 'ring-1 ring-amber-600/30' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#0C0A09] flex items-center justify-center text-xl shrink-0">
                {iconMap[notif.type]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <h3 className={`text-sm font-bold ${!notif.read ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>
                    {notif.title}
                    {!notif.read && (
                      <span className="inline-block w-2 h-2 rounded-full bg-amber-500 ml-2 align-middle"></span>
                    )}
                  </h3>
                  <span className="text-[10px] text-[var(--muted)] shrink-0">{notif.time}</span>
                </div>
                <p className="text-sm text-[var(--muted)] mt-1 leading-relaxed">{notif.message}</p>
                
                {notif.type === 'flashcard' && (
                  <Link href="/flashcards" className="inline-block mt-3 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors">
                    Start Review →
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {notifications.length <= 1 && (
        <div className="text-center py-12 text-[var(--muted)]">
          <span className="text-4xl block mb-4">🔔</span>
          <p>No new notifications. Keep reading to earn achievements!</p>
        </div>
      )}
    </div>
  );
}
