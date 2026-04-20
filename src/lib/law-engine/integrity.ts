// Phase 8.1 — law-pack integrity verification.
// Computes / verifies checksums for data/laws/**/*.json against
// data/laws/checksums.json.
//
// TODO(phase-8): implement canonicalized JSON hashing and runtime verify.
//   See ROADMAP.md and docs/roadmap/phase-08.md.

export type PackMetadata = {
  packId: string;
  packVersion: string; // SemVer
  publishedAt: string | null;
  sourceUrls: string[];
  hash: string | null;
  lastVerified: string | null;
  coverage: { sections: number; lastSectionAdded: string | null };
};

/**
 * Computes SHA-256 of canonicalized text
 */
async function computeHash(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Deterministic JSON stringifier (Browser-compatible)
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

export async function verifyChecksums(): Promise<{ ok: boolean; mismatches: string[] }> {
  try {
    const res = await fetch('/data/laws/checksums.json');
    if (!res.ok) return { ok: false, mismatches: ['checksums.json missing'] };
    const manifest = await res.json();
    
    const mismatches: string[] = [];
    
    for (const packId of Object.keys(manifest)) {
      const packRes = await fetch(`/data/laws/in/${packId}.json`);
      if (!packRes.ok) continue;
      
      const json = await packRes.json();
      const actualHash = await computeHash(canonicalize(json));
      
      if (actualHash !== manifest[packId].sha256) {
        mismatches.push(packId);
      }
    }
    
    return { ok: mismatches.length === 0, mismatches };
  } catch (err) {
    console.error('Integrity check failed:', err);
    return { ok: false, mismatches: ['runtime error'] };
  }
}

export async function getPackMetadata(packId: string): Promise<PackMetadata | null> {
  try {
    // Try to load metadata file
    const res = await fetch(`/data/laws/in/${packId}.pack_metadata.json`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
