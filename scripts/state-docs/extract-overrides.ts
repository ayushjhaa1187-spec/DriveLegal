/**
 * scripts/state-docs/extract-overrides.ts
 *
 * Step D of the state-docs pipeline:
 * Parses relevant pages from section_index.json using regex heuristics
 * to extract structured compounding/fine override rows.
 *
 * For LLM-assisted extraction, this module prepares prompts and parses
 * the structured JSON response. LLM call is optional (requires OPENAI_API_KEY
 * or ANTHROPIC_API_KEY env var).
 *
 * Produces: data/extracted/state-docs/<STATE>/<docId>/overrides.json
 *
 * Run:
 *   npx tsx scripts/state-docs/extract-overrides.ts --state=MH --doc=MH-2026-04-20-abc123
 *   npx tsx scripts/state-docs/extract-overrides.ts --state=MH --doc=... --llm
 */

import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const EXTRACTED_DIR = path.join(ROOT, "data/extracted/state-docs");

export type OverrideRow = {
  state_code: string;
  section: string | null;
  rule_reference: string | null;
  title_en: string;
  override_type: "compounding_amount" | "penalty" | "other";
  amount_inr: number | null;
  applies_to: string[];
  effective_date: string | null;
  source_page: number;
  source_text_excerpt: string;
  confidence: "high" | "medium" | "low";
  notes: string[];
};

export type OverridesFile = {
  doc: {
    doc_id: string;
    state_code: string;
    document_type: string;
    source_url: string;
    retrieved_at: string;
    sha256: string;
  };
  extraction_method: "regex" | "llm" | "hybrid";
  extracted_at: string;
  state_overrides: OverrideRow[];
};

// ---- Regex-based heuristic extraction (no LLM) ------------------------------

// Pattern: Section 194D ... Rs. 500 / \u20b9500
const SECTION_AMOUNT_PATTERN =
  /(?:section|sec\.?)\s*(\d+[A-Z]?(?:-[A-Z]?)?).*?(?:rs\.?|\u20b9)\s*([\d,]+)/gi;

// Pattern: standalone amount lines in tables: "500", "1,000", "10000"
const TABLE_AMOUNT_PATTERN = /^\s*(\d{1,2}[.,]?\d{3,5})\s*$/gm;

// Vehicle type hints
function inferAppliesTo(text: string): string[] {
  const lower = text.toLowerCase();
  const types: string[] = [];
  if (lower.match(/two.?wheel|2w|motor.?cycle|scooter/)) types.push("2W");
  if (lower.match(/four.?wheel|4w|car|lmv/)) types.push("4W");
  if (lower.match(/heavy|hmv|truck|lorry|bus/)) types.push("HMV");
  if (lower.match(/three.?wheel|3w|auto/)) types.push("3W");
  return types.length ? types : ["all"];
}

function extractSectionFromText(text: string): string | null {
  const m = text.match(/(?:section|sec\.?)\s*(\d+[A-Z]?(?:\([a-z]\))?)/i);
  return m ? `Section ${m[1]}` : null;
}

function parseAmountString(s: string): number | null {
  const cleaned = s.replace(/,/g, "").trim();
  const n = parseInt(cleaned, 10);
  return isNaN(n) ? null : n;
}

async function extractWithRegex(
  stateCode: string,
  docId: string,
  relevantPages: number[]
): Promise<OverrideRow[]> {
  const pagesTextPath = path.join(EXTRACTED_DIR, stateCode, docId, "pages_text.json");
  const raw = JSON.parse(await fs.readFile(pagesTextPath, "utf-8"));
  const pages = raw.pages as Array<{ page_number: number; text: string }>;

  const relevantSet = new Set(relevantPages);
  const rows: OverrideRow[] = [];

  for (const page of pages) {
    if (!relevantSet.has(page.page_number)) continue;

    const text = page.text;
    let match: RegExpExecArray | null;

    // Reset regex
    SECTION_AMOUNT_PATTERN.lastIndex = 0;

    while ((match = SECTION_AMOUNT_PATTERN.exec(text)) !== null) {
      const sectionNum = match[1];
      const amountStr = match[2];
      const amount = parseAmountString(amountStr);

      // Extract surrounding context (up to 200 chars)
      const start = Math.max(0, match.index - 40);
      const end = Math.min(text.length, match.index + match[0].length + 80);
      const excerpt = text.slice(start, end).replace(/\s+/g, " ").trim();

      if (amount !== null && amount >= 100 && amount <= 200000) {
        rows.push({
          state_code: stateCode,
          section: `Section ${sectionNum}`,
          rule_reference: null,
          title_en: `Section ${sectionNum} violation`,
          override_type: "compounding_amount",
          amount_inr: amount,
          applies_to: inferAppliesTo(excerpt),
          effective_date: null,
          source_page: page.page_number,
          source_text_excerpt: excerpt,
          confidence: "medium",
          notes: ["Extracted by regex heuristic — verify manually"]
        });
      }
    }
  }

  return rows;
}

// ---- LLM prompt builder (for use with OpenAI / Anthropic / Gemini) ----------

