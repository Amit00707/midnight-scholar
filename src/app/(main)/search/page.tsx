'use client';

import React, { useState } from 'react';
import { useBookSearch, useCategoryBooks } from "@/lib/hooks/useBooks";
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, BookOpen, Star, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

const categories = ["All", "Philosophy", "Science", "History", "Psychology", "Physics", "Technology", "Social Media", "Education", "Business", "Art", "Fiction"];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState("All");
  
  // 1. Fetch by Search Query (Only if query is not empty)
  const { data: searchData, isLoading: isSearchLoading } = useBookSearch(query, 30, 1, !!query);
  
  // 2. Fetch by Category (Only if no active query)
  const isCategoryMode = !query;
  const { data: categoryData, isLoading: isCategoryLoading } = useCategoryBooks(
    activeCategory,
    30,
    isCategoryMode
  );

  const isLoading = isSearchLoading || isCategoryLoading;

  // Final Results Mapping
  const results = query ? searchData?.results : categoryData?.results;
  const total = query ? searchData?.total : categoryData?.total;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Search Header */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-600/10 border border-violet-600/20 text-violet-400 text-xs font-bold tracking-widest uppercase mb-6"
        >
          <Search size={14} /> The Great Library Search
        </motion.div>
        <h1 className="text-5xl md:text-6xl font-serif text-[var(--foreground)] mb-6 leading-tight">
          Find your next <span className="text-[var(--primary)] italic">revelation.</span>
        </h1>
        
        <div className="relative group max-w-2xl mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-600 to-violet-600 rounded-full blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <input 
            type="text" 
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value) setActiveCategory("All");
            }}
            placeholder="Search for titles, authors, or concepts..."
            className="relative w-full bg-[#1C1917] border border-[var(--border)] rounded-full px-8 py-5 text-xl text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none shadow-2xl transition-all"
          />
          <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {isLoading ? <Loader2 size={24} className="animate-spin text-[var(--muted)]" /> : <Search size={24} className="text-[var(--muted)]" />}
          </div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap justify-center gap-3 mb-16">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              if (cat !== "All") setQuery(""); // Clear search to show category results
            }}
            className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all border ${
              activeCategory === cat 
                ? 'bg-[var(--primary)] border-[var(--primary)] text-[#0C0A09] shadow-[0_0_15px_rgba(217,119,6,0.3)]' 
                : 'bg-[#1C1917] border-[var(--border)] text-[var(--muted)] hover:border-amber-600/50 hover:text-[var(--foreground)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {true ? (
          <motion.div
            key={`results-${activeCategory}-${query}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-8 border-b border-[var(--border)] pb-4">
              <h3 className="text-sm uppercase tracking-widest font-bold text-[var(--muted)]">
                {total || 0} {activeCategory !== "All" ? activeCategory : ""} Revelations Found
              </h3>
              <div className="flex items-center gap-2 text-xs text-amber-500 font-bold">
                <Sparkles size={14} /> AI Sorted
              </div>
            </div>

            {isLoading ? (
               <div className="flex flex-col items-center justify-center py-32">
                 <Loader2 size={40} className="animate-spin text-[var(--primary)] mb-4" />
                 <p className="text-[var(--muted)] animate-pulse font-serif italic text-lg">Sifting through the ancient scrolls...</p>
               </div>
            ) : (
              <>
                {results && results.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {results.map((book: any, idx: number) => (
                      <motion.div
                        key={`${book.id ?? book.ol_key ?? 'book'}-${idx}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                      >
                        <Link href={`/book/${book.id || (book.ol_key?.split('/').pop())}`} className="group block h-full">
                          <div className="bg-[#1C1917] border border-[var(--border)] rounded-2xl p-6 h-full flex flex-col hover:border-amber-900/50 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-2 relative overflow-hidden group/card">
                            <div className="flex gap-5 flex-1">
                              <div className="w-24 h-36 rounded-lg bg-[#0C0A09] border border-[var(--border)] shrink-0 overflow-hidden shadow-lg relative">
                                 {book.cover_url ? (
                                   <img src={book.cover_url} alt={book.title} className="w-full h-full object-cover transform group-hover/card:scale-110 transition-transform duration-500" />
                                 ) : (
                                   <div className="absolute inset-0 flex items-center justify-center text-[var(--muted)] text-[8px] font-serif uppercase p-2 text-center">No Cover</div>
                                 )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 text-amber-600 mb-1">
                                   <Star size={12} fill="currentColor" />
                                   <span className="text-[10px] font-bold uppercase tracking-tighter">{book.rating || '4.5'}</span>
                                </div>
                                <h4 className="text-xl font-serif font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors line-clamp-2 leading-tight mb-1">
                                  {book.title}
                                </h4>
                                <p className="text-sm text-[var(--muted)] mb-3 line-clamp-1">by {book.author}</p>
                                <span className="inline-block px-2 py-0.5 bg-amber-900/20 text-amber-500 rounded border border-amber-900/30 text-[10px] font-bold uppercase">
                                  {book.category || activeCategory || "Scholar Choice"}
                                </span>
                              </div>
                            </div>
                            
                            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between group-hover:border-amber-900/20 transition-colors">
                              <span className="text-[10px] text-[var(--muted)] font-mono uppercase tracking-widest">Explore Details</span>
                              <ArrowRight size={16} className="text-[var(--muted)] group-hover:text-[var(--primary)] transform group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-24 bg-[#1C1917] border border-[var(--border)] border-dashed rounded-3xl">
                     <div className="text-6xl mb-6 opacity-20 grayscale">🕯️</div>
                     <h2 className="text-3xl font-serif text-[var(--foreground)] mb-3">The archives are silent</h2>
                     <p className="text-[var(--muted)] max-w-md mx-auto">We couldn't find any revelations matching "{query || activeCategory}". Try searching for a different concept or browse our classic collections.</p>
                     <Button 
                       variant="outline" 
                       className="mt-8 border-amber-900/30 text-amber-600 hover:bg-amber-600/10"
                       onClick={() => { setQuery(""); setActiveCategory("All"); }}
                     >
                       Reset Library Search
                     </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Featured Categories for Exploration */}
            <div className="col-span-1 md:col-span-3 text-center mb-6">
              <h2 className="text-2xl font-serif text-[var(--foreground)]">Explore Curated Collections</h2>
            </div>
            {[
              { title: "Western Philosophy", icon: "🏛️", count: 24, color: "from-amber-600/10", cat: "Philosophy" },
              { title: "Scientific Revolutions", icon: "⚛️", count: 18, color: "from-blue-600/10", cat: "Science" },
              { title: "Historical Archives", icon: "📜", count: 32, color: "from-emerald-600/10", cat: "History" },
              { title: "Modern Psychology", icon: "🧠", count: 15, color: "from-violet-600/10", cat: "Psychology" },
              { title: "Quantum Physics", icon: "🌌", count: 12, color: "from-indigo-600/10", cat: "Physics" },
              { title: "Classical Literature", icon: "🖋️", count: 45, color: "from-rose-600/10", cat: "Fiction" },
            ].map((box, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.02 }}
                onClick={() => {
                  setActiveCategory(box.cat);
                  setQuery("");
                }}
                className={`bg-[#1C1917] border border-[var(--border)] rounded-2xl p-8 flex flex-col items-center text-center cursor-pointer hover:border-[var(--primary)] transition-all bg-gradient-to-br ${box.color} to-transparent`}
              >
                <span className="text-4xl mb-4">{box.icon}</span>
                <h3 className="text-xl font-serif font-bold text-[var(--foreground)] mb-2">{box.title}</h3>
                <p className="text-xs text-[var(--muted)] uppercase tracking-widest font-bold">{box.count} Volumes</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
