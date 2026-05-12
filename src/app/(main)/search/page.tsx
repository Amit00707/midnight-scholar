'use client';

import React, { useState } from 'react';
import { useBookSearch } from "@/lib/hooks/useBooks";

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const { data, isLoading } = useBookSearch(query);

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-serif text-[var(--foreground)] mb-8 text-center">Global Search Engine</h1>
      
      <div className="relative max-w-2xl mx-auto mb-12">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for books, authors, or specific historical concepts..."
          className="w-full bg-[#1C1917] border border-[var(--border)] rounded-full px-6 py-4 text-lg text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none shadow-xl"
        />
        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-2xl">🔍</span>
      </div>

      {isLoading && <div className="text-center text-[var(--muted)]">Loading...</div>}

      {query && data?.results && (
        <div className="space-y-4">
          <h3 className="text-sm uppercase tracking-widest font-bold text-[var(--muted)] mb-4">Results for "{query}"</h3>
          {data.results.map((book: any) => (
            <div key={book.id} className="bg-[#1C1917] p-4 rounded-lg border border-[var(--border)] cursor-pointer hover:border-[var(--primary)] flex gap-4">
              {book.cover_url_small && (
                <img src={book.cover_url_small} alt={book.title} className="w-16 object-cover rounded" />
              )}
              <div>
                <h4 className="text-[var(--primary)] font-bold">{book.title}</h4>
                <p className="text-sm text-[var(--muted)] mt-1">By {book.author}</p>
                <p className="text-xs text-[var(--muted)] mt-2">Rating: {book.rating} • {book.category}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
