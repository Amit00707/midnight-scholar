'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

interface KeywordsTabProps {
  bookId: string;
  pageNumber: number;
}

interface Keyword {
  term: string;
  definition: string;
  importance: number;
}

export function KeywordsTab({ bookId, pageNumber }: KeywordsTabProps) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['keywords', bookId, pageNumber],
    queryFn: () => api.getKeywords(bookId, pageNumber),
    enabled: !!bookId && pageNumber > 0,
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  const keywords: Keyword[] = data?.keywords || [];

  const importanceColors: Record<number, string> = {
    5: 'bg-amber-900/40 text-amber-400 border-amber-900/60',
    4: 'bg-purple-900/30 text-purple-400 border-purple-900/50',
    3: 'bg-blue-900/30 text-blue-400 border-blue-900/50',
    2: 'bg-teal-900/30 text-teal-400 border-teal-900/50',
    1: 'bg-gray-800/40 text-gray-400 border-gray-700/50',
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-serif text-[var(--accent)] font-bold flex items-center gap-2">
          ✨ Core Keywords
        </h3>
        <p className="text-xs text-[var(--muted)] mt-1">AI-extracted from page {pageNumber}</p>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse mt-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex gap-2">
              <div className="h-8 bg-[#292524] rounded-md w-24" />
              <div className="h-8 bg-[#292524] rounded-md flex-1" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-400 text-sm mt-4">
          Failed to extract keywords. Is the AI engine configured?
        </div>
      ) : keywords.length === 0 ? (
        <div className="text-center text-[var(--muted)] text-sm mt-8">
          No keywords found for this page.
        </div>
      ) : (
        <>
          {/* Keyword Tags */}
          <div className="flex flex-wrap gap-2 mt-2">
            {keywords.map(kw => (
              <button
                key={kw.term}
                className={`px-3 py-1.5 border rounded-md text-sm hover:opacity-80 transition-opacity flex items-center gap-2 ${importanceColors[kw.importance] || importanceColors[3]}`}
              >
                {kw.term}
                <span className="text-[10px] bg-[#0C0A09] px-1.5 py-0.5 rounded text-[var(--muted)]">
                  {'★'.repeat(kw.importance)}
                </span>
              </button>
            ))}
          </div>

          {/* Definitions */}
          <div className="mt-6 space-y-3">
            <h4 className="text-xs font-bold text-[var(--muted)] uppercase tracking-wider">Definitions</h4>
            {keywords.map(kw => (
              <div
                key={kw.term + '-def'}
                className="bg-[#1C1917] border border-[var(--border)] rounded-lg p-3"
              >
                <p className="text-sm font-medium text-[var(--foreground)]">{kw.term}</p>
                <p className="text-xs text-[var(--muted)] mt-1 leading-relaxed">{kw.definition}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="mt-auto pt-4 border-t border-[var(--border)]">
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="w-full py-2 bg-[var(--surface-hover)] text-[var(--foreground)] rounded-lg text-xs hover:opacity-80 disabled:opacity-40"
        >
          {isLoading ? 'Extracting...' : 'Regenerate Keywords'}
        </button>
      </div>
    </div>
  );
}
