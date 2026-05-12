'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookGrid } from '@/components/books/BookGrid';
import { useAuth } from '@/lib/auth-context';
import { api, type Book } from '@/lib/api/client';

type Tab = 'all' | 'reading' | 'finished' | 'wishlist';

export default function LibraryPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('all');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    if (isAuthenticated) {
      loadBooks();
    }
  }, [isAuthenticated, authLoading]);

  async function loadBooks() {
    try {
      const data = await api.getBooks();
      setBooks(data);
    } catch (err) {
      console.error('Failed to load books:', err);
    } finally {
      setLoading(false);
    }
  }

  const displayBooks = books.map(b => ({ 
    id: String(b.id), 
    title: b.title, 
    author: b.author,
    cover_url: b.cover_url
  }));

  const readingBooks = books.filter(b => b.progress && b.progress.percentage < 100);
  const finishedBooks = books.filter(b => b.progress && b.progress.percentage >= 100);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: `All Books (${books.length})` },
    { key: 'reading', label: `Currently Reading (${readingBooks.length})` },
    { key: 'finished', label: `Finished (${finishedBooks.length})` },
  ];

  const filteredBooks = activeTab === 'all' ? displayBooks : 
                        activeTab === 'reading' ? readingBooks : 
                        activeTab === 'finished' ? finishedBooks : displayBooks;

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 flex items-center justify-center min-h-[60vh]">
        <div className="text-[var(--muted)] text-lg animate-pulse">Loading your library...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif text-[var(--foreground)] mb-2">My Library</h1>
      <p className="text-[var(--muted)] mb-8">Manage your personal collection and reading lists.</p>

      <div className="flex gap-8 border-b border-[var(--border)] mb-8">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 border-b-2 font-medium transition-colors ${
              activeTab === tab.key
                ? 'border-[var(--primary)] text-[var(--foreground)]'
                : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {filteredBooks.length > 0 ? (
        <BookGrid books={filteredBooks.map(b => ({ id: String(b.id), title: b.title, author: b.author, cover_url: b.cover_url }))} />
      ) : (
        <div className="text-center py-20 bg-[var(--surface)] border border-[var(--border)] rounded-xl">
          <p className="text-[var(--muted)] text-lg mb-4">No books found in this category.</p>
          <button onClick={() => router.push('/search')} className="text-[var(--primary)] hover:underline">
            Discover new books
          </button>
        </div>
      )}
    </div>
  );
}
