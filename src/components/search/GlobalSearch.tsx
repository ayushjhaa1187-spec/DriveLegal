'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Calculator, Shield, MapPin, X, ArrowRight, CornerDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  category: 'Rules' | 'Pages' | 'Support';
  href: string;
  icon: any;
}

const STATIC_PAGES: SearchResult[] = [
  { id: 'p1', title: 'Fine Calculator', subtitle: 'Check motor vehicle act penalties', category: 'Pages', href: '/calculator', icon: Calculator },
  { id: 'p2', title: 'Traffic Scan', subtitle: 'Verify challans with AI', category: 'Pages', href: '/scan', icon: Search },
  { id: 'p3', title: 'Hotspots', subtitle: 'View live police checkposts', category: 'Pages', href: '/hotspots', icon: MapPin },
  { id: 'p4', title: 'Know Your Rights', subtitle: 'Legal aid and consumer rights', category: 'Pages', href: '/rights', icon: Shield },
];

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const results = query === '' 
    ? STATIC_PAGES 
    : STATIC_PAGES.filter(p => 
        p.title.toLowerCase().includes(query.toLowerCase()) || 
        p.subtitle.toLowerCase().includes(query.toLowerCase())
      );

  const navigate = useCallback((href: string) => {
    router.push(href);
    setOpen(false);
    setQuery('');
  }, [router]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  return (
    <>
      {/* Search trigger button for desktop header */}
      <button
        onClick={() => setOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all text-xs"
      >
        <Search className="h-3.5 w-3.5" />
        <span>Search anything...</span>
        <kbd className="font-sans font-bold text-[10px] bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-800">
          ⌘K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative z-[210]"
            >
              <div className="flex items-center gap-3 p-5 border-b border-slate-100 dark:border-slate-800">
                <Search className="h-5 w-5 text-slate-400" />
                <input
                  autoFocus
                  placeholder="Type to search rules, pages, or guides..."
                  className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white font-medium"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && results[activeIndex]) navigate(results[activeIndex].href);
                    if (e.key === 'ArrowDown') setActiveIndex(i => Math.min(results.length - 1, i + 1));
                    if (e.key === 'ArrowUp') setActiveIndex(i => Math.max(0, i - 1));
                  }}
                />
                <button 
                  onClick={() => setOpen(false)}
                  className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                >
                  <X className="h-4 w-4 text-slate-400" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2">
                {results.length > 0 ? (
                  <div className="space-y-1">
                    {results.map((result, idx) => {
                      const Icon = result.icon;
                      const active = idx === activeIndex;

                      return (
                        <button
                          key={result.id}
                          onClick={() => navigate(result.href)}
                          onMouseEnter={() => setActiveIndex(idx)}
                          className={cn(
                            "w-full flex items-center justify-between p-3 rounded-2xl transition-all text-left",
                            active ? "bg-brand-navy/5 dark:bg-white/10" : "bg-transparent"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn(
                              "h-10 w-10 rounded-xl flex items-center justify-center transition-all",
                              active ? "bg-brand-navy text-white scale-110 shadow-lg" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                            )}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                               <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                                 {result.title}
                               </p>
                               <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                                 {result.subtitle}
                               </p>
                            </div>
                          </div>
                          
                          {active && (
                            <div className="flex items-center gap-1.5 text-brand-navy dark:text-slate-400">
                               <span className="text-[10px] font-bold uppercase tracking-wider">Open</span>
                               <CornerDownLeft className="h-3.5 w-3.5" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="py-12 text-center text-slate-400">
                    <p className="text-sm">No results found for "{query}"</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <div className="flex gap-4">
                   <div className="flex items-center gap-1.5">
                      <span className="px-1 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">↑↓</span>
                      Next
                   </div>
                   <div className="flex items-center gap-1.5">
                        <span className="px-1 py-0.5 rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">Enter</span>
                        Select
                   </div>
                </div>
                <div>DriveLegal QuickSearch</div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
