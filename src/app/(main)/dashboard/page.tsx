'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookGrid } from '@/components/books/BookGrid';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';
import { api, type ReadingProgress } from '@/lib/api/client';
import { useTrendingBooks, useBookDetail, useClassicBooks, useCategoryBooks } from '@/lib/hooks/useBooks';
import { useQuery } from '@tanstack/react-query';
import { LibraryChat } from '@/components/dashboard/LibraryChat';
import { Compass, BookOpen, Clock, Star, Sparkles, Brain, Users, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [progress, setProgress] = useState<ReadingProgress[]>([]);
  const [progressLoading, setProgressLoading] = useState(true);

  const [userInterests, setUserInterests] = useState<string[]>(['science', 'philosophy', 'technology']);
  const [activeCategory, setActiveCategory] = useState('Philosophy');

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
  const { data: catBooks, isLoading: catLoading } = useCategoryBooks(activeCategory, 6);

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
    ? trendingBooks?.results?.find(b => String(b.id) === String(currentProgress.book_id))
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
        <div className="col-span-1 md:col-span-2 bg-[#1C1917] border border-[var(--border)] rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row gap-6 items-center text-center sm:text-left">
          {currentBook?.cover_url_small || currentBook?.cover_url ? (
            <img 
              src={(currentBook.cover_url_small || currentBook.cover_url) ?? undefined} 
              alt={currentBook.title} 
              loading="lazy"
              className="w-32 sm:w-24 h-48 sm:h-36 rounded-md shrink-0 border border-amber-900/30 object-cover transition-opacity duration-500 opacity-0" 
              onLoad={(e) => {
                (e.target as HTMLImageElement).classList.remove('opacity-0');
              }}
            />
          ) : (
            <div className="w-32 sm:w-24 h-48 sm:h-36 bg-[#292524] rounded-md shrink-0 border border-amber-900/30"></div>
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

        {/* Library AI Assistant */}
        <div className="col-span-1">
          <LibraryChat />
        </div>
      </div>

      {/* Flashcard Review Widget */}
      <FlashcardWidget isAuthenticated={isAuthenticated} router={router} />

      {/* Personalized Discovery Engine */}
      <div className="space-y-24 mb-24">
        
        {/* Row 1: Curated for You (Interest Based) */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-900/20 text-amber-500">
                <Sparkles size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-serif text-[var(--foreground)] font-bold">Curated for Your Path</h2>
                <p className="text-[var(--muted)] text-xs uppercase tracking-widest font-bold">Based on your curiosity: {userInterests.join(', ')}</p>
              </div>
            </div>
            <Link href="/profile" className="text-xs text-[var(--primary)] hover:underline font-bold uppercase tracking-widest">Update Interests</Link>
          </div>
          
          <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x">
            {catLoading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="w-40 aspect-[2/3] bg-[#1C1917] rounded-2xl animate-pulse shrink-0"></div>
              ))
            ) : (
              catBooks?.results?.map(b => (
                <div key={b.id} className="w-40 shrink-0 snap-start">
                  <CompactBookCard book={b} />
                </div>
              ))
            )}
            {(!catBooks?.results || catBooks.results.length === 0) && (
              <div className="w-full py-12 text-center bg-[#1C1917] rounded-3xl border border-dashed border-[var(--border)]">
                <p className="text-[var(--muted)] italic">Refining your scholarly recommendations...</p>
              </div>
            )}
          </div>
        </section>



        {/* Row 3: Social Feed & Discovery */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Social Feed (2/3) */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-serif font-bold text-[var(--foreground)]">Social Scholarly Feed</h3>
              <div className="flex gap-2">
                <Button variant="ghost" size="xs" className="text-[10px] uppercase tracking-widest font-black" onClick={() => router.push('/social')}>Discussion Feed</Button>
                <Button variant="primary" size="xs" className="text-[10px] uppercase tracking-widest font-black" onClick={() => router.push('/social')}>Join Community</Button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { u: "Scholar_Aris", n: "The synthesis of AI in 'The Mind' is groundbreaking.", t: "Philosophy" },
                { u: "Luna_Sci", n: "Found a rare citation in the physics volume. Fascinating!", t: "Science" },
                { u: "HistoryBuff", n: "Trade route mappings here are exquisite.", t: "History" },
                { u: "TechGeek", n: "Quantum chapters are a must-read for STEM.", t: "Tech" }
              ].map((post, i) => (
                <div key={i} className="p-5 bg-[#1C1917] rounded-2xl border border-[var(--border)] hover:border-amber-600/20 transition-all group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-amber-900/20 flex items-center justify-center text-[10px] font-bold text-amber-500 border border-amber-900/30">{post.u[0]}</div>
                    <div className="text-xs font-bold group-hover:text-amber-500 transition-colors">{post.u}</div>
                  </div>
                  <p className="text-[11px] text-[var(--muted)] leading-relaxed line-clamp-2 italic">"{post.n}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Discovery Strips (1/3) */}
          <div className="space-y-12">
            {/* Trending */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--muted)]">Trending</h4>
                <Link href="/search" className="text-[10px] text-amber-600 hover:underline">View all</Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {trendingBooks?.results?.slice(0, 5).map(b => (
                  <div key={b.id} className="w-24 shrink-0 snap-start">
                    <CompactBookCard book={b} />
                  </div>
                ))}
              </div>
            </section>

            {/* Classics */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--muted)]">Classics</h4>
                <Link href="/explore" className="text-[10px] text-amber-600 hover:underline">Explore</Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {classicBooks?.results?.slice(0, 5).map(b => (
                  <div key={b.id} className="w-24 shrink-0 snap-start">
                    <CompactBookCard book={b} />
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

      </div>
    </div>
  );
}

function CompactBookCard({ book }: { book: any }) {
  return (
    <Link href={`/book/${book.id}`} className="group block">
      <div className="aspect-[2/3] rounded-xl overflow-hidden border border-[var(--border)] group-hover:border-amber-500/50 transition-all duration-300 relative bg-[#1C1917]">
        <img 
          src={book.cover_url_small || book.cover_url} 
          alt={book.title} 
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 opacity-0" 
          onLoad={(e) => {
            (e.target as HTMLImageElement).classList.remove('opacity-0');
          }}
        />
      </div>
      <div className="mt-2">
        <h4 className="text-[11px] font-bold truncate text-[var(--foreground)] group-hover:text-amber-500 transition-colors">{book.title}</h4>
        <p className="text-[9px] text-[var(--muted)] truncate mt-0.5">{book.author}</p>
      </div>
    </Link>
  );
}

// ─── Flashcard Review Widget ─────────────────────────────────
function FlashcardWidget({ isAuthenticated, router }: { isAuthenticated: boolean; router: any }) {
  const { data: stats } = useQuery({
    queryKey: ['flashcardStats'],
    queryFn: () => api.getFlashcardStats(),
    enabled: isAuthenticated,
  });

  if (!stats || stats.total_cards === 0) return null;

  return (
    <div className="mb-12 bg-[#1C1917] border border-[var(--border)] rounded-2xl p-6 shadow-xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-amber-900/30 flex items-center justify-center text-2xl">
            🧠
          </div>
          <div>
            <h3 className="text-lg font-serif text-[var(--foreground)] font-bold">
              Flashcard Review
            </h3>
            <p className="text-sm text-[var(--muted)]">
              {stats.due_today > 0
                ? `${stats.due_today} card${stats.due_today > 1 ? 's' : ''} due for review today`
                : 'All caught up! No cards due right now.'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-center hidden sm:block">
            <p className="text-xl font-bold text-[var(--foreground)]">{stats.total_cards}</p>
            <p className="text-[10px] text-[var(--muted)] uppercase">Total</p>
          </div>
          <div className="text-center hidden sm:block">
            <p className="text-xl font-bold text-blue-400">{stats.retention_rate}%</p>
            <p className="text-[10px] text-[var(--muted)] uppercase">Retention</p>
          </div>
          <div className="text-center hidden sm:block">
            <p className="text-xl font-bold text-green-400">{stats.cards_reviewed_today}</p>
            <p className="text-[10px] text-[var(--muted)] uppercase">Today</p>
          </div>
          <Button
            variant={stats.due_today > 0 ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => router.push('/flashcards')}
          >
            {stats.due_today > 0 ? 'Start Review →' : 'View Deck'}
          </Button>
        </div>
      </div>
    </div>
  );
}
