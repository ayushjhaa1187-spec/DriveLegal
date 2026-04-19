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

// In-memory cache keyed by stateCode (or "central" for central-only)
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
 * Load merged violations for a given state.
 * State overrides REPLACE matching central entries by `section`.
 * If no state file exists, falls back to central-only.
 */
export async function loadViolations(stateCode: string | null): Promise<Violation[]> {
  const cacheKey = stateCode ?? "central";

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  // Always load central law
  const centralData = await fetchDataset("/data/laws/in/central.json");
  const central = centralData?.violations ?? [];

  if (!stateCode) {
    cache.set(cacheKey, central);
    return central;
  }

  // Try to load state override
  const stateData = await fetchDataset(`/data/laws/in/${stateCode}.json`);
  const stateViolations = stateData?.violations ?? [];

  if (stateViolations.length === 0) {
    // No override file for this state — use central
    cache.set(cacheKey, central);
    return central;
  }

  // Build a map of sections overridden by the state
  const overriddenSections = new Set(
    stateViolations
      .map((v) => v.section)
      .filter(Boolean)
  );

  // Keep central entries whose section is NOT overridden by the state
  const filteredCentral = central.filter(
    (v) => !v.section || !overriddenSections.has(v.section)
  );

  // Merge: state overrides first, then remaining central entries
  const merged = [...stateViolations, ...filteredCentral];

  cache.set(cacheKey, merged);
  return merged;
}

/** Clear the cache (useful for testing or hot-reload) */
export function clearViolationCache(): void {
  cache.clear();
}

/** Expose the full list of states that have override files */
export const STATES_WITH_OVERRIDES: string[] = ["MH", "KA", "DL"];
