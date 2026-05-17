'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api/client';

interface NotesTabProps {
  bookId: string;
  pageNumber: number;
  selectedText?: string;
}

export function NotesTab({ bookId, pageNumber, selectedText }: NotesTabProps) {
  const [notes, setNotes] = useState<any[]>([]);
  const [newNote, setNewNote] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, [bookId]);

  const loadNotes = async () => {
    try {
      const res = await api.getNotes(bookId);
      setNotes(res.notes || []);
    } catch (err) {
      console.error('Failed to load notes', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!newNote.trim()) return;
    try {
      await api.addNote(bookId, pageNumber, newNote);
      setNewNote('');
      loadNotes(); // Refresh
    } catch (err) {
      console.error('Failed to save note', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.deleteNote(id);
      loadNotes(); // Refresh
    } catch (err) {
      console.error('Failed to delete note', err);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-serif text-[var(--foreground)] font-bold flex items-center gap-2">
          📝 Notes
        </h3>
        <p className="text-xs text-[var(--muted)] mt-1">Jot down your thoughts while reading</p>
      </div>

      {/* New Note Form */}
      <div className="mb-6 bg-[#1C1917] p-4 rounded-xl border border-[var(--border)] shadow-sm">
        <p className="text-xs text-[var(--primary)] font-bold mb-2 uppercase tracking-wide">
          Page {pageNumber}
        </p>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="What are you thinking?"
          className="w-full bg-[#0C0A09] border border-[var(--border)] rounded-lg p-3 text-sm text-[var(--foreground)] min-h-[100px] focus:outline-none focus:border-[var(--primary)] transition-colors mb-3"
        />
        <div className="flex justify-between items-center">
          {selectedText ? (
            <button
              onClick={() => setNewNote(prev => prev ? `${prev}\n\n"${selectedText}"` : `"${selectedText}"`)}
              className="text-xs text-[var(--accent)] hover:underline font-medium"
            >
              + Quote Selection
            </button>
          ) : <div />}
          <button
            onClick={handleSave}
            disabled={!newNote.trim()}
            className="px-4 py-2 bg-[var(--primary)] text-[#0C0A09] rounded-lg font-medium text-sm hover:opacity-90 disabled:opacity-50"
          >
            Save Note
          </button>
        </div>
      </div>

      {/* Notes List */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-[#1C1917] rounded-xl border border-[var(--border)]"></div>
            <div className="h-24 bg-[#1C1917] rounded-xl border border-[var(--border)]"></div>
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center text-[var(--muted)] py-8 text-sm">
            No notes yet. Start writing!
          </div>
        ) : (
          notes.map(note => (
            <div key={note.id} className="bg-[#1C1917] p-4 rounded-xl border border-[var(--border)] relative group">
              <button 
                onClick={() => handleDelete(note.id)}
                className="absolute top-3 right-3 text-[var(--muted)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete note"
              >
                ✕
              </button>
              <div className="text-xs font-bold text-[var(--primary)] mb-2">Page {note.page_number}</div>
              <p className="text-sm text-[var(--foreground)] whitespace-pre-wrap">{note.content}</p>
              <div className="text-[10px] text-[var(--muted)] mt-3">
                {new Date(note.created_at).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
