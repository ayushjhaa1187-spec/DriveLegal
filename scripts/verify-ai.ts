import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { resolveIntent } from "../src/lib/llm/router";
import * as fs from "fs";
import * as path from "path";

async function runBenchmark() {
  console.log("🚀 Starting AI Accuracy Benchmark...");
  
  // Ensure artifacts dir exists
  const artifactsDir = path.resolve(process.cwd(), "artifacts");
  if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir);

  const goldenSetPath = path.resolve(process.cwd(), "data/eval/golden-queries.json");
  const goldenSet = JSON.parse(fs.readFileSync(goldenSetPath, "utf-8"));

  let passed = 0;
  const total = goldenSet.length;
  const results: any[] = [];

  for (const testCase of goldenSet) {
    try {
      console.log(`\nAnalyzing: "${testCase.query}"`);
      
      // Test both Online and Offline paths
      const onlineIntent = await resolveIntent(testCase.query, true);
      const offlineIntent = await resolveIntent(testCase.query, false);

      const onlinePassed = onlineIntent?.category === testCase.expected.category && 
                           (testCase.expected.stateCode === null || onlineIntent?.stateCode === testCase.expected.stateCode);
      
      const offlinePassed = offlineIntent?.category === testCase.expected.category;

      if (onlinePassed) passed++;

      results.push({
        query: testCase.query,
        expected: testCase.expected,
        online: onlineIntent,
        offline: offlineIntent,
        onlineStatus: onlinePassed ? "✅ PASS" : "❌ FAIL",
        offlineStatus: offlinePassed ? "✅ PASS" : "❌ FAIL"
      });

      console.log(`- Online Check: ${onlinePassed ? "✅" : "❌"}`);
      console.log(`- Offline Check: ${offlinePassed ? "✅" : "❌"}`);
    } catch (err) {
      console.error(`Error processing "${testCase.query}":`, err);
    }
  }

  const accuracy = (passed / total) * 100;
  console.log("\n" + "=".repeat(40));
  console.log(`📊 FINAL REPORT`);
  console.log(`Total Cases: ${total}`);
  console.log(`Passed (Online): ${passed}`);
  console.log(`Accuracy (Online): ${accuracy.toFixed(1)}%`);
  console.log("=".repeat(40));

  // Save report
  const reportPath = path.resolve(process.cwd(), "artifacts/ai-benchmark-report.json");
  fs.writeFileSync(reportPath, JSON.stringify({ accuracy, results }, null, 2));
  console.log(`\nReport saved to ${reportPath}`);
}

runBenchmark().catch(console.error);
