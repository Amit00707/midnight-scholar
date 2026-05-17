'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAskDoubt } from '@/lib/hooks/useAI';

interface QATabProps {
  bookId: string;
  pageNumber: number;
  selectedText?: string;
}

export function QATab({ bookId, pageNumber, selectedText }: QATabProps) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([
    { role: 'ai', text: 'Hello Scholar! What part of this chapter is confusing you?' }
  ]);

  const { mutate: askDoubt, isPending } = useAskDoubt();

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isPending) return;

    setMessages((prev) => [...prev, { role: 'user', text: query }]);
    setQuery('');

    const questionWithContext = selectedText 
      ? `[Context: ${selectedText}] \nQuestion: ${query}` 
      : query;

    askDoubt(
      { bookId, pageNumber, question: questionWithContext },
      {
        onSuccess: (data) => {
          setMessages((prev) => [...prev, { role: 'ai', text: data.answer }]);
        },
        onError: () => {
          setMessages((prev) => [...prev, { role: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
        }
      }
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4">
        <h3 className="text-lg font-serif text-[var(--accent)] font-bold flex items-center gap-2">
          ✨ Doubt Solver
        </h3>
        <p className="text-xs text-[var(--muted)] mt-1">Contextual AI Assistant</p>
      </div>

      {selectedText && (
        <div className="mb-4 p-2 bg-[#292524] border border-amber-900/30 rounded text-xs text-amber-200/80 italic">
          <span className="block font-bold text-amber-500 mb-1">SELECTED CONTEXT:</span>
          "{selectedText.length > 150 ? selectedText.substring(0, 150) + '...' : selectedText}"
        </div>
      )}

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`p-3 rounded-lg max-w-[85%] text-sm ${m.role === 'user' ? 'bg-[var(--primary)] text-[#0C0A09] rounded-br-none' : 'bg-[#2E224F] border border-[#523A97] text-white rounded-bl-none'}`}>
              {m.text}
            </div>
          </div>
        ))}
        {isPending && (
          <div className="flex justify-start">
            <div className="p-3 rounded-lg bg-[#2E224F] border border-[#523A97] text-white rounded-bl-none">
              <span className="animate-pulse">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleAsk} className="flex flex-col gap-2 relative mt-auto border-t border-[var(--border)] pt-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask a question..."
          className="w-full bg-[#0C0A09] border border-[var(--border)] rounded-full px-4 py-2 text-sm text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none"
          disabled={isPending}
        />
        <div className="flex justify-between items-center px-1">
          <button type="button" className="text-amber-500 text-sm hover:text-amber-400" disabled={isPending}>
            🎙️ Voice Query
          </button>
          <Button type="submit" variant="primary" size="sm" className="bg-[var(--accent)] text-white hover:bg-violet-500" disabled={isPending || !query.trim()}>
            Send
          </Button>
        </div>
      </form>
    </div>
  );
}
