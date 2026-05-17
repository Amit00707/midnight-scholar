import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api, ReadingProgress } from "@/lib/api/client"

export const readerKeys = {
  all: ['reader'] as const,
  progress: (bookId: string) => [...readerKeys.all, 'progress', bookId] as const,
  bookmarks: (bookId: string) => [...readerKeys.all, 'bookmarks', bookId] as const,
  notes: (bookId: string) => [...readerKeys.all, 'notes', bookId] as const,
}

export function useBookProgress(bookId: string) {
  return useQuery({
    queryKey: readerKeys.progress(bookId),
    queryFn: () => api.getBookProgress(bookId),
    enabled: !!bookId,
  })
}

export function useUpdateProgress() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ bookId, page }: { bookId: string; page: number }) => 
      api.updateProgress(bookId, page),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: readerKeys.progress(variables.bookId) })
    }
  })
}

export function useBookmarks(bookId: string) {
  return useQuery({
    queryKey: readerKeys.bookmarks(bookId),
    queryFn: () => api.getBookmarks(bookId),
    enabled: !!bookId,
  })
}

export function useNotes(bookId: string) {
  return useQuery({
    queryKey: readerKeys.notes(bookId),
    queryFn: () => api.getNotes(bookId),
    enabled: !!bookId,
  })
}
