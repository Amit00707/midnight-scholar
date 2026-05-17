'use client';

import React, { useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

interface TOCTabProps {
  bookId: string;
  pdfUrl?: string;
  currentPage: number;
  onPageJump?: (page: number) => void;
}

interface TOCItem {
  title: string;
  page: number;
  level: number;
  children: TOCItem[];
}

export function TOCTab({ bookId, pdfUrl, currentPage, onPageJump }: TOCTabProps) {
  const [outline, setOutline] = useState<TOCItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pdfUrl) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    async function loadOutline() {
      try {
        // If the URL is our local proxy, it might fail for protected books
        const loadingTask = pdfjsLib.getDocument(pdfUrl!);
        const pdf = await loadingTask.promise;
        const rawOutline = await pdf.getOutline();

        if (cancelled) return;

        if (!rawOutline || rawOutline.length === 0) {
          setOutline([]);
          setIsLoading(false);
          return;
        }

        // Resolve destinations to page numbers
        const items = await resolveOutline(rawOutline, pdf, 0);
        setOutline(items);
      } catch (err) {
        if (!cancelled) {
          console.error('TOC load error:', err);
          // If it's a fetch error, it's likely a CORS/Proxy issue for a protected book
          if (err instanceof Error && err.message.includes('fetch')) {
            setError('This book is protected or restricted. Table of Contents cannot be extracted automatically.');
          } else {
            setError('Could not extract table of contents.');
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadOutline();
    return () => { cancelled = true; };
  }, [pdfUrl]);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-serif text-[var(--accent)] font-bold flex items-center gap-2">
          📑 Table of Contents
        </h3>
        <p className="text-xs text-[var(--muted)] mt-1">
          {outline.length > 0 ? `${outline.length} sections found` : 'Extracted from PDF'}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3 animate-pulse mt-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-8 bg-[#292524] rounded w-full" />
          ))}
        </div>
      ) : error ? (
        <div className="text-red-400 text-sm mt-4">{error}</div>
      ) : outline.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-3">📄</div>
          <p className="text-[var(--foreground)] font-medium mb-1">No TOC available</p>
          <p className="text-xs text-[var(--muted)]">
            This PDF does not contain a structured table of contents. Try navigating using page numbers.
          </p>
        </div>
      ) : (
        <div className="space-y-0.5 overflow-y-auto">
          {renderItems(outline, currentPage, onPageJump)}
        </div>
      )}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────

function renderItems(items: TOCItem[], currentPage: number, onJump?: (page: number) => void): React.ReactNode {
  return items.map((item, idx) => {
    const isActive = item.page === currentPage;
    const isNear = Math.abs(item.page - currentPage) <= 2;
    
    return (
      <div key={`${item.title}-${idx}`}>
        <button
          onClick={() => onJump?.(item.page)}
          className={`w-full text-left py-2 px-3 rounded-lg transition-colors flex justify-between items-center group
            ${isActive
              ? 'bg-[var(--primary)] text-[#0C0A09] font-medium'
              : isNear
                ? 'bg-amber-900/10 text-[var(--foreground)] hover:bg-amber-900/20'
                : 'text-[var(--foreground)] hover:bg-[var(--surface-hover)]'
            }`}
          style={{ paddingLeft: `${12 + item.level * 16}px` }}
        >
          <span className="text-sm truncate flex-1">{item.title}</span>
          <span className={`text-[10px] shrink-0 ml-2 font-mono ${
            isActive ? 'text-[#0C0A09]/70' : 'text-[var(--muted)]'
          }`}>
            p.{item.page}
          </span>
        </button>
        {item.children.length > 0 && renderItems(item.children, currentPage, onJump)}
      </div>
    );
  });
}

async function resolveOutline(
  items: any[],
  pdf: pdfjsLib.PDFDocumentProxy,
  level: number
): Promise<TOCItem[]> {
  const resolved: TOCItem[] = [];

  for (const item of items) {
    let pageNum = 1;

    try {
      if (item.dest) {
        // Dest can be a string (named destination) or an array
        let dest = item.dest;
        if (typeof dest === 'string') {
          dest = await pdf.getDestination(dest);
        }
        if (Array.isArray(dest) && dest[0]) {
          const pageIndex = await pdf.getPageIndex(dest[0]);
          pageNum = pageIndex + 1; // 0-indexed → 1-indexed
        }
      }
    } catch (e) {
      // Fallback to page 1 if destination resolution fails
    }

    const children = item.items?.length > 0
      ? await resolveOutline(item.items, pdf, level + 1)
      : [];

    resolved.push({
      title: item.title || 'Untitled',
      page: pageNum,
      level,
      children,
    });
  }

  return resolved;
}
