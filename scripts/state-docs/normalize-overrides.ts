/**
 * scripts/state-docs/normalize-overrides.ts
 *
 * Step E of the state-docs pipeline:
 * Deduplicates + normalizes override rows across multiple docs for a state.
 * Handles conflicts, standardizes applies_to, and outputs a merged file.
 *
 * Run:
 *   npx tsx scripts/state-docs/normalize-overrides.ts --state=MH
 */

import fs from "node:fs/promises";
import path from "node:path";
import type { OverrideRow, OverridesFile } from "./extract-overrides.js";

const ROOT = process.cwd();
const EXTRACTED_DIR = path.join(ROOT, "data/extracted/state-docs");

// Canonical section name: "Section 194D" → normalized
function normalizeSection(s: string | null): string | null {
  if (!s) return null;
  return s.trim().replace(/^sec\.?\s*/i, "Section ").replace(/\s+/g, " ");
}

// Normalize applies_to: dedup + sort
function normalizeAppliesTo(arr: string[]): string[] {
  const canonical: Record<string, string> = {
    "2w": "2W", "two-wheeler": "2W", "twowheeler": "2W", "motorcycle": "2W",
    "4w": "4W", "four-wheeler": "4W", "car": "4W", "lmv": "4W",
    "hmv": "HMV", "heavy": "HMV", "truck": "HMV", "bus": "HMV",
    "3w": "3W", "auto": "3W", "threewheeler": "3W",
    "all": "all"
  };
  const normalized = arr
    .map(a => canonical[a.toLowerCase()] ?? a.toUpperCase())
    .filter((v, i, arr) => arr.indexOf(v) === i)
    .sort();
  return normalized.length ? normalized : ["all"];
}

type ConflictGroup = {
  section: string;
  rows: OverrideRow[];
  has_conflict: boolean;
  resolved_amount: number | null;
  resolution_note: string;
};

function resolveConflict(rows: OverrideRow[]): ConflictGroup {
  const section = rows[0].section ?? "unknown";
  const amounts = rows.map(r => r.amount_inr).filter(a => a !== null) as number[];
  const uniqueAmounts = [...new Set(amounts)];
  const hasConflict = uniqueAmounts.length > 1;

  let resolvedAmount: number | null = null;
  let resolutionNote = "";

  if (!hasConflict) {
    resolvedAmount = amounts[0] ?? null;
    resolutionNote = "Consistent across all sources";
  } else {
    // Prefer state_compounding_schedule over police_echallan_table
    const scheduleRows = rows.filter(r => (r as any).doc_type === "state_compounding_schedule");
    if (scheduleRows.length && scheduleRows[0].amount_inr !== null) {
      resolvedAmount = scheduleRows[0].amount_inr;
      resolutionNote = `Conflict: amounts ${uniqueAmounts.join(", ")}. Using state_compounding_schedule value.`;
    } else {
      // Use highest-confidence row
      const highConf = rows.find(r => r.confidence === "high");
      resolvedAmount = highConf?.amount_inr ?? rows[0].amount_inr;
      resolutionNote = `Conflict: amounts ${uniqueAmounts.join(", ")}. Using highest-confidence value. Manual review recommended.`;
    }
  }

  return {
    section,
    rows,
    has_conflict: hasConflict,
    resolved_amount: resolvedAmount,
    resolution_note: resolutionNote
  };
}

export async function normalizeStateOverrides(stateCode: string): Promise<void> {
  const stateDir = path.join(EXTRACTED_DIR, stateCode);
  const entries = await fs.readdir(stateDir).catch(() => []);
  const docIds = entries.filter(e => !e.startsWith("_") && !e.endsWith(".json"));

  const allRows: OverrideRow[] = [];

  for (const docId of docIds) {
    const overridesPath = path.join(stateDir, docId, "overrides.json");
    try {
      const overridesFile: OverridesFile = JSON.parse(
        await fs.readFile(overridesPath, "utf-8")
      );
      const docType = overridesFile.doc.document_type;
      for (const row of overridesFile.state_overrides) {
        allRows.push({
          ...row,
          section: normalizeSection(row.section),
          applies_to: normalizeAppliesTo(row.applies_to),
          // carry doc_type for conflict resolution
          ...(({ doc_type: docType } as any))
        } as OverrideRow);
      }
    } catch {
      // doc not yet extracted — skip
    }
  }

  // Group by normalized section
  const bySection = new Map<string, OverrideRow[]>();
  for (const row of allRows) {
    const key = row.section ?? `__no_section_${row.source_page}`;
    if (!bySection.has(key)) bySection.set(key, []);
    bySection.get(key)!.push(row);
  }

  const conflicts: ConflictGroup[] = [];
  const normalizedRows: OverrideRow[] = [];

  for (const [section, rows] of bySection) {
    const group = resolveConflict(rows);
    conflicts.push(group);

    // Output both: a clean "resolved" row + original rows with conflict flags
    const resolvedRow: OverrideRow = {
      ...rows[0],
      section,
      amount_inr: group.resolved_amount,
      notes: [
        ...rows[0].notes,
        group.resolution_note,
        ...(group.has_conflict ? [`CONFLICT: ${rows.length} sources disagree`] : [])
      ]
    };
    normalizedRows.push(resolvedRow);
  }

  const conflictCount = conflicts.filter(g => g.has_conflict).length;

  const output = {
    state_code: stateCode,
    normalized_at: new Date().toISOString(),
    total_rows: normalizedRows.length,
    conflict_count: conflictCount,
    docs_processed: docIds.length,
    rows: normalizedRows,
    conflict_details: conflicts.filter(g => g.has_conflict)
  };

  const outPath = path.join(stateDir, "_normalized_overrides.json");
  await fs.writeFile(outPath, JSON.stringify(output, null, 2));

  console.log(
    `Normalized ${normalizedRows.length} rows for ${stateCode} ` +
    `(${conflictCount} conflicts). → ${outPath}`
  );
}

// ---- CLI --------------------------------------------------------------------

const stateArg = process.argv.find(a => a.startsWith("--state="))?.split("=")[1];

if (!stateArg) {
  console.error("Usage: npx tsx normalize-overrides.ts --state=MH");
  process.exit(1);
}

normalizeStateOverrides(stateArg).catch(e => { console.error(e); process.exit(1); });
