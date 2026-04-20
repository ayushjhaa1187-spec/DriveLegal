import { openDB, type IDBPDatabase } from "idb";

export interface QueuedRequest {
  id: string;
  url: string;
  method: "POST" | "PUT" | "DELETE" | "PATCH";
  body: any;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
  type: "hotspot" | "legal_lead" | "other";
}

class OfflineQueue {
  private dbPromise: Promise<IDBPDatabase> | null = null;

  private async getDB() {
    if (!this.dbPromise) {
      this.dbPromise = openDB("drivelegal-q", 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains("sync-queue")) {
            db.createObjectStore("sync-queue", { keyPath: "id" });
          }
        },
      });
    }
    return this.dbPromise;
  }

  async enqueue(request: Omit<QueuedRequest, "id" | "timestamp" | "retryCount">) {
    const db = await this.getDB();
    const id = crypto.randomUUID();
    const queued: QueuedRequest = {
      ...request,
      id,
      timestamp: Date.now(),
      retryCount: 0,
    };
    await db.put("sync-queue", queued);
    
    // Attempt immediate sync if online
    if (navigator.onLine) {
      this.sync();
    }
    
    return id;
  }

  async sync() {
    const db = await this.getDB();
    const all = await db.getAll("sync-queue");
    
    if (all.length === 0) return;

    console.log(`[OfflineQueue] Attempting to sync ${all.length} items...`);

    for (const item of all) {
      try {
        const response = await fetch(item.url, {
          method: item.method,
          headers: {
            "Content-Type": "application/json",
            ...item.headers,
          },
          body: JSON.stringify(item.body),
        });

        if (response.ok) {
          await db.delete("sync-queue", item.id);
          console.log(`[OfflineQueue] Synced ${item.type} (${item.id}) successfully`);
        } else {
          // Increment retry count if it failed with server error
          item.retryCount += 1;
          if (item.retryCount > 5) {
             console.warn(`[OfflineQueue] Item ${item.id} failed too many times. Deleting.`);
             await db.delete("sync-queue", item.id);
          } else {
             await db.put("sync-queue", item);
          }
        }
      } catch (err) {
        console.error(`[OfflineQueue] Sync failed for ${item.id}:`, err);
        // It remains in queue for next attempt
        break; // Stop syncing if network is down again
      }
    }
  }

  async getQueueSize() {
    const db = await this.getDB();
    return db.count("sync-queue");
  }
}

export const offlineQueue = new OfflineQueue();

if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    offlineQueue.sync();
  });
}
