import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { ViolationsDatasetSchema } from "../src/lib/law-engine/schema";

const LAWS_DIR = join(process.cwd(), "data/laws/in");
const LAWPACKS_DIR = join(process.cwd(), "data/lawpacks");

function validateFiles() {
  let exitCode = 0;

  // 1. Basic violation JSONs
  const lawFiles = readdirSync(LAWS_DIR).filter(
    (f) => f.endsWith(".json") && !f.includes("pack_metadata") && f !== "manifest.json"
  );
  console.log(`🔍 Validating ${lawFiles.length} standard legal files...\n`);

  lawFiles.forEach((file) => {
    const filePath = join(LAWS_DIR, file);
    try {
      const content = JSON.parse(readFileSync(filePath, "utf-8"));
      const result = ViolationsDatasetSchema.safeParse(content);
      if (!result.success) {
        console.error(`❌ [${file}] Schema violation:`);
        result.error.issues.forEach((issue) => {
          console.error(`   - ${issue.path.join(".")}: ${issue.message} (${issue.code})`);
        });
        exitCode = 1;
      } else {
        console.log(`✅ [${file}] OK`);
      }
    } catch (e) {
      exitCode = 1;
    }
  });

  // 2. Lawpacks (Section 2.1)
  console.log(`\n📦 Checking Lawpack Integrity (Section 2.1)...`);
  const requiredLawpacks = ["manifest.json", "in/central/1.0.0/violations.json", "in/central/1.0.0/pack_metadata.json"];
  
  requiredLawpacks.forEach(relPath => {
    const p = join(LAWPACKS_DIR, relPath);
    try {
      readFileSync(p);
      console.log(`✅ ${relPath} present`);
    } catch (e) {
      console.error(`❌ Missing: ${relPath}`);
      exitCode = 1;
    }
  });

  process.exit(exitCode);
}

validateFiles();
