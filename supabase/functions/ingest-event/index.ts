import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import ngeohash from "https://esm.sh/ngeohash@0.6.3";

// ═══════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════
type EventType = "scan" | "calc" | "ask";

interface BasePayload {
  type: EventType;
  state_code?: unknown;
  lat?: unknown;
  lng?: unknown;
}

interface ScanPayload extends BasePayload {
  type: "scan";
  vehicle_type?: unknown;
  charged_total_inr?: unknown;
  legal_total_inr?: unknown;
  overcharge_total_inr?: unknown;
  status: unknown;
  confidence: unknown;
  violation_ids?: unknown;
  sections?: unknown;
  pack_id?: unknown;
  pack_version?: unknown;
}

interface CalcPayload extends BasePayload {
  type: "calc";
  vehicle_type?: unknown;
  violation_id?: unknown;
  section?: unknown;
  category?: unknown;
  severity?: unknown;
  applied_fine_inr?: unknown;
  pack_id?: unknown;
  pack_version?: unknown;
  source?: unknown;
}

interface AskPayload extends BasePayload {
  type: "ask";
  language?: unknown;
  intent_confidence?: unknown;
  resolved_offline?: unknown;
  matched_violation_ids?: unknown;
}

// ═══════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════
const VALID_STATES = new Set([
  "AN","AP","AR","AS","BR","CH","CG","DD","DL","GA","GJ",
  "HR","HP","JK","JH","KA","KL","LA","LD","MP","MH","MN",
  "ML","MZ","NL","OR","PY","PB","RJ","SK","TN","TS","TR",
  "UP","UK","WB",
]);

const VALID_VEHICLE = new Set([
  "2W","3W","4W","LMV","HMV","transport","non_transport","all",
]);

const VALID_STATUS = new Set([
  "correct","overcharged","undercharged","unverified",
]);

const VALID_CONFIDENCE = new Set(["high","medium","low"]);
const VALID_SOURCE = new Set(["manual","nlp"]);

// Rate limiting (in-memory per instance)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 60;
const RATE_WINDOW_MS = 60_000;

// ═══════════════════════════════════════════════════
// VALIDATORS
// ═══════════════════════════════════════════════════
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

function safeState(val: unknown): string | null {
  if (typeof val !== "string") return null;
  const c = val.trim().toUpperCase();
  return VALID_STATES.has(c) ? c : null;
}

function safeGeohash5(lat: unknown, lng: unknown): string | null {
  const la = Number(lat);
  const lo = Number(lng);
  if (!Number.isFinite(la) || !Number.isFinite(lo)) return null;
  if (la < -90 || la > 90 || lo < -180 || lo > 180) return null;
  try {
    return ngeohash.encode(la, lo, 5);
  } catch {
    return null;
  }
}

function safeInt(
  val: unknown,
  min = 0,
  max = 10_000_000
): number | null {
  const n = Number(val);
  if (!Number.isFinite(n)) return null;
  const i = Math.round(n);
  if (i < min || i > max) return null;
  return i;
}

function safeStringArray(
  val: unknown,
  maxItems = 10,
  maxLen = 150
): string[] {
  if (!Array.isArray(val)) return [];
  return val
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim().slice(0, maxLen))
    .filter(Boolean)
    .slice(0, maxItems);
}

function safeEnum<T extends string>(
  val: unknown,
  allowed: Set<T>,
  fallback: T | null = null
): T | null {
  if (typeof val !== "string") return fallback;
  return allowed.has(val as T) ? (val as T) : fallback;
}

function safeString(val: unknown, maxLen = 50): string | null {
  if (typeof val !== "string") return null;
  const t = val.trim().slice(0, maxLen);
  return t || null;
}

// ═══════════════════════════════════════════════════
// CORS HEADERS
// ═══════════════════════════════════════════════════
const CORS = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ═══════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════
serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (req.method !== "POST") {
    return err("Method not allowed", 405);
  }

  // Rate limit
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return err("Too many requests", 429);
  }

  // Parse body
  let payload: BasePayload;
  try {
    payload = await req.json();
  } catch {
    return err("Invalid JSON", 400);
  }

  if (!payload || typeof payload !== "object") {
    return err("Invalid payload", 400);
  }

  // Compute geohash_5 (discard lat/lng after this point)
  const geohash_5 = safeGeohash5(payload.lat, payload.lng);
  const state_code = safeState(payload.state_code);

  // Supabase service role client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  // Route by type
  switch (payload.type) {
    case "scan":
      return handleScan(supabase, payload as ScanPayload, state_code, geohash_5);
    case "calc":
      return handleCalc(supabase, payload as CalcPayload, state_code, geohash_5);
    case "ask":
      return handleAsk(supabase, payload as AskPayload, state_code, geohash_5);
    default:
      return err("Unknown event type", 400);
  }
});

