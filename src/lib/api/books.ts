// ============================================================
// src/lib/api/books.ts
// Midnight Scholar — Books API Client (Next.js Frontend)
// Connects Next.js → FastAPI → Open Library
// ============================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// ============================================================
// TYPESCRIPT INTERFACES
// Match exactly with backend BookResponse schema
// ============================================================

export interface Book {
  id:             string | null
  ol_key:         string | null
  title:          string
  author:         string
  authors:        string[]
  cover_url:      string
  cover_id:       number | null
  isbn:           string | null
  category:       string
  subjects:       string[]
  language:       string
  page_count:     number
  difficulty:     "Beginner" | "Intermediate" | "Advanced" | "Unknown"
  reading_hours:  number
  published_year: number
  rating:         number
  rating_count:   number
  edition_count:  number
  has_ebook:      boolean
  preview_url:    string | null
  // Recommendation extra field
  recommended_because?: string
}

export interface BookDetail extends Book {
  description:    string
  cover_url_md:   string | null
  author_keys:    string[]
  created:        string | null
  last_modified:  string | null
}

export interface BookListResponse {
  results:      Book[]
  total:        number
  page:         number
  limit:        number
  query?:       string
  total_pages?: number
}

export interface CategoryResponse {
  category: string
  results:  Book[]
  total:    number
}

export interface RecommendationResponse {
  results:   Book[]
  total:     number
  interests: string[]
}

// ============================================================
// HELPER — Get Auth Header
// Reads JWT token from localStorage (set on login)
// ============================================================
function getAuthHeaders(): HeadersInit {
  if (typeof window === "undefined") return { "Content-Type": "application/json" };
  const token = localStorage.getItem("access_token")
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// ============================================================
// 1. SEARCH BOOKS
// Used by: Smart Search page (src/app/(main)/search/page.tsx)
//          Navbar search bar (src/components/layout/Navbar.tsx)
// ============================================================
export async function searchBooks(
  query:  string,
  limit:  number = 10,
  page:   number = 1,
  lang:   string = "eng"
): Promise<BookListResponse> {
  const params = new URLSearchParams({
    q:     query,
    limit: String(limit),
    page:  String(page),
    lang,
  })

  const res = await fetch(`${API_BASE}/books/search?${params}`, {
    headers: getAuthHeaders(),
  })

  if (!res.ok) throw new Error(`Search failed: ${res.statusText}`)
  return res.json()
}

// ============================================================
// 2. GET BOOKS BY CATEGORY
// Used by: Dashboard rows (src/components/dashboard/)
//          Book listing filter (src/app/(main)/books/page.tsx)
// ============================================================
export async function getBooksByCategory(
  category: string,
  limit:    number = 12,
  sort:     "rating" | "new" | "editions" = "rating"
): Promise<CategoryResponse> {
  const params = new URLSearchParams({
    limit: String(limit),
    sort,
  })

  const res = await fetch(
    `${API_BASE}/books/category/${encodeURIComponent(category)}?${params}`,
    { headers: getAuthHeaders() }
  )

  if (!res.ok) throw new Error(`Category fetch failed: ${res.statusText}`)
  return res.json()
}

// ============================================================
// 3. GET TRENDING BOOKS
// Used by: Dashboard Popular row, Landing page
//          (src/components/dashboard/PopularBooksRow.tsx)
// ============================================================
export async function getTrendingBooks(limit: number = 12): Promise<{ results: Book[]; total: number }> {
  const res = await fetch(`${API_BASE}/books/trending?limit=${limit}`, {
    headers: getAuthHeaders(),
  })

  if (!res.ok) throw new Error(`Trending fetch failed: ${res.statusText}`)
  return res.json()
}

// ============================================================
// 4. GET BOOKS BY AUTHOR
// Used by: Author Profile page
//          (src/app/(main)/author/[id]/page.tsx)
// ============================================================
export async function getBooksByAuthor(
  authorName: string,
  limit:      number = 12
): Promise<{ author: string; results: Book[]; total: number }> {
  const params = new URLSearchParams({
    name:  authorName,
    limit: String(limit),
  })

  const res = await fetch(`${API_BASE}/books/by-author?${params}`, {
    headers: getAuthHeaders(),
  })

  if (!res.ok) throw new Error(`Author fetch failed: ${res.statusText}`)
  return res.json()
}

// ============================================================
// 5. GET PERSONALIZED RECOMMENDATIONS
// Used by: Onboarding Step 3, Dashboard AI Recommended row
//          (src/app/(onboarding)/onboarding/first-book/page.tsx)
//          (src/components/dashboard/AIRecommendedRow.tsx)
// Requires: User must be logged in (sends JWT token)
// ============================================================
export async function getPersonalizedRecommendations(
  interests:          string[],
  limitPerCategory:   number = 4
): Promise<RecommendationResponse> {
  const res = await fetch(`${API_BASE}/books/recommendations`, {
    method:  "POST",
    headers: getAuthHeaders(),
    body:    JSON.stringify({
      interests,
      limit_per_category: limitPerCategory,
    }),
  })

  if (!res.ok) throw new Error(`Recommendations failed: ${res.statusText}`)
  return res.json()
}

// ============================================================
// 6. GET SINGLE BOOK DETAIL
// Used by: Book Details page
//          (src/app/(main)/books/[id]/page.tsx)
// ============================================================
export async function getBookById(olId: string): Promise<BookDetail> {
  const res = await fetch(`${API_BASE}/books/${olId}`, {
    headers: getAuthHeaders(),
  })

  if (res.status === 404) throw new Error("Book not found")
  if (!res.ok) throw new Error(`Book detail fetch failed: ${res.statusText}`)
  return res.json()
}

// ============================================================
// REACT QUERY KEYS
// Use these in useQuery() calls for consistent caching
// ============================================================
export const bookKeys = {
  all:             ["books"]                                    as const,
  search:          (q: string)        => ["books", "search", q] as const,
  category:        (cat: string)      => ["books", "category", cat] as const,
  trending:        ()                 => ["books", "trending"]  as const,
  author:          (name: string)     => ["books", "author", name] as const,
  recommendations: (interests: string[]) => ["books", "recommendations", interests] as const,
  detail:          (id: string)       => ["books", "detail", id] as const,
}
