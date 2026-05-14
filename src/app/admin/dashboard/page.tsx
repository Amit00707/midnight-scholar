'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api/client';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Users, BookOpen, Activity, Shield, BarChart3 } from 'lucide-react';

export default function AdminDashboard() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => apiFetch<any>('/admin/stats'),
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  const { data: usersData } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => apiFetch<any>('/admin/users'),
    enabled: isAuthenticated && user?.role === 'admin',
    retry: false,
  });

  if (authLoading) {
    return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-[var(--muted)] animate-pulse">Loading...</div>;
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-32 text-center">
        <Shield size={48} className="mx-auto text-red-500/30 mb-4" />
        <h1 className="text-3xl font-serif text-[var(--foreground)] mb-4">Access Denied</h1>
        <p className="text-[var(--muted)] mb-8">Admin clearance required to access this area.</p>
        <Link href="/dashboard" className="text-amber-500 hover:underline">← Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-red-900/30">
        <div>
          <span className="text-xs text-red-500 font-bold uppercase tracking-wider block mb-1">Root Clearance</span>
          <h1 className="text-3xl font-serif text-[var(--foreground)]">System Administration</h1>
        </div>
        <Link href="/admin/monitoring" className="text-sm text-amber-500 hover:underline font-bold">
          Live Monitoring →
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Users', value: stats?.total_users ?? '—', icon: <Users size={20} />, color: 'text-blue-400' },
          { label: 'Total Books', value: stats?.total_books ?? '—', icon: <BookOpen size={20} />, color: 'text-amber-400' },
          { label: 'API Latency', value: stats ? `${stats.api_latency_ms}ms` : '—', icon: <Activity size={20} />, color: 'text-green-400' },
          { label: 'System Status', value: stats?.system_status ?? '—', icon: <Shield size={20} />, color: 'text-violet-400' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#1C1917] border border-[var(--border)] rounded-xl p-6">
            <div className={`mb-3 ${stat.color}`}>{stat.icon}</div>
            <p className={`text-2xl font-bold font-mono ${stat.color}`}>{isLoading ? '...' : stat.value}</p>
            <p className="text-xs text-[var(--muted)] uppercase tracking-wider mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Growth Chart (mock) */}
        <div className="bg-[#1C1917] border border-[var(--border)] rounded-xl p-6 md:col-span-2">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-amber-500" /> User Registrations (Last 7 Days)
          </h2>
          <div className="h-32 w-full flex items-end gap-2 border-b border-[var(--border)] pb-2">
            {[30, 45, 60, 50, 80, 95, 120].map((h, i) => (
              <div key={i} className="flex-1 bg-amber-600/40 rounded-t-sm hover:bg-amber-600 transition-colors cursor-pointer" style={{ height: `${h}%` }} title={`Day ${i + 1}`} />
            ))}
          </div>
          <div className="flex justify-between text-xs text-[var(--muted)] mt-2">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-[#1C1917] border border-[var(--border)] rounded-xl p-6">
          <h2 className="text-lg font-bold text-[var(--foreground)] mb-4">Recent Users</h2>
          <div className="space-y-3">
            {usersData?.users?.slice(0, 6).map((u: any) => (
              <div key={u.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-amber-900/20 flex items-center justify-center text-xs font-bold text-amber-500 border border-amber-900/30">
                  {u.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--foreground)] truncate">{u.name}</p>
                  <p className="text-xs text-[var(--muted)] truncate">{u.email}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  u.role === 'admin' ? 'bg-red-900/30 text-red-400' :
                  u.role === 'teacher' ? 'bg-amber-900/30 text-amber-400' :
                  'bg-stone-800 text-stone-400'
                }`}>
                  {u.role}
                </span>
              </div>
            )) || (
              <p className="text-sm text-[var(--muted)]">No users found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
