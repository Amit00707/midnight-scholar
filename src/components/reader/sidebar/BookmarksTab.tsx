'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api/client';

interface BookmarksTabProps {
  bookId: string;
  pageNumber: number;
}

export function BookmarksTab({ bookId, pageNumber }: BookmarksTabProps) {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [label, setLabel] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, [bookId]);

  const loadBookmarks = async () => {
    try {
      const res = await api.getBookmarks(bookId);
      setBookmarks(res.bookmarks || []);
    } catch (err) {
      console.error('Failed to load bookmarks', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.addBookmark(bookId, pageNumber, label || `Page ${pageNumber}`);
      setLabel('');
      loadBookmarks(); // Refresh
    } catch (err) {
      console.error('Failed to save bookmark', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteBookmark(id);
      loadBookmarks(); // Refresh
    } catch (err) {
      console.error('Failed to delete bookmark', err);
    }
  };

  const isCurrentPageBookmarked = bookmarks.some(b => b.page_number === pageNumber);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-serif text-[var(--foreground)] font-bold flex items-center gap-2">
          🔖 Bookmarks
        </h3>
        <p className="text-xs text-[var(--muted)] mt-1">Save important pages for later</p>
      </div>

      {/* New Bookmark Form */}
      <div className="mb-6 bg-[#1C1917] p-4 rounded-xl border border-[var(--border)] shadow-sm">
        {isCurrentPageBookmarked ? (
          <div className="text-center text-sm text-[var(--primary)] font-medium py-2">
            ✅ Page {pageNumber} is bookmarked
          </div>
        ) : (
          <>
            <p className="text-xs text-[var(--primary)] font-bold mb-2 uppercase tracking-wide">
              Bookmark Page {pageNumber}
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Optional label..."
                className="flex-1 bg-[#0C0A09] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors"
              />
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[var(--primary)] text-[#0C0A09] rounded-lg font-medium text-sm hover:opacity-90"
              >
                Save
              </button>
            </div>
          </>
        )}
      </div>

      {/* Bookmarks List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {isLoading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-16 bg-[#1C1917] rounded-xl border border-[var(--border)]"></div>
            <div className="h-16 bg-[#1C1917] rounded-xl border border-[var(--border)]"></div>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center text-[var(--muted)] py-8 text-sm">
            No bookmarks yet.
          </div>
        ) : (
          bookmarks.map(bookmark => (
            <div key={bookmark.id} className="bg-[#1C1917] p-3 rounded-xl border border-[var(--border)] relative group flex justify-between items-center hover:border-[var(--primary)] transition-colors cursor-pointer">
              <div>
                <div className="text-xs font-bold text-[var(--primary)]">Page {bookmark.page_number}</div>
                {bookmark.label && (
                  <div className="text-sm text-[var(--foreground)] mt-1">{bookmark.label}</div>
                )}
                <div className="text-[10px] text-[var(--muted)] mt-1">
                  {new Date(bookmark.created_at).toLocaleDateString()}
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(bookmark.id);
                }}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:bg-red-900/30 hover:text-red-400 transition-colors"
                title="Delete bookmark"
              >
                ✕
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
