'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, ShieldAlert, Info, ExternalLink } from 'lucide-react';
import { getPackMetadata, verifyChecksums, type PackMetadata } from '@/lib/law-engine/integrity';
import { motion, AnimatePresence } from 'framer-motion';

interface LawPackBadgeProps {
  packId: string;
}

export function LawPackBadge({ packId }: LawPackBadgeProps) {
  const [metadata, setMetadata] = useState<PackMetadata | null>(null);
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    async function load() {
      const meta = await getPackMetadata(packId);
      setMetadata(meta);
      
      const integrity = await verifyChecksums();
      setIsVerified(!integrity.mismatches.includes(packId));
    }
    load();
  }, [packId]);

  if (!metadata && isVerified === null) return null;

  const version = metadata?.packVersion ?? '1.0.0';
  const lastVerified = metadata?.lastVerified ?? new Date().toLocaleDateString();

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${
          isVerified 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
            : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
        }`}
      >
        {isVerified ? <ShieldCheck className="h-3 w-3" /> : <ShieldAlert className="h-3 w-3" />}
        Law Pack: {packId.toUpperCase()}@{version}
        {isVerified ? ' · Verified' : ' · Tampered'}
      </button>

      <AnimatePresence>
        {showDetails && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-black/5" 
              onClick={() => setShowDetails(false)} 
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute left-0 bottom-full mb-2 w-64 p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                   <p className="text-[10px] font-black uppercase text-slate-400">Pack Details</p>
                   {isVerified ? (
                     <span className="text-[8px] font-black bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">AUTHENTIC</span>
                   ) : (
                     <span className="text-[8px] font-black bg-red-100 text-red-700 px-1.5 py-0.5 rounded">UNVERIFIED</span>
                   )}
                </div>

                <div>
                   <p className="text-xs font-bold text-slate-900 dark:text-white">{packId.toUpperCase()} v{version}</p>
                   <p className="text-[10px] text-slate-500">Verified on {lastVerified}</p>
                </div>

                {metadata?.coverage && (
                  <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-lg">
                    <p className="text-[10px] font-bold text-slate-600">Coverage</p>
                    <p className="text-xs text-slate-500">{metadata.coverage.sections} sections matched.</p>
                  </div>
                )}

                {metadata?.sourceUrls && metadata.sourceUrls.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-600">Official Sources</p>
                    {metadata.sourceUrls.map((url, i) => (
                      <a 
                        key={i} 
                        href={url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-1 text-[10px] text-brand-navy hover:underline truncate"
                      >
                        <ExternalLink className="h-2.5 w-2.5" /> {new URL(url).hostname}
                      </a>
                    ))}
                  </div>
                )}
                
                <p className="text-[9px] text-zinc-400 italic">
                  Cryptographic hash: {metadata?.hash?.substring(0, 16) ?? 'N/A'}...
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
