/**
 * useFlashcardDeck — React Query hooks for the SM-2 flashcard system.
 * Covers generation, due cards, review, deck management, and stats.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

// ─── Due Cards ──────────────────────────────────────────────
export function useDueFlashcards(bookId?: string) {
  return useQuery({
    queryKey: ['flashcards', 'due', bookId],
    queryFn: () => api.getDueFlashcards(bookId),
    refetchInterval: 1000 * 60 * 5, // Refresh every 5 minutes
  });
}

// ─── Full Deck ──────────────────────────────────────────────
export function useFlashcardDeck(bookId?: string, page: number = 1) {
  return useQuery({
    queryKey: ['flashcards', 'deck', bookId, page],
    queryFn: () => api.getFlashcardDeck(bookId, page),
  });
}

// ─── Stats ──────────────────────────────────────────────────
export function useFlashcardStats() {
  return useQuery({
    queryKey: ['flashcards', 'stats'],
    queryFn: () => api.getFlashcardStats(),
    staleTime: 1000 * 60 * 2,
  });
}

// ─── Generate + Save ────────────────────────────────────────
export function useGenerateFlashcards() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ bookId, pageNumber }: { bookId: string | number; pageNumber: number }) =>
      api.generateFlashcards(bookId, pageNumber),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flashcards'] });
    },
  });
}

// ─── Review a Card ──────────────────────────────────────────
export function useReviewFlashcard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ cardId, rating, timeSpentMs }: { cardId: number; rating: number; timeSpentMs?: number }) =>
      api.reviewFlashcard(cardId, rating, timeSpentMs),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flashcards'] });
    },
  });
}

// ─── Manual Creation ────────────────────────────────────────
export function useCreateFlashcard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { bookId: string; front: string; back: string; sourcePage?: number; tags?: string }) =>
      api.createManualFlashcard(data.bookId, data.front, data.back, data.sourcePage, data.tags),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flashcards'] });
    },
  });
}

// ─── Delete ─────────────────────────────────────────────────
export function useDeleteFlashcard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cardId: number) => api.deleteFlashcard(cardId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flashcards'] });
    },
  });
}

// ─── Suspend Toggle ─────────────────────────────────────────
export function useSuspendFlashcard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (cardId: number) => api.toggleSuspendFlashcard(cardId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['flashcards'] });
    },
  });
}
