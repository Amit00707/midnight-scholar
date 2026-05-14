'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import Link from 'next/link';
import { BookOpen, Users, Plus, ChevronRight, BarChart3, GraduationCap, Clock, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TeacherDashboardPage() {
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newClassDesc, setNewClassDesc] = useState('');

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const res = await api.getClasses();
      setClasses(res.classes || []);
    } catch (error) {
      console.error('Failed to load classes', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName) return;
    
    try {
      await api.createClass(newClassName, newClassDesc);
      setNewClassName('');
      setNewClassDesc('');
      setShowCreateModal(false);
      loadClasses();
    } catch (error) {
      console.error('Failed to create class', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-2 text-amber-600 mb-2">
            <LayoutDashboard size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Faculty Command Center</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif text-[var(--foreground)] font-bold">Academic Oversight</h1>
        </motion.div>
        
        <button 
          onClick={() => setShowCreateModal(true)}
          className="group relative px-6 py-3 bg-[var(--primary)] text-[#0C0A09] rounded-xl font-bold flex items-center gap-2 overflow-hidden shadow-lg shadow-amber-600/20 active:scale-95 transition-all"
        >
          <Plus size={20} />
          Create New Classroom
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { label: "Active Scholars", val: "124", icon: <Users size={20} />, trend: "+12% this week" },
          { label: "Avg. Proficiency", val: "84%", icon: <BarChart3 size={20} />, trend: "Top 5% of Institution" },
          { label: "Assignments Due", val: "8", icon: <Clock size={20} />, trend: "Next: Philosophy 101" },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#1C1917] border border-[var(--border)] rounded-2xl p-6 relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
               <div className="p-3 bg-[#0C0A09] rounded-xl border border-white/5 text-amber-600">
                 {stat.icon}
               </div>
               <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter">{stat.trend}</span>
            </div>
            <h3 className="text-3xl font-mono font-bold text-[var(--foreground)] mb-1">{stat.val}</h3>
            <p className="text-xs text-[var(--muted)] font-bold uppercase tracking-widest">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="border-t border-[var(--border)] pt-12">
        <h2 className="text-2xl font-serif text-[var(--foreground)] mb-8">Active Faculty Classrooms</h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-[#1C1917] h-56 rounded-3xl border border-[var(--border)]"></div>
            ))}
          </div>
        ) : classes.length === 0 ? (
          <div className="text-center bg-[#1C1917] border border-[var(--border)] border-dashed rounded-3xl p-16">
            <GraduationCap size={64} className="mx-auto text-[var(--muted)]/20 mb-6" />
            <h2 className="text-2xl font-serif text-[var(--foreground)] mb-3">Your halls are currently empty</h2>
            <p className="text-[var(--muted)] mb-8 max-w-md mx-auto">
              Initiate your first classroom to begin distributing volumes, generating synthetic quizzes, and monitoring scholar evolution.
            </p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-3 bg-[var(--primary)] text-[#0C0A09] rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              Establish Classroom
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {classes.map((cls, i) => (
              <motion.div
                key={cls.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/teacher/classes/${cls.id}`} className="group block h-full">
                  <div className="bg-[#1C1917] border border-[var(--border)] rounded-3xl p-8 h-full flex flex-col hover:border-amber-600/30 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                       <GraduationCap size={80} />
                    </div>
                    
                    <div className="flex justify-between items-start mb-6">
                      <div className="px-3 py-1 bg-amber-900/20 text-amber-600 rounded-full text-[10px] font-bold uppercase tracking-widest border border-amber-900/30">
                        Academic Year 2026
                      </div>
                      <ChevronRight size={20} className="text-[var(--muted)] group-hover:text-[var(--primary)] transition-all transform group-hover:translate-x-1" />
                    </div>

                    <h3 className="text-2xl font-serif font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors mb-3">
                      {cls.name}
                    </h3>
                    <p className="text-sm text-[var(--muted)] mb-8 line-clamp-2 italic">
                      {cls.description || "The archives for this classroom are currently being populated with academic objectives."}
                    </p>
                    
                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                       <div className="flex -space-x-2">
                         {[1,2,3].map(j => (
                           <div key={j} className="w-8 h-8 rounded-full border-2 border-[#1C1917] bg-[#0C0A09] flex items-center justify-center text-[10px]">👤</div>
                         ))}
                         <div className="w-8 h-8 rounded-full border-2 border-[#1C1917] bg-amber-600 flex items-center justify-center text-[8px] font-bold text-black">+21</div>
                       </div>
                       <span className="text-[10px] text-[var(--muted)] font-mono uppercase tracking-[0.2em]">Live Tracking</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Create Class Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowCreateModal(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative bg-[#1C1917] border border-[var(--border)] rounded-3xl p-8 w-full max-w-md shadow-2xl"
          >
            <h2 className="text-3xl font-serif font-bold text-[var(--foreground)] mb-2">Establish Hall</h2>
            <p className="text-sm text-[var(--muted)] mb-8">Define the parameters of your new academic collective.</p>
            
            <form onSubmit={handleCreateClass}>
              <div className="space-y-6 mb-8">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.2em] mb-3">Class Title</label>
                  <input 
                    type="text" 
                    required
                    value={newClassName}
                    onChange={e => setNewClassName(e.target.value)}
                    className="w-full bg-[#0C0A09] border border-[var(--border)] rounded-xl px-4 py-4 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors placeholder:opacity-30"
                    placeholder="e.g. Theoretical Ethics & Moral Logic"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[var(--muted)] uppercase tracking-[0.2em] mb-3">Academic Description</label>
                  <textarea 
                    value={newClassDesc}
                    onChange={e => setNewClassDesc(e.target.value)}
                    className="w-full bg-[#0C0A09] border border-[var(--border)] rounded-xl px-4 py-4 text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)] transition-colors min-h-[120px] placeholder:opacity-30"
                    placeholder="What mysteries will your scholars solve?"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 text-[var(--muted)] hover:text-[var(--foreground)] font-bold text-sm transition-colors border border-[var(--border)] rounded-xl"
                >
                  Dissolve
                </button>
                <button 
                  type="submit"
                  disabled={!newClassName}
                  className="flex-1 px-4 py-3 bg-[var(--primary)] text-[#0C0A09] rounded-xl font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
                >
                  Establish
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
