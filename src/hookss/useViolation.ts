"use client";

import { useState, useEffect, useCallback } from "react";
import { buildSearchIndex, searchViolations } from "@/lib/law-engine/search";
import type { Violation } from "@/types/violation";

let cachedViolations: Violation[] | null = null;

export function useViolations() {
  const [violations, setViolations] = useState<Violation[]>(cachedViolations ?? []);
  const [loading, setLoading] = useState(cachedViolations === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cachedViolations !== null) return;

    async function load() {
      try {
        const res = await fetch("/data/laws/in/central.json");
        if (!res.ok) throw new Error("Failed to load law data");
        const data = await res.json();
        cachedViolations = data.violations ?? [];
        buildSearchIndex(cachedViolations!);
        setViolations(cachedViolations!);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load violations");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const search = useCallback(
    (query: string, vehicleType?: string | null) => searchViolations(query, vehicleType),
    []
  );

  const getById = useCallback(
    (id: string) => violations.find((v) => v.id === id) ?? null,
    [violations]
  );

  return { violations, loading, error, search, getById };
}
