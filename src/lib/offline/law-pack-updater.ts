import { dataLoader } from "../data/data-loader";

interface Manifest {
  version: string;
  lastUpdated: string;
  states: Record<string, { hash: string; lastUpdated: string }>;
}

export class LawPackUpdater {
  private static MANIFEST_URL = "/data/laws/in/manifest.json";

  static async checkForUpdates() {
    if (!navigator.onLine) return;

    try {
      const response = await fetch(this.MANIFEST_URL);
      if (!response.ok) return;

      const manifest: Manifest = await response.json();
      const lastCheck = localStorage.getItem("drivelegal_last_law_update");
      
      if (lastCheck === manifest.lastUpdated) {
        console.log("[LawPackUpdater] Law packs are already up to date.");
        return;
      }

      console.log("[LawPackUpdater] New law packs available. Syncing...");
      
      // We don't download all at once to save bandwidth.
      // Instead, we mark the local cache as stale for dataLoader.
      // Or we can pre-fetch the current state.
      const currentState = localStorage.getItem("user-state");
      if (currentState) {
        const { code } = JSON.parse(currentState);
        if (code) {
          await dataLoader.loadViolations(code); // Trigger refreshed load
        }
      }

      localStorage.setItem("drivelegal_last_law_update", manifest.lastUpdated);
    } catch (err) {
      console.warn("[LawPackUpdater] Manifest check failed:", err);
    }
  }
}

// Auto-check on load if in browser
if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    // Delay check to prioritize UI rendering
    setTimeout(() => LawPackUpdater.checkForUpdates(), 5000);
  });
}
