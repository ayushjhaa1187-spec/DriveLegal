/**
 * scripts/state-docs/pdf-text.ts
 *
 * Step B of the state-docs pipeline:
 * Extracts text from PDFs page-by-page using pdf-parse (embedded text).
 * Falls back to OCR-ready placeholder if text is too sparse (scanned PDF).
 *
 * Dependencies: pdf-parse
 * Install: npm install pdf-parse @types/pdf-parse
 *
 * Run:
 *   npx tsx scripts/state-docs/pdf-text.ts --state=MH --doc=MH-2026-04-20-abc123
 *   npx tsx scripts/state-docs/pdf-text.ts --state=MH  (all docs for state)
 */

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const CACHE_DIR = path.join(ROOT, ".cache/state-docs");
const EXTRACTED_DIR = path.join(ROOT, "data/extracted/state-docs");

// Minimum characters per page to consider text "embedded" (not scanned)
const MIN_CHARS_PER_PAGE = 80;

export type PageText = {
  page_number: number;
  char_count: number;
  text: string;
  is_sparse: boolean;
};

export type PdfTextResult = {
  doc_id: string;
  state_code: string;
  total_pages: number;
  sparse_pages: number[];
  needs_ocr: boolean;
  pages: PageText[];
  extracted_at: string;
};

export async function extractPdfText(
  stateCode: string,
  docId: string
): Promise<PdfTextResult> {
  const pdfPath = path.join(CACHE_DIR, stateCode, `${docId}.pdf`);
  const docFolder = path.join(EXTRACTED_DIR, stateCode, docId);

  // Lazy-load pdf-parse to avoid startup errors if not installed
  let pdfParse: (buf: Buffer, opts?: Record<string, unknown>) => Promise<{ numpages: number; text: string }>;
  try {
    pdfParse = (await import("pdf-parse")).default;
  } catch {
    throw new Error(
      "pdf-parse not installed. Run: npm install pdf-parse @types/pdf-parse"
    );
  }

  const buf = await fs.readFile(pdfPath);

  const pages: PageText[] = [];
  const pageIndex = 0;

  // pdf-parse renders all pages into a single text string by default.
  // For per-page extraction, we use the pagerender callback.
  const perPageTexts: string[] = [];

  await pdfParse(buf, {
    pagerender: (pageData: any) => {
      return pageData.getTextContent().then((content: any) => {
        const str = content.items
          .map((item: any) => item.str)
          .join(" ")
          .replace(/\s+/g, " ")
          .trim();
        perPageTexts.push(str);
        return str;
      });
    }
  });

  for (let i = 0; i < perPageTexts.length; i++) {
    const text = perPageTexts[i];
    const charCount = text.length;
    const isSparse = charCount < MIN_CHARS_PER_PAGE;
    pages.push({
      page_number: i + 1,
      char_count: charCount,
      text,
      is_sparse: isSparse
    });
  }

  const sparsePages = pages
    .filter(p => p.is_sparse)
    .map(p => p.page_number);

  // If >50% of pages are sparse → likely scanned PDF, needs OCR
  const needsOcr = pages.length > 0 && sparsePages.length / pages.length > 0.5;

  const result: PdfTextResult = {
    doc_id: docId,
    state_code: stateCode,
    total_pages: pages.length,
    sparse_pages: sparsePages,
    needs_ocr: needsOcr,
    pages,
    extracted_at: new Date().toISOString()
  };

  // Write per-page text JSON
  await fs.mkdir(docFolder, { recursive: true });
  await fs.writeFile(
    path.join(docFolder, "pages_text.json"),
    JSON.stringify(result, null, 2)
  );

  // Update doc_meta to reflect extraction status
  const metaPath = path.join(docFolder, "doc_meta.json");
  try {
    const meta = JSON.parse(await fs.readFile(metaPath, "utf-8"));
    meta.extraction_status = needsOcr ? "needs_ocr" : "text_extracted";
    meta.total_pages = pages.length;
    meta.sparse_pages_count = sparsePages.length;
    await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));
  } catch {
    // meta might not exist yet
  }

  console.log(
    `  ${needsOcr ? "[NEEDS OCR]" : "[OK]"}  ${docId}: ${pages.length} pages, ` +
    `${sparsePages.length} sparse (${Math.round((sparsePages.length / Math.max(pages.length, 1)) * 100)}%)`
  );

  return result;
}

// ---- Batch over all docs in a state -----------------------------------------

export async function extractAllDocsForState(stateCode: string): Promise<void> {
  const stateDir = path.join(EXTRACTED_DIR, stateCode);
  const entries = await fs.readdir(stateDir).catch(() => []);
  const docIds = entries.filter(e => !e.startsWith("_") && !e.endsWith(".json"));

  if (!docIds.length) {
    console.log(`No docs found for state ${stateCode}. Run fetch.ts first.`);
    return;
  }

  console.log(`\nExtracting text for ${docIds.length} docs in state: ${stateCode}`);
  for (const docId of docIds) {
    try {
      await extractPdfText(stateCode, docId);
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
  console.error("Usage: npx tsx pdf-text.ts --state=MH [--doc=MH-2026-04-20-abc123]");
  process.exit(1);
}

if (docArg) {
  extractPdfText(stateArg, docArg).catch(e => { console.error(e); process.exit(1); });
} else {
  extractAllDocsForState(stateArg).catch(e => { console.error(e); process.exit(1); });
}
