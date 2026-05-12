import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

export function useSummary(bookId: string | number, pageNumber: number) {
  return useQuery({
    queryKey: ['ai', 'summary', bookId, pageNumber],
    queryFn: () => api.getSummary(bookId, pageNumber),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

export function useFlashcards(bookId: string | number, pageNumber: number) {
  return useQuery({
    queryKey: ['ai', 'flashcards', bookId, pageNumber],
    queryFn: () => api.getFlashcards(bookId, pageNumber),
    staleTime: 1000 * 60 * 5,
  });
}

export function useQuiz(bookId: string | number, pageNumber: number) {
  return useQuery({
    queryKey: ['ai', 'quiz', bookId, pageNumber],
    queryFn: () => api.getQuiz(bookId, pageNumber),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAskDoubt() {
  return useMutation({
    mutationFn: ({ bookId, pageNumber, question }: { bookId: string | number; pageNumber: number; question: string }) =>
      api.askDoubt(bookId, pageNumber, question),
  });
}
