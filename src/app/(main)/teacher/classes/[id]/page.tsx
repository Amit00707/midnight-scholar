'use client';

import React, { useState, useEffect, use } from 'react';
import { api } from '@/lib/api/client';
import Link from 'next/link';
import { ArrowLeft, Megaphone, BookOpen, Users, Plus } from 'lucide-react';

export default function ClassDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [classroom, setClassroom] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'announcements' | 'assignments' | 'students'>('announcements');
  const [isLoading, setIsLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [bookId, setBookId] = useState('');

  useEffect(() => {
    // In a real app we'd fetch the specific class details here.
    // For now, we fetch all and find the matching one, or just mock the data
    // since the backend only has simple routes right now.
    loadClassDetails();
  }, [id]);

  const loadClassDetails = async () => {
    try {
      const res = await api.getClasses();
      const found = res.classes.find((c: any) => c.id === parseInt(id));
      if (found) {
        setClassroom(found);
      } else {
        // Fallback for demo
        setClassroom({ id: parseInt(id), name: `Class #${id}`, description: 'Manage this class' });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnnounce = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    try {
      await api.sendAnnouncement(parseInt(id), title, content);
      setTitle('');
      setContent('');
      alert('Announcement sent to all enrolled students!');
    } catch (err) {
      console.error(err);
      alert('Failed to send announcement');
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookId || !title) return;
    try {
      await api.createAssignment(parseInt(id), bookId, title, content);
      setBookId('');
      setTitle('');
      setContent('');
      alert('Assignment created successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to create assignment');
    }
  };

  if (isLoading) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-[var(--muted)]">Loading class details...</div>;
  }

  if (!classroom) {
    return <div className="max-w-4xl mx-auto px-4 py-12 text-center text-red-400">Classroom not found.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/teacher" className="inline-flex items-center gap-2 text-[var(--muted)] hover:text-[var(--foreground)] mb-6 transition-colors">
        <ArrowLeft size={16} /> Back to Dashboard
      </Link>

      <div className="bg-[#1C1917] border border-[var(--border)] rounded-2xl p-8 mb-8 shadow-sm">
        <h1 className="text-3xl font-serif text-[var(--foreground)] mb-2">{classroom.name}</h1>
        <p className="text-[var(--muted)]">{classroom.description}</p>
      </div>

      <div className="flex border-b border-[var(--border)] mb-8">
        <button 
          onClick={() => setActiveTab('announcements')}
          className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${activeTab === 'announcements' ? 'border-[var(--primary)] text-[var(--foreground)]' : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)]'}`}
        >
          <Megaphone size={18} /> Announcements
        </button>
        <button 
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${activeTab === 'assignments' ? 'border-[var(--primary)] text-[var(--foreground)]' : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)]'}`}
        >
          <BookOpen size={18} /> Assignments
        </button>
        <button 
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-6 py-4 font-medium border-b-2 transition-colors ${activeTab === 'students' ? 'border-[var(--primary)] text-[var(--foreground)]' : 'border-transparent text-[var(--muted)] hover:text-[var(--foreground)]'}`}
        >
          <Users size={18} /> Students
        </button>
      </div>

      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Recent Announcements</h2>
            <div className="text-center py-12 bg-[#1C1917] border border-[var(--border)] rounded-xl text-[var(--muted)]">
              No announcements sent yet. Use the form to notify your class.
            </div>
          </div>
          <div className="bg-[#1C1917] border border-[var(--border)] rounded-xl p-6 h-fit">
            <h3 className="font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <Plus size={18} className="text-[var(--primary)]" /> New Announcement
            </h3>
            <form onSubmit={handleAnnounce} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--muted)] uppercase mb-2">Subject</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} type="text" className="w-full bg-[#0C0A09] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--muted)] uppercase mb-2">Message</label>
                <textarea required value={content} onChange={e => setContent(e.target.value)} className="w-full bg-[#0C0A09] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] outline-none min-h-[100px]" />
              </div>
              <button type="submit" className="w-full py-2 bg-[var(--primary)] text-[#0C0A09] rounded-lg font-bold hover:opacity-90">Send to Class</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'assignments' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Active Assignments</h2>
            <div className="text-center py-12 bg-[#1C1917] border border-[var(--border)] rounded-xl text-[var(--muted)]">
              No books assigned yet. Provide an Open Library ID to assign reading material.
            </div>
          </div>
          <div className="bg-[#1C1917] border border-[var(--border)] rounded-xl p-6 h-fit">
            <h3 className="font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
              <Plus size={18} className="text-[var(--primary)]" /> Assign Reading
            </h3>
            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--muted)] uppercase mb-2">Open Library Book ID</label>
                <input required value={bookId} onChange={e => setBookId(e.target.value)} type="text" placeholder="e.g. OL27448W" className="w-full bg-[#0C0A09] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--muted)] uppercase mb-2">Assignment Title</label>
                <input required value={title} onChange={e => setTitle(e.target.value)} type="text" placeholder="e.g. Read Chapters 1-3" className="w-full bg-[#0C0A09] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--muted)] uppercase mb-2">Instructions</label>
                <textarea value={content} onChange={e => setContent(e.target.value)} className="w-full bg-[#0C0A09] border border-[var(--border)] rounded-lg px-3 py-2 text-sm text-[var(--foreground)] focus:border-[var(--primary)] outline-none min-h-[80px]" />
              </div>
              <button type="submit" className="w-full py-2 bg-[var(--primary)] text-[#0C0A09] rounded-lg font-bold hover:opacity-90">Create Assignment</button>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)] mb-4">Enrolled Students</h2>
          <div className="bg-[#1C1917] border border-[var(--border)] rounded-xl p-6 text-center text-[var(--muted)] py-12">
            Share this class ID with your students so they can enroll:
            <div className="text-2xl font-mono text-[var(--primary)] mt-4 font-bold">{classroom.id}</div>
          </div>
        </div>
      )}
    </div>
  );
}
