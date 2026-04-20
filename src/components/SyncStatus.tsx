"use client";

import { useAuth } from "./AuthProvider";

/**
 * Lightweight sync-status indicator.
 * Shows nothing if Firebase is unconfigured (pure offline mode).
 * Shows "Offline Mode" if user is not signed in.
 * Shows avatar + "Synced" when authenticated.
 */
export function SyncStatus() {
  const { user, loading, signOut } = useAuth();

  if (loading) return null; // Don't flash UI while auth resolves

  // Not signed in — show a subtle login prompt
  if (!user) {
    return (
      <div 
        className="sync-status-btn sync-status--offline"
        title="Sign in to enable cloud sync"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        <span>Offline Mode</span>
      </div>
    );
  }

  const metadata = user.user_metadata || {};
  const avatar = metadata.avatar_url || metadata.picture;
  const name = metadata.full_name || metadata.name || "User";

  // Signed in — show synced badge with avatar
  return (
    <div className="sync-status-btn sync-status--synced">
      {avatar && (
        <img
          src={avatar}
          alt={name}
          className="sync-avatar"
          referrerPolicy="no-referrer"
        />
      )}
      <span>Synced</span>
      <button
        onClick={signOut}
        className="sync-logout"
        title="Sign out"
      >
        ✕
      </button>
    </div>
  );
}
