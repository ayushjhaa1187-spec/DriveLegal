import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { config } from "dotenv";

// Load environment variables from .env.local
config({ path: ".env.local" });

const PARSED_DIR = join(process.cwd(), "data", "parsed");
const OUT_PATH = join(PARSED_DIR, "gemini_extracted.json");

if (!existsSync(PARSED_DIR)) mkdirSync(PARSED_DIR, { recursive: true });

// Zod schema converted to Gemini's expected openapi-like schema format
const violationSchema = {
  type: "ARRAY",
  items: {
    type: "OBJECT",
    properties: {
      id: { type: "STRING" },
      section: { type: "STRING" },
      rule_reference: { type: "STRING" },
      title: {
        type: "OBJECT",
        properties: {
          en: { type: "STRING" }
        },
        required: ["en"]
      },
      plain_english_summary: { type: "STRING" },
      category: { type: "STRING", enum: ["speed", "safety", "documentation", "dangerous_driving", "intoxication", "helmet", "seatbelt", "insurance", "licence", "registration", "overloading", "juvenile", "pollution", "parking", "signal_violation", "mobile_use", "vehicle_condition", "permit", "other"] },
      applies_to: { type: "ARRAY", items: { type: "STRING", enum: ["2W", "3W", "4W", "LMV", "HMV", "transport", "non_transport", "pedestrian", "all"] } },
      compounding_amount_inr: { type: "NUMBER" },
      penalty: {
        type: "OBJECT",
        properties: {
          first_offence: {
            type: "OBJECT",
            properties: {
              fine: { type: "OBJECT", properties: { min: { type: "NUMBER" }, max: { type: "NUMBER" }, fixed: { type: "NUMBER" } } },
              imprisonment: { type: "OBJECT", properties: { value: { type: "NUMBER" }, unit: { type: "STRING", enum: ["days", "months", "years"] }, severity: { type: "STRING", enum: ["may", "shall"] }, text: { type: "STRING" } } }
            }
          },
          repeat_offence: {
            type: "OBJECT",
            properties: {
              fine: { type: "OBJECT", properties: { min: { type: "NUMBER" }, max: { type: "NUMBER" }, fixed: { type: "NUMBER" } } },
              imprisonment: { type: "OBJECT", properties: { value: { type: "NUMBER" }, unit: { type: "STRING", enum: ["days", "months", "years"] }, severity: { type: "STRING", enum: ["may", "shall"] }, text: { type: "STRING" } } }
            }
          },
          licence_suspension: { type: "STRING" },
          licence_disqualification: { type: "STRING" },
          community_service: { type: "BOOLEAN" }
        }
      },
      jurisdiction: {
        type: "OBJECT",
        properties: {
          level: { type: "STRING", enum: ["central", "state", "city"] },
          state_code: { type: "STRING" }
        },
        required: ["level"]
      },
      source_document: { type: "STRING" },
      source_url: { type: "STRING" },
      source_text_excerpt: { type: "STRING" },
      last_verified: { type: "STRING" },
      verification_status: { type: "STRING", enum: ["verified", "pending_review", "outdated"] }
    },
    required: ["id", "section", "title", "plain_english_summary", "category", "applies_to", "penalty", "jurisdiction", "source_document", "verification_status"]
  }
};

async function generateLegalData() {
  const apiKey = "AIzaSyBBFQq6j9nJ8EXdjfmKXjtz-Gg2aOX29tc";
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY in .env.local");
  
  console.log("📤 Requesting DriveLegal dataset expansion from Gemini (via fetch REST)...");
  
  const prompt = `You are a legal data extraction pipeline. Using your knowledge of the Indian Motor Vehicles (Amendment) Act 2019, create a comprehensive list of exactly 15 of the most common traffic violations.
Output an array of JSON objects strictly matching this exact implicit schema shape.
Make sure to capture both first offence and repeat offence fines where written by the law.
If an amount is explicit, map it to 'fixed'. If it's a range (e.g. "one thousand to two thousand"), map to 'min' and 'max'.
Ensure source_document is "Motor Vehicles Act 2019" and level is "central".
Return ONLY raw stringified JSON Array. Do NOT use markdown code blocks (like \`\`\`json). Do NOT add conversational text.`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      { role: "user", parts: [{ text: prompt }] }
    ]
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch from Gemini REST API: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!raw) throw new Error("Gemini returned empty text.");
  
  writeFileSync(OUT_PATH, raw);
  console.log(`✅ Extracted data written to ${OUT_PATH}`);
  console.log(`⚠️ Please manually verify ${OUT_PATH} and merge into central.json!`);
}

async function scrape() {
  console.log("🚀 Starting DriveLegal Data Automation...");
  try {
    await generateLegalData();
  } catch(e) {
    console.error("❌ Pipeline failed:", e);
  }
}

scrape();
