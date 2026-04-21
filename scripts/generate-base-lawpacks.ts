import * as fs from 'fs/promises';
import * as path from 'path';

const STATES = [
  "AN", "AP", "AR", "AS", "BR", "CH", "CT", "DN", "DD", "DL", 
  "GA", "GJ", "HR", "HP", "JK", "JH", "KA", "KL", "LA", "LD", 
  "MP", "MH", "MN", "ML", "MZ", "NL", "OR", "PY", "PB", "RJ", 
  "SK", "TN", "TG", "TR", "UP", "UT", "WB"
];

const DATA_DIR = path.join(process.cwd(), 'data', 'lawpacks', 'in');
const CENTRAL_FILE = path.join(process.cwd(), 'public', 'data', 'laws', 'in', 'central.json');

async function generate() {
  console.log("🚀 Generating Baseline Lawpacks for 36 States/UTs...");

  // Load central as baseline
  const centralData = await fs.readFile(CENTRAL_FILE, 'utf-8');

  for (const state of STATES) {
    const stateDir = path.join(DATA_DIR, state.toLowerCase(), '1.0.0');
    await fs.mkdir(stateDir, { recursive: true });

    // 1. Create violations.json (Inherit from central as baseline)
    // In a real state override, this would be a diff or a filtered set
    await fs.writeFile(path.join(stateDir, 'violations.json'), centralData);

    // 2. Create packmetadata.json
    const metadata = {
      jurisdiction: `IN-${state}`,
      stateCode: state,
      version: "1.0.0",
      publishedAt: new Date().toISOString(),
      lastVerified: "2026-04-21",
      totalViolations: JSON.parse(centralData).length,
      hash: ""
    };
    await fs.writeFile(path.join(stateDir, 'packmetadata.json'), JSON.stringify(metadata, null, 2));

    console.log(`✅ Prepared infrastructure for ${state}`);
  }

  console.log("\n✨ Universal infrastructure ready. Run 'npm run build:lawpacks' to finalize.");
}

generate().catch(console.error);
