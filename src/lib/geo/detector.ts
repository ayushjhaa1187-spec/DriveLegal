/**
 * State Detection Service
 *
 * 3-pass detection:
 *   1. navigator.geolocation → Nominatim OSM reverse geocode
 *   2. /api/geo edge route (Cloudflare CF-Region header)
 *   3. null → manual override
 *
 * Result is cached in sessionStorage (one detection per tab session).
 */

import { INDIA_STATES } from "@/lib/law-engine/states";

export type DetectionMethod = "gps" | "ip" | "manual" | "none";

export interface StateDetectionResult {
  stateCode: string | null;
  stateName: string | null;
  method: DetectionMethod;
  error?: string;
}

const SESSION_KEY = "dl_detected_state";

// ─── Nominatim OSM reverse geocode ───────────────────────────────────────────

const STATE_NAME_MAP: Record<string, string> = Object.fromEntries(
  INDIA_STATES.map((s) => [s.name.toLowerCase(), s.code])
);

// A few common alternate names Nominatim might return
const NOMINATIM_ALIASES: Record<string, string> = {
  "uttarakhand": "UT",
  "uttaranchal": "UT",
  "orissa": "OR",
  "pondicherry": "PY",
  "j&k": "JK",
  "jammu and kashmir": "JK",
  "delhi": "DL",
  "national capital territory of delhi": "DL",
  "andaman and nicobar islands": "AN",
};

function resolveStateCode(stateName: string): string | null {
  const lower = stateName.toLowerCase().trim();
  // Try direct map
  for (const [key, code] of Object.entries(STATE_NAME_MAP)) {
    if (lower === key || lower.includes(key)) return code;
  }
  // Try aliases
  for (const [alias, code] of Object.entries(NOMINATIM_ALIASES)) {
    if (lower.includes(alias)) return code;
  }
  return null;
}

async function detectByGPS(): Promise<StateDetectionResult> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ stateCode: null, stateName: null, method: "none", error: "Geolocation not supported" });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=5&accept-language=en`;
          const res = await fetch(url, {
            headers: { "User-Agent": "DriveLegal/1.0 (legal-calculator)" },
          });
          if (!res.ok) throw new Error("Nominatim returned non-OK");
          const data = await res.json();
          const rawState =
            data.address?.state ??
            data.address?.region ??
            data.address?.county;

          if (!rawState) throw new Error("No state in Nominatim response");

          const stateCode = resolveStateCode(rawState);
          const stateName = INDIA_STATES.find((s) => s.code === stateCode)?.name ?? rawState;

          resolve({ stateCode, stateName, method: "gps" });
        } catch (e: any) {
          resolve({ stateCode: null, stateName: null, method: "gps", error: e.message });
        }
      },
      (err) => {
        resolve({ stateCode: null, stateName: null, method: "none", error: err.message });
      },
      { timeout: 6000, maximumAge: 300_000 }
    );
  });
}

async function detectByIP(): Promise<StateDetectionResult> {
  try {
    const res = await fetch("/api/geo");
    if (!res.ok) throw new Error("geo route returned non-OK");
    const data = await res.json();
    if (!data.stateCode) return { stateCode: null, stateName: null, method: "ip", error: "No IP-based state" };
    const stateName = INDIA_STATES.find((s) => s.code === data.stateCode)?.name ?? null;
    return { stateCode: data.stateCode, stateName, method: "ip" };
  } catch (e: any) {
    return { stateCode: null, stateName: null, method: "ip", error: e.message };
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Detect user's state. Uses sessionStorage cache to avoid repeated requests. */
export async function detectState(): Promise<StateDetectionResult> {
  // Check session cache
  try {
    const cached = sessionStorage.getItem(SESSION_KEY);
    if (cached) return JSON.parse(cached) as StateDetectionResult;
  } catch {
    // sessionStorage may be unavailable (sandboxed iframes, etc.) — continue
  }

  // Pass 1: GPS
  const gpsResult = await detectByGPS();
  if (gpsResult.stateCode) {
    cacheResult(gpsResult);
    return gpsResult;
  }

  // Pass 2: IP / Cloudflare header
  const ipResult = await detectByIP();
  if (ipResult.stateCode) {
    cacheResult(ipResult);
    return ipResult;
  }

  // Pass 3: Fallback — let user pick manually
  const fallback: StateDetectionResult = { stateCode: null, stateName: null, method: "none" };
  return fallback;
}

function cacheResult(result: StateDetectionResult): void {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(result));
  } catch {
    // ignore storage errors
  }
}

/** Clear cached state (used when user manually overrides) */
export function clearDetectedState(): void {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}
