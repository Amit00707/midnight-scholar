'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/lib/auth-context';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';

interface UserPreferences {
  aggressiveFlashcards: boolean;
  focusBlackoutLevel: string;
  dailyReminder: boolean;
  showStreakNotif: boolean;
  theme: string;
  timeCommitment: number; // minutes per day
  timeCommitmentEnabled: boolean;
}

const DEFAULT_PREFS: UserPreferences = {
  aggressiveFlashcards: true,
  focusBlackoutLevel: '80',
  dailyReminder: true,
  showStreakNotif: true,
  theme: 'midnight',
  timeCommitment: 60,
  timeCommitmentEnabled: false,
};

export default function SettingsPage() {
  const { user, isAuthenticated, logout } = useAuth();
  const [prefs, setPrefs] = useState<UserPreferences>(DEFAULT_PREFS);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load saved preferences
  useEffect(() => {
    const stored = localStorage.getItem('ms_preferences');
    if (stored) {
      try { setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(stored) }); } catch {}
    }
  }, []);

  function updatePref<K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    localStorage.setItem('ms_preferences', JSON.stringify(updated));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-serif text-[var(--foreground)] font-bold">Settings</h1>
          <p className="text-[var(--muted)] text-sm mt-1">Configure your Midnight Scholar experience.</p>
        </div>

        {/* Save Toast */}
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="px-4 py-2 bg-green-900/30 border border-green-600/40 text-green-400 text-sm rounded-lg"
            >
              ✓ Saved
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <div className="space-y-8">
        
        {/* Reading Engine */}
        <section className="bg-[#1C1917] border border-[var(--border)] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
            <span className="text-lg">📖</span> Reading Engine
          </h2>
          <div className="space-y-5">
            <ToggleRow
              title="Aggressive Flashcard Extraction"
              description="AI will passively pull hard concepts into your spaced repetition deck."
              checked={prefs.aggressiveFlashcards}
              onChange={(val) => updatePref('aggressiveFlashcards', val)}
            />
            
            <div className="flex justify-between items-center pt-4 border-t border-[var(--border)]">
              <div>
                <h3 className="font-medium text-[var(--foreground)]">Focus Mode Blackout Level</h3>
                <p className="text-sm text-[var(--muted)]">Adjust the darkness of the surrounding screen in Focus Mode.</p>
              </div>
              <select
                value={prefs.focusBlackoutLevel}
                onChange={(e) => updatePref('focusBlackoutLevel', e.target.value)}
                className="bg-[#0C0A09] border border-[var(--border)] rounded-md px-3 py-2 text-sm text-[var(--foreground)] focus:border-amber-600 outline-none transition-colors"
              >
                <option value="60">Light (60%)</option>
                <option value="80">Medium (80%)</option>
                <option value="95">Heavy (95%)</option>
                <option value="100">Total Blackout</option>
              </select>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-[#1C1917] border border-[var(--border)] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
            <span className="text-lg">🔔</span> Notifications
          </h2>
          <div className="space-y-5">
            <ToggleRow
              title="Daily Review Reminder"
              description="Get reminded when you have flashcards due for review."
              checked={prefs.dailyReminder}
              onChange={(val) => updatePref('dailyReminder', val)}
            />
            <ToggleRow
              title="Streak Notifications"
              description="Get notified about streak milestones and when your streak is about to break."
              checked={prefs.showStreakNotif}
              onChange={(val) => updatePref('showStreakNotif', val)}
            />
          </div>
        </section>

        {/* Time Commitment */}
        <section className="bg-[#1C1917] border border-[var(--border)] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
            <span className="text-lg">🎯</span> Time Commitment
          </h2>
          <div className="space-y-5">
            <ToggleRow
              title="Daily Reading Goal"
              description="Set a daily time target for your reading sessions."
              checked={prefs.timeCommitmentEnabled}
              onChange={(val) => updatePref('timeCommitmentEnabled', val)}
            />

            {prefs.timeCommitmentEnabled && (
              <div className="pt-4 border-t border-[var(--border)]">
                <div className="mb-4">
                  <h3 className="font-medium text-[var(--foreground)]">Daily Target</h3>
                  <p className="text-sm text-[var(--muted)]">How much time can you commit daily?</p>
                </div>

                {/* Time Slider */}
                <div className="mb-6">
                  <div className="flex justify-between text-sm text-[var(--muted)] mb-2">
                    <span>15 min</span>
                    <span className="text-amber-500 font-bold text-lg">{prefs.timeCommitment} min</span>
                    <span>4 hr</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="240"
                    step="15"
                    value={prefs.timeCommitment}
                    onChange={(e) => updatePref('timeCommitment', parseInt(e.target.value))}
                    className="w-full h-2 bg-[#0C0A09] rounded-lg appearance-none cursor-pointer accent-amber-500"
                  />
                </div>

                {/* Quick Select Buttons */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[30, 60, 90, 120].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => updatePref('timeCommitment', mins)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                        prefs.timeCommitment === mins
                          ? 'bg-amber-600 text-black'
                          : 'bg-[#0C0A09] border border-[var(--border)] text-[var(--foreground)] hover:border-amber-600/50'
                      }`}
                    >
                      {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                    </button>
                  ))}
                </div>

                {/* Custom Time Display */}
                <div className="flex items-center gap-3 p-4 bg-[#0C0A09] rounded-xl border border-[var(--border)]">
                  <Clock size={20} className="text-amber-500" />
                  <div>
                    <p className="text-[var(--foreground)] font-medium">
                      {prefs.timeCommitment >= 60
                        ? `${Math.floor(prefs.timeCommitment / 60)} hr ${prefs.timeCommitment % 60 > 0 ? `${prefs.timeCommitment % 60} min` : ''}`
                        : `${prefs.timeCommitment} minutes`
                      } per day
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      Weekly: {Math.round(prefs.timeCommitment * 7 / 60)}h {prefs.timeCommitment * 7 % 60}m
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Appearance */}
        <section className="bg-[#1C1917] border border-[var(--border)] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
            <span className="text-lg">🎨</span> Appearance
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'midnight', label: 'Midnight', bg: '#0C0A09', accent: '#D97706' },
              { id: 'dark', label: 'Dark', bg: '#1a1a2e', accent: '#7C3AED' },
              { id: 'sepia', label: 'Sepia', bg: '#2d2418', accent: '#B8860B' },
            ].map(theme => (
              <button
                key={theme.id}
                onClick={() => updatePref('theme', theme.id)}
                className={`p-4 rounded-xl border-2 transition-all text-center ${
                  prefs.theme === theme.id
                    ? 'border-amber-600 shadow-[0_0_15px_rgba(217,119,6,0.2)]'
                    : 'border-[var(--border)] hover:border-[var(--muted)]'
                }`}
              >
                <div
                  className="w-full h-8 rounded-md mb-3 mx-auto border border-white/10"
                  style={{ background: `linear-gradient(135deg, ${theme.bg}, ${theme.accent}30)` }}
                />
                <span className="text-sm text-[var(--foreground)] font-medium">{theme.label}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Account */}
        <section className="bg-[#1C1917] border border-[var(--border)] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
            <span className="text-lg">🔐</span> Account
          </h2>
          {isAuthenticated && user && (
            <div className="flex items-center gap-4 mb-6 p-4 bg-[#0C0A09] rounded-xl border border-[var(--border)]">
              <div className="w-12 h-12 rounded-full bg-[var(--primary)] flex items-center justify-center text-[#0C0A09] font-bold text-xl">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-[var(--foreground)] font-medium">{user.name}</p>
                <p className="text-xs text-[var(--muted)] capitalize">{user.role}</p>
              </div>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="secondary" className="w-full sm:w-auto">Change Password</Button>
            <Button
              variant="secondary"
              className="w-full sm:w-auto border-red-900/50 text-red-400 hover:bg-red-900/20"
              onClick={() => setShowDeleteConfirm(true)}
            >
              Delete Account & Data
            </Button>
          </div>
        </section>

        {/* Data Management */}
        <section className="bg-[#1C1917] border border-[var(--border)] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-6 flex items-center gap-2">
            <span className="text-lg">💾</span> Data
          </h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" size="sm" onClick={() => {
              localStorage.removeItem('ms_reading_goal');
              localStorage.removeItem('ms_week_log');
              localStorage.removeItem('ms_preferences');
              window.location.reload();
            }}>
              Reset All Local Data
            </Button>
            <Button variant="ghost" size="sm">Export Reading History</Button>
          </div>
        </section>

      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-[#1C1917] border border-red-900/50 rounded-2xl p-8 w-full max-w-md shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-xl font-serif text-red-400 font-bold mb-4">Delete Account?</h3>
              <p className="text-sm text-[var(--muted)] mb-6 leading-relaxed">
                This will permanently delete your account, reading progress, flashcards, and all associated data. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
                <Button variant="secondary" className="flex-1 border-red-900 text-red-400 hover:bg-red-900/30" onClick={logout}>
                  Delete Forever
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Toggle Row Component ─────────────────────────
function ToggleRow({ title, description, checked, onChange }: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}) {
  return (
    <div className="flex justify-between items-center">
      <div className="mr-4">
        <h3 className="font-medium text-[var(--foreground)]">{title}</h3>
        <p className="text-sm text-[var(--muted)]">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
          checked ? 'bg-amber-600' : 'bg-stone-700'
        }`}
      >
        <div
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}
