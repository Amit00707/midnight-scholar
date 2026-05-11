/**
 * Midnight Scholar — API Client
 * ================================
 * Centralized HTTP client with JWT token management.
 * All frontend pages use this to talk to the FastAPI backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

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
    apiFetch<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signup: (name: string, email: string, password: string, role: string = 'student') =>
    apiFetch<AuthResponse>('/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    }),

  // Books
  getBooks: () => apiFetch<Book[]>('/books'),
  getBook: (id: number) => apiFetch<Book>(`/books/${id}`),
  searchBooks: (query: string) => apiFetch<Book[]>(`/search?q=${encodeURIComponent(query)}`),

  // Reading Progress
  getProgress: () => apiFetch<ReadingProgress[]>('/progress'),
  updateProgress: (bookId: number, page: number) =>
    apiFetch('/progress', {
      method: 'PATCH',
      body: JSON.stringify({ book_id: bookId, current_page: page }),
    }),

  // Gamification
  getLeaderboard: () => apiFetch('/leaderboard'),
  getStreak: () => apiFetch('/streak'),
  getBadges: () => apiFetch('/badges'),

  // Social
  getComments: (bookId: number) => apiFetch(`/comments/${bookId}`),

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
  id: number;
  title: string;
  author: string;
  category?: string;
  cover_url?: string;
  total_pages?: number;
  description?: string;
}

export interface ReadingProgress {
  id: number;
  book_id: number;
  current_page: number;
  total_pages: number;
  book_title?: string;
  book_author?: string;
}
