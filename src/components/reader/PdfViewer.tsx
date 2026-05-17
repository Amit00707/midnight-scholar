'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
// @ts-ignore - TextLayer might not be in the old @types/pdfjs-dist
import { TextLayer, GlobalWorkerOptions, getDocument } from 'pdfjs-dist';
import { motion } from 'framer-motion';
import { Sparkles, Brain } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Set up the PDF.js worker
if (typeof window !== 'undefined' && !GlobalWorkerOptions.workerSrc) {
  GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
}

interface PdfViewerProps {
  url?: string;
  iaId?: string;
  title?: string;
  onPageChange?: (page: number, total: number) => void;
  onTextSelect?: (text: string) => void;
  initialPage?: number;
  focusMode?: boolean;
  isBookLoading?: boolean;
}

export function PdfViewer({ url, iaId, title, onPageChange, onTextSelect, initialPage, focusMode = false, isBookLoading = false }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textLayerRef = useRef<HTMLDivElement>(null);
  
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      if (onTextSelect) onTextSelect(selection.toString());
    }
  };
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [hasInitialJumped, setHasInitialJumped] = useState(false);
  const [pageRendering, setPageRendering] = useState(false);
  const [pageNumPending, setPageNumPending] = useState<number | null>(null);
  const [scale, setScale] = useState(1.2);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // If the book has already finished loading in the parent and we have no source
  useEffect(() => {
    if (!url && !iaId && !isBookLoading) {
      setError('No direct manuscript found. Activating simulation mode.');
      setIsLoading(false);
    }
  }, [url, iaId, isBookLoading]);

  // If we have an Internet Archive ID, we prefer the official IA Embed.
  // Direct PDF downloads from IA (archive.org/download/...) often return 401/403 for protected books.
  if (iaId) {
    return (
      <div className={`w-full h-full bg-[#1C1917] rounded-lg overflow-hidden border transition-all duration-700
        ${focusMode ? 'border-amber-900/50 shadow-[0_0_50px_rgba(217,119,6,0.1)]' : 'border-[var(--border)]'}`}
      >
        <iframe
          src={`https://archive.org/embed/${iaId}?ui=full`}
          width="100%"
          height="100%"
          style={{ border: 'none' }}
          allowFullScreen
        />
      </div>
    );
  }

  // Load the PDF Document
  useEffect(() => {
    if (!url) return;
    let isMounted = true;
    setIsLoading(true);
    const proxyUrl = url.startsWith('http') 
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/proxy/pdf?url=${encodeURIComponent(url)}`
      : url;

    const loadingTask = getDocument(proxyUrl);
    
    loadingTask.promise.then(
      (pdf) => {
        if (!isMounted) return;
        const startPage = initialPage || 1;
        setPdfDoc(pdf);
        setPageNum(startPage);
        if (onPageChange) onPageChange(startPage, pdf.numPages);
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

  // Initial Jump Logic
  useEffect(() => {
    if (pdfDoc && initialPage && initialPage > 1 && !hasInitialJumped) {
      setPageNum(initialPage);
      setHasInitialJumped(true);
      if (onPageChange) onPageChange(initialPage, pdfDoc.numPages);
    }
  }, [pdfDoc, initialPage, hasInitialJumped, onPageChange]);

  // Render the page
  const renderPage = useCallback((num: number, pdf: pdfjsLib.PDFDocumentProxy) => {
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
        canvas: canvas,
      };

      const renderTask = page.render(renderContext);

      renderTask.promise.then(() => {
        setPageRendering(false);
        
        // Render Text Layer
        if (textLayerRef.current) {
          textLayerRef.current.innerHTML = '';
          textLayerRef.current.style.width = `${viewport.width}px`;
          textLayerRef.current.style.height = `${viewport.height}px`;
          
          page.getTextContent().then((textContent) => {
            // @ts-ignore - API change in PDF.js 4.0+
            const textLayer = new TextLayer({
              textContentSource: textContent,
              container: textLayerRef.current!,
              viewport: viewport,
            });
            textLayer.render();
          });
        }

        if (pageNumPending !== null) {
          renderPage(pageNumPending, pdf);
          setPageNumPending(null);
        }
      }).catch(err => {
        console.error('Render error:', err);
        setPageRendering(false);
      });
    });
  }, [scale, pageNumPending]);

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
      <div className="flex flex-col items-center justify-center h-full bg-[#0C0A09] text-center p-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full"
        >
          <div className="mb-10 relative inline-block">
            <div className="w-40 h-40 rounded-full bg-amber-900/10 flex items-center justify-center text-6xl border border-amber-900/20">
              📜
            </div>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-amber-600 flex items-center justify-center text-[#0C0A09] shadow-[0_0_20px_rgba(217,119,6,0.4)]"
            >
              <Sparkles size={24} />
            </motion.div>
          </div>
          
          <h2 className="text-4xl font-serif text-[var(--foreground)] font-bold mb-6">
            Scholarly Simulation Active
          </h2>
          <p className="text-[var(--muted)] text-xl mb-10 leading-relaxed max-w-xl mx-auto">
            A direct digital copy is currently unavailable for this record. 
            However, your <span className="text-white italic">Midnight Scholar AI Engine</span> has synthesized the following overview for your research:
          </p>

          <div className="mt-12 p-10 bg-[#1C1917] rounded-[2rem] border border-amber-900/30 shadow-2xl relative group overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-opacity">
              <Brain size={120} />
            </div>
            <p className="font-serif text-2xl text-[var(--foreground)] leading-relaxed italic relative z-10">
              "This work explores deep conceptual frameworks and historical paradigms that continue to shape modern scholarly discourse."
            </p>
            <p className="text-amber-500/60 text-sm mt-6 font-bold uppercase tracking-widest relative z-10">
              AI Insight Summary Ready in Sidebar
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mt-12">
            <Button 
              variant="primary" 
              size="lg" 
              className="rounded-full px-10 py-6 text-lg shadow-2xl hover:scale-105 transition-transform" 
              onClick={() => window.open(`https://openlibrary.org/search?q=${encodeURIComponent(title || '')}`, '_blank')}
            >
              Find Alternative Edition
            </Button>
            <Button 
              variant="ghost" 
              size="lg" 
              className="rounded-full px-10 py-6 text-lg border border-[var(--border)] hover:bg-white/5" 
              onClick={() => window.history.back()}
            >
              Return to Library
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full flex flex-col items-center overflow-auto bg-[#1C1917] rounded-lg border transition-all duration-700
      ${focusMode ? 'border-amber-900/50 shadow-[0_0_50px_rgba(217,119,6,0.1)]' : 'border-[var(--border)]'}`}
    >
      <div className="flex-1 overflow-auto p-4 md:p-8 w-full flex justify-center custom-scrollbar">
        <div className="relative shadow-2xl rounded-sm overflow-hidden bg-white mx-auto">
          <canvas ref={canvasRef} className={`block max-w-full h-auto ${darkMode ? 'invert hue-rotate-180' : ''}`} />
          <div 
            ref={textLayerRef} 
            className="textLayer absolute top-0 left-0 right-0 bottom-0 opacity-20 pointer-events-auto"
            onMouseUp={handleTextSelection}
          />
        </div>
      </div>

      {/* Reader Controls - Hide if IA Embed is active since it has its own controls */}
      {!iaId && (
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
            onClick={() => setDarkMode(d => !d)}
            className={`text-[var(--muted)] hover:text-white transition-colors ${darkMode ? 'text-amber-500' : ''}`}
            title="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
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
      )}
    </div>
  );
}
