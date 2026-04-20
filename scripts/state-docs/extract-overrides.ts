import fs from "fs";
import path from "path";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ---------------------------------------------------------------------------
// extract-overrides.ts  (Gemini edition)
// Step D of the state-docs pipeline.
// Reads sections.json + raw.txt for a doc, runs regex first, then falls back
// to Gemini 1.5 Flash for unstructured/messy pages.
//
// Usage:
//   npx tsx scripts/state-docs/extract-overrides.ts --state=MH --doc=MH-compounding-2022
//
// Requires: GEMINI_API_KEY in env (free at aistudio.google.com)
// ---------------------------------------------------------------------------

const GEMINI_MODEL = "gemini-1.5-flash";

interface Override {
  offense_code?: string;
  offense_description: string;
  section: string;
  compounding_amount?: number | null;
  fine_min?: number | null;
  fine_max?: number | null;
  unit?: string;
  source_url: string;
  source_page?: number;
  source_text_excerpt: string;
  confidence: "high" | "medium" | "low";
}

interface SectionHit {
  page: number;
  section_refs: string[];
  keyword_hits: string[];
  text_snippet: string;
}

// ---------------------------------------------------------------------------
// Regex-based extraction (fast, no API cost)
// ---------------------------------------------------------------------------
const AMOUNT_RE = /(?:Rs\.?|INR|\u20b9)\s*(\d[\d,]*)/gi;
const SECTION_RE = /[Ss]ection\s*(\d+[A-Z]?(?:\(\d+\))?(?:\/\d+[A-Z]?)*)/g;
const ROW_RE =
  /([A-Z][\w\s/()-]{5,60})\s+(?:Rs\.?|\u20b9|INR)?\s*(\d[\d,]*)\s*(?:\/|to|-)?\s*(\d[\d,]*)?/gi;

function extractByRegex(text: string, sourceUrl: string, page: number): Override[] {
  const results: Override[] = [];
  let match: RegExpExecArray | null;

  ROW_RE.lastIndex = 0;
  while ((match = ROW_RE.exec(text)) !== null) {
    const desc = match[1].trim();
    const amt1 = parseInt(match[2].replace(/,/g, ""), 10);
    const amt2 = match[3] ? parseInt(match[3].replace(/,/g, ""), 10) : undefined;

    // Find section reference near this match
    const nearby = text.slice(Math.max(0, match.index - 100), match.index + 200);
    SECTION_RE.lastIndex = 0;
    const secMatch = SECTION_RE.exec(nearby);
    const section = secMatch ? `Section ${secMatch[1]}` : "Unknown";

    if (desc.length < 8 || amt1 < 100 || amt1 > 50000) continue;

    results.push({
      offense_description: desc,
      section,
      compounding_amount: amt2 ? undefined : amt1,
      fine_min: amt2 ? amt1 : undefined,
      fine_max: amt2 ?? undefined,
      source_url: sourceUrl,
      source_page: page,
      source_text_excerpt: match[0].trim().slice(0, 200),
      confidence: "medium",
    });
  }
  return results;
}

