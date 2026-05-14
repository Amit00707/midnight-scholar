'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface BookGridProps {
  title?: string;
  books: { 
    id: string; 
    title: string; 
    author: string; 
    cover_url?: string | null;
    rating?: number;
    progress?: { percentage: number };
  }[];
}

export function BookGrid({ title, books }: BookGridProps) {
  return (
    <section className="my-8">
      {title && <h2 className="text-2xl font-serif text-[var(--primary)] mb-6">{title}</h2>}
      {books.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center bg-[#1C1917]/50 rounded-3xl border border-dashed border-amber-900/20 backdrop-blur-sm">
          <div className="w-16 h-16 rounded-full bg-amber-900/10 flex items-center justify-center mb-4">
            <BookOpen size={32} className="text-amber-500/30" />
          </div>
          <p className="text-[var(--muted)] text-sm font-serif italic max-w-xs">
            "This section of the archive is currently being cataloged. Check back as we uncover more volumes."
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {books.map((book, idx) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link href={`/book/${book.id}`} className="group block">
                <div className="aspect-[2/3] w-full rounded-xl bg-[#0C0A09] border border-[var(--border)] overflow-hidden relative shadow-lg group-hover:border-[var(--primary)] transition-all group-hover:shadow-2xl group-hover:-translate-y-2">
                  <GridBookImage book={book} />
                  
                  {/* Overlay Info */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <div className="flex items-center gap-1 text-amber-500 mb-1">
                      <Star size={10} fill="currentColor" />
                      <span className="text-[10px] font-bold">{book.rating || '4.5'}</span>
                    </div>
                    <p className="text-[10px] text-white font-bold truncate">{book.author}</p>
                  </div>

                  {/* Progress Bar for Library */}
                  {book.progress && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-black/40">
                      <div 
                        className="h-full bg-[var(--primary)] transition-all duration-1000" 
                        style={{ width: `${book.progress.percentage}%` }}
                      />
                    </div>
                  )}
                </div>
                <div className="mt-3">
                  <span className="inline-block px-2 py-0.5 text-[9px] uppercase font-bold tracking-widest text-amber-500 bg-amber-950/30 border border-amber-900/30 rounded-full mb-1.5">
                    Archive Vol.
                  </span>
                  <h4 className="text-sm font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors truncate mb-0.5">
                    {book.title}
                  </h4>
                  <p className="text-xs text-[var(--muted)] truncate">{book.author}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
}

function GridBookImage({ book }: { book: any }) {
  const [error, setError] = useState(false);

  if (error || !book.cover_url) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#1C1917] to-[#0C0A09]">
        <BookOpen size={24} className="text-amber-900/20 mb-2" />
        <span className="text-[var(--muted)] text-[10px] font-serif uppercase tracking-[0.2em] leading-relaxed line-clamp-3">
          {book.title}
        </span>
      </div>
    );
  }

  return (
    <img 
      src={book.cover_url} 
      alt={book.title} 
      loading="lazy"
      onError={() => setError(true)}
      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" 
    />
  );
}
