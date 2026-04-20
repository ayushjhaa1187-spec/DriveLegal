/**
 * DriveLegal — Data Loader Strategy
 * ═══════════════════════════════════════════════════
 * Based on PART 3.3 spec.
 */

import { openDB, type IDBPDatabase } from "idb";
import type { Violation, ViolationsDataset as LawDataFile } from "../law-engine/schema";

interface DataLoadStrategy {
  /**
   * Tiered loading strategy:
   * 1. Memory cache (instant)
   * 2. IndexedDB cache (fast)
   * 3. Service Worker cache (fast, offline)
   * 4. Network fetch (with timeout)
   * 5. Fallback to bundled JSON (always works)
   */
  loadViolations(stateCode?: string): Promise<Violation[]>;
}

class DriveLegalDataLoader implements DataLoadStrategy {
  private memoryCache = new Map<string, Violation[]>();
  private loadPromises = new Map<string, Promise<Violation[]>>();
  private dbPromise: Promise<IDBPDatabase> | null = null;

  private async getDB() {
    if (!this.dbPromise) {
      this.dbPromise = openDB("drivelegal-data", 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("law-files")) {
            db.createObjectStore("law-files", { keyPath: "key" });
          }
        },
      });
    }
    return this.dbPromise;
  }
  
  async loadViolations(stateCode = "central"): Promise<Violation[]> {
    const key = stateCode.toLowerCase();
    
    // Stage 1: Memory cache
    const cached = this.memoryCache.get(key);
    if (cached) return cached;

    // Deduplicate concurrent requests
    const inFlight = this.loadPromises.get(key);
    if (inFlight) return inFlight;

    const loadPromise = this.loadFromTiers(key);
    this.loadPromises.set(key, loadPromise);
    
    try {
      const result = await loadPromise;
      this.memoryCache.set(key, result);
      return result;
    } finally {
      this.loadPromises.delete(key);
    }
  }

  private async loadFromTiers(stateCode: string): Promise<Violation[]> {
    // Stage 2: IndexedDB
    try {
      const idbData = await this.loadFromIDB(stateCode);
      if (idbData && this.isFresh(idbData)) {
        // Background refresh
        this.refreshInBackground(stateCode);
        return idbData.violations;
      }
    } catch (e) {
      console.warn("IDB load failed:", e);
    }

    // Stage 3 + 4: Network (Service Worker handles caching)
    try {
      const networkData = await this.loadFromNetwork(stateCode);
      await this.saveToIDB(stateCode, networkData);
      return networkData.violations;
    } catch (e) {
      console.warn("Network load failed:", e);
    }

    // Stage 5: Bundled fallback
    return this.loadBundledFallback(stateCode);
  }

  private async loadFromIDB(stateCode: string): Promise<LawDataFile | null> {
    try {
      const db = await this.getDB();
      const result = await db.get("law-files", `laws-${stateCode}`);
      return result?.data ?? null;
    } catch {
      return null;
    }
  }

  private async saveToIDB(stateCode: string, data: LawDataFile): Promise<void> {
    try {
      const db = await this.getDB();
      await db.put("law-files", {
        key: `laws-${stateCode}`,
        data,
        cachedAt: Date.now(),
      });
    } catch (e) {
      console.warn("Save to IDB failed:", e);
    }
  }

  private isFresh(data: LawDataFile): boolean {
    // Check if the data has a timestamp. ViolationsDataset schema has document_metadata.extraction_timestamp
    if (!data.document_metadata?.extraction_timestamp) return false;
    const updated = new Date(data.document_metadata.extraction_timestamp).getTime();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - updated < sevenDays;
  }

  private async loadFromNetwork(stateCode: string): Promise<LawDataFile> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    
    try {
      const response = await fetch(`/data/laws/in/${stateCode}.json`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } finally {
      clearTimeout(timeout);
    }
  }

  private async loadBundledFallback(stateCode: string): Promise<Violation[]> {
    try {
      // Use fetch to get project-local JSON as fallback
      const response = await fetch(`/data/laws/in/${stateCode === "central" ? "central" : stateCode}.json`);
      if (!response.ok) {
        if (stateCode !== "central") return this.loadBundledFallback("central");
        throw new Error("Fallback failed");
      }
      const data = (await response.json()) as LawDataFile;
      return data.violations ?? [];
    } catch {
      return [];
    }
  }

  private refreshInBackground(stateCode: string): void {
    if (typeof window === "undefined") return;
    
    setTimeout(() => {
      this.loadFromNetwork(stateCode)
        .then((data) => {
          this.saveToIDB(stateCode, data);
          this.memoryCache.set(stateCode, data.violations);
        })
        .catch(() => {});
    }, 1000);
  }
}

export const dataLoader = new DriveLegalDataLoader();
