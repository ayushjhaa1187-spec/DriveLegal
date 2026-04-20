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

export async function verifyChecksums(): Promise<{ ok: boolean; mismatches: string[] }> {
  // TODO(phase-8): implement.
  return { ok: true, mismatches: [] };
}

export function getPackMetadata(_packId: string): PackMetadata | null {
  // TODO(phase-8): implement.
  return null;
}
