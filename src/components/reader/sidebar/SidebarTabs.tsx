'use client';

import React, { useState } from 'react';
import { SummaryTab } from './SummaryTab';
import { QATab } from './QATab';
import { FlashcardsTab } from './FlashcardsTab';
import { RevisionTab } from './RevisionTab';
import { KeywordsTab } from './KeywordsTab';

// Skeleton placeholders for remaining standard tabs
const PlaceholderTab = ({ name }: { name: string }) => (
  <div className="p-4 text-[var(--muted)] text-sm text-center mt-10">
    {name} Tab logic loading...
  </div>
);

type TabType = 'toc' | 'summary' | 'qa' | 'flashcards' | 'keywords' | 'revision' | 'notes' | 'bookmarks' | 'quiz';

interface SidebarTabsProps {
  bookId: string;
  currentPage: number;
}

export function SidebarTabs({ bookId, currentPage }: SidebarTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('summary');

  const tabs: { id: TabType, label: string, isAI?: boolean }[] = [
    { id: 'toc', label: 'TOC' },
    { id: 'summary', label: 'Summary', isAI: true },
    { id: 'qa', label: 'Doubt Solver', isAI: true },
    { id: 'flashcards', label: 'Flashcards', isAI: true },
    { id: 'keywords', label: 'Keywords', isAI: true },
    { id: 'revision', label: 'Revision', isAI: true },
    { id: 'notes', label: 'Notes' },
    { id: 'bookmarks', label: 'Bookmarks' },
    { id: 'quiz', label: 'Quiz', isAI: true },
  ];

  return (
    <div className="h-full w-full bg-[var(--surface)] border-l border-[var(--border)] flex flex-col">
      {/* Scrollable Tab Strip */}
      <div className="flex overflow-x-auto border-b border-[var(--border)] no-scrollbar bg-[#0C0A09]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors
              ${activeTab === tab.id 
                ? (tab.isAI ? 'border-[var(--accent)] text-[var(--foreground)]' : 'border-[var(--primary)] text-[var(--foreground)]') 
                : 'border-transparent text-[var(--muted)] hover:bg-[var(--surface-hover)]'
              }
            `}
          >
            {tab.isAI && <span className="mr-1 text-[var(--accent)]">✨</span>}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dynamic Content Pane */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'summary' && <SummaryTab bookId={bookId} pageNumber={currentPage} />}
        {activeTab === 'qa' && <QATab bookId={bookId} pageNumber={currentPage} />}
        {activeTab === 'flashcards' && <FlashcardsTab bookId={bookId} pageNumber={currentPage} />}
        {activeTab === 'revision' && <RevisionTab />}
        {activeTab === 'keywords' && <KeywordsTab />}
        
        {/* Placeholder standard tabs waiting for HTML integration */}
        {activeTab === 'toc' && <PlaceholderTab name="Table of Contents" />}
        {activeTab === 'notes' && <PlaceholderTab name="User Notes" />}
        {activeTab === 'bookmarks' && <PlaceholderTab name="Bookmarks" />}
        {activeTab === 'quiz' && <PlaceholderTab name="Smart Quiz" />}
      </div>
    </div>
  );
}
