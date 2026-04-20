"use client";

import { useState, useEffect, useCallback } from 'react';

export interface OfflineStatus {
  isOffline: boolean;
  isOnline: boolean;
  wasOffline: boolean;
  reconnectedAt: Date | null;
  disconnectedAt: Date | null;
  connectionType: string | null;
  effectiveType: string | null;
}

function getConnectionInfo(): { connectionType: string | null; effectiveType: string | null } {
  if (typeof window === 'undefined') return { connectionType: null, effectiveType: null };
  const nav = navigator as any;
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
  if (!conn) return { connectionType: null, effectiveType: null };
  return {
    connectionType: conn.type || null,
    effectiveType: conn.effectiveType || null,
  };
}

export function useOfflineStatus(): OfflineStatus {
  const [isOffline, setIsOffline] = useState(typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const [wasOffline, setWasOffline] = useState(false);
  const [reconnectedAt, setReconnectedAt] = useState<Date | null>(null);
  const [disconnectedAt, setDisconnectedAt] = useState<Date | null>(null);
  const [connectionInfo, setConnectionInfo] = useState(getConnectionInfo());

  const isOnline = !isOffline;

  const handleOnline = useCallback(() => {
    setIsOffline(false);
    setWasOffline(true);
    setReconnectedAt(new Date());
    setConnectionInfo(getConnectionInfo());
  }, []);

  const handleOffline = useCallback(() => {
    setIsOffline(true);
    setWasOffline(false);
    setDisconnectedAt(new Date());
    setConnectionInfo({ connectionType: null, effectiveType: null });
  }, []);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const nav = navigator as any;
    const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
    if (conn) {
      const handleConnectionChange = () => setConnectionInfo(getConnectionInfo());
      conn.addEventListener('change', handleConnectionChange);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        conn.removeEventListener('change', handleConnectionChange);
      };
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return {
    isOffline,
    isOnline,
    wasOffline,
    reconnectedAt,
    disconnectedAt,
    connectionType: connectionInfo.connectionType,
    effectiveType: connectionInfo.effectiveType,
  };
}

// Utility: check if app should use cached data
export function shouldUseCachedData(status: OfflineStatus): boolean {
  return status.isOffline || (status.effectiveType === '2g') || (status.effectiveType === 'slow-2g');
}

// Utility: get human readable connection description
export function getConnectionDescription(status: OfflineStatus): string {
  if (status.isOffline) return 'Offline';
  if (status.effectiveType === '4g') return 'Fast (4G)';
  if (status.effectiveType === '3g') return 'Moderate (3G)';
  if (status.effectiveType === '2g') return 'Slow (2G)';
  if (status.effectiveType === 'slow-2g') return 'Very Slow';
  return 'Online';
}
