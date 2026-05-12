// ============================================================
// src/lib/hooks/useBooks.ts
// Midnight Scholar — React Query Hooks for Books
// Drop these into any component to fetch real book data
// ============================================================

import { useQuery, useMutation } from "@tanstack/react-query"
import {
  searchBooks,
  getBooksByCategory,
  getTrendingBooks,
  getBooksByAuthor,
  getBookById,
  getPersonalizedRecommendations,
  bookKeys,
} from "@/lib/api/books"

// ============================================================
// 1. useBookSearch
// Component: src/app/(main)/search/page.tsx
// Component: src/components/layout/Navbar.tsx
// ============================================================
export function useBookSearch(
  query:   string,
  limit:   number = 10,
  page:    number = 1,
  enabled: boolean = true
) {
  return useQuery({
    queryKey:   bookKeys.search(query),
    queryFn:    () => searchBooks(query, limit, page),
    enabled:    enabled && query.length > 0,
    staleTime:  1000 * 60 * 5,   // Cache 5 minutes
    retry:      2,
  })
}

// ============================================================
// 2. useCategoryBooks
// Component: src/components/dashboard/ContinueReadingRow.tsx
// Component: src/app/(main)/books/page.tsx (filter)
// ============================================================
export function useCategoryBooks(
  category: string,
  limit:    number = 12,
  enabled:  boolean = true
) {
  return useQuery({
    queryKey:   bookKeys.category(category),
    queryFn:    () => getBooksByCategory(category, limit),
    enabled:    enabled && category.length > 0,
    staleTime:  1000 * 60 * 10,  // Cache 10 minutes
    retry:      2,
  })
}

// ============================================================
// 3. useTrendingBooks
// Component: src/components/dashboard/PopularBooksRow.tsx
// Component: src/app/landing/page.tsx
// ============================================================
export function useTrendingBooks(limit: number = 12) {
  return useQuery({
    queryKey:   bookKeys.trending(),
    queryFn:    () => getTrendingBooks(limit),
    staleTime:  1000 * 60 * 30,  // Cache 30 minutes (trending doesn't change fast)
    retry:      2,
  })
}

// ============================================================
// 4. useAuthorBooks
// Component: src/app/(main)/author/[id]/page.tsx
// ============================================================
export function useAuthorBooks(authorName: string, limit: number = 12) {
  return useQuery({
    queryKey:   bookKeys.author(authorName),
    queryFn:    () => getBooksByAuthor(authorName, limit),
    enabled:    authorName.length > 0,
    staleTime:  1000 * 60 * 15,  // Cache 15 minutes
    retry:      2,
  })
}

// ============================================================
// 5. useBookDetail
// Component: src/app/(main)/books/[id]/page.tsx
// ============================================================
export function useBookDetail(olId: string) {
  return useQuery({
    queryKey:   bookKeys.detail(olId),
    queryFn:    () => getBookById(olId),
    enabled:    olId.length > 0,
    staleTime:  1000 * 60 * 30,  // Cache 30 minutes
    retry:      1,
  })
}

// ============================================================
// 6. useRecommendations
// Component: src/app/(onboarding)/onboarding/first-book/page.tsx
// Component: src/components/dashboard/AIRecommendedRow.tsx
// ============================================================
export function useRecommendations(
  interests: string[],
  enabled:   boolean = true
) {
  return useQuery({
    queryKey:   bookKeys.recommendations(interests),
    queryFn:    () => getPersonalizedRecommendations(interests),
    enabled:    enabled && interests.length > 0,
    staleTime:  1000 * 60 * 10,
    retry:      2,
  })
}
