import { openDB, IDBPDatabase } from "idb";

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════
export interface ScanSummary {
  state_code: string | null;
  lat?: number;
  lng?: number;
  vehicle_type: string | null;
  charged_total_inr: number | null;
  legal_total_inr: number | null;
  overcharge_total_inr: number | null;
  status: "correct"|"overcharged"|"undercharged"|"unverified";
  confidence: "high"|"medium"|"low";
  violation_ids: string[];
  sections: string[];
  pack_id: string;
  pack_version: string;
}

export interface CalcSummary {
  state_code: string | null;
  lat?: number;
  lng?: number;
  vehicle_type: string | null;
  violation_id: string;
  section: string | null;
  category: string | null;
  severity: number | null;
  applied_fine_inr: number | null;
  pack_id: string;
  pack_version: string;
  source: "manual"|"nlp";
}

export interface AskSummary {
  state_code: string | null;
  lat?: number;
  lng?: number;
  language: string;
  intent_confidence: number | null;
  resolved_offline: boolean;
  matched_violation_ids: string[];
}

interface QueuedEvent {
  id: string;
  type: "scan"|"calc"|"ask";
  payload: Record<string, unknown>;
  createdAt: number;
  retries: number;
}

// ═══════════════════════════════════════════════════
// CONFIG
// ═══════════════════════════════════════════════════
const INGEST_URL =
  `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/ingest-event`;

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

// ═══════════════════════════════════════════════════
// OFFLINE QUEUE (IndexedDB)
// ═══════════════════════════════════════════════════
let dbPromise: Promise<IDBPDatabase<unknown>> | null = null;

async function getQueueDB() {
  if (typeof window === "undefined") return null;
  if (!dbPromise) {
    dbPromise = openDB("drivelegal-queue", 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains("events")) {
          const store = db.createObjectStore("events", { keyPath: "id" });
          store.createIndex("createdAt", "createdAt");
        }
      },
    });
  }
  return dbPromise;
}

async function enqueue(event: QueuedEvent): Promise<void> {
  try {
    const db = await getQueueDB();
    if (!db) return;
    await db.put("events", event);
  } catch (e) {
    console.warn("[emitter] Queue write failed:", e);
  }
}

async function dequeue(id: string): Promise<void> {
  try {
    const db = await getQueueDB();
    if (!db) return;
    await db.delete("events", id);
  } catch (e) {
    console.warn("[emitter] Queue delete failed:", e);
  }
}

async function getAllQueued(): Promise<QueuedEvent[]> {
  try {
    const db = await getQueueDB();
    if (!db) return [];
    return await db.getAll("events");
  } catch {
    return [];
  }
}

// ═══════════════════════════════════════════════════
// SEND (with retry)
// ═══════════════════════════════════════════════════
async function sendEvent(
  type: "scan"|"calc"|"ask",
  payload: Record<string, unknown>
): Promise<void> {
  const event: QueuedEvent = {
    id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    type,
    payload: { ...payload, type },
    createdAt: Date.now(),
    retries: 0,
  };

  if (typeof window !== "undefined" && !navigator.onLine) {
    await enqueue(event);
    return;
  }

  await attemptSend(event);
}

async function attemptSend(event: QueuedEvent): Promise<void> {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      console.warn("[emitter] NEXT_PUBLIC_SUPABASE_URL not set, dropping event");
      return;
    }

    const res = await fetch(INGEST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event.payload),
    });

    if (res.ok) {
      await dequeue(event.id);
      return;
    }

    // 4xx = don't retry (bad payload)
    if (res.status >= 400 && res.status < 500) {
      console.warn("[emitter] Bad payload, dropping event:", res.status);
      await dequeue(event.id);
      return;
    }

    // 5xx = retry
    throw new Error(`Server error: ${res.status}`);
  } catch (e) {
    event.retries++;
    if (event.retries >= MAX_RETRIES) {
      console.warn("[emitter] Max retries reached, dropping event:", event.id);
      await dequeue(event.id);
      return;
    }
    await enqueue(event);
  }
}

// ═══════════════════════════════════════════════════
// FLUSH QUEUE (call on online event)
// ═══════════════════════════════════════════════════
export async function flushQueue(): Promise<void> {
  if (typeof window !== "undefined" && !navigator.onLine) return;

  const queued = await getAllQueued();
  if (queued.length === 0) return;

  for (const event of queued) {
    // Small delay between flush items to avoid burst
    await new Promise((r) => setTimeout(r, 500));
    await attemptSend(event);
  }
}

// Register flush on reconnect
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    flushQueue().catch(console.warn);
  });
}

// ═══════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════
export async function emitScanSummary(summary: ScanSummary): Promise<void> {
  try {
    await sendEvent("scan", summary as unknown as Record<string, unknown>);
  } catch (e) {
    console.warn("[emitter] emitScanSummary failed:", e);
  }
}

export async function emitCalcEvent(summary: CalcSummary): Promise<void> {
  try {
    await sendEvent("calc", summary as unknown as Record<string, unknown>);
  } catch (e) {
    console.warn("[emitter] emitCalcEvent failed:", e);
  }
}

export async function emitAskEvent(summary: AskSummary): Promise<void> {
  try {
    await sendEvent("ask", summary as unknown as Record<string, unknown>);
  } catch (e) {
    console.warn("[emitter] emitAskEvent failed:", e);
  }
}

// Legacy track function for compatibility
export function track(event: string, props?: Record<string, unknown>) {
  // Map legacy track calls if needed, or eventually remove
  console.log(`[analytics] Legacy track called for: ${event}`, props);
}
