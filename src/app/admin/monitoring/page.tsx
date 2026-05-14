'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Users, 
  Server, 
  Cpu, 
  Database, 
  AlertTriangle, 
  ShieldCheck, 
  RefreshCw,
  Globe,
  Zap
} from 'lucide-react';
import { api } from '@/lib/api/client';
import { Button } from '@/components/ui/Button';

interface MonitoringStats {
  cpu_usage: number;
  memory_usage: number;
  active_sessions: number;
  requests_per_minute: number;
  error_rate: number;
  db_connection_status: string;
  redis_status: string;
  openai_status: string;
}

export default function AdminMonitoringPage() {
  const [stats, setStats] = useState<MonitoringStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchStats = async () => {
    try {
      const data = await api.getMonitoring();
      setStats(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to fetch monitoring stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
        <RefreshCw className="animate-spin text-amber-500" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-serif font-bold text-[var(--foreground)] mb-2 flex items-center gap-3">
              <ShieldCheck className="text-amber-500" />
              System Monitoring
            </h1>
            <p className="text-[var(--muted)]">Real-time platform health and infrastructure metrics.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-[var(--muted)] uppercase tracking-wider">Last Sync</p>
              <p className="text-sm font-mono">{lastUpdated.toLocaleTimeString()}</p>
            </div>
            <Button variant="outline" onClick={fetchStats} className="gap-2">
              <RefreshCw size={16} /> Refresh
            </Button>
          </div>
        </div>

        {/* Status Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <StatusCard 
            title="Database" 
            status={stats?.db_connection_status || 'Checking...'} 
            icon={<Database size={20} />} 
            type={stats?.db_connection_status === 'connected' ? 'success' : 'error'}
          />
          <StatusCard 
            title="Redis Cache" 
            status={stats?.redis_status || 'Checking...'} 
            icon={<Zap size={20} />} 
            type={stats?.redis_status === 'connected' ? 'success' : 'warning'}
          />
          <StatusCard 
            title="AI Engine (OpenAI)" 
            status={stats?.openai_status || 'Checking...'} 
            icon={<Server size={20} />} 
            type={stats?.openai_status === 'ready' ? 'success' : 'error'}
          />
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Resource Usage */}
          <section className="bg-[#1C1917] border border-[var(--border)] rounded-3xl p-8 shadow-xl">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
              <Cpu size={20} className="text-amber-500" />
              Resource Allocation
            </h2>
            <div className="space-y-8">
              <UsageBar label="CPU Utilization" value={stats?.cpu_usage || 0} unit="%" color="bg-amber-500" />
              <UsageBar label="Memory Consumption" value={stats?.memory_usage || 0} unit="%" color="bg-blue-500" />
              <div className="pt-4 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-stone-900/50 border border-stone-800">
                  <p className="text-xs text-[var(--muted)] uppercase mb-1">Total Servers</p>
                  <p className="text-2xl font-serif font-bold">4 Nodes</p>
                </div>
                <div className="p-4 rounded-2xl bg-stone-900/50 border border-stone-800">
                  <p className="text-xs text-[var(--muted)] uppercase mb-1">Uptime</p>
                  <p className="text-2xl font-serif font-bold">99.98%</p>
                </div>
              </div>
            </div>
          </section>

          {/* Traffic & Errors */}
          <section className="bg-[#1C1917] border border-[var(--border)] rounded-3xl p-8 shadow-xl">
            <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
              <Activity size={20} className="text-amber-500" />
              Traffic Overview
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2 p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--muted)] mb-1">Requests / Min</p>
                  <p className="text-4xl font-serif font-bold text-amber-500">{stats?.requests_per_minute || 0}</p>
                </div>
                <Globe size={48} className="text-amber-500/20" />
              </div>
              
              <div className="p-6 rounded-3xl bg-stone-900 border border-stone-800">
                <p className="text-sm text-[var(--muted)] mb-1 flex items-center gap-2">
                  <Users size={14} /> Active Sessions
                </p>
                <p className="text-3xl font-serif font-bold">{stats?.active_sessions || 0}</p>
              </div>

              <div className="p-6 rounded-3xl bg-red-500/5 border border-red-500/20">
                <p className="text-sm text-[var(--muted)] mb-1 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-red-500" /> Error Rate
                </p>
                <p className="text-3xl font-serif font-bold text-red-500">{stats?.error_rate || 0}%</p>
              </div>
            </div>
          </section>
        </div>

        {/* Logs Preview */}
        <section className="mt-8 bg-[#1C1917] border border-[var(--border)] rounded-3xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
            <h2 className="font-bold">Recent System Logs</h2>
            <Button variant="ghost" size="sm">View Full Logs</Button>
          </div>
          <div className="divide-y divide-stone-800">
            <LogEntry time="17:04:12" level="INFO" message="OpenAI API response verified (244ms)" />
            <LogEntry time="17:03:55" level="WARN" message="Database connection pool peak reached (18/20)" />
            <LogEntry time="17:02:44" level="INFO" message="New user signup: amit@example.com" />
            <LogEntry time="17:01:30" level="INFO" message="Night mode cache refreshed" />
          </div>
        </section>
      </div>
    </div>
  );
}

function StatusCard({ title, status, icon, type }: { title: string, status: string, icon: React.ReactNode, type: 'success' | 'warning' | 'error' }) {
  const colors = {
    success: 'text-green-500 bg-green-500/10 border-green-500/20',
    warning: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    error: 'text-red-500 bg-red-500/10 border-red-500/20'
  };

  return (
    <div className={`p-5 rounded-2xl border-2 flex items-center justify-between ${colors[type]}`}>
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-xs font-bold uppercase tracking-wider opacity-70">{title}</p>
          <p className="font-serif font-bold capitalize">{status}</p>
        </div>
      </div>
      <div className={`w-3 h-3 rounded-full animate-pulse ${type === 'success' ? 'bg-green-500' : type === 'warning' ? 'bg-amber-500' : 'bg-red-500'}`} />
    </div>
  );
}

function UsageBar({ label, value, unit, color }: { label: string, value: number, unit: string, color: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-[var(--muted)]">{label}</span>
        <span className="text-sm font-bold">{value}{unit}</span>
      </div>
      <div className="h-2 w-full bg-stone-800 rounded-full overflow-hidden">
        <motion.div 
          className={`h-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}

function LogEntry({ time, level, message }: { time: string, level: string, message: string }) {
  return (
    <div className="p-4 flex items-start gap-4 hover:bg-stone-900/50 transition-colors">
      <span className="text-xs font-mono text-[var(--muted)] shrink-0">{time}</span>
      <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
        level === 'INFO' ? 'bg-blue-500/10 text-blue-500' : 'bg-amber-500/10 text-amber-500'
      }`}>{level}</span>
      <span className="text-sm text-stone-300">{message}</span>
    </div>
  );
}