// ═══════════════════════════════════════════════════
// SCAN HANDLER
// ═══════════════════════════════════════════════════
async function handleScan(
  supabase: ReturnType<typeof createClient>,
  p: ScanPayload,
  state_code: string | null,
  geohash_5: string | null
): Promise<Response> {
  const status = safeEnum(p.status, VALID_STATUS);
  if (!status) return err("Invalid status", 400);

  const confidence = safeEnum(p.confidence, VALID_CONFIDENCE);

  const charged = safeInt(p.charged_total_inr);
  const legal = safeInt(p.legal_total_inr);
  const overcharge = safeInt(p.overcharge_total_inr);

  // Cross-validate amounts
  if (
    charged !== null &&
    legal !== null &&
    overcharge !== null &&
    status === "overcharged"
  ) {
    const expected = (charged ?? 0) - (legal ?? 0);
    if (Math.abs((overcharge ?? 0) - expected) > 100) {
      console.warn("[ingest-event/scan] Amount mismatch:", {
        charged, legal, overcharge, expected,
      });
    }
  }

  const { error } = await supabase.from("scan_events").insert({
    state_code,
    geohash_5,
    vehicle_type: safeEnum(p.vehicle_type, VALID_VEHICLE),
    charged_total_inr: charged,
    legal_total_inr: legal,
    overcharge_total_inr: overcharge,
    status,
    confidence,
    violation_ids: safeStringArray(p.violation_ids, 10, 150),
    sections: safeStringArray(p.sections, 10, 50),
    pack_id: safeString(p.pack_id, 50),
    pack_version: safeString(p.pack_version, 20),
  });

  if (error) {
    console.error("[ingest-event/scan] DB error:", error);
    return err("Insert failed", 500);
  }

  return ok({ received: true });
}

// ═══════════════════════════════════════════════════
// CALC HANDLER
// ═══════════════════════════════════════════════════
async function handleCalc(
  supabase: ReturnType<typeof createClient>,
  p: CalcPayload,
  state_code: string | null,
  geohash_5: string | null
): Promise<Response> {
  const severity = safeInt(p.severity, 1, 5);

  const { error } = await supabase.from("calc_events").insert({
    state_code,
    geohash_5,
    vehicle_type: safeEnum(p.vehicle_type, VALID_VEHICLE),
    violation_id: safeString(p.violation_id, 200),
    section: safeString(p.section, 50),
    category: safeString(p.category, 50),
    severity: severity as (1|2|3|4|5) | null,
    applied_fine_inr: safeInt(p.applied_fine_inr, 0, 500_000),
    pack_id: safeString(p.pack_id, 50),
    pack_version: safeString(p.pack_version, 20),
    source: safeEnum(p.source, VALID_SOURCE) ?? "manual",
  });

  if (error) {
    console.error("[ingest-event/calc] DB error:", error);
    return err("Insert failed", 500);
  }

  return ok({ received: true });
}

// ═══════════════════════════════════════════════════
// ASK HANDLER
// ═══════════════════════════════════════════════════
async function handleAsk(
  supabase: ReturnType<typeof createClient>,
  p: AskPayload,
  state_code: string | null,
  geohash_5: string | null
): Promise<Response> {
  const intentConf = typeof p.intent_confidence === "number" &&
    p.intent_confidence >= 0 &&
    p.intent_confidence <= 1
      ? p.intent_confidence
      : null;

  const { error } = await supabase.from("ask_events").insert({
    state_code,
    geohash_5,
    language: safeString(p.language, 5) ?? "en",
    intent_confidence: intentConf,
    resolved_offline: !!p.resolved_offline,
    matched_violation_ids: safeStringArray(
      p.matched_violation_ids, 10, 150
    ),
  });

  if (error) {
    console.error("[ingest-event/ask] DB error:", error);
    return err("Insert failed", 500);
  }

  return ok({ received: true });
}

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════
function ok(body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

function err(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}
