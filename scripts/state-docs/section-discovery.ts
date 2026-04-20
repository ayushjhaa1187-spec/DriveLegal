/**
 * scripts/state-docs/section-discovery.ts
 *
 * Step C of the state-docs pipeline:
 * Uses keyword matching + LLM (optional) to identify which pages in a PDF
 * contain relevant compounding/fine table data.
 *
 * Produces: data/extracted/state-docs/<STATE>/<docId>/section_index.json
 *
 * Run:
 *   npx tsx scripts/state-docs/section-discovery.ts --state=MH --doc=MH-2026-04-20-abc123
 */

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const EXTRACTED_DIR = path.join(ROOT, "data/extracted/state-docs");

// Keywords that indicate a page is relevant for compounding/fine extraction
const RELEVANT_KEYWORDS = [
  // English
  "compounding", "compound fee", "fine", "penalty", "offence", "section",
  "motor vehicle", "challan", "schedule", "amount", "\u20b9", "rs.", "rupee",
  "inr", "payable", "offender", "traffic", "violation",
  // Common Indian legal phrases
  "under section", "section 177", "section 179", "section 181", "section 183",
  "section 184", "section 185", "section 186", "section 194", "section 196",
  "rule ", "notification", "gazette",
  // Hindi/regional transliterations sometimes in English PDFs
  "chakkar", "helmit", "helmt", "speed", "drunk", "license"
];

export type PageRelevance = {
  page_number: number;
  is_relevant: boolean;
  keyword_hits: string[];
  relevance_score: number; // 0-100
};

export type SectionIndex = {
  doc_id: string;
  state_code: string;
  total_pages: number;
  relevant_pages: number[];
  high_relevance_pages: number[];
  page_relevance: PageRelevance[];
  discovery_method: "keyword" | "llm" | "hybrid";
  created_at: string;
};

function scorePageText(text: string): { score: number; hits: string[] } {
  const lower = text.toLowerCase();
  const hits: string[] = [];

  for (const kw of RELEVANT_KEYWORDS) {
    if (lower.includes(kw.toLowerCase())) {
      hits.push(kw);
    }
  }

  // Score: base points per keyword hit + bonus for table-like patterns
  let score = Math.min(hits.length * 8, 60);

  // Bonus: numeric patterns suggesting fine table (e.g. \u20b9500, Rs. 1000)
  const amountMatches = lower.match(/[\u20b9rs.\s](\d{3,5})/g) ?? [];
  score += Math.min(amountMatches.length * 5, 30);

  // Bonus: section number patterns
  const sectionMatches = lower.match(/section\s+\d{3}/g) ?? [];
  score += Math.min(sectionMatches.length * 3, 10);

  return { score: Math.min(score, 100), hits };
}

export async function discoverSections(
  stateCode: string,
  docId: string
): Promise<SectionIndex> {
  const docFolder = path.join(EXTRACTED_DIR, stateCode, docId);
  const pagesTextPath = path.join(docFolder, "pages_text.json");

  const raw = JSON.parse(await fs.readFile(pagesTextPath, "utf-8"));
  const pages = raw.pages as Array<{ page_number: number; text: string; is_sparse: boolean }>;

  const pageRelevance: PageRelevance[] = [];

  for (const page of pages) {
    if (page.is_sparse) {
      // Sparse pages: likely scanned — mark uncertain but keep with low score
      pageRelevance.push({
        page_number: page.page_number,
        is_relevant: false,
        keyword_hits: [],
        relevance_score: 0
      });
      continue;
    }

    const { score, hits } = scorePageText(page.text);
    pageRelevance.push({
      page_number: page.page_number,
      is_relevant: score >= 20,
      keyword_hits: hits,
      relevance_score: score
    });
  }

  const relevantPages = pageRelevance
    .filter(p => p.is_relevant)
    .map(p => p.page_number);

  const highRelevancePages = pageRelevance
    .filter(p => p.relevance_score >= 50)
    .map(p => p.page_number);

  const index: SectionIndex = {
    doc_id: docId,
    state_code: stateCode,
    total_pages: pages.length,
    relevant_pages: relevantPages,
    high_relevance_pages: highRelevancePages,
    page_relevance: pageRelevance,
    discovery_method: "keyword",
    created_at: new Date().toISOString()
  };

  await fs.writeFile(
    path.join(docFolder, "section_index.json"),
    JSON.stringify(index, null, 2)
  );

  console.log(
    `  [${docId}] ${relevantPages.length}/${pages.length} relevant pages ` +
    `(${highRelevancePages.length} high-relevance)`
  );

  return index;
}

// ---- Batch ------------------------------------------------------------------

export async function discoverAllDocsForState(stateCode: string): Promise<void> {
  const stateDir = path.join(EXTRACTED_DIR, stateCode);
  const entries = await fs.readdir(stateDir).catch(() => []);
  const docIds = entries.filter(e => !e.startsWith("_") && !e.endsWith(".json"));

  console.log(`\nSection discovery for ${docIds.length} docs in state: ${stateCode}`);
  for (const docId of docIds) {
    try {
      await discoverSections(stateCode, docId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ ${docId}: ${msg}`);
    }
  }
}

// ---- CLI --------------------------------------------------------------------

const args = process.argv.slice(2);
const stateArg = args.find(a => a.startsWith("--state="))?.split("=")[1];
const docArg = args.find(a => a.startsWith("--doc="))?.split("=")[1];

if (!stateArg) {
  console.error("Usage: npx tsx section-discovery.ts --state=MH [--doc=<docId>]");
  process.exit(1);
}

if (docArg) {
  discoverSections(stateArg, docArg).catch(e => { console.error(e); process.exit(1); });
} else {
  discoverAllDocsForState(stateArg).catch(e => { console.error(e); process.exit(1); });
}
