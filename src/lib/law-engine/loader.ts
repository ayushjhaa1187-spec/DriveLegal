/**
 * Law Engine Loader
 *
 * Loads, merges, and caches violation records from:
 *   - /data/laws/in/central.json  (always loaded)
 *   - /data/laws/in/{STATE}.json  (loaded on demand, merged on top)
 *
 * State overrides win on matching `section` + `applies_to` intersection.
 * Result is a flat Violation[] with jurisdiction already resolved.
 */

import type { Violation } from "./schema";

interface LoadedDataset {
  violations: Violation[];
}

// In-memory cache keyed by "country:state"
const cache = new Map<string, Violation[]>();

async function fetchDataset(path: string): Promise<LoadedDataset | null> {
  try {
    const res = await fetch(path, { cache: "force-cache" });
    if (!res.ok) return null;
    const json = await res.json();
    return { violations: json.violations ?? [] };
  } catch {
    return null;
  }
}

/**
 * Load merged violations for a given country and state.
 * Supports:
 * 1. Global (country only): /data/lawpacks/global/{country}/1.0.0/violations.json
 * 2. Domestic (India): /data/lawpacks/in/{state || central}/1.0.0/violations.json
 */
export async function loadViolations(stateCode: string | null, countryCode: string = "in"): Promise<Violation[]> {
  const cacheKey = `${countryCode}:${stateCode ?? "central"}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  // ─── Global Strategy ───────────────────────────────────────────────────────
  if (countryCode.toLowerCase() !== "in") {
    const globalData = await fetchDataset(`/data/lawpacks/global/${countryCode.toLowerCase()}/1.0.0/violations.json`);
    const violations = globalData?.violations ?? [];
    cache.set(cacheKey, violations);
    return violations;
  }

  // ─── India Strategy ────────────────────────────────────────────────────────
  // Always load central law as baseline
  const centralData = await fetchDataset("/data/lawpacks/in/central/1.0.0/violations.json");
  const central = centralData?.violations ?? [];

  if (!stateCode || stateCode === "central") {
    cache.set(cacheKey, central);
    return central;
  }

  // Try to load state override
  const stateData = await fetchDataset(`/data/lawpacks/in/${stateCode.toLowerCase()}/1.0.0/violations.json`);
  const stateViolations = stateData?.violations ?? [];

  if (stateViolations.length === 0) {
    cache.set(cacheKey, central);
    return central;
  }

  // Merge: state overrides REPLACE central entries with matching section
  const overriddenSections = new Set(
    stateViolations.map((v) => v.section).filter(Boolean)
  );

  const filteredCentral = central.filter(
    (v) => !v.section || !overriddenSections.has(v.section)
  );

  const merged = [...stateViolations, ...filteredCentral];
  cache.set(cacheKey, merged);
  return merged;
}

export function clearViolationCache(): void {
  cache.clear();
}
