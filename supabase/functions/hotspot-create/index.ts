import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import ngeohash from "https://esm.sh/ngeohash@0.6.3";

// ═══════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════
const VALID_TYPES = new Set([
  "overcharging",
  "frequent_checks",
  "unclear_signage",
  "dangerous_spot",
  "other",
]);

const VALID_STATES = new Set([
  "AN","AP","AR","AS","BR","CH","CG","DD","DL","GA","GJ",
  "HR","HP","JK","JH","KA","KL","LA","LD","MP","MH","MN",
  "ML","MZ","NL","OR","PY","PB","RJ","SK","TN","TS","TR",
  "UP","UK","WB",
]);

// India bounding box (strict)
const INDIA_BOUNDS = {
  minLat: 6.0,
  maxLat: 37.5,
  minLng: 68.0,
  maxLng: 97.5,
};

const MAX_HOTSPOTS_PER_DAY = 5;

const CORS = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ═══════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════
function computeGeohash6(lat: number, lng: number): string {
  return ngeohash.encode(lat, lng, 6);
}

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

// ═══════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════
serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (req.method !== "POST") return err("Method not allowed", 405);

  // Auth check
  const authHeader = req.headers.get("authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) {
    return err("Unauthorized", 401);
  }

  // Verify session using anon client
  const supabaseAnon = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    }
  );

  const { data: userData, error: authError } =
    await supabaseAnon.auth.getUser();

  if (authError || !userData?.user) {
    return err("Invalid session", 401);
  }

  const userId = userData.user.id;

  // Parse body
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return err("Invalid JSON", 400);
  }

  // Validate type
  const type = typeof body.type === "string" ? body.type : "";
  if (!VALID_TYPES.has(type)) {
    return err("Invalid hotspot type", 400);
  }

  // Validate coordinates (strict India bounds)
  const lat = Number(body.lat);
  const lng = Number(body.lng);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng) ||
    lat < INDIA_BOUNDS.minLat ||
    lat > INDIA_BOUNDS.maxLat ||
    lng < INDIA_BOUNDS.minLng ||
    lng > INDIA_BOUNDS.maxLng
  ) {
    return err("Coordinates must be within India", 400);
  }

  // Validate state_code
  const state_code =
    typeof body.state_code === "string" &&
    VALID_STATES.has(body.state_code.toUpperCase())
      ? body.state_code.toUpperCase()
      : null;

  // Sanitize description (no PII patterns)
  let description: string | null = null;
  if (typeof body.description === "string") {
    description = body.description.trim().slice(0, 300);
    // Remove anything resembling phone numbers, vehicle numbers, names
    description = description
      .replace(/\b\d{10}\b/g, "")           // phone numbers
      .replace(/[A-Z]{2}\d{2}[A-Z]{2}\d{4}/gi, "") // vehicle registration
      .trim()
      .slice(0, 300) || null;
  }

  // Rate limit: max 5 hotspots per day per user
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  const dayStart = new Date();
  dayStart.setUTCHours(0, 0, 0, 0);

  const { count, error: countError } = await supabase
    .from("hotspots")
    .select("id", { count: "exact", head: true })
    .eq("created_by", userId)
    .gte("created_at", dayStart.toISOString());

  if (countError) {
    console.error("[hotspot-create] Count query failed:", countError);
    return err("Service error", 500);
  }

  if ((count ?? 0) >= MAX_HOTSPOTS_PER_DAY) {
    return err(
      `Maximum ${MAX_HOTSPOTS_PER_DAY} hotspot reports per day`,
      429
    );
  }

  // Compute geohash_6 (discard raw lat/lng)
  let geohash_6: string;
  try {
    geohash_6 = computeGeohash6(lat, lng);
    if (!geohash_6 || geohash_6.length !== 6) {
      throw new Error("Invalid geohash computed");
    }
  } catch (e) {
    console.error("[hotspot-create] Geohash error:", e);
    return err("Location processing failed", 500);
  }

  // Insert (service role)
  const { data, error: insertError } = await supabase
    .from("hotspots")
    .insert({
      created_by: userId,
      state_code,
      geohash_6,
      type,
      description,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("[hotspot-create] Insert failed:", insertError);
    return err("Failed to create hotspot", 500);
  }

  return ok({ ok: true, id: data.id });
});
