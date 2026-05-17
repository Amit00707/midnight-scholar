'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SidebarTabs } from '@/components/reader/sidebar/SidebarTabs';
import { PdfViewer } from '@/components/reader/PdfViewer';
import { useBookDetail } from '@/lib/hooks/useBooks';
import { useBookProgress, useUpdateProgress } from '@/lib/hooks/useReader';
import Link from 'next/link';

export default function CoreReaderPage({ params }: { params: any }) {
  const resolvedParams = React.use(params) as { id: string };
  const id = resolvedParams.id;
  const [focusMode, setFocusMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedText, setSelectedText] = useState("");
  const { data: book, isLoading } = useBookDetail(id);
  const { data: progress } = useBookProgress(id);
  const { mutate: updateProgress } = useUpdateProgress();

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateProgress({ bookId: id, page });
  };

  // If the book provides a real PDF (like the Gutenberg Classic books), we use it.
  // Otherwise, we pass an empty string, which safely triggers our elegant "Simulation Mode Active" UI.
  // We can pass the mozilla test PDF via a URL param if we ever need it specifically for debug: ?test=true
  const testUrl = typeof window !== 'undefined' && window.location.search.includes('test=true') 
    ? 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf' 
    : '';
  
  const pdfUrl = book?.pdf_url || testUrl;

  return (
    <div className="flex h-[calc(100vh-64px)] w-full overflow-hidden bg-[var(--background)]">
      
      {/* FOCUS MODE OVERLAY */}
      <AnimatePresence>
        {focusMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-40 bg-black/80 backdrop-blur-sm transition-all"
          />
        )}
      </AnimatePresence>

      <div className="relative z-50 flex h-full w-full">
        {/* Main PDF Rendering Plane */}
        <div className="flex-1 relative flex flex-col items-center justify-center bg-[#0C0A09] p-4 pt-16 transition-all duration-500">
          
          {/* Top Control Bar */}
          <div className={`absolute top-4 left-6 z-50 flex items-center gap-4 transition-opacity ${focusMode ? 'opacity-10 hover:opacity-100' : 'opacity-100'}`}>
            <Link href={`/book/${id}`} className="text-[var(--muted)] hover:text-white transition-colors">
              ← Back
            </Link>
            <div className="w-px h-4 bg-[var(--border)]"></div>
            <h1 className="font-serif text-xl font-bold text-[var(--foreground)] truncate max-w-md">
              {isLoading ? 'Loading...' : book?.title || `Book ID: ${id}`}
            </h1>
          </div>
          
          <div className="absolute top-4 right-6 z-50">
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`px-4 py-2 rounded-full border text-sm font-bold transition-all shadow-xl
                ${focusMode 
                  ? 'bg-amber-600 border-amber-500 text-[#0C0A09]' 
                  : 'bg-[var(--surface)] border-[var(--border)] text-[var(--primary)] hover:bg-[#292524]'}`}
            >
              {focusMode ? '◎ Focus Active' : '◉ Focus Mode'}
            </button>
          </div>

          {/* Actual PDF.js Viewer */}
          <div className={`relative w-full max-w-5xl h-full transition-all duration-700
            ${focusMode ? 'scale-100' : 'scale-[0.98]'}`}
          >
            <PdfViewer 
              url={pdfUrl} 
              iaId={book?.ia_id}
              title={book?.title}
              focusMode={focusMode} 
              isBookLoading={isLoading}
              initialPage={progress?.current_page || 1}
              onPageChange={handlePageChange} 
              onTextSelect={setSelectedText}
            />
          </div>
        </div>

        {/* Dynamic AI Sidebar Wrapper */}
        <motion.div 
          animate={{ width: focusMode ? 0 : 400, opacity: focusMode ? 0 : 1 }}
          className="h-full border-l border-[var(--border)] overflow-hidden bg-[var(--surface)] z-10 shrink-0"
        >
          <div className="w-[400px] h-full">
            <SidebarTabs 
              bookId={id} 
              currentPage={currentPage} 
              pdfUrl={pdfUrl} 
              selectedText={selectedText}
              onPageJump={(page) => setCurrentPage(page)} 
            />
          </div>
        </motion.div>
      </div>

    </div>
  );
}
