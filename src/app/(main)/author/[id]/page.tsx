'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthorBooks } from '@/lib/hooks/useBooks';
import { ArrowLeft, BookOpen, Star, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function AuthorPage() {
  const params = useParams();
  const router = useRouter();
  // id is the URL-encoded author name
  const authorName = decodeURIComponent(params?.id as string || '');

  const { data, isLoading, isError } = useAuthorBooks(authorName, 20);

  // ─── Loading ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-[#1C1917] rounded-xl w-48" />
          <div className="h-32 bg-[#1C1917] rounded-2xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="aspect-[2/3] bg-[#1C1917] rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <div className="text-6xl mb-6">✍️</div>
        <h1 className="text-3xl font-serif text-[var(--foreground)] mb-4">Author Not Found</h1>
        <p className="text-[var(--muted)] mb-8">
          We couldn't find any books by this author in our archives.
        </p>
        <Button variant="primary" onClick={() => router.push('/search')}>
          Search the Library
        </Button>
      </div>
    );
  }

  const books = data.results || [];
  const total = data.total || books.length;

  return (
    <div className="min-h-screen bg-[var(--background)]">

      {/* ─── Hero ─── */}
      <div className="relative border-b border-[var(--border)] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/5 to-violet-900/5" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-10 group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-8">
            {/* Avatar */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-28 h-28 rounded-3xl bg-gradient-to-br from-amber-900/30 to-violet-900/30 border border-amber-900/30 flex items-center justify-center text-5xl shadow-2xl shrink-0"
            >
              ✍️
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span className="text-xs text-amber-500 uppercase font-bold tracking-[0.2em] mb-2 block">
                Author
              </span>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-[var(--foreground)] mb-3">
                {authorName}
              </h1>
              <div className="flex items-center gap-4 text-sm text-[var(--muted)]">
                <span className="flex items-center gap-1.5">
                  <BookOpen size={14} />
                  {total} work{total !== 1 ? 's' : ''} in our library
                </span>
                <a
                  href={`https://openlibrary.org/search/authors?q=${encodeURIComponent(authorName)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-amber-500 transition-colors"
                >
                  <ExternalLink size={12} />
                  Open Library
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ─── Books Grid ─── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-serif font-bold text-[var(--foreground)]">
            All Works
          </h2>
          <span className="text-sm text-[var(--muted)]">{total} books found</span>
        </div>

        {books.length === 0 ? (
          <div className="text-center py-24 bg-[#1C1917] border border-dashed border-[var(--border)] rounded-3xl">
            <div className="text-5xl mb-4 opacity-20">📚</div>
            <h3 className="text-xl font-serif text-[var(--foreground)] mb-2">No books found</h3>
            <p className="text-[var(--muted)]">
              We couldn't find any books by {authorName} in our archives.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {books.map((book: any, idx: number) => (
              <motion.div
                key={book.id || idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Link href={`/book/${book.id}`} className="group block">
                  {/* Cover */}
                  <div className="aspect-[2/3] w-full rounded-xl bg-[#1C1917] border border-[var(--border)] overflow-hidden relative shadow-lg group-hover:border-amber-500/50 group-hover:-translate-y-1 transition-all duration-300">
                    {book.cover_url_small || book.cover_url ? (
                      <img
                        src={book.cover_url_small || book.cover_url}
                        alt={book.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                        <BookOpen size={24} className="text-amber-900/30 mb-2" />
                        <span className="text-[var(--muted)] text-[9px] font-serif uppercase tracking-widest leading-relaxed line-clamp-3">
                          {book.title}
                        </span>
                      </div>
                    )}

                    {/* Rating overlay */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-1">
                        <Star size={10} className="text-amber-500 fill-amber-500" />
                        <span className="text-[10px] text-white font-bold">
                          {book.rating?.toFixed(1) || '4.5'}
                        </span>
                      </div>
                    </div>

                    {/* Free badge */}
                    {(book.pdf_url || book.ia_id) && (
                      <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-violet-600/90 text-white text-[8px] font-bold uppercase">
                        Free
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <div className="mt-3">
                    <h3 className="text-xs font-bold text-[var(--foreground)] group-hover:text-amber-500 transition-colors line-clamp-2 leading-snug">
                      {book.title}
                    </h3>
                    {book.published_year && (
                      <p className="text-[10px] text-[var(--muted)] mt-0.5">{book.published_year}</p>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
