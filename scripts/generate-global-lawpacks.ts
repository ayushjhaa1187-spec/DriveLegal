import fs from "fs";
import path from "path";

const GLOBAL_DATA = [
  {
    code: "usa",
    name: "United States",
    currency: "USD",
    violations: [
      {
        id: "USA::Speeding::11-20-over",
        section: "Speeding 11-20",
        title: { en: "Speeding (11-20 mph over)" },
        plain_english_summary: "Driving between 11 and 20 miles per hour over the posted limit.",
        category: "speed",
        severity: 4,
        applies_to: ["all"],
        jurisdiction: { country: "USA", state_code: "NY", state_name: "New York" },
        penalty: {
          first_offence: { fine: { min: 90, max: 300, currency: "USD" } }
        },
        source_document: "NY Traffic Law",
        last_verified: "2024-04-21"
      }
    ]
  },
  {
    code: "uk",
    name: "United Kingdom",
    currency: "GBP",
    violations: [
      {
        id: "UK::Helmet::not-worn",
        section: "Rule 83",
        title: { en: "Riding without a helmet" },
        plain_english_summary: "On a motorcycle, you MUST wear a protective helmet.",
        category: "helmet",
        severity: 5,
        applies_to: ["2W"],
        jurisdiction: { country: "UK", state_code: null, state_name: "United Kingdom" },
        penalty: {
          first_offence: { fine: { fixed: 100, currency: "GBP" } }
        },
        source_document: "Highway Code",
        last_verified: "2024-04-21"
      }
    ]
  },
  {
    code: "uae",
    name: "United Arab Emirates",
    currency: "AED",
    violations: [
      {
        id: "UAE::Mobile::handheld-use",
        section: "Traffic Fee 38",
        title: { en: "Using a hand-held mobile phone while driving" },
        plain_english_summary: "Using a mobile phone or being distracted while driving.",
        category: "mobile_use",
        severity: 6,
        applies_to: ["all"],
        jurisdiction: { country: "UAE", state_code: "DXB", state_name: "Dubai" },
        penalty: {
          first_offence: { fine: { fixed: 800, currency: "AED" } }
        },
        source_document: "Federal Traffic Law",
        last_verified: "2024-04-21"
      }
    ]
  }
];

async function generate() {
  const baseDir = path.join(process.cwd(), "data", "lawpacks", "global");
  
  for (const country of GLOBAL_DATA) {
    const countryDir = path.join(baseDir, country.code, "1.0.0");
    if (!fs.existsSync(countryDir)) {
      fs.mkdirSync(countryDir, { recursive: true });
    }

    const dataset = {
      document_metadata: {
        source_document: "Global Traffic Regulations",
        document_type: "central_act",
        jurisdiction: country.code.toUpperCase(),
        language: "en",
        extraction_timestamp: new Date().toISOString()
      },
      violations: country.violations
    };

    fs.writeFileSync(
      path.join(countryDir, "violations.json"),
      JSON.stringify(dataset, null, 2)
    );
    console.log(`✅ Generated ${country.name} lawpack.`);
  }
}

generate();
