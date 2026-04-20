import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Deterministic JSON stringifier to ensure consistent hashes
 */
function canonicalize(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return '[' + obj.map(o => canonicalize(o)).join(',') + ']';
  }

  const keys = Object.keys(obj).sort();
  return '{' + keys.map(k => `${JSON.stringify(k)}:${canonicalize(obj[k])}`).join(',') + '}';
}

async function generateChecksums() {
  const lawsDir = path.join(process.cwd(), 'data', 'laws', 'in');
  const files = fs.readdirSync(lawsDir).filter(f => f.endsWith('.json') && !f.includes('pack_metadata'));
  
  const checksums: Record<string, { sha256: string; entries: number; generatedAt: string }> = {};

  for (const file of files) {
    const packId = file.replace('.json', '');
    const fullPath = path.join(lawsDir, file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    
    try {
      const json = JSON.parse(content);
      const canonical = canonicalize(json);
      const sha256 = crypto.createHash('sha256').update(canonical).digest('hex');
      const entries = json.violations?.length ?? 0;

      checksums[packId] = {
        sha256,
        entries,
        generatedAt: new Date().toISOString().split('T')[0]
      };
      
      console.log(`✅ [${packId}] -> ${sha256.substring(0, 8)}... (${entries} entries)`);
    } catch (e) {
      console.error(`❌ Failed to parse ${file}:`, e);
    }
  }

  const outputPath = path.join(process.cwd(), 'data', 'laws', 'checksums.json');
  fs.writeFileSync(outputPath, JSON.stringify(checksums, null, 2));
  console.log(`\n🎉 Generated checksums.json with ${Object.keys(checksums).length} packs.`);
}

generateChecksums().catch(console.error);
