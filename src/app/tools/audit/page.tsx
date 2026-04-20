'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, ExternalLink, Download } from 'lucide-react';

interface AuditEntry {
  violation: any;
  status: 'ok' | 'mismatch' | 'pending';
  reviewNote: string;
}

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ ok: 0, mismatch: 0, pending: 0 });

  useEffect(() => {
    async function loadSample() {
      const res = await fetch('/data/lawpacks/in/central/1.0.0/violations.json');
      const data = await res.json();
      // Random sample of 50
      const shuffled = data.violations
        .sort(() => Math.random() - 0.5)
        .slice(0, 50);
      setEntries(shuffled.map((v: any) => ({ violation: v, status: 'pending', reviewNote: '' })));
      setLoading(false);
    }
    loadSample();
  }, []);

  useEffect(() => {
    setStats({
      ok: entries.filter((e) => e.status === 'ok').length,
      mismatch: entries.filter((e) => e.status === 'mismatch').length,
      pending: entries.filter((e) => e.status === 'pending').length,
    });
  }, [entries]);

  function markEntry(index: number, status: 'ok' | 'mismatch', note?: string) {
    setEntries((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], status, reviewNote: note ?? '' };
      return updated;
    });
  }

  function exportResults() {
    const result = {
      auditDate: new Date().toISOString(),
      totalReviewed: entries.filter((e) => e.status !== 'pending').length,
      accuracy:
        stats.ok + stats.mismatch > 0
          ? (stats.ok / (stats.ok + stats.mismatch)) * 100
          : 0,
      entries: entries.map((e) => ({
        id: e.violation.id,
        section: e.violation.section,
        status: e.status,
        note: e.reviewNote,
      })),
    };
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  }

  if (loading)
    return <div className="p-8 text-center">Loading 50 random violations...</div>;

  const accuracy =
    stats.ok + stats.mismatch > 0
      ? Math.round((stats.ok / (stats.ok + stats.mismatch)) * 100)
      : 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Legal Accuracy Audit Tool</h1>
        <button
          onClick={exportResults}
          className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl"
        >
          <Download className="h-4 w-4" />
          Export Results
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Correct', value: stats.ok, color: 'text-green-600' },
          { label: 'Mismatch', value: stats.mismatch, color: 'text-red-600' },
          { label: 'Pending', value: stats.pending, color: 'text-amber-600' },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center"
          >
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Accuracy bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm mb-1">
          <span>Accuracy</span>
          <span className="font-bold">{accuracy}%</span>
        </div>
        <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: `${accuracy}%` }}
          />
        </div>
      </div>

      {/* Entries */}
      <div className="space-y-4">
        {entries.map((entry, idx) => (
          <div
            key={entry.violation.id}
            className={`border-2 rounded-2xl p-5 ${
              entry.status === 'ok'
                ? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950'
                : entry.status === 'mismatch'
                ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {entry.violation.section ?? 'No section'}
                  </span>
                  <span className="text-xs text-slate-500">{entry.violation.category}</span>
                </div>
                <h3 className="font-semibold text-slate-900 dark:text-white">
                  {entry.violation.title?.en}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {entry.violation.plainEnglishSummary}
                </p>
                {/* Fines */}
                <div className="mt-2 flex gap-4 text-sm">
                  <span>
                    1st offence:{' '}
                    <strong>
                      {entry.violation.penalty?.fineFirstOffenceINR ?? '?'}
                    </strong>
                  </span>
                  {entry.violation.penalty?.fineRepeatOffenceINR && (
                    <span>
                      Repeat:{' '}
                      <strong>{entry.violation.penalty.fineRepeatOffenceINR}</strong>
                    </span>
                  )}
                </div>
                {/* Source */}
                <a
                  href={entry.violation.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-amber-600 mt-2 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Verify source
                </a>
                {entry.violation.sourceTextExcerpt && (
                  <blockquote className="mt-2 pl-3 border-l-2 border-slate-300 text-xs text-slate-500 italic">
                    {entry.violation.sourceTextExcerpt}
                  </blockquote>
                )}
              </div>

              {/* Action buttons */}
              {entry.status === 'pending' && (
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => markEntry(idx, 'ok')}
                    className="flex items-center gap-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Correct
                  </button>
                  <button
                    onClick={() => {
                      const note = prompt('Describe the mismatch') ?? '';
                      markEntry(idx, 'mismatch', note);
                    }}
                    className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
                  >
                    <XCircle className="h-4 w-4" />
                    Mismatch
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
