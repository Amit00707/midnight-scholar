'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookGrid } from '@/components/books/BookGrid';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';
import { api, type ReadingProgress } from '@/lib/api/client';
import { useTrendingBooks, useRecommendations, useBookDetail, useClassicBooks } from '@/lib/hooks/useBooks';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [progress, setProgress] = useState<ReadingProgress[]>([]);
  const [progressLoading, setProgressLoading] = useState(true);

  const [userInterests, setUserInterests] = useState<string[]>(['science', 'philosophy', 'technology']);

  useEffect(() => {
    // Load personalized interests from onboarding if available
    const savedInterests = localStorage.getItem('midnight_scholar_interests');
    if (savedInterests) {
      try {
        const parsed = JSON.parse(savedInterests);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setUserInterests(parsed);
        }
      } catch (e) {
        // use defaults if parsing fails
      }
    }
  }, []);

  const { data: trendingBooks, isLoading: trendingLoading } = useTrendingBooks(12);
  const { data: recommendedBooks, isLoading: recommendedLoading } = useRecommendations(
    userInterests,
    isAuthenticated
  );

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      loadProgress();
    }
  }, [isAuthenticated, authLoading, router]);

  async function loadProgress() {
    try {
      const progressData = await api.getProgress();
      setProgress(progressData);
    } catch (err) {
      console.error('Failed to load progress:', err);
    } finally {
      setProgressLoading(false);
    }
  }

  // Fetch free classic books with real PDFs
  const { data: classicBooks } = useClassicBooks();

  // Find the currently reading book
  const currentProgress = progress.length > 0 ? progress[0] : null;
  
  // Fetch details for the current active book using its ID
  const { data: currentBookData } = useBookDetail(currentProgress?.book_id ? String(currentProgress.book_id) : '');

  // Determine which book object to use (either from detail fetch or fallback)
  const currentBook = currentBookData || (currentProgress
    ? trendingBooks?.results?.find(b => String(b.id) === String(currentProgress.book_id)) || 
      recommendedBooks?.results?.find(b => String(b.id) === String(currentProgress.book_id))
    : null);

  const readingPercent = currentProgress && currentProgress.total_pages
    ? Math.round((currentProgress.current_page / currentProgress.total_pages) * 100)
    : 0;

  if (authLoading || progressLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-[var(--muted)] text-lg animate-pulse">Loading your library...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-end mb-12 border-b border-[var(--border)] pb-6">
        <div>
          <h1 className="text-4xl font-serif font-bold text-[var(--foreground)]">
            Welcome back, {user?.name || 'Scholar'}.
          </h1>
          <p className="text-[var(--muted)] mt-2">
            {progress.length > 0
              ? `You are currently reading ${progress.length} book${progress.length > 1 ? 's' : ''}.`
              : 'Start your reading journey by exploring the library!'}
          </p>
        </div>
        <Button variant="ghost" onClick={() => router.push('/profile')}>View Profile →</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Continue Reading Card */}
        <div className="col-span-1 md:col-span-2 bg-[#1C1917] border border-[var(--border)] rounded-2xl p-6 shadow-xl flex gap-6 items-center">
          {currentBook?.cover_url_small || currentBook?.cover_url ? (
            <img src={currentBook.cover_url_small || currentBook.cover_url} alt={currentBook.title} className="w-24 h-36 rounded-md shrink-0 border border-amber-900/30 object-cover" />
          ) : (
            <div className="w-24 h-36 bg-[#292524] rounded-md shrink-0 border border-amber-900/30"></div>
          )}
          <div className="flex-1">
            <span className="text-xs text-amber-500 uppercase font-bold tracking-widest mb-1 block">
              {currentProgress ? 'Currently Reading' : 'No Active Book'}
            </span>
            <h2 className="text-2xl font-serif text-[var(--foreground)]">
              {currentBook?.title || (currentProgress ? `Book ID: ${currentProgress.book_id}` : 'Explore the Library')}
            </h2>
            <p className="text-[var(--muted)] text-sm mb-4">
              {currentProgress
                ? `${currentBook?.author || 'Unknown'} • Page ${currentProgress.current_page} of ${currentProgress.total_pages}`
                : 'Find your next great read in our collection.'}
            </p>
            
            {currentProgress && (
              <div className="w-full bg-[#0C0A09] rounded-full h-2 mb-4 border border-[var(--border)]">
                <div
                  className="bg-[var(--primary)] h-2 rounded-full shadow-[0_0_10px_rgba(217,119,6,0.5)]"
                  style={{ width: `${readingPercent}%` }}
                ></div>
              </div>
            )}
            
            <div className="flex gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => currentProgress ? router.push(`/read/${currentProgress.book_id}`) : router.push('/search')}
              >
                {currentProgress ? 'Resume' : 'Browse Library'}
              </Button>
              <Button variant="ghost" size="sm">Options</Button>
            </div>
          </div>
        </div>

        {/* AI Insight Card */}
        <div className="bg-[#2E224F]/30 border border-[#7C3AED]/30 rounded-2xl p-6 flex flex-col items-start shadow-[0_0_20px_rgba(124,58,237,0.05)]">
          <span className="text-xs text-[#A78BFA] uppercase font-bold tracking-widest mb-2 flex items-center gap-2">✨ AI Insight</span>
          <p className="text-[var(--foreground)] text-sm leading-relaxed max-w-sm">
            {currentBook
              ? `Keep up the momentum with "${currentBook.title}". You're ${readingPercent}% through!`
              : 'Add a book to your library to unlock personalized AI insights and reading recommendations.'}
          </p>
        </div>
      </div>

      <div className="space-y-16">
        <BookGrid 
          title="Trending in the Library" 
          books={trendingBooks?.results?.map(b => ({ 
            id: String(b.id), 
            title: b.title, 
            author: b.author,
            cover_url: b.cover_url_small
          })) || []} 
        />

        <BookGrid 
          title="Recommended for your Intellectual Pursuits" 
          books={recommendedBooks?.results?.map(b => ({ 
            id: String(b.id), 
            title: b.title, 
            author: b.author,
            cover_url: b.cover_url_small
          })) || []} 
        />

        <BookGrid 
          title="Free Classic Books (Real PDFs)" 
          books={classicBooks?.results?.map(b => ({ 
            id: String(b.id), 
            title: b.title, 
            author: b.author,
            cover_url: b.cover_url
          })) || []} 
        />
      </div>
    </div>
  );
}
