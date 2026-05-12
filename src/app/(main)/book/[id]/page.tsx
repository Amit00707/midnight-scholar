'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useBookDetail } from '@/lib/hooks/useBooks';

export default function BookDetailsPage({ params }: { params: { id: string } }) {
  const { data: book, isLoading } = useBookDetail(params.id);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-[var(--muted)] text-lg animate-pulse">Loading book details...</div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-[var(--muted)] text-xl mb-4">Book not found</div>
        <Link href="/search"><Button variant="ghost">Return to Search</Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Left Column: Cover & Actions */}
        <div className="w-full md:w-1/3 flex flex-col gap-6">
          <div className="aspect-[2/3] w-full rounded-xl bg-[#292524] border border-[var(--border)] shadow-2xl relative overflow-hidden">
            {book.cover_url ? (
              <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-[var(--muted)]/50 font-serif text-xl border-4 border-[#1C1917] m-4">
                Cover Art
              </div>
            )}
          </div>
          
          <Link href={`/read/${book.id}`} className="w-full block">
            <Button variant="primary" className="w-full h-14 text-lg">
              Read Now
            </Button>
          </Link>
          
          {/* Missing Feature Check: QR Modal Trigger Placeholder */}
          <Button variant="secondary" className="w-full mb-6">
            📱 Send to Phone (QR)
          </Button>
        </div>

        {/* Right Column: Metadata & AI Stats */}
        <div className="flex-1">
          <div className="flex gap-2 mb-4 flex-wrap">
            <span className="px-3 py-1 bg-amber-900/20 text-[var(--primary)] border border-[var(--primary)]/30 rounded-full text-xs font-bold uppercase">{book.category}</span>
            <span className="px-3 py-1 bg-[#1C1917] text-[var(--muted)] border border-[var(--border)] rounded-full text-xs font-bold uppercase">{book.difficulty || 'Intermediate'}</span>
            {book.subjects && book.subjects.slice(0, 3).map((subject: string, idx: number) => (
              <span key={idx} className="px-3 py-1 bg-[#1C1917] text-[var(--muted)] border border-[var(--border)] rounded-full text-xs font-bold uppercase">{subject}</span>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-serif text-[var(--foreground)] mb-2">{book.title}</h1>
          
          {book.authors && book.authors.length > 0 ? (
            <Link href={`/author/${book.authors[0]?.toLowerCase().replace(/\s+/g, '-')}`} className="text-lg text-[var(--muted)] hover:text-[var(--primary)] mb-8 inline-block">
              by {book.authors.join(', ')}
            </Link>
          ) : (
            <div className="text-lg text-[var(--muted)] mb-8">
              by Unknown Author
            </div>
          )}

          <p className="text-[var(--foreground)] leading-relaxed text-lg mb-8">
            {book.description || `Dive into ${book.title}. This book does not have a comprehensive description available, but it explores themes like ${book.subjects?.slice(0,3).join(', ') || 'various interesting concepts'}.`}
          </p>

          <div className="bg-[#1C1917] border border-[var(--border)] rounded-xl p-6 flex gap-8 items-center mb-8 flex-wrap">
            <div>
              <span className="block text-sm text-[var(--muted)] mb-1">Total Pages</span>
              <span className="font-mono text-xl font-bold">{book.page_count || 'Unknown'}</span>
            </div>
            <div className="w-px h-12 bg-[var(--border)] hidden sm:block"></div>
            <div>
              <span className="block text-sm text-[var(--muted)] mb-1">Avg. Read Time</span>
              <span className="font-mono text-xl font-bold">{book.reading_hours ? `${book.reading_hours} Hrs` : 'Unknown'}</span>
            </div>
            <div className="w-px h-12 bg-[var(--border)] hidden sm:block"></div>
            <div>
              <span className="block text-sm text-[var(--muted)] mb-1">AI Rating</span>
              <span className="font-mono text-xl font-bold text-[var(--accent)]">{book.rating ? `${(book.rating * 20).toFixed(0)}/100` : 'Not Rated'}</span>
            </div>
          </div>

          {/* User Reviews Section */}
          <div className="border-t border-[var(--border)] pt-8 mt-12">
            <h3 className="text-2xl font-serif text-[var(--foreground)] mb-6">Community Insights</h3>
            {/* Ratings UI here */}
            <p className="text-[var(--muted)]">{book.rating ? `${book.rating} / 5 from ${book.rating_count} scholars.` : 'No community insights available yet.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
