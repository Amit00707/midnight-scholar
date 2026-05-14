'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useBookDetail } from '@/lib/hooks/useBooks';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api/client';
import {
  BookOpen, Star, Clock, FileText, Globe, ArrowLeft,
  Bookmark, Play, Users, ChevronRight, Sparkles, Brain
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { isAuthenticated } = useAuth();

  const { data: book, isLoading, isError } = useBookDetail(id);
  const [addingToLibrary, setAddingToLibrary] = useState(false);
  const [addedToLibrary, setAddedToLibrary] = useState(false);
  const [activeTab, setActiveTab] = useState<'about' | 'details'>('about');

  async function handleStartReading() {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    try {
      await api.updateProgress(id as any, 1);
    } catch (_) {}
    router.push(`/read/${id}`);
  }

  async function handleAddToLibrary() {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    setAddingToLibrary(true);
    try {
      await api.updateProgress(id as any, 1);
      setAddedToLibrary(true);
    } catch (_) {
      setAddedToLibrary(true);
    } finally {
      setAddingToLibrary(false);
    }
  }

  // ─── Loading ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row gap-12 animate-pulse">
          <div className="w-56 h-80 bg-[#1C1917] rounded-2xl shrink-0 mx-auto md:mx-0" />
          <div className="flex-1 space-y-4">
            <div className="h-10 bg-[#1C1917] rounded-xl w-3/4" />
            <div className="h-6 bg-[#1C1917] rounded-xl w-1/2" />
            <div className="h-4 bg-[#1C1917] rounded-xl w-full mt-8" />
            <div className="h-4 bg-[#1C1917] rounded-xl w-5/6" />
            <div className="h-4 bg-[#1C1917] rounded-xl w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  // ─── Error ─────────────────────────────────────────────────
  if (isError || !book) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <div className="text-6xl mb-6">📚</div>
        <h1 className="text-3xl font-serif text-[var(--foreground)] mb-4">Book Not Found</h1>
        <p className="text-[var(--muted)] mb-8">
          We couldn't find this book in our archives. It may have been moved or removed.
        </p>
        <Button variant="primary" onClick={() => router.push('/search')}>
          Search the Library
        </Button>
      </div>
    );
  }

  const coverUrl = (book as any).cover_url_md || (book as any).cover_url;
  const rating = (book as any).rating || 4.5;
  const ratingCount = (book as any).rating_count || 0;
  const pageCount = (book as any).page_count || (book as any).total_pages || 0;
  const readingHours = (book as any).reading_hours || (pageCount ? Math.round(pageCount / 40) : 0);
  const difficulty = (book as any).difficulty || 'Intermediate';
  const subjects = (book as any).subjects || [];
  const description = (book as any).description || '';
  const publishedYear = (book as any).published_year || '';
  const language = (book as any).language || 'English';
  const editionCount = (book as any).edition_count || 1;
  const hasFulltext = !!(book as any).pdf_url || !!(book as any).ia_id;

  const difficultyColor: Record<string, string> = {
    Beginner: 'text-green-400 bg-green-900/20 border-green-900/40',
    Intermediate: 'text-amber-400 bg-amber-900/20 border-amber-900/40',
    Advanced: 'text-red-400 bg-red-900/20 border-red-900/40',
    Unknown: 'text-stone-400 bg-stone-900/20 border-stone-900/40',
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">

      {/* ─── Hero Banner ─── */}
      <div className="relative overflow-hidden border-b border-[var(--border)]">
        {/* Blurred cover background */}
        {coverUrl && (
          <div
            className="absolute inset-0 opacity-10 blur-3xl scale-110"
            style={{ backgroundImage: `url(${coverUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--background)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-10 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          <div className="flex flex-col md:flex-row gap-10 items-start">
            {/* Cover */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="shrink-0 mx-auto md:mx-0"
            >
              <div className="w-48 md:w-56 aspect-[2/3] rounded-2xl overflow-hidden border border-[var(--border)] shadow-2xl bg-[#1C1917]">
                {coverUrl ? (
                  <img
                    src={coverUrl}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                    <BookOpen size={40} className="text-amber-900/40 mb-3" />
                    <span className="text-[var(--muted)] text-xs font-serif uppercase tracking-widest leading-relaxed">
                      {book.title}
                    </span>
                  </div>
                )}
              </div>

              {/* Read Now badge */}
              {hasFulltext && (
                <div className="mt-3 text-center">
                  <span className="inline-block px-3 py-1 rounded-full bg-violet-600/20 text-violet-400 border border-violet-600/30 text-xs font-bold uppercase tracking-widest">
                    ✓ Free to Read
                  </span>
                </div>
              )}
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 min-w-0"
            >
              {/* Category badge */}
              {(book as any).category && (
                <span className="inline-block px-3 py-1 rounded-full bg-amber-900/20 text-amber-500 border border-amber-900/30 text-xs font-bold uppercase tracking-widest mb-4">
                  {(book as any).category}
                </span>
              )}

              <h1 className="text-3xl md:text-5xl font-serif font-bold text-[var(--foreground)] leading-tight mb-3">
                {book.title}
              </h1>

              {/* Author */}
              <Link
                href={`/author/${encodeURIComponent(book.author)}`}
                className="text-lg text-amber-500 hover:text-amber-400 transition-colors font-medium mb-6 inline-block"
              >
                by {book.author}
              </Link>

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-6 mb-8">
                {/* Rating */}
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star
                      key={i}
                      size={16}
                      className={i <= Math.round(rating) ? 'text-amber-500 fill-amber-500' : 'text-stone-600'}
                    />
                  ))}
                  <span className="text-sm font-bold text-[var(--foreground)] ml-1">{rating.toFixed(1)}</span>
                  {ratingCount > 0 && (
                    <span className="text-xs text-[var(--muted)]">({ratingCount.toLocaleString()} ratings)</span>
                  )}
                </div>

                {pageCount > 0 && (
                  <div className="flex items-center gap-1.5 text-[var(--muted)] text-sm">
                    <FileText size={14} />
                    <span>{pageCount} pages</span>
                  </div>
                )}

                {readingHours > 0 && (
                  <div className="flex items-center gap-1.5 text-[var(--muted)] text-sm">
                    <Clock size={14} />
                    <span>~{readingHours}h read</span>
                  </div>
                )}

                <span className={`px-2 py-0.5 rounded border text-xs font-bold ${difficultyColor[difficulty] || difficultyColor['Unknown']}`}>
                  {difficulty}
                </span>
              </div>

              {/* Description preview */}
              {description && (
                <p className="text-[var(--muted)] leading-relaxed mb-8 max-w-2xl line-clamp-3 text-base">
                  {description}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleStartReading}
                  className="px-8 gap-2"
                >
                  <Play size={18} fill="currentColor" />
                  {hasFulltext ? 'Read Now' : 'Open Reader'}
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleAddToLibrary}
                  disabled={addingToLibrary || addedToLibrary}
                  className="px-8 gap-2"
                >
                  <Bookmark size={18} className={addedToLibrary ? 'fill-current' : ''} />
                  {addedToLibrary ? 'In Library ✓' : addingToLibrary ? 'Adding...' : 'Add to Library'}
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ─── Body ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Left: Main Content */}
          <div className="lg:col-span-2">

            {/* Tabs */}
            <div className="flex gap-1 mb-8 bg-[#1C1917] rounded-xl p-1 border border-[var(--border)] w-fit">
              {(['about', 'details'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-lg text-sm font-bold capitalize transition-colors ${
                    activeTab === tab
                      ? 'bg-[var(--primary)] text-[#0C0A09]'
                      : 'text-[var(--muted)] hover:text-[var(--foreground)]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* About Tab */}
            {activeTab === 'about' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {description ? (
                  <div className="prose prose-invert max-w-none">
                    <p className="text-[var(--foreground)] leading-relaxed text-lg whitespace-pre-line">
                      {description}
                    </p>
                  </div>
                ) : (
                  <div className="bg-[#1C1917] border border-[var(--border)] rounded-2xl p-8 text-center">
                    <Brain size={40} className="text-amber-900/30 mx-auto mb-4" />
                    <p className="text-[var(--muted)] italic font-serif text-lg">
                      "A work of profound intellectual depth awaiting your discovery."
                    </p>
                    <p className="text-xs text-[var(--muted)] mt-3 uppercase tracking-widest">
                      No description available — Open the reader to explore
                    </p>
                  </div>
                )}

                {/* Subjects */}
                {subjects.length > 0 && (
                  <div className="mt-10">
                    <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-4">Subjects</h3>
                    <div className="flex flex-wrap gap-2">
                      {subjects.slice(0, 12).map((s: string) => (
                        <span
                          key={s}
                          className="px-3 py-1 rounded-full bg-[#1C1917] border border-[var(--border)] text-xs text-[var(--muted)] hover:border-amber-600/40 hover:text-[var(--foreground)] transition-colors cursor-default"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-[#1C1917] border border-[var(--border)] rounded-2xl overflow-hidden">
                  {[
                    { label: 'Author', value: book.author },
                    { label: 'Published', value: publishedYear || 'Unknown' },
                    { label: 'Language', value: language },
                    { label: 'Pages', value: pageCount ? `${pageCount} pages` : 'Unknown' },
                    { label: 'Editions', value: editionCount ? `${editionCount} editions` : '1 edition' },
                    { label: 'Difficulty', value: difficulty },
                    { label: 'Reading Time', value: readingHours ? `~${readingHours} hours` : 'Unknown' },
                    { label: 'Open Library ID', value: id },
                  ].map((row, i) => (
                    <div
                      key={row.label}
                      className={`flex justify-between items-center px-6 py-4 ${
                        i !== 7 ? 'border-b border-[var(--border)]' : ''
                      }`}
                    >
                      <span className="text-sm text-[var(--muted)] font-medium">{row.label}</span>
                      <span className="text-sm text-[var(--foreground)] font-bold text-right max-w-xs truncate">
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-6">

            {/* AI Features Card */}
            <div className="bg-gradient-to-br from-amber-900/10 to-violet-900/10 border border-amber-900/20 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={18} className="text-amber-500" />
                <h3 className="font-bold text-[var(--foreground)]">AI-Powered Features</h3>
              </div>
              <ul className="space-y-3 text-sm text-[var(--muted)]">
                {[
                  '✨ Auto-generated summaries',
                  '🧠 Spaced repetition flashcards',
                  '📝 Smart quiz generation',
                  '🔑 Keyword extraction',
                  '💬 AI doubt solver',
                ].map(f => (
                  <li key={f} className="flex items-center gap-2">{f}</li>
                ))}
              </ul>
              <Button
                variant="primary"
                size="sm"
                className="w-full mt-5"
                onClick={handleStartReading}
              >
                Start Reading with AI →
              </Button>
            </div>

            {/* Quick Stats */}
            <div className="bg-[#1C1917] border border-[var(--border)] rounded-2xl p-6">
              <h3 className="font-bold text-[var(--foreground)] mb-4 text-sm uppercase tracking-widest">
                Book Stats
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Rating', value: rating.toFixed(1), icon: '⭐' },
                  { label: 'Pages', value: pageCount || '—', icon: '📄' },
                  { label: 'Read Time', value: readingHours ? `${readingHours}h` : '—', icon: '⏱️' },
                  { label: 'Editions', value: editionCount || 1, icon: '📚' },
                ].map(stat => (
                  <div key={stat.label} className="bg-[#0C0A09] rounded-xl p-3 text-center border border-[var(--border)]">
                    <div className="text-xl mb-1">{stat.icon}</div>
                    <div className="text-lg font-bold text-[var(--foreground)]">{stat.value}</div>
                    <div className="text-[10px] text-[var(--muted)] uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* External Links */}
            <div className="bg-[#1C1917] border border-[var(--border)] rounded-2xl p-6">
              <h3 className="font-bold text-[var(--foreground)] mb-4 text-sm uppercase tracking-widest">
                External Links
              </h3>
              <div className="space-y-2">
                <a
                  href={`https://openlibrary.org/works/${id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-[#0C0A09] border border-[var(--border)] hover:border-amber-600/40 transition-colors group"
                >
                  <div className="flex items-center gap-2 text-sm text-[var(--muted)] group-hover:text-[var(--foreground)]">
                    <Globe size={14} />
                    Open Library
                  </div>
                  <ChevronRight size={14} className="text-[var(--muted)]" />
                </a>
                <a
                  href={`https://www.goodreads.com/search?q=${encodeURIComponent(book.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl bg-[#0C0A09] border border-[var(--border)] hover:border-amber-600/40 transition-colors group"
                >
                  <div className="flex items-center gap-2 text-sm text-[var(--muted)] group-hover:text-[var(--foreground)]">
                    <BookOpen size={14} />
                    Goodreads
                  </div>
                  <ChevronRight size={14} className="text-[var(--muted)]" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
