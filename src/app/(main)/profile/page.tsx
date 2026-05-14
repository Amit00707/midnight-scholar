'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { motion } from 'framer-motion';
import { Award, BookOpen, Clock, Zap, History, Settings, Share2, ShieldCheck, Star, Sparkles, GraduationCap, Users } from 'lucide-react';
import { useRecommendations } from '@/lib/hooks/useBooks';
import { BookGrid } from '@/components/books/BookGrid';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [userInterests, setUserInterests] = React.useState<string[]>(['philosophy', 'science', 'history']);

  React.useEffect(() => {
    const saved = localStorage.getItem('midnight_scholar_interests');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setUserInterests(parsed);
      } catch (e) {}
    }
  }, []);

  const { data: recommendedBooks, isLoading: recommendedLoading } = useRecommendations(
    userInterests,
    isAuthenticated
  );

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

  const { data: flashcardStats } = useQuery({
    queryKey: ['flashcardStats'],
    queryFn: () => api.getFlashcardStats(),
    enabled: isAuthenticated,
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-serif text-[var(--foreground)] mb-4">Secret Archives Locked</h2>
        <p className="text-[var(--muted)] mb-8">Please identify yourself to access your personal collection.</p>
        <Link href="/login"><Button variant="primary">Login</Button></Link>
      </div>
    );
  }

  const level = Math.max(1, Math.floor((pointsData?.total_points || 0) / 100));
  const finishedBooksCount = booksData?.filter((b: any) => b.progress?.percentage === 100).length || 0;

  const achievements = [
    { title: "Early Philosopher", desc: "Finished 5 philosophy books", icon: "🏛️", unlocked: finishedBooksCount >= 5 },
    { title: "Scholar's Sprint", desc: "7-day reading streak", icon: "🔥", unlocked: (streakData?.current_streak || 0) >= 7 },
    { title: "Memory Master", desc: "Mastered 50 flashcards", icon: "🧠", unlocked: (flashcardStats?.mature_cards || 0) >= 50 },
    { title: "Knowledge Seeker", desc: "Added 10 books to library", icon: "📚", unlocked: (booksData?.length || 0) >= 10 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Profile Header */}
      <div className="relative mb-16">
        <div className="h-48 w-full rounded-3xl bg-gradient-to-r from-amber-900/20 via-violet-900/20 to-amber-900/20 border border-white/5 overflow-hidden">
           <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </div>
        
        <div className="absolute -bottom-12 left-8 md:left-12 flex flex-col md:flex-row items-end gap-6">
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-[#0C0A09] border-4 border-[#1C1917] flex items-center justify-center text-6xl shadow-2xl overflow-hidden group">
               <span className="group-hover:scale-110 transition-transform duration-500">🦉</span>
               <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-amber-600 px-3 py-1 rounded-lg text-[10px] font-black text-black uppercase shadow-lg border-2 border-[#1C1917]">
              Lvl {level}
            </div>
          </div>
          
          <div className="pb-4">
            <h1 className="text-4xl font-serif font-bold text-[var(--foreground)] mb-1 flex items-center gap-3">
              {user.name} 
              <ShieldCheck size={24} className="text-amber-600" />
            </h1>
            <p className="text-[var(--primary)] font-bold uppercase tracking-[0.2em] text-xs flex items-center gap-2">
              <Star size={12} fill="currentColor" /> {user.role || 'Scholar'}
            </p>
          </div>
        </div>

        <div className="absolute bottom-4 right-8 md:right-12 flex gap-3">
           <Button variant="secondary" className="h-10 bg-[#1C1917] border-white/5"><Settings size={16} /></Button>
           <Button variant="secondary" className="h-10 bg-[#1C1917] border-white/5"><Share2 size={16} /></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-20">
        
        {/* Left Column: Stats & Achievements */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Stats Bento */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Day Streak", val: streakData?.current_streak || 0, icon: <Zap className="text-amber-500" /> },
              { label: "Wisdom XP", val: pointsData?.total_points || 0, icon: <Award className="text-violet-500" /> },
              { label: "Volumes", val: booksData?.length || 0, icon: <BookOpen className="text-blue-500" /> },
              { label: "Study Time", val: "42h", icon: <Clock className="text-emerald-500" /> },
            ].map((stat, i) => (
              <div key={i} className="bg-[#1C1917] border border-[var(--border)] rounded-2xl p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  {stat.icon}
                </div>
                <span className="text-3xl font-serif font-bold text-[var(--foreground)] block mb-1">{stat.val}</span>
                <span className="text-[10px] text-[var(--muted)] font-black uppercase tracking-widest">{stat.label}</span>
              </div>
            ))}
          </div>

          {/* Achievements Grid */}
          <div>
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-serif font-bold text-[var(--foreground)]">Scholar Achievements</h3>
              <span className="text-xs text-[var(--muted)] font-bold uppercase tracking-widest underline cursor-pointer">View All</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {achievements.map((item, i) => (
                <div key={i} className={`flex items-center gap-5 p-5 rounded-2xl border transition-all ${
                  item.unlocked 
                    ? 'bg-amber-900/5 border-amber-900/20' 
                    : 'bg-[#1C1917] border-[var(--border)] opacity-50 grayscale'
                }`}>
                  <div className="text-3xl w-14 h-14 bg-[#0C0A09] rounded-xl flex items-center justify-center border border-white/5 shadow-inner">
                    {item.icon}
                  </div>
                  <div>
                    <h4 className={`font-bold ${item.unlocked ? 'text-[var(--foreground)]' : 'text-[var(--muted)]'}`}>{item.title}</h4>
                    <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">{item.desc}</p>
                  </div>
                  {item.unlocked && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#d97706]"></div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="space-y-8">
          
          {/* Teacher Control Center (If Teacher) */}
          {user?.role === 'teacher' && (
            <div className="bg-amber-900/5 border border-amber-900/20 rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <GraduationCap size={60} />
              </div>
              <h3 className="text-xl font-serif font-bold text-[var(--foreground)] mb-4 flex items-center gap-3">
                <GraduationCap size={20} className="text-amber-500" /> Instructor Portal
              </h3>
              <p className="text-xs text-[var(--muted)] mb-6 italic leading-relaxed">
                Manage your classrooms, curate reading lists, and track student growth through advanced scholarly analytics.
              </p>
              <Button 
                variant="primary" 
                className="w-full shadow-lg" 
                onClick={() => router.push('/teacher')}
              >
                Enter Control Center
              </Button>
            </div>
          )}

          {/* Social Connection */}
          <div className="bg-[#1C1917] border border-[var(--border)] rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-5">
               <Users size={60} />
            </div>
            <h3 className="text-xl font-serif font-bold text-[var(--foreground)] mb-4 flex items-center gap-3">
              <Users size={20} className="text-blue-400" /> Scholarly Network
            </h3>
            <p className="text-xs text-[var(--muted)] mb-6">
              Connect with fellow researchers, share citations, and join the global discourse.
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="flex-1 bg-[#0C0A09]" onClick={() => router.push('/social')}>
                Feed
              </Button>
              <Button variant="secondary" size="sm" className="flex-1 bg-[#0C0A09]">
                Find Scholars
              </Button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-[#1C1917] border border-[var(--border)] rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <History size={80} />
            </div>
            <h3 className="text-xl font-serif font-bold text-[var(--foreground)] mb-8 flex items-center gap-3">
              <History size={18} className="text-amber-600" /> Recent Activity
            </h3>
            
            <div className="space-y-6 relative">
              <div className="absolute left-1.5 top-2 bottom-2 w-px bg-[var(--border)] opacity-30"></div>
              
              {[
                { type: "Read", text: "Finished 'The Republic'", time: "2h ago", color: "bg-amber-500" },
                { type: "Quiz", text: "Scored 90% on Stoicism Quiz", time: "5h ago", color: "bg-violet-500" },
                { type: "Flash", text: "Reviewed 42 memory cards", time: "Yesterday", color: "bg-blue-500" },
                { type: "Book", text: "Added 'Ethics' by Spinoza", time: "2 days ago", color: "bg-emerald-500" },
              ].map((activity, i) => (
                <div key={i} className="flex gap-4 relative pl-6">
                  <div className={`absolute left-0 top-1.5 w-3 h-3 rounded-full ${activity.color} border-4 border-[#1C1917]`}></div>
                  <div>
                    <p className="text-sm text-[var(--foreground)] font-medium leading-tight">{activity.text}</p>
                    <span className="text-[10px] text-[var(--muted)] uppercase tracking-widest font-bold mt-1 inline-block">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended for You */}
      <div className="mt-24 border-t border-[var(--border)] pt-16">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-900/20 text-amber-500">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-3xl font-serif text-[var(--foreground)] font-bold">Curated for Your Path</h2>
              <p className="text-[var(--muted)] text-sm">Volumes chosen based on your scholarly interests.</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/onboarding/first-book')}>Update Interests</Button>
        </div>

        {recommendedLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-[#1C1917] rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : recommendedBooks?.results && recommendedBooks.results.length > 0 ? (
          <BookGrid 
            books={recommendedBooks.results.map(b => ({ 
              id: String(b.id), 
              title: b.title, 
              author: b.author,
              cover_url: b.cover_url_small
            }))} 
          />
        ) : (
          <div className="py-16 px-8 rounded-3xl bg-[#1C1917] border border-dashed border-[var(--border)] text-center">
            <Sparkles className="mx-auto text-amber-500/30 mb-4" size={48} />
            <h3 className="text-xl font-serif text-[var(--foreground)] mb-2">Expanding Your Horizons</h3>
            <p className="text-[var(--muted)] max-w-md mx-auto mb-6">
              We're curating specific volumes based on your interests. Update your scholarly preferences to see more tailored recommendations.
            </p>
            <Button variant="primary" size="sm" onClick={() => router.push('/onboarding/first-book')}>
              Refine Interests
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
