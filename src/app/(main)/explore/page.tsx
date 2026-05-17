'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';
import { BookGrid } from '@/components/books/BookGrid';
import { Button } from '@/components/ui/Button';
import { Search, Sparkles, BookOpen, Clock, Star, ArrowRight, Library, Globe, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const categories = [
  { id: "All", icon: "📚" },
  { id: "Philosophy", icon: "🏛️" },
  { id: "Science", icon: "⚛️" },
  { id: "History", icon: "📜" },
  { id: "Psychology", icon: "🧠" },
  { id: "Physics", icon: "🌌" },
  { id: "Technology", icon: "💻" },
  { id: "Social Media", icon: "📱" },
  { id: "Education", icon: "🎓" },
  { id: "Business", icon: "📈" },
  { id: "Art", icon: "🎨" },
  { id: "Fiction", icon: "🖋️" }
];

function getBookIdentity(book: any, index: number) {
  return book?.id || book?.ol_key || `${book?.title || 'book'}-${index}`;
}

function uniqueBooks(books: any[] | undefined) {
  if (!books) return [];

  const seen = new Set<string>();

  return books.filter((book, index) => {
    const identity = getBookIdentity(book, index);

    if (seen.has(identity)) {
      return false;
    }

    seen.add(identity);
    return true;
  });
}

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState("All");

  const { data: trending } = useQuery({
    queryKey: ['trending'],
    queryFn: () => api.getTrending(10)
  });

  const { data: categoryBooks, isLoading: categoryLoading } = useQuery({
    queryKey: ['category', activeCategory],
    queryFn: () => api.getBooksByCategory(activeCategory, 12)
  });

  const { data: classics } = useQuery({
    queryKey: ['classics'],
    queryFn: () => api.getClassics("", 10)
  });

  const [recommendedInterests, setRecommendedInterests] = useState<string[]>([]);
  
  useEffect(() => {
    const saved = localStorage.getItem('midnight_scholar_interests');
    if (saved) {
      try {
        setRecommendedInterests(JSON.parse(saved));
      } catch (e) {}
    }
  }, []);

  const { data: recommendations } = useQuery({
    queryKey: ['recommendations', recommendedInterests],
    queryFn: () => recommendedInterests.length > 0 
      ? api.getBooksByCategory(recommendedInterests[0], 10) 
      : Promise.resolve({ results: [] }),
    enabled: recommendedInterests.length > 0
  });

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16 pb-24 border-b border-[var(--border)]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
           <div className="absolute top-1/4 right-0 w-96 h-96 bg-amber-600/10 rounded-full blur-[100px] animate-pulse"></div>
           <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-violet-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-900/10 border border-amber-900/20 text-amber-500 text-xs font-bold tracking-widest uppercase mb-8"
          >
            <Globe size={14} /> Global Digital Archive
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-serif text-[var(--foreground)] mb-8 leading-[1.1]"
          >
            Explore the <span className="text-[var(--primary)] italic">Infinite Library.</span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-xl text-[var(--muted)] mb-12 leading-relaxed"
          >
            Midnight Scholar connects you to millions of free books via Open Library. 
            No subscriptions. No limits. Just pure knowledge.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link href="/search">
              <Button variant="primary" size="lg" className="px-10 py-6 text-lg rounded-full">
                <Search size={20} className="mr-2" /> Start Searching
              </Button>
            </Link>
            <Link href="/library">
              <Button variant="ghost" size="lg" className="px-10 py-6 text-lg rounded-full border border-[var(--border)]">
                <Library size={20} className="mr-2" /> My Collection
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Trending Section */}
        <div className="mb-24">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-900/20 text-amber-500">
                <Compass size={24} />
              </div>
              <h2 className="text-3xl font-serif text-[var(--foreground)] font-bold">Trending Worldwide</h2>
            </div>
            <Link href="/search" className="text-sm text-amber-500 font-bold hover:underline">Explore all →</Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {uniqueBooks(trending?.results).slice(0, 5).map((book: any, idx: number) => (
              <BookCard key={getBookIdentity(book, idx)} book={book} delay={idx * 0.1} />
            ))}
          </div>
        </div>

        {/* Recommended for You Section */}
        {recommendations?.results && recommendations.results.length > 0 && (
          <div className="mb-24">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-violet-900/20 text-violet-400">
                  <Sparkles size={24} />
                </div>
                <h2 className="text-3xl font-serif text-[var(--foreground)] font-bold">Recommended for You</h2>
              </div>
              <p className="text-xs text-violet-400 font-mono tracking-tighter">Based on your interests in {recommendedInterests.slice(0, 2).join(', ')}</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              {uniqueBooks(recommendations.results).slice(0, 5).map((book: any, idx: number) => (
                <BookCard key={getBookIdentity(book, idx)} book={book} delay={idx * 0.1} />
              ))}
            </div>
          </div>
        )}

        {/* Categories Section */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif text-[var(--foreground)] font-bold mb-4">Browse by Discipline</h2>
            <p className="text-[var(--muted)]">Curated collections from the world's leading academic subjects.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-8 py-3.5 rounded-2xl text-sm font-bold transition-all flex items-center gap-2 border ${
                  activeCategory === cat.id 
                    ? 'bg-[var(--primary)] border-[var(--primary)] text-[#0C0A09] shadow-2xl shadow-amber-900/20' 
                    : 'bg-[#1C1917] border-[var(--border)] text-[var(--muted)] hover:border-amber-600/50 hover:text-white'
                }`}
              >
                <span>{cat.icon}</span> {cat.id}
              </button>
            ))}
          </div>
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {categoryLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="aspect-[2/3] bg-[#292524] rounded-xl animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                  {uniqueBooks(categoryBooks?.results).map((book: any, idx: number) => (
                    <BookCard key={getBookIdentity(book, idx)} book={book} delay={idx * 0.05} />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Classics Section */}
        <div>
          <div className="bg-gradient-to-br from-[#1C1917] to-[#0C0A09] border border-[var(--border)] rounded-3xl p-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/5 rounded-full blur-[80px]"></div>
            
            <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-12 relative z-10">
              <div className="max-w-xl">
                <h2 className="text-4xl font-serif text-[var(--foreground)] font-bold mb-4">The Great Classics</h2>
                <p className="text-[var(--muted)]">Timeless masterpieces available with high-quality free PDFs. Dive into the foundations of literature and thought.</p>
              </div>
              <Link href="/search">
                <Button variant="ghost" className="text-amber-500 font-bold border border-amber-900/30">View Entire Collection →</Button>
              </Link>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 relative z-10">
              {uniqueBooks(classics?.results).slice(0, 5).map((book: any, idx: number) => (
                <BookCard key={getBookIdentity(book, idx)} book={book} delay={idx * 0.1} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookCard({ book, delay }: { book: any; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
    >
      <Link href={`/book/${book.id}`} className="group block">
        <div className="aspect-[2/3] w-full rounded-xl bg-[#0C0A09] border border-[var(--border)] overflow-hidden relative shadow-lg group-hover:border-[var(--primary)] transition-all group-hover:shadow-2xl group-hover:-translate-y-2">
          <BookCardImage book={book} />
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
            <div className="flex items-center gap-1 text-amber-500 mb-1">
              <Star size={10} fill="currentColor" />
              <span className="text-[10px] font-bold">{book.rating || '4.8'}</span>
            </div>
            <p className="text-[10px] text-white font-bold truncate">{book.author}</p>
          </div>
          
          {/* Readable Badge */}
          {book.has_fulltext && (
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-violet-600/90 text-white text-[8px] font-bold uppercase tracking-widest backdrop-blur-sm">
              Read Now
            </div>
          )}
        </div>
        <div className="mt-4">
          <h4 className="text-sm font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors truncate mb-1">
            {book.title}
          </h4>
          <p className="text-xs text-[var(--muted)] line-clamp-1">
            {book.author}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

function BookCardImage({ book }: { book: any }) {
  const [error, setError] = useState(false);
  const coverUrl = book.cover_url_small || book.cover_url;

  if (error || !coverUrl) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#1C1917] to-[#0C0A09]">
        <BookOpen size={24} className="text-amber-900/20 mb-2" />
        <span className="text-[var(--muted)] text-[9px] font-serif uppercase tracking-[0.2em] leading-relaxed line-clamp-3">
          {book.title}
        </span>
      </div>
    );
  }

  return (
    <img 
      src={coverUrl} 
      alt={book.title} 
      loading="lazy"
      onError={() => setError(true)}
      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
    />
  );
}
