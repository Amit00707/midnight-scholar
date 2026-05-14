'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

interface ReadingGoal {
  pagesPerDay: number;
  minutesPerDay: number;
}

interface DayLog {
  date: string;
  pagesRead: number;
  minutesRead: number;
  completed: boolean;
}

export default function ReadingPlanPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  // Local state — persists to localStorage
  const [goal, setGoal] = useState<ReadingGoal>({ pagesPerDay: 20, minutesPerDay: 30 });
  const [weekLog, setWeekLog] = useState<DayLog[]>([]);
  const [editingGoal, setEditingGoal] = useState(false);
  const [tempPages, setTempPages] = useState(20);
  const [tempMinutes, setTempMinutes] = useState(30);

  const { data: streakData } = useQuery({
    queryKey: ['streak'],
    queryFn: () => api.getStreak(),
    enabled: isAuthenticated,
  });

  const { data: flashcardStats } = useQuery({
    queryKey: ['flashcardStats'],
    queryFn: () => api.getFlashcardStats(),
    enabled: isAuthenticated,
  });

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ms_reading_goal');
    if (saved) {
      try { setGoal(JSON.parse(saved)); } catch {}
    }
    const savedLog = localStorage.getItem('ms_week_log');
    if (savedLog) {
      try { setWeekLog(JSON.parse(savedLog)); } catch {}
    } else {
      initWeek();
    }
  }, []);

  function initWeek() {
    const days: DayLog[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        date: d.toISOString().split('T')[0],
        pagesRead: 0,
        minutesRead: 0,
        completed: false,
      });
    }
    setWeekLog(days);
    localStorage.setItem('ms_week_log', JSON.stringify(days));
  }

  function saveGoal() {
    const newGoal = { pagesPerDay: tempPages, minutesPerDay: tempMinutes };
    setGoal(newGoal);
    localStorage.setItem('ms_reading_goal', JSON.stringify(newGoal));
    setEditingGoal(false);
  }

  function logToday(pages: number, minutes: number) {
    const today = new Date().toISOString().split('T')[0];
    const updated = weekLog.map(d => {
      if (d.date === today) {
        const newPages = d.pagesRead + pages;
        const newMinutes = d.minutesRead + minutes;
        return {
          ...d,
          pagesRead: newPages,
          minutesRead: newMinutes,
          completed: newPages >= goal.pagesPerDay || newMinutes >= goal.minutesPerDay,
        };
      }
      return d;
    });
    setWeekLog(updated);
    localStorage.setItem('ms_week_log', JSON.stringify(updated));
  }

  const todayLog = weekLog.find(d => d.date === new Date().toISOString().split('T')[0]);
  const completedDays = weekLog.filter(d => d.completed).length;
  const totalPagesWeek = weekLog.reduce((sum, d) => sum + d.pagesRead, 0);

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (authLoading) {
    return <div className="text-center py-20 animate-pulse text-[var(--muted)]">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <div className="text-center py-20 text-[var(--muted)]">Please log in to set your reading plan.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-[var(--foreground)]">Reading Plan</h1>
        <p className="text-[var(--muted)] mt-2">Set daily goals and track your reading consistency.</p>
      </div>

      {/* ─── Daily Goal Card ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="md:col-span-2 bg-[#1C1917] border border-[var(--border)] rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-serif text-[var(--foreground)] font-bold">Today's Progress</h2>
              <p className="text-sm text-[var(--muted)] mt-1">
                {todayLog?.completed
                  ? '🎉 Goal completed! Great work!'
                  : `${todayLog?.pagesRead || 0} / ${goal.pagesPerDay} pages`}
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setEditingGoal(true); setTempPages(goal.pagesPerDay); setTempMinutes(goal.minutesPerDay); }}>
              Edit Goal
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#0C0A09] rounded-full h-4 mb-6 border border-[var(--border)]">
            <motion.div
              className="h-4 rounded-full bg-gradient-to-r from-amber-600 to-amber-400"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, ((todayLog?.pagesRead || 0) / goal.pagesPerDay) * 100)}%` }}
              transition={{ duration: 0.8 }}
              style={{ boxShadow: '0 0 12px rgba(217,119,6,0.5)' }}
            />
          </div>

          {/* Quick Log Buttons */}
          <div className="flex flex-wrap gap-3">
            {[5, 10, 20].map(n => (
              <Button key={n} variant="secondary" size="sm" onClick={() => logToday(n, n * 2)}>
                +{n} pages
              </Button>
            ))}
            <Button variant="primary" size="sm" onClick={() => logToday(goal.pagesPerDay - (todayLog?.pagesRead || 0), goal.minutesPerDay)}>
              Mark Complete ✓
            </Button>
          </div>
        </div>

        {/* Streak & Stats */}
        <div className="space-y-4">
          <div className="bg-[#1C1917] border border-[var(--border)] rounded-2xl p-5 text-center">
            <span className="text-3xl block mb-1">🔥</span>
            <p className="text-2xl font-mono font-bold text-[var(--foreground)]">{streakData?.current_streak || 0}</p>
            <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Day Streak</p>
          </div>
          <div className="bg-[#1C1917] border border-[var(--border)] rounded-2xl p-5 text-center">
            <span className="text-3xl block mb-1">📄</span>
            <p className="text-2xl font-mono font-bold text-[var(--foreground)]">{totalPagesWeek}</p>
            <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Pages This Week</p>
          </div>
          <div className="bg-[#1C1917] border border-[var(--border)] rounded-2xl p-5 text-center">
            <span className="text-3xl block mb-1">🧠</span>
            <p className="text-2xl font-mono font-bold text-blue-400">{flashcardStats?.due_today || 0}</p>
            <p className="text-[10px] text-[var(--muted)] uppercase tracking-wider">Cards Due Today</p>
          </div>
        </div>
      </div>

      {/* ─── Week Overview ─── */}
      <div className="bg-[#1C1917] border border-[var(--border)] rounded-2xl p-6 shadow-xl mb-10">
        <h3 className="text-lg font-serif text-[var(--foreground)] font-bold mb-6">This Week</h3>
        <div className="grid grid-cols-7 gap-3">
          {weekLog.map((day) => {
            const d = new Date(day.date + 'T12:00:00');
            const dayName = dayNames[d.getDay()];
            const isToday = day.date === new Date().toISOString().split('T')[0];
            const progress = goal.pagesPerDay > 0 ? Math.min(100, (day.pagesRead / goal.pagesPerDay) * 100) : 0;

            return (
              <div
                key={day.date}
                className={`flex flex-col items-center p-3 rounded-xl border transition-colors ${
                  isToday
                    ? 'border-amber-600/50 bg-amber-900/10'
                    : day.completed
                      ? 'border-green-600/30 bg-green-900/10'
                      : 'border-[var(--border)] bg-[#0C0A09]'
                }`}
              >
                <span className={`text-[10px] uppercase font-bold tracking-wider mb-2 ${isToday ? 'text-amber-400' : 'text-[var(--muted)]'}`}>
                  {dayName}
                </span>
                <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center mb-2" style={{
                  borderColor: day.completed ? '#22c55e' : progress > 0 ? '#d97706' : '#44403c',
                }}>
                  {day.completed ? (
                    <span className="text-green-400 text-lg">✓</span>
                  ) : (
                    <span className="text-xs font-mono text-[var(--muted)]">{Math.round(progress)}%</span>
                  )}
                </div>
                <span className="text-[10px] text-[var(--muted)]">{day.pagesRead}p</span>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-4">
          <p className="text-sm text-[var(--muted)]">
            {completedDays}/7 days completed this week
          </p>
          <Button variant="ghost" size="sm" onClick={initWeek}>Reset Week</Button>
        </div>
      </div>

      {/* ─── Edit Goal Modal ─── */}
      {editingGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setEditingGoal(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1C1917] border border-[var(--border)] rounded-2xl p-8 w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-xl font-serif text-[var(--foreground)] font-bold mb-6">Set Daily Goal</h3>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="text-sm text-[var(--muted)] block mb-2">Pages per day</label>
                <input
                  type="range"
                  min={5}
                  max={100}
                  step={5}
                  value={tempPages}
                  onChange={e => setTempPages(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
                <p className="text-center text-2xl font-mono font-bold text-[var(--foreground)] mt-2">{tempPages} pages</p>
              </div>
              <div>
                <label className="text-sm text-[var(--muted)] block mb-2">Minutes per day</label>
                <input
                  type="range"
                  min={10}
                  max={180}
                  step={5}
                  value={tempMinutes}
                  onChange={e => setTempMinutes(Number(e.target.value))}
                  className="w-full accent-amber-600"
                />
                <p className="text-center text-2xl font-mono font-bold text-[var(--foreground)] mt-2">{tempMinutes} min</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setEditingGoal(false)}>Cancel</Button>
              <Button variant="primary" className="flex-1" onClick={saveGoal}>Save Goal</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