// ---------------------------------------------------------------------------
// Gemini-based extraction (for messy / OCR / dense narrative pages)
// ---------------------------------------------------------------------------
async function extractByGemini(
  pageText: string,
  sourceUrl: string,
  page: number,
  apiKey: string
): Promise<Override[]> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  const prompt = `You are a legal data extraction assistant for Indian Motor Vehicles Act documents.

Extract ALL compounding fees and fine amounts from the text below.
Output ONLY a valid JSON array. No explanation, no markdown, no code fences.

Each object must have exactly these fields:
- offense_description: string (what the offense is)
- section: string (e.g. "Section 177" or "Unknown")
- compounding_amount: number or null (single fixed fee in INR)
- fine_min: number or null
- fine_max: number or null
- source_text_excerpt: string (the exact text fragment you found this in, max 150 chars)
- confidence: "high" | "medium" | "low"

Rules:
- NEVER invent amounts. If not found, use null.
- If a range like "500-1000" is given, use fine_min=500, fine_max=1000, compounding_amount=null.
- If a single amount like "1000" is given, use compounding_amount=1000.
- confidence is "high" if exact table row found, "medium" if inferred from text.

TEXT:
${pageText.slice(0, 6000)}

JSON array:`;

  try {
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    // Strip any accidental markdown fences
    const cleaned = raw.replace(/^```[\w]*\n?/m, "").replace(/```$/m, "").trim();
    const parsed: Omit<Override, "source_url" | "source_page">[] = JSON.parse(cleaned);

    return parsed.map((r) => ({
      ...r,
      source_url: sourceUrl,
      source_page: page,
    }));
  } catch (err) {
    console.warn(`  [gemini] Failed to parse response for page ${page}:`, (err as Error).message);
    return [];
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function run() {
  const stateArg = process.argv.find((a) => a.startsWith("--state="))?.split("=")[1];
  const docArg = process.argv.find((a) => a.startsWith("--doc="))?.split("=")[1];
  const useLLM = process.argv.includes("--llm");

  if (!stateArg || !docArg) {
    console.error("Usage: npx tsx extract-overrides.ts --state=MH --doc=MH-compounding-2022 [--llm]");
    process.exit(1);
  }

  const apiKey = process.env.GEMINI_API_KEY ?? "";
  if (useLLM && !apiKey) {
    console.error("GEMINI_API_KEY env var not set. Get a free key at aistudio.google.com");
    process.exit(1);
  }

  const docDir = path.join(process.cwd(), "data", "extracted", "state-docs", stateArg, docArg);
  const rawTxtPath = path.join(docDir, "raw.txt");
  const sectionsPath = path.join(docDir, "sections.json");
  const outPath = path.join(docDir, "overrides_raw.json");

  if (!fs.existsSync(rawTxtPath)) {
    console.error(`raw.txt not found at ${rawTxtPath}. Run pdf-text.ts first.`);
    process.exit(1);
  }

  const rawText = fs.readFileSync(rawTxtPath, "utf-8");
  const pages = rawText.split("\n--- PAGE ").slice(1);

  // Find relevant pages from sections.json if it exists
  let relevantPages: number[] = [];
  if (fs.existsSync(sectionsPath)) {
    const sections: SectionHit[] = JSON.parse(fs.readFileSync(sectionsPath, "utf-8"));
    relevantPages = sections.map((s) => s.page);
    console.log(`  [info] Using ${relevantPages.length} relevant pages from sections.json`);
  } else {
    relevantPages = pages.map((_, i) => i + 1);
    console.log(`  [info] No sections.json found, scanning all ${pages.length} pages`);
  }

  // Read source_url from registry
  const registryPath = path.join(process.cwd(), "data", "sources", "state_docs_registry.json");
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf-8"));
  const allDocs: { doc_id: string; source_url: string }[] = Object.values(registry.IN).flat() as any;
  const docMeta = allDocs.find((d: any) => d.doc_id === docArg);
  const sourceUrl = docMeta?.source_url ?? "unknown";

  const allOverrides: Override[] = [];

  for (const pageNum of relevantPages) {
    const pageText = pages[pageNum - 1];
    if (!pageText) continue;

    console.log(`  [page ${pageNum}] Running regex extraction...`);
    const regexResults = extractByRegex(pageText, sourceUrl, pageNum);
    console.log(`    Found ${regexResults.length} rows via regex`);

    if (regexResults.length > 0) {
      allOverrides.push(...regexResults);
    } else if (useLLM) {
      console.log(`    Regex found nothing, falling back to Gemini...`);
      const geminiResults = await extractByGemini(pageText, sourceUrl, pageNum, apiKey);
      console.log(`    Found ${geminiResults.length} rows via Gemini`);
      allOverrides.push(...geminiResults);
    } else {
      console.log(`    Regex found nothing. Re-run with --llm flag to use Gemini for this page.`);
    }
  }

  const output = {
    state_code: stateArg,
    doc_id: docArg,
    generated_at: new Date().toISOString(),
    total_rows: allOverrides.length,
    overrides: allOverrides,
  };

  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));
  console.log(`\nDone. ${allOverrides.length} overrides written to ${outPath}`);
}

run();
