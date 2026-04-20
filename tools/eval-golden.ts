import fs from 'fs';
import path from 'path';
import { parseUserIntent } from '../src/lib/llm/intent-parser';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function runEval() {
  const goldenPath = path.join(process.cwd(), 'tools', 'golden-queries.json');
  const queries = JSON.parse(fs.readFileSync(goldenPath, 'utf8'));

  console.log(`\n🚀 Starting AI Eval on ${queries.length} queries...\n`);

  let passed = 0;
  const results = [];

  for (const q of queries) {
    process.stdout.write(`Evaluating: "${q.query}" ... `);
    
    try {
      const start = Date.now();
      const result = await parseUserIntent(q.query);
      const latency = Date.now() - start;

      const categoryMatch = result.violations[0] === q.expected.category;
      const stateMatch = result.state === q.expected.stateCode;
      const vehicleMatch = result.vehicleType === q.expected.vehicleType;
      const repeatMatch = result.isRepeatOffender === q.expected.isRepeatOffender;

      const isMatch = categoryMatch && stateMatch && vehicleMatch && repeatMatch;

      if (isMatch) {
        console.log('✅ PASS');
        passed++;
      } else {
        console.log('❌ FAIL');
        console.log(`   Diff: ${JSON.stringify({
          category: categoryMatch ? 'ok' : `got ${result.violations[0]} expected ${q.expected.category}`,
          state: stateMatch ? 'ok' : `got ${result.state} expected ${q.expected.stateCode}`,
          vehicle: vehicleMatch ? 'ok' : `got ${result.vehicleType} expected ${q.expected.vehicleType}`,
          repeat: repeatMatch ? 'ok' : `got ${result.isRepeatOffender} expected ${q.expected.isRepeatOffender}`
        }, null, 2)}`);
      }

      results.push({
        query: q.query,
        match: isMatch,
        latency,
        intent: result
      });
    } catch (err: any) {
      console.log(`💥 ERROR: ${err.message}`);
    }
  }

  const accuracy = (passed / queries.length) * 100;
  console.log(`\n📊 Final Results:`);
  console.log(`Accuracy: ${accuracy.toFixed(1)}% (${passed}/${queries.length})`);
  console.log(`Avg Latency: ${(results.reduce((acc, r) => acc + r.latency, 0) / results.length).toFixed(0)}ms`);
}

runEval().catch(console.error);
