'use client';

import React from 'react';
import Link from 'next/link';

interface BookGridProps {
  title?: string;
  books: { id: string; title: string; author: string; cover_url?: string }[];
}

export function BookGrid({ title, books }: BookGridProps) {
  return (
    <section className="my-8">
      {title && <h2 className="text-2xl font-serif text-[var(--primary)] mb-6">{title}</h2>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {books.map(book => (
          <Link key={book.id} href={`/book/${book.id}`} className="group block">
            <div className="aspect-[2/3] w-full rounded-md bg-[#292524] border border-[var(--border)] overflow-hidden relative shadow-lg group-hover:border-[var(--primary)] transition-all">
              {book.cover_url ? (
                <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <h3 className="text-sm font-bold text-white leading-tight">{book.title}</h3>
                  <p className="text-xs text-[var(--muted)]">{book.author}</p>
                </div>
              )}
            </div>
            <div className="mt-3">
              <span className="inline-block px-2 text-[10px] uppercase font-bold tracking-wider text-[var(--primary)] bg-amber-900/20 border border-[var(--primary)]/30 rounded">
                E-Book
              </span>
              <p className="text-xs text-[var(--muted)] mt-1 truncate">{book.title}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
