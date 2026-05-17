/**
 * Midnight Scholar — API Client
 * ================================
 * Centralized HTTP client with JWT token management.
 * All frontend pages use this to talk to the FastAPI backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export function getWsUrl(endpoint: string): string {
  const base = API_BASE.replace('http', 'ws');
  return `${base}${endpoint}`;
}


// ─── Token Helpers ───────────────────────────────────────────
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ms_access_token');
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('ms_refresh_token');
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem('ms_access_token', access);
  localStorage.setItem('ms_refresh_token', refresh);
}

export function clearTokens() {
  localStorage.removeItem('ms_access_token');
  localStorage.removeItem('ms_refresh_token');
  localStorage.removeItem('ms_user');
}

// ─── Core Fetch Wrapper ──────────────────────────────────────
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expired — try refresh
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      headers['Authorization'] = `Bearer ${getToken()}`;
      const retryResponse = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
      if (!retryResponse.ok) throw new Error(`API Error: ${retryResponse.statusText}`);
      return retryResponse.json();
    }
    // Refresh failed — force logout
    clearTokens();
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let errorMessage = `API Error: ${response.statusText}`;
    
    if (errorData.detail) {
      if (typeof errorData.detail === 'string') {
        errorMessage = errorData.detail;
      } else if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
        // Handle FastAPI validation errors: detail is an array of objects
        errorMessage = errorData.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
      } else {
        errorMessage = JSON.stringify(errorData.detail);
      }
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

// ─── Token Refresh ───────────────────────────────────────────
async function tryRefreshToken(): Promise<boolean> {
  const refresh = getRefreshToken();
  if (!refresh) return false;

  try {
    const res = await fetch(`${API_BASE}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

// ─── Typed API Methods ───────────────────────────────────────

// Auth
export const api = {
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signup: (name: string, email: string, password: string, role: string = 'student') =>
    apiFetch<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),

  // Books
  getBooks: () => apiFetch<Book[]>('/books/library'),
  getBook: (id: string | number) => apiFetch<any>(`/books/${id}`),
  searchBooks: (query: string) => apiFetch<any>(`/books/search?q=${encodeURIComponent(query)}`),
  getTrending: (limit: number = 12) => apiFetch<any>(`/books/trending?limit=${limit}`),
  getClassics: (search: string = "", limit: number = 12) => 
    apiFetch<any>(`/books/classics?search=${encodeURIComponent(search)}&limit=${limit}`),
  getRecommendations: (interests: string[], limitPerCategory: number = 4) => 
    apiFetch<any>('/books/recommendations', { 
      method: 'POST', 
      body: JSON.stringify({ interests, limit_per_category: limitPerCategory }) 
    }),
  getBooksByCategory: (category: string, limit: number = 12) => 
    apiFetch<any>(`/books/category/${category}?limit=${limit}`),

  // Reading Progress (reader endpoints)
  getProgress: () => apiFetch<ReadingProgress[]>('/reader/progress'),
  getBookProgress: (bookId: string) => apiFetch<ReadingProgress | null>(`/reader/progress/${bookId}`),
  getWeakTopics: () => apiFetch<any>('/analytics/weak-topics'),
  getReadingHabits: () => apiFetch<any>('/analytics/reading-habits'),
  updateProgress: (bookId: string | number, page: number) =>
    apiFetch('/reader/progress', {
      method: 'PATCH',
      body: JSON.stringify({ book_id: String(bookId), current_page: page }),
    }),

  // Notes and Bookmarks (reader endpoints)
  getBookmarks: (bookId: string | number) => apiFetch<{ bookmarks: any[] }>(`/reader/bookmarks/${bookId}`),
  addBookmark: (bookId: string | number, page: number, label: string = '') =>
    apiFetch('/reader/bookmarks', { method: 'POST', body: JSON.stringify({ book_id: String(bookId), page_number: page, label }) }),
  deleteBookmark: (bookmarkId: number) =>
    apiFetch(`/reader/bookmarks/${bookmarkId}`, { method: 'DELETE' }),

  getNotes: (bookId: string | number) => apiFetch<{ notes: any[] }>(`/reader/notes/${bookId}`),
  addNote: (bookId: string | number, page: number, content: string) =>
    apiFetch('/reader/notes', { method: 'POST', body: JSON.stringify({ book_id: String(bookId), page_number: page, content }) }),
  deleteNote: (noteId: number) =>
    apiFetch(`/reader/notes/${noteId}`, { method: 'DELETE' }),

  // Gamification
  getLeaderboard: () => apiFetch('/gamification/leaderboard'),
  getStreak: () => apiFetch<{ current_streak: number; longest_streak: number }>('/gamification/streak'),
  getBadges: () => apiFetch('/gamification/badges'),
  getPoints: () => apiFetch<{ total_points: number }>('/gamification/points'),

  // Social
  getSocialFeed: () => apiFetch('/feed'),
  getComments: (bookId: number) => apiFetch(`/comments/${bookId}`),
  createPost: (content: string) =>
    apiFetch('/posts', {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  // AI Reader Tools
  getSummary: (bookId: string | number, pageNumber: number) =>
    apiFetch<any>('/summary', {
      method: 'POST',
      body: JSON.stringify({ book_id: String(bookId), page_number: pageNumber }),
    }),
  getFlashcards: (bookId: string | number, pageNumber: number) =>
    apiFetch<any>('/flashcards', {
      method: 'POST',
      body: JSON.stringify({ book_id: String(bookId), page_number: pageNumber }),
    }),
  getQuiz: (bookId: string | number, pageNumber: number) =>
    apiFetch<any>('/quiz', {
      method: 'POST',
      body: JSON.stringify({ book_id: String(bookId), page_number: pageNumber }),
    }),
  askDoubt: (bookId: string | number, pageNumber: number, question: string) =>
    apiFetch<any>('/ask', {
      method: 'POST',
      body: JSON.stringify({ book_id: String(bookId), page_number: pageNumber, question }),
    }),
  getKeywords: (bookId: string | number, pageNumber: number) =>
    apiFetch<any>('/keywords', {
      method: 'POST',
      body: JSON.stringify({ book_id: String(bookId), page_number: pageNumber }),
    }),
  libraryChat: (query: string) =>
    apiFetch<any>('/library-chat', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),

  // Teacher
  getClasses: () => apiFetch<{ classes: any[] }>('/classes'),
  createClass: (name: string, description?: string) => 
    apiFetch('/classes', { method: 'POST', body: JSON.stringify({ name, description }) }),
  enrollStudent: (classId: number, studentId: number) => 
    apiFetch(`/classes/${classId}/enroll?student_id=${studentId}`, { method: 'POST' }),
  createAssignment: (classId: number, bookId: string, title: string, description?: string, dueDate?: string) => 
    apiFetch(`/classes/${classId}/assign`, { method: 'POST', body: JSON.stringify({ book_id: bookId, title, description, due_date: dueDate }) }),
  sendAnnouncement: (classId: number, title: string, content: string) => 
    apiFetch(`/classes/${classId}/announce`, { method: 'POST', body: JSON.stringify({ title, content }) }),
  getQuizResults: () => apiFetch<{ results: any[] }>('/quiz-results'),

  // Subscription
  getPlans: () => apiFetch<{ plans: any[] }>('/plans'),

  // ─── Flashcards (SM-2 Spaced Repetition) ───────────────────
  generateFlashcards: (bookId: string | number, pageNumber: number, context?: string) =>
    apiFetch<any>('/flashcards/generate', {
      method: 'POST',
      body: JSON.stringify({ book_id: String(bookId), page_number: pageNumber, context: context || undefined }),
    }),

  getDueFlashcards: (bookId?: string, limit: number = 50) =>
    apiFetch<any>(`/flashcards/due?${bookId ? `book_id=${bookId}&` : ''}limit=${limit}`),

  getFlashcardDeck: (bookId?: string, page: number = 1, perPage: number = 50) =>
    apiFetch<any>(`/flashcards/deck?${bookId ? `book_id=${bookId}&` : ''}page=${page}&per_page=${perPage}`),

  reviewFlashcard: (cardId: number, rating: number, timeSpentMs?: number) =>
    apiFetch<any>(`/flashcards/${cardId}/review`, {
      method: 'POST',
      body: JSON.stringify({ rating, time_spent_ms: timeSpentMs }),
    }),

  createManualFlashcard: (bookId: string, front: string, back: string, sourcePage?: number, tags?: string) =>
    apiFetch<any>('/flashcards/manual', {
      method: 'POST',
      body: JSON.stringify({ book_id: bookId, front, back, source_page: sourcePage, tags }),
    }),

  updateFlashcard: (cardId: number, updates: { front?: string; back?: string; tags?: string; is_suspended?: boolean }) =>
    apiFetch<any>(`/flashcards/${cardId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  deleteFlashcard: (cardId: number) =>
    apiFetch<any>(`/flashcards/${cardId}`, { method: 'DELETE' }),

  toggleSuspendFlashcard: (cardId: number) =>
    apiFetch<any>(`/flashcards/${cardId}/suspend`, { method: 'POST' }),

  getFlashcardStats: () =>
    apiFetch<any>('/flashcards/stats'),

  // Admin
  getMonitoring: () => apiFetch<any>('/admin/monitoring'),

  // User
  getMe: () => apiFetch<AuthResponse>('/me'),
};

// ─── Types ───────────────────────────────────────────────────
export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  role: string;
  user_id: number;
  name: string;
}

export interface Book {
  id: string | number;
  title: string;
  author: string;
  category?: string;
  cover_url?: string;
  total_pages?: number;
  description?: string;
  progress?: {
    current_page: number;
    total_pages: number;
    percentage: number;
  };
  ia_id?: string;
  pdf_url?: string;
  epub_url?: string;
}

export interface ReadingProgress {
  id: number;
  book_id: number;
  current_page: number;
  total_pages: number;
  book_title?: string;
  book_author?: string;
}
