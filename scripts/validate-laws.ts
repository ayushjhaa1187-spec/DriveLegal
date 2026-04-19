import { readFileSync, readdirSync } from "fs";
import { join } from "path";
import { ViolationsDatasetSchema } from "../src/lib/law-engine/schema";

const DATA_DIR = join(process.cwd(), "data/laws/in");

function validateFiles() {
  const files = readdirSync(DATA_DIR).filter((f) => f.endsWith(".json"));
  let exitCode = 0;

  console.log(`🔍 Validating ${files.length} legal data files...\n`);

  files.forEach((file) => {
    const filePath = join(DATA_DIR, file);
    try {
      const content = JSON.parse(readFileSync(filePath, "utf-8"));
      const result = ViolationsDatasetSchema.safeParse(content);

      if (!result.success) {
        console.error(`❌ [${file}] Validation failed:`);
        result.error.issues.forEach((issue) => {
          console.error(`   - ${issue.path.join(".")}: ${issue.message}`);
        });
        exitCode = 1;
      } else {
        console.log(`✅ [${file}] Validated successfully (${result.data.violations.length} violations)`);
      }
    } catch (e: any) {
      console.error(`💥 [${file}] Critical error: ${e.message}`);
      exitCode = 1;
    }
  });

  if (exitCode === 0) {
    console.log("\n✨ All legal records passed integrity checks.");
  } else {
    console.error("\n🛑 Integrity checks failed. Please fix schema violations before deployment.");
  }

  process.exit(exitCode);
}

validateFiles();
