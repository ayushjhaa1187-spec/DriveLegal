import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// build-state-digest.ts
// Reads all _normalized_overrides.json files for a state and produces
// data/digests/states/[STATE].json  — the UI-ready State Digest.
// Usage:  npx tsx build-state-digest.ts --state=MH
// ---------------------------------------------------------------------------

interface Override {
  offense_code?: string;
  offense_description: string;
  section: string;
  compounding_amount?: number;
  fine_min?: number;
  fine_max?: number;
  unit?: string;
  source_url: string;
  source_page?: number;
  source_text_excerpt: string;
  confidence: "high" | "medium" | "low";
  has_conflict?: boolean;
  conflict_note?: string;
}

interface NormalizedOutput {
  state_code: string;
  generated_at: string;
  docs_processed: number;
  rows: Override[];
  conflict_details: Override[];
}

interface StateDigest {
  state_code: string;
  generated_at: string;
  source_doc_count: number;
  total_overrides: number;
  conflict_count: number;
  coverage_note: string;
  key_highlights: string[];
  overrides: Override[];
  conflicts: Override[];
}

function buildHighlights(rows: Override[]): string[] {
  const highlights: string[] = [];

  // Top compounding amounts
  const withAmount = rows
    .filter((r) => r.compounding_amount != null)
    .sort((a, b) => (b.compounding_amount ?? 0) - (a.compounding_amount ?? 0));

  if (withAmount.length > 0) {
    const top = withAmount[0];
    highlights.push(
      `Highest compounding fee: ₹${top.compounding_amount} for "${top.offense_description}" (${top.section})`
    );
  }

  const minAmount = withAmount[withAmount.length - 1];
  if (minAmount && withAmount.length > 1) {
    highlights.push(
      `Lowest compounding fee: ₹${minAmount.compounding_amount} for "${minAmount.offense_description}" (${minAmount.section})`
    );
  }

  // Unique sections covered
  const sections = [...new Set(rows.map((r) => r.section))];
  highlights.push(`Sections covered: ${sections.slice(0, 8).join(", ")}${sections.length > 8 ? " ..." : ""}`);

  // High-confidence count
  const highConf = rows.filter((r) => r.confidence === "high").length;
  highlights.push(`${highConf} of ${rows.length} overrides verified with high confidence`);

  return highlights;
}

async function buildDigest(stateCode: string): Promise<void> {
  const extractedBase = path.join(
    process.cwd(),
    "data",
    "extracted",
    "state-docs",
    stateCode
  );

  if (!fs.existsSync(extractedBase)) {
    console.error(`No extracted data found for state: ${stateCode}`);
    console.error(`Expected directory: ${extractedBase}`);
    process.exit(1);
  }

  // Collect all normalized override files
  const docDirs = fs
    .readdirSync(extractedBase)
    .filter((d) => fs.statSync(path.join(extractedBase, d)).isDirectory());

  let allRows: Override[] = [];
  let allConflicts: Override[] = [];
  let docsProcessed = 0;

  for (const docId of docDirs) {
    const normPath = path.join(extractedBase, docId, "_normalized_overrides.json");
    if (!fs.existsSync(normPath)) {
      console.warn(`  [skip] No normalized overrides in ${docId}`);
      continue;
    }

    const data: NormalizedOutput = JSON.parse(fs.readFileSync(normPath, "utf-8"));
    allRows.push(...data.rows);
    allConflicts.push(...(data.conflict_details ?? []));
    docsProcessed++;
    console.log(`  [ok] Loaded ${data.rows.length} rows from ${docId}`);
  }

  if (docsProcessed === 0) {
    console.error("No normalized override files found. Run normalize-overrides.ts first.");
    process.exit(1);
  }

  // Deduplicate by section + offense_description
  const seen = new Set<string>();
  const deduped: Override[] = [];
  for (const row of allRows) {
    const key = `${row.section}::${row.offense_description.toLowerCase().trim()}`;
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(row);
    }
  }

  const highlights = buildHighlights(deduped);

  const coverageNote =
    docsProcessed === 1
      ? `Based on ${docsProcessed} source document. More sources may be available.`
      : `Aggregated from ${docsProcessed} source documents.`;

  const digest: StateDigest = {
    state_code: stateCode,
    generated_at: new Date().toISOString(),
    source_doc_count: docsProcessed,
    total_overrides: deduped.length,
    conflict_count: allConflicts.length,
    coverage_note: coverageNote,
    key_highlights: highlights,
    overrides: deduped,
    conflicts: allConflicts,
  };

  // Write output
  const outDir = path.join(process.cwd(), "data", "digests", "states");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${stateCode}.json`);
  fs.writeFileSync(outPath, JSON.stringify(digest, null, 2));

  console.log(`\nDigest built for ${stateCode}:`);
  console.log(`  Total overrides : ${deduped.length}`);
  console.log(`  Conflicts       : ${allConflicts.length}`);
  console.log(`  Docs processed  : ${docsProcessed}`);
  console.log(`  Output          : ${outPath}`);
}

// ---- CLI -------------------------------------------------------------------

const stateArg = process.argv.find((a) => a.startsWith("--state="))?.split("=")[1];

if (!stateArg) {
  console.error("Usage: npx tsx build-state-digest.ts --state=MH");
  process.exit(1);
}

buildDigest(stateArg.toUpperCase());
