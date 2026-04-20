// Phase 11.1 — Golden Dataset Eval Harness for LLM intent parser
// Run with: npx tsx scripts/run-eval.ts

interface GoldenCase {
  query: string;
  language: string;
  expectedViolations: string[];
  expectedState: string | null;
  expectedVehicle: string | null;
  notes: string;
}

const GOLDEN_DATASET: GoldenCase[] = [
  {
    query: 'How much fine for not wearing helmet in Mumbai?',
    language: 'en',
    expectedViolations: ['helmet'],
    expectedState: 'MH',
    expectedVehicle: null,
    notes: 'City-state mapping: Mumbai -> MH',
  },
  {
    query: '\u0926\u093f\u0932\u094d\u0932\u0940 \u092e\u0947\u0902 \u092c\u093e\u0907\u0915 \u092a\u0930 \u0939\u0947\u0932\u092e\u0947\u091f \u0928\u0939\u0940\u0902 \u092a\u0939\u0928\u0928\u0947 \u092a\u0930 \u091c\u0941\u0930\u094d\u092e\u093e\u0928\u093e?',
    language: 'hi',
    expectedViolations: ['helmet'],
    expectedState: 'DL',
    expectedVehicle: '2W',
    notes: 'Hindi query with vehicle mention',
  },
  {
    query: 'drunk driving fine in Tamil Nadu second time',
    language: 'en',
    expectedViolations: ['drunk-driving'],
    expectedState: 'TN',
    expectedVehicle: null,
    notes: 'Repeat offender detection',
  },
  {
    query: 'seat belt not wearing car Bangalore',
    language: 'en',
    expectedViolations: ['seatbelt'],
    expectedState: 'KA',
    expectedVehicle: '4W',
    notes: 'City-state: Bangalore -> KA',
  },
  {
    query: 'over speed fine highway UP',
    language: 'en',
    expectedViolations: ['speed'],
    expectedState: 'UP',
    expectedVehicle: null,
    notes: 'Speeding on highway, UP state',
  },
];

interface EvalResult {
  query: string;
  passed: boolean;
  violationMatch: boolean;
  stateMatch: boolean;
  vehicleMatch: boolean;
  actualOutput: any;
  errors: string[];
}

async function parseUserIntent(query: string): Promise<any> {
  // Dynamic import to avoid circular deps at eval time
  const { parseIntent } = await import('../src/lib/llm/intent-parser');
  return parseIntent(query);
}

async function runEval(): Promise<void> {
  console.log(`Running LLM Eval on ${GOLDEN_DATASET.length} cases...`);
  const results: EvalResult[] = [];
  let passed = 0;

  for (const tc of GOLDEN_DATASET) {
    let intent: any;
    const errors: string[] = [];

    try {
      intent = await parseUserIntent(tc.query);
    } catch (e) {
      console.error(`PARSE ERROR for "${tc.query}":`, e);
      results.push({
        query: tc.query,
        passed: false,
        violationMatch: false,
        stateMatch: false,
        vehicleMatch: false,
        actualOutput: null,
        errors: [`Parse error: ${e}`],
      });
      continue;
    }

    const violationMatch = tc.expectedViolations.every((v) =>
      intent.violations?.includes(v),
    );
    const stateMatch = intent.state === tc.expectedState;
    const vehicleMatch =
      tc.expectedVehicle === null || intent.vehicleType === tc.expectedVehicle;

    if (!violationMatch)
      errors.push(`Expected violations: ${tc.expectedViolations.join(', ')}, Got: ${intent.violations?.join(', ')}`);
    if (!stateMatch)
      errors.push(`Expected state: ${tc.expectedState}, Got: ${intent.state}`);
    if (!vehicleMatch)
      errors.push(`Expected vehicle: ${tc.expectedVehicle}, Got: ${intent.vehicleType}`);

    const allPassed = violationMatch && stateMatch && vehicleMatch;
    if (allPassed) passed++;

    results.push({
      query: tc.query,
      passed: allPassed,
      violationMatch,
      stateMatch,
      vehicleMatch,
      actualOutput: intent,
      errors,
    });

    console.log(allPassed ? '\u2705' : '\u274c', tc.query.slice(0, 60) + '...');
    if (errors.length > 0) errors.forEach((e) => console.log('   ', e));
  }

  const accuracy = Math.round((passed / GOLDEN_DATASET.length) * 100);
  console.log(`\nResults: ${passed}/${GOLDEN_DATASET.length} passed — ${accuracy}% accuracy`);

  if (accuracy < 80) {
    console.error('Accuracy below 80% threshold. Review LLM prompts.');
    process.exit(1);
  } else {
    console.log('Eval passed.');
  }
}

runEval().catch(console.error);
