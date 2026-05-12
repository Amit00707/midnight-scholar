'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set up the PDF.js worker
if (typeof window !== 'undefined' && !pdfjsLib.GlobalWorkerOptions.workerSrc) {
  // Using mjs for v3+ or matching version
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

interface PdfViewerProps {
  url: string;
  onPageChange?: (page: number, total: number) => void;
  focusMode?: boolean;
}

export function PdfViewer({ url, onPageChange, focusMode = false }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [pageRendering, setPageRendering] = useState(false);
  const [pageNumPending, setPageNumPending] = useState<number | null>(null);
  const [scale, setScale] = useState(1.2);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load the PDF Document
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const loadingTask = pdfjsLib.getDocument(url);
    
    loadingTask.promise.then(
      (pdf) => {
        if (!isMounted) return;
        setPdfDoc(pdf);
        setPageNum(1);
        if (onPageChange) onPageChange(1, pdf.numPages);
        setIsLoading(false);
      },
      (err) => {
        if (!isMounted) return;
        console.error('Error loading PDF:', err);
        setError('Failed to load the PDF document. It may be missing or protected.');
        setIsLoading(false);
      }
    );

    return () => {
      isMounted = false;
      loadingTask.destroy();
    };
  }, [url]);

  // Render the page
  const renderPage = (num: number, pdf: pdfjsLib.PDFDocumentProxy) => {
    setPageRendering(true);

    pdf.getPage(num).then((page) => {
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current;
      
      if (!canvas) {
        setPageRendering(false);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      };

      const renderTask = page.render(renderContext);

      renderTask.promise.then(() => {
        setPageRendering(false);
        if (pageNumPending !== null) {
          renderPage(pageNumPending, pdf);
          setPageNumPending(null);
        }
      }).catch(err => {
        console.error('Render error:', err);
        setPageRendering(false);
      });
    });
  };

  useEffect(() => {
    if (pdfDoc) {
      renderPage(pageNum, pdfDoc);
      if (onPageChange) onPageChange(pageNum, pdfDoc.numPages);
    }
  }, [pdfDoc, pageNum, scale]);

  const queueRenderPage = (num: number) => {
    if (pageRendering) {
      setPageNumPending(num);
    } else if (pdfDoc) {
      renderPage(num, pdfDoc);
    }
  };

  const onPrevPage = () => {
    if (pageNum <= 1) return;
    setPageNum(prev => prev - 1);
  };

  const onNextPage = () => {
    if (!pdfDoc || pageNum >= pdfDoc.numPages) return;
    setPageNum(prev => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#1C1917] rounded-lg">
        <div className="w-12 h-12 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-[var(--muted)] font-serif">Loading manuscript...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#1C1917] rounded-lg p-8 text-center border border-red-900/30">
        <span className="text-4xl mb-4">📄</span>
        <p className="text-[var(--foreground)] font-serif text-lg mb-2">Simulation Mode Active</p>
        <p className="text-[var(--muted)] max-w-md">{error}</p>
        <div className="mt-8 p-6 bg-[#0C0A09] rounded border border-[var(--border)] max-w-2xl text-left">
          <p className="font-serif text-xl text-[var(--foreground)] leading-relaxed">
            "The rapid expansion of the Republic severely strained the ancestral systems of governance. The Senate found itself managing not a city-state, but an empire spanning the Mediterranean."
          </p>
          <p className="text-[var(--muted)] text-sm mt-4 italic">— Placeholder Text (PDF unavailable for this Open Library record)</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full flex flex-col items-center overflow-auto bg-[#1C1917] rounded-lg border transition-all duration-700
      ${focusMode ? 'border-amber-900/50 shadow-[0_0_50px_rgba(217,119,6,0.1)]' : 'border-[var(--border)]'}`}
    >
      <div className="flex-1 overflow-auto p-4 md:p-8 w-full flex justify-center custom-scrollbar">
        <canvas ref={canvasRef} className="shadow-2xl bg-white max-w-full" />
      </div>

      {/* Reader Controls */}
      <div className={`absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-[#0C0A09]/90 backdrop-blur px-6 py-3 rounded-full border border-[var(--border)] flex items-center gap-6 shadow-2xl transition-all duration-300 ${focusMode ? 'opacity-30 hover:opacity-100' : 'opacity-100'}`}>
        <button 
          onClick={onPrevPage} 
          disabled={pageNum <= 1}
          className="text-[var(--foreground)] hover:text-[var(--primary)] disabled:opacity-30 disabled:hover:text-[var(--foreground)] transition-colors"
        >
          ← Prev
        </button>
        <span className="font-mono text-[var(--muted)] text-sm">
          {pageNum} / {pdfDoc?.numPages || '?'}
        </span>
        <button 
          onClick={onNextPage} 
          disabled={!pdfDoc || pageNum >= pdfDoc.numPages}
          className="text-[var(--foreground)] hover:text-[var(--primary)] disabled:opacity-30 disabled:hover:text-[var(--foreground)] transition-colors"
        >
          Next →
        </button>
        <div className="w-px h-4 bg-[var(--border)]"></div>
        <button 
          onClick={() => setScale(s => s + 0.2)}
          className="text-[var(--muted)] hover:text-white transition-colors"
        >
          A+
        </button>
        <button 
          onClick={() => setScale(s => Math.max(0.6, s - 0.2))}
          className="text-[var(--muted)] hover:text-white transition-colors"
        >
          A-
        </button>
      </div>
    </div>
  );
}
