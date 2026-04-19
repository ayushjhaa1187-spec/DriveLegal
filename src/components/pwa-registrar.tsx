'use client';

import { useEffect, useState } from 'react';

export function PWARegistrar() {
  const [showReload, setShowReload] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // next-pwa registers the SW, we just need to hook into the API
      navigator.serviceWorker.ready.then((reg) => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setShowReload(true);
              }
            });
          }
        });
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  const reloadPage = () => {
    waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
    setShowReload(false);
  };

  if (!showReload) return null;

  return (
    <div className="fixed bottom-4 left-4 z-[9999] bg-brand-navy text-white p-4 rounded-xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-5">
      <p className="text-sm font-medium">New version available!</p>
      <button onClick={reloadPage} className="bg-white text-brand-navy px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors">
        Update Now
      </button>
    </div>
  );
}
