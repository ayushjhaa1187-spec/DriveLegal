/**
 * scripts/state-docs/fetch.ts
 *
 * Step A of the state-docs pipeline:
 * Downloads PDFs from state_docs_registry.json, computes SHA-256,
 * assigns stable doc_id, and writes doc_meta.json per document.
 *
 * Run:
 *   npx tsx scripts/state-docs/fetch.ts --state=MH
 *   npx tsx scripts/state-docs/fetch.ts --all
 */

import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

type RegistryEntry = {
  source_url: string;
  source_type: "pdf" | "html";
  document_type_hint?: string;
  title_hint?: string;
  notes?: string;
};

type Registry = {
  _schema_version: string;
  IN: Record<string, RegistryEntry[]>;
};

const ROOT = process.cwd();
const REGISTRY_PATH = path.join(ROOT, "data/sources/state_docs_registry.json");
const CACHE_DIR = path.join(ROOT, ".cache/state-docs");
const OUT_DIR = path.join(ROOT, "data/extracted/state-docs");

// ---- helpers ----------------------------------------------------------------

async function sha256File(filePath: string): Promise<string> {
  const buf = await fs.readFile(filePath);
  return crypto.createHash("sha256").update(buf).digest("hex");
}

function buildDocId(stateCode: string, sha256: string): string {
  const date = new Date().toISOString().slice(0, 10);
  return `${stateCode}-${date}-${sha256.slice(0, 12)}`;
}

async function downloadToFile(url: string, outPath: string): Promise<void> {
  console.log(`  Downloading: ${url}`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000); // 60s timeout
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
    const arr = new Uint8Array(await res.arrayBuffer());
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, arr);
  } finally {
    clearTimeout(timeout);
  }
}

async function getFileSizeBytes(filePath: string): Promise<number> {
  const stat = await fs.stat(filePath);
  return stat.size;
}

// ---- core fetch function ----------------------------------------------------

export async function fetchStateDocs(
  stateCode: string,
  opts: { dryRun?: boolean; skipExisting?: boolean } = {}
): Promise<void> {
  const registry: Registry = JSON.parse(
    await fs.readFile(REGISTRY_PATH, "utf-8")
  );

  const stateDocs = registry?.IN?.[stateCode];
  if (!stateDocs?.length) {
    throw new Error(`No registry entries for state: ${stateCode}`);
  }

  console.log(`\nFetching ${stateDocs.length} document(s) for state: ${stateCode}`);

  const results: Array<{ status: string; doc_id?: string; url: string; error?: string }> = [];

  for (const item of stateDocs) {
    if (item.source_type !== "pdf") {
      console.log(`  Skipping non-PDF (html support TODO): ${item.source_url}`);
      results.push({ status: "skipped_html", url: item.source_url });
      continue;
    }

    const tmpPath = path.join(CACHE_DIR, stateCode, `tmp-${Date.now()}.pdf`);

    try {
      if (opts.dryRun) {
        console.log(`  [dry-run] Would download: ${item.source_url}`);
        results.push({ status: "dry_run", url: item.source_url });
        continue;
      }

      await downloadToFile(item.source_url, tmpPath);

      const hash = await sha256File(tmpPath);
      const id = buildDocId(stateCode, hash);
      const docFolder = path.join(OUT_DIR, stateCode, id);

      // Check if already fetched (same hash)
      const existingMeta = path.join(docFolder, "doc_meta.json");
      if (opts.skipExisting) {
        const exists = await fs.access(existingMeta).then(() => true).catch(() => false);
        if (exists) {
          console.log(`  Already fetched (skip): ${id}`);
          await fs.unlink(tmpPath).catch(() => {});
          results.push({ status: "skipped_existing", doc_id: id, url: item.source_url });
          continue;
        }
      }

      // Move to stable path
      const finalPdfPath = path.join(CACHE_DIR, stateCode, `${id}.pdf`);
      await fs.rename(tmpPath, finalPdfPath);

      // Create output folder
      await fs.mkdir(docFolder, { recursive: true });

      const fileSizeBytes = await getFileSizeBytes(finalPdfPath);

      const meta = {
        doc_id: id,
        state_code: stateCode,
        source_url: item.source_url,
        source_type: item.source_type,
        document_type_hint: item.document_type_hint ?? null,
        title_hint: item.title_hint ?? null,
        notes: item.notes ?? null,
        retrieved_at: new Date().toISOString(),
        sha256: hash,
        file_size_bytes: fileSizeBytes,
        extraction_status: "pending",
        pipeline_version: "1.0.0"
      };

      await fs.writeFile(
        existingMeta,
        JSON.stringify(meta, null, 2)
      );

      console.log(`  ✓ Fetched: ${id} (${(fileSizeBytes / 1024).toFixed(1)} KB)`);
      results.push({ status: "ok", doc_id: id, url: item.source_url });

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ Failed: ${item.source_url} → ${msg}`);
      await fs.unlink(tmpPath).catch(() => {});
      results.push({ status: "error", url: item.source_url, error: msg });
    }
  }

  // Write fetch summary
  const summaryPath = path.join(OUT_DIR, stateCode, "_fetch_summary.json");
  await fs.mkdir(path.dirname(summaryPath), { recursive: true });
  await fs.writeFile(
    summaryPath,
    JSON.stringify({
      state_code: stateCode,
      fetched_at: new Date().toISOString(),
      results
    }, null, 2)
  );

  const ok = results.filter(r => r.status === "ok").length;
  const failed = results.filter(r => r.status === "error").length;
  console.log(`\nDone: ${ok} fetched, ${failed} failed, ${results.length - ok - failed} skipped.`);
  if (failed > 0) process.exitCode = 1;
}

// ---- fetch all states -------------------------------------------------------

export async function fetchAllStates(
  opts: { dryRun?: boolean; skipExisting?: boolean } = {}
): Promise<void> {
  const registry: Registry = JSON.parse(
    await fs.readFile(REGISTRY_PATH, "utf-8")
  );
  const states = Object.keys(registry.IN ?? {});
  console.log(`Fetching all ${states.length} states: ${states.join(", ")}\n`);
  for (const state of states) {
    await fetchStateDocs(state, opts);
  }
}

// ---- CLI --------------------------------------------------------------------

const args = process.argv.slice(2);
const stateArg = args.find(a => a.startsWith("--state="))?.split("=")[1];
const allFlag = args.includes("--all");
const dryRun = args.includes("--dry-run");
const skipExisting = args.includes("--skip-existing");

if (allFlag) {
  fetchAllStates({ dryRun, skipExisting }).catch(e => {
    console.error(e);
    process.exit(1);
  });
} else if (stateArg) {
  fetchStateDocs(stateArg, { dryRun, skipExisting }).catch(e => {
    console.error(e);
    process.exit(1);
  });
} else {
  console.error("Usage: npx tsx fetch.ts --state=MH | --all [--dry-run] [--skip-existing]");
  process.exit(1);
}
