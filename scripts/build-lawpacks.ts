// Phase 8.2 — Build Law Packs & generate checksums + manifest
// Run with: npx tsx scripts/build-lawpacks.ts

import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';

const LAWPACKS_DIR = path.join(process.cwd(), 'data', 'lawpacks');

async function buildAllPacks(): Promise<void> {
  console.log('Building Law Packs...');

  const manifest: Record<string, any> = {
    schemaVersion: '2.0.0',
    generatedAt: new Date().toISOString(),
    packs: {},
  };

  // Walk all pack directories under data/lawpacks/in/
  const jurisdictionsDir = path.join(LAWPACKS_DIR, 'in');
  let jurisdictions: any[] = [];
  try {
    jurisdictions = await fs.readdir(jurisdictionsDir, { withFileTypes: true });
  } catch {
    console.warn('No in/ directory found, skipping.');
  }

  for (const jur of jurisdictions) {
    if (!jur.isDirectory()) continue;

    const jurPath = path.join(jurisdictionsDir, jur.name);
    const versions = await fs.readdir(jurPath);
    const latest = [...versions].sort().pop();
    if (!latest) continue;

    const packPath = path.join(jurPath, latest);
    const checksums = await generateChecksums(packPath);

    // Write checksums.json
    await fs.writeFile(
      path.join(packPath, 'checksums.json'),
      JSON.stringify(checksums, null, 2),
    );

    // Update metadata
    const metaPath = path.join(packPath, 'packmetadata.json');
    try {
      const meta = JSON.parse(await fs.readFile(metaPath, 'utf-8'));
      meta.hash = checksums.packHash;
      meta.publishedAt = new Date().toISOString();
      await fs.writeFile(metaPath, JSON.stringify(meta, null, 2));

      manifest.packs[`IN-${jur.name}`] = {
        latest,
        path: `in/${jur.name}/${latest}`,
        lastVerified: meta.lastVerified,
        totalViolations: meta.totalViolations,
      };

      console.log(`IN-${jur.name}@${latest} ${checksums.packHash.slice(0, 12)}...`);
    } catch {
      console.warn(`No packmetadata.json found for IN-${jur.name}@${latest}`);
    }
  }

  // Write manifest
  await fs.writeFile(
    path.join(LAWPACKS_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2),
  );

  console.log('All law packs built successfully.');
  console.log(`${Object.keys(manifest.packs).length} packs in manifest`);
}

async function generateChecksums(
  packDir: string,
): Promise<{ files: Record<string, string>; packHash: string }> {
  const files = await fs.readdir(packDir);
  const fileHashes: Record<string, string> = {};

  for (const file of files) {
    if (file === 'checksums.json') continue;
    const content = await fs.readFile(path.join(packDir, file));
    fileHashes[file] = crypto.createHash('sha256').update(content).digest('hex');
  }

  const packHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(fileHashes))
    .digest('hex');

  return { files: fileHashes, packHash };
}

buildAllPacks().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
