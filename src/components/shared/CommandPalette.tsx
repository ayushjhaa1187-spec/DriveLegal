'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Calculator, MessageSquare, Scale, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Command {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  group: 'navigate' | 'violation' | 'rights';
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Command[]>([]);
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const baseCommands: Command[] = [
    {
      id: 'calc',
      label: 'Open Calculator',
      icon: <Calculator className="h-4 w-4" />,
      action: () => router.push('/calculator'),
      group: 'navigate',
    },
    {
      id: 'ask',
      label: 'Ask Legal AI',
      icon: <MessageSquare className="h-4 w-4" />,
      action: () => router.push('/ask'),
      group: 'navigate',
    },
    {
      id: 'rights',
      label: 'Know Your Rights',
      icon: <ShieldCheck className="h-4 w-4" />,
      action: () => router.push('/rights'),
      group: 'navigate',
    },
    {
      id: 'laws',
      label: 'Browse All Laws',
      icon: <Scale className="h-4 w-4" />,
      action: () => router.push('/laws'),
      group: 'navigate',
    },
  ];

  // Open/close on Cmd+K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Auto-focus when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults(baseCommands);
    }
  }, [open]);

  // Filter results
  useEffect(() => {
    if (!query) {
      setResults(baseCommands);
      return;
    }
    const filtered = baseCommands.filter((c) =>
      c.label.toLowerCase().includes(query.toLowerCase()),
    );
    setResults(filtered);
    setSelected(0);
  }, [query]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      results[selected]?.action();
      setOpen(false);
    }
  }

  if (!open) return null;

  // Group results
  const grouped = results.reduce(
    (acc, cmd) => {
      const g = cmd.group;
      if (!acc[g]) acc[g] = [];
      acc[g].push(cmd);
      return acc;
    },
    {} as Record<string, Command[]>,
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />

      {/* Palette */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-xl z-50 px-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          {/* Search input */}
          <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-slate-800">
            <Search className="h-5 w-5 text-slate-400 flex-shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search violations, sections, or navigate..."
              className="flex-1 bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
            />
            <kbd className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded font-mono text-slate-500">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto p-2">
            {Object.entries(grouped).map(([group, cmds]) => (
              <div key={group} className="mb-2">
                <div className="text-xs uppercase tracking-wider text-slate-400 px-3 py-1">
                  {group === 'navigate' ? 'Pages' : group === 'violation' ? 'Violations' : 'Rights'}
                </div>
                {cmds.map((cmd) => {
                  const globalIdx = results.indexOf(cmd);
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => { cmd.action(); setOpen(false); }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors',
                        globalIdx === selected
                          ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300',
                      )}
                    >
                      {cmd.icon}
                      <div className="flex-1">
                        <div className="text-sm font-medium">{cmd.label}</div>
                        {cmd.description && (
                          <div className="text-xs text-slate-500 font-mono">{cmd.description}</div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ))}

            {results.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">No results for &ldquo;{query}&rdquo;</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
