import { openDB, type IDBPDatabase } from "idb";
import type { ChatMessage } from "@/types/llm";

interface DriveLegalDB {
  "qa-history": {
    key: string;
    value: { id: string; messages: ChatMessage[]; createdAt: number; updatedAt: number };
    indexes: { "by-date": number };
  };
  preferences: {
    key: string;
    value: { key: string; value: string | boolean | number };
  };
  "cached-responses": {
    key: string;
    value: { key: string; response: string; timestamp: number; ttl: number };
  };
}

let db: IDBPDatabase<any> | null = null;

export async function getDB() {
  if (db) return db;
  db = await openDB("drivelegal", 1, {
    upgrade(database) {
      const qaStore = database.createObjectStore("qa-history", { keyPath: "id" });
      qaStore.createIndex("by-date", "updatedAt");
      database.createObjectStore("preferences", { keyPath: "key" });
      database.createObjectStore("cached-responses", { keyPath: "key" });
    },
  });
  return db;
}

export async function saveQASession(id: string, messages: ChatMessage[]): Promise<void> {
  const database = await getDB();
  await database.put("qa-history", { id, messages, createdAt: Date.now(), updatedAt: Date.now() });
}

export async function getCachedResponse(key: string): Promise<string | null> {
  const database = await getDB();
  const cached = await database.get("cached-responses", key);
  if (!cached) return null;
  if (Date.now() > cached.timestamp + cached.ttl) {
    await database.delete("cached-responses", key);
    return null;
  }
  return cached.response;
}

export async function setCachedResponse(key: string, response: string, ttlMs = 24 * 60 * 60 * 1000): Promise<void> {
  const database = await getDB();
  await database.put("cached-responses", { key, response, timestamp: Date.now(), ttl: ttlMs });
}

export async function getPreference<T extends string | boolean | number>(key: string, defaultValue: T): Promise<T> {
  const database = await getDB();
  const pref = await database.get("preferences", key);
  return (pref?.value as T) ?? defaultValue;
}

export async function setPreference(key: string, value: string | boolean | number): Promise<void> {
  const database = await getDB();
  await database.put("preferences", { key, value });
}
