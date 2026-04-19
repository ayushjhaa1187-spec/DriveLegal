import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { z } from "zod";
import { ViolationSchema } from "../src/lib/law-engine/schema";
import type { Violation } from "../src/lib/law-engine/schema";

const EXTRACTED_PATH = join(process.cwd(), "data", "parsed", "gemini_extracted.json");
const CENTRAL_PATH = join(process.cwd(), "public", "data", "laws", "in", "central.json");

function merge() {
  console.log("🚦 Starting DriveLegal Deduplication & Append pipeline...");

  const rawExtracted = readFileSync(EXTRACTED_PATH, "utf-8");
  let newViolations: any[] = [];
  try {
    newViolations = JSON.parse(rawExtracted);
  } catch (e) {
    throw new Error("Failed to parse extracted JSON.");
  }

  // Safely map and patch LLM input to meet strict schema requirements
  console.log(`🧩 Normalizing and Validating ${newViolations.length} violations against Zod schema...`);
  const validatedExtract: Violation[] = [];
  
  for (const v of newViolations) {
    // Add default fallbacks for LLM missing strict fields
    const patched = {
      ...v,
      severity: v.severity || 3,
      compoundable: v.compoundable ?? null,
      compounding_amount_inr: v.compounding_amount_inr ?? null,
      source_text_excerpt: v.plain_english_summary || "Excerpt not provided",
      confidence: v.confidence || "high",
      extraction_notes: v.extraction_notes || ["Auto-extracted from Model"],
      last_verified: v.last_verified || new Date().toISOString(),
      effective_date: v.effective_date || new Date().toISOString(),
      source_page: null,
      source_url: null,
      jurisdiction: {
        country: "IN",
        state_code: null,
        state_name: null,
        ...v.jurisdiction,
      },
      penalty: {
        ...v.penalty,
        licence_suspension: v.penalty?.licence_suspension ?? null,
        licence_disqualification: v.penalty?.licence_disqualification ?? null,
        community_service: v.penalty?.community_service ?? null,
        other_penalty_text: v.penalty?.other_penalty_text ?? null,
        first_offence: {
          fine: v.penalty?.first_offence?.fine ? { 
            min: v.penalty.first_offence.fine.min ?? null,
            max: v.penalty.first_offence.fine.max ?? null,
            fixed: v.penalty.first_offence.fine.fixed ?? null,
            currency: "INR" 
          } : null,
          imprisonment: v.penalty?.first_offence?.imprisonment ? {
             value: v.penalty.first_offence.imprisonment.value ?? null,
             unit: v.penalty.first_offence.imprisonment.unit ?? null,
             severity: v.penalty.first_offence.imprisonment.severity ?? null,
             text: v.penalty.first_offence.imprisonment.text ?? null
          } : null,
        },
        repeat_offence: v.penalty?.repeat_offence ? {
          fine: v.penalty.repeat_offence.fine ? { 
            min: v.penalty.repeat_offence.fine.min ?? null,
            max: v.penalty.repeat_offence.fine.max ?? null,
            fixed: v.penalty.repeat_offence.fine.fixed ?? null,
            currency: "INR" 
          } : null,
          imprisonment: v.penalty.repeat_offence.imprisonment ? {
             value: v.penalty.repeat_offence.imprisonment.value ?? null,
             unit: v.penalty.repeat_offence.imprisonment.unit ?? null,
             severity: v.penalty.repeat_offence.imprisonment.severity ?? null,
             text: v.penalty.repeat_offence.imprisonment.text ?? null
          } : null,
        } : null,
      }
    };

    const res = ViolationSchema.safeParse(patched);
    if (!res.success) {
      console.warn(`⚠️ Filtered invalid record: ID ${v.id}. Error: ${res.error.issues[0].path.join(".")} - ${res.error.issues[0].message}`);
    } else {
      validatedExtract.push(res.data);
    }
  }

  console.log(`✅ ${validatedExtract.length} violations successfully passed strict Zod schema validation.`);

  // Load existing Database
  let centralRaw: any = { violations: [] };
  try {
    centralRaw = JSON.parse(readFileSync(CENTRAL_PATH, "utf-8"));
  } catch(e) {
    console.warn("No existing central.json found, creating a new DB wrapper.");
  }

  const centralDB: Violation[] = centralRaw.violations || [];
  const existingIds = new Set(centralDB.map(v => v.id));
  
  let appendCount = 0;
  for (const item of validatedExtract) {
    if (!existingIds.has(item.id)) {
      centralDB.push(item);
      existingIds.add(item.id);
      appendCount++;
    } else {
       console.log(`🔷 ID ${item.id} already exists. Skipping.`);
    }
  }

  centralRaw.violations = centralDB;
  writeFileSync(CENTRAL_PATH, JSON.stringify(centralRaw, null, 2));
  console.log(`🎉 Pipeline Complete! Merged ${appendCount} new violations into central.json.`);
  console.log(`📊 Central Database now contains ${centralDB.length} violations.`);
}

merge();
