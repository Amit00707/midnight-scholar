'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Quote, Sparkles, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface FeedItem {
  user: string;
  action: string;
  book: string;
  time: string;
  quote?: string;
  created_at?: string;
}

export default function SocialFeedPage() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    async function fetchFeed() {
      try {
        const res: any = await api.getSocialFeed();
        setFeed(res.feed || []);
      } catch (error) {
        console.error('Failed to fetch social feed:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchFeed();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header Section */}
      <div className="mb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-900/10 border border-amber-900/20 text-amber-500 text-xs font-bold tracking-widest uppercase mb-4"
        >
          <Sparkles size={14} /> The Agora Community
        </motion.div>
        <h1 className="text-5xl font-serif text-[var(--foreground)] mb-4">The Agora</h1>
        <p className="text-[var(--muted)] text-lg max-w-2xl mx-auto">
          Share your revelations, discuss philosophy, and see what scholars around the globe are uncovering.
        </p>
      </div>

      {/* Post Creation Area */}
      <div className="bg-[#1C1917] border border-[var(--border)] rounded-2xl p-6 mb-12 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 via-violet-600 to-amber-600"></div>
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-[#292524] flex items-center justify-center border border-[var(--border)] shrink-0">
             <User size={24} className="text-[var(--muted)]" />
          </div>
          <div className="flex-1">
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="What did you uncover in your latest reading?"
              className="w-full bg-transparent border-none focus:ring-0 text-lg text-[var(--foreground)] placeholder:text-[#444] resize-none min-h-[80px]"
            />
            <div className="flex justify-between items-center pt-4 border-t border-[var(--border)]">
              <div className="flex gap-2">
                <button className="p-2 hover:bg-white/5 rounded-lg text-[var(--muted)] transition-colors">
                   <Quote size={20} />
                </button>
              </div>
              <Button 
                variant="primary" 
                size="sm" 
                disabled={!newPost.trim() || isPosting}
                className="px-6"
                onClick={async () => {
                  if (!newPost.trim()) return;
                  setIsPosting(true);
                  try {
                    await api.createPost(newPost.trim());
                    setFeed([{ 
                      user: 'You', 
                      action: 'shared a revelation', 
                      book: 'Your Library', 
                      time: 'Just now', 
                      quote: newPost 
                    }, ...feed]);
                    setNewPost('');
                  } catch (_) {
                    // optimistic update even if API fails
                    setFeed([{ 
                      user: 'You', 
                      action: 'shared a revelation', 
                      book: 'Your Library', 
                      time: 'Just now', 
                      quote: newPost 
                    }, ...feed]);
                    setNewPost('');
                  } finally {
                    setIsPosting(false);
                  }
                }}
              >
                {isPosting ? 'Posting...' : 'Post Thought'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Feed List */}
      <div className="space-y-8">
        {isLoading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-[#1C1917] border border-[var(--border)] rounded-2xl p-6 h-48 animate-pulse"></div>
            ))}
          </div>
        ) : feed.length === 0 ? (
          <div className="bg-[#1C1917] border border-[var(--border)] rounded-2xl p-20 text-center text-[var(--muted)] border-dashed">
            <span className="text-6xl mb-6 block opacity-20">🏛️</span>
            <h2 className="text-2xl font-serif text-[var(--foreground)] mb-2">The Agora is quiet today.</h2>
            <p className="max-w-xs mx-auto">Start reading and highlighting books to see community activity here!</p>
          </div>
        ) : (
          <AnimatePresence>
            {feed.map((post, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#1C1917] border border-[var(--border)] rounded-2xl p-8 shadow-xl hover:border-amber-900/50 transition-all group relative"
              >
                <div className="flex gap-6">
                  {/* User Column */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-900/20 to-violet-900/20 border border-[var(--border)] flex items-center justify-center text-xl font-bold text-[var(--primary)] shrink-0">
                      {post.user[0].toUpperCase()}
                    </div>
                    <div className="h-full w-px bg-gradient-to-b from-[var(--border)] to-transparent mt-2"></div>
                  </div>

                  {/* Content Column */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                          {post.user}
                        </h3>
                        <p className="text-xs text-[var(--muted)] font-medium uppercase tracking-widest mt-1">
                          {post.action} in <span className="text-amber-500">{post.book}</span>
                        </p>
                      </div>
                      <span className="text-[10px] text-[var(--muted)] font-mono">
                        {post.created_at ? new Date(post.created_at).toLocaleDateString() : post.time}
                      </span>
                    </div>
                    
                    {post.quote && (
                      <div className="relative mb-6">
                         <Quote size={40} className="absolute -top-4 -left-4 text-white/5 pointer-events-none" />
                         <div className="border-l-4 border-amber-600/50 pl-6 py-2 italic text-lg text-[var(--foreground)] font-serif leading-relaxed">
                            {post.quote}
                         </div>
                      </div>
                    )}

                    {/* Interaction Bar */}
                    <div className="flex items-center gap-6 pt-4 border-t border-[var(--border)]">
                      <button className="flex items-center gap-2 text-[var(--muted)] hover:text-red-500 transition-colors text-sm font-medium">
                        <Heart size={18} /> 24
                      </button>
                      <button className="flex items-center gap-2 text-[var(--muted)] hover:text-blue-500 transition-colors text-sm font-medium">
                        <MessageCircle size={18} /> 8
                      </button>
                      <button className="flex items-center gap-2 text-[var(--muted)] hover:text-[var(--primary)] transition-colors text-sm font-medium">
                        <Share2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