export function buildExtractionPrompt(pageTexts: string[], stateCode: string): string {
  return `You are a legal data extraction assistant for Indian traffic law.

Extract ALL compounding fee / fine / penalty rows from the following pages of a state government PDF document for state: ${stateCode}.

For each row, output a JSON object with these exact fields:
- section: string | null (e.g. "Section 194D", "Rule 138")
- rule_reference: string | null
- title_en: string (brief English description of the offence)
- override_type: "compounding_amount" | "penalty" | "other"
- amount_inr: number | null (the rupee amount as an integer)
- applies_to: string[] (e.g. ["2W", "4W", "HMV", "all"])
- effective_date: string | null (ISO date if mentioned)
- source_page: number
- source_text_excerpt: string (exact 1-3 sentence excerpt from source)
- confidence: "high" | "medium" | "low"
- notes: string[] (any caveats, conflicts, or ambiguities)

Rules:
1. NEVER invent amounts. If unclear, set amount_inr: null and confidence: "low"
2. If two amounts appear for same section, output BOTH rows with a conflict note
3. Preserve the source_text_excerpt exactly as it appears in the document
4. Only output rows for compounding/fine/penalty amounts — skip all other content
5. Output ONLY a JSON array — no prose, no markdown

Document pages:
${pageTexts.map((t, i) => `--- Page ${i + 1} ---\n${t}`).join("\n\n")}

Output JSON array:`;
}

// ---- Main extraction function -----------------------------------------------

export async function extractOverrides(
  stateCode: string,
  docId: string,
  opts: { useLlm?: boolean } = {}
): Promise<OverridesFile> {
  const docFolder = path.join(EXTRACTED_DIR, stateCode, docId);
  const metaPath = path.join(docFolder, "doc_meta.json");
  const indexPath = path.join(docFolder, "section_index.json");

  const meta = JSON.parse(await fs.readFile(metaPath, "utf-8"));
  const index = JSON.parse(await fs.readFile(indexPath, "utf-8"));

  const relevantPages: number[] = index.relevant_pages ?? [];
  let rows: OverrideRow[] = [];
  let method: "regex" | "llm" | "hybrid" = "regex";

  if (opts.useLlm && process.env.ANTHROPIC_API_KEY) {
    // LLM path — reads page texts and calls API
    const pagesTextPath = path.join(docFolder, "pages_text.json");
    const raw = JSON.parse(await fs.readFile(pagesTextPath, "utf-8"));
    const pages = raw.pages as Array<{ page_number: number; text: string }>;
    const relevantSet = new Set(relevantPages);
    const relevantTexts = pages
      .filter(p => relevantSet.has(p.page_number))
      .map(p => p.text);

    const prompt = buildExtractionPrompt(relevantTexts, stateCode);

    // Batch in groups of 10 pages to stay within token limits
    const BATCH = 10;
    for (let i = 0; i < relevantTexts.length; i += BATCH) {
      const batch = relevantTexts.slice(i, i + BATCH);
      const batchPrompt = buildExtractionPrompt(batch, stateCode);

      try {
        // Dynamic import to avoid hard dependency
        const Anthropic = (await import("@anthropic-ai/sdk")).default;
        const client = new Anthropic();
        const response = await client.messages.create({
          model: "claude-opus-4-5",
          max_tokens: 4096,
          messages: [{ role: "user", content: batchPrompt }]
        });
        const content = response.content[0];
        if (content.type === "text") {
          const parsed = JSON.parse(content.text) as OverrideRow[];
          rows.push(...parsed.map(r => ({ ...r, state_code: stateCode })));
        }
      } catch (err) {
        console.error(`LLM extraction failed for batch ${i}: ${err}. Falling back to regex.`);
        const fallback = await extractWithRegex(stateCode, docId, relevantPages);
        rows.push(...fallback);
        break;
      }
    }
    method = "llm";
  } else {
    rows = await extractWithRegex(stateCode, docId, relevantPages);
    method = "regex";
  }

  const overridesFile: OverridesFile = {
    doc: {
      doc_id: meta.doc_id,
      state_code: stateCode,
      document_type: meta.document_type_hint ?? "other",
      source_url: meta.source_url,
      retrieved_at: meta.retrieved_at,
      sha256: meta.sha256
    },
    extraction_method: method,
    extracted_at: new Date().toISOString(),
    state_overrides: rows
  };

  await fs.writeFile(
    path.join(docFolder, "overrides.json"),
    JSON.stringify(overridesFile, null, 2)
  );

  // Update meta
  meta.extraction_status = "overrides_extracted";
  meta.overrides_count = rows.length;
  await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));

  console.log(`  [${docId}] Extracted ${rows.length} override rows (method: ${method})`);
  return overridesFile;
}

// ---- CLI --------------------------------------------------------------------

const args = process.argv.slice(2);
const stateArg = args.find(a => a.startsWith("--state="))?.split("=")[1];
const docArg = args.find(a => a.startsWith("--doc="))?.split("=")[1];
const useLlm = args.includes("--llm");

if (!stateArg || !docArg) {
  console.error("Usage: npx tsx extract-overrides.ts --state=MH --doc=<docId> [--llm]");
  process.exit(1);
}

extractOverrides(stateArg, docArg, { useLlm }).catch(e => { console.error(e); process.exit(1); });
