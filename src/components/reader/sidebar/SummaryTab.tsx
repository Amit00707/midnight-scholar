'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useSummary } from '@/lib/hooks/useAI';

interface SummaryTabProps {
  bookId: string;
  pageNumber: number;
}

export function SummaryTab({ bookId, pageNumber }: SummaryTabProps) {
  const { data, isLoading, error } = useSummary(bookId, pageNumber);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-serif text-[var(--accent)] font-bold flex items-center gap-2">
          ✨ Live Summary
        </h3>
        <p className="text-xs text-[var(--muted)] mt-1">Generated from page {pageNumber}</p>
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse mt-4">
          <div className="h-4 bg-[#292524] rounded w-3/4"></div>
          <div className="h-4 bg-[#292524] rounded w-full"></div>
          <div className="h-4 bg-[#292524] rounded w-full"></div>
          <div className="h-4 bg-[#292524] rounded w-5/6"></div>
          <div className="h-4 bg-[#292524] rounded w-1/2"></div>
        </div>
      ) : error ? (
        <div className="text-red-400 text-sm mt-4">Failed to generate summary. Is the AI engine configured?</div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="prose prose-invert text-sm text-[var(--foreground)] mt-4">
          <p className="leading-relaxed">
            {data?.summary || 'No summary available.'}
          </p>
          {data?.key_points && data.key_points.length > 0 && (
            <ul className="list-disc pl-4 mt-4 space-y-2 text-[var(--muted)]">
              {data.key_points.map((point: string, i: number) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
          )}
        </motion.div>
      )}
    </div>
  );
}
