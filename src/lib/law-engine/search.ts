import Fuse from "fuse.js";
import type { Violation, VehicleType } from "@/types/violation";

let fuseInstance: Fuse<Violation> | null = null;

export function buildSearchIndex(violations: Violation[]): void {
  fuseInstance = new Fuse(violations, {
    keys: [
      { name: "title.en", weight: 0.4 },
      { name: "plain_english_summary", weight: 0.3 },
      { name: "section", weight: 0.2 },
      { name: "category", weight: 0.1 },
    ],
    threshold: 0.4,
    includeScore: true,
    minMatchCharLength: 2,
  });
}

export function searchViolations(
  query: string,
  vehicleType?: string | null,
  limit = 10
): Violation[] {
  if (!fuseInstance) return [];

  let results = fuseInstance.search(query, { limit: limit * 2 });

  if (vehicleType && vehicleType !== "all") {
    results = results.filter(
      (r) =>
        r.item.applies_to.includes("all") ||
        r.item.applies_to.includes(vehicleType as VehicleType)
    );
  }

  return results.slice(0, limit).map((r) => r.item);
}

export function getViolationById(
  violations: Violation[],
  id: string
): Violation | null {
  return violations.find((v) => v.id === id) ?? null;
}

export function getViolationsByCategory(
  violations: Violation[],
  category: string,
  vehicleType?: string | null
): Violation[] {
  return violations.filter(
    (v) =>
      v.category === category &&
      (!vehicleType ||
        vehicleType === "all" ||
        v.applies_to.includes("all") ||
        v.applies_to.includes(vehicleType as VehicleType))
  );
}
