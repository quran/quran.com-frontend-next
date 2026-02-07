#!/usr/bin/env node

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const mapPath = path.join(repoRoot, '.agents', 'quran', 'symlink-map.json');

const exists = async (targetPath) => {
  try {
    await fs.lstat(targetPath);
    return true;
  } catch {
    return false;
  }
};

const resolveLinkTarget = (linkPath, currentTarget) =>
  path.resolve(path.dirname(linkPath), currentTarget);

const ensureSymlinkSupport = async () => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'quran-ai-sync-'));
  const target = path.join(tempDir, 'target.txt');
  const link = path.join(tempDir, 'link.txt');

  try {
    await fs.writeFile(target, 'ok', 'utf8');
    await fs.symlink('target.txt', link, 'file');
  } catch (error) {
    const help = [
      'Unable to create symlinks in this environment.',
      'Please enable symlink support and rerun `yarn ai:sync`.',
      'Windows: enable Developer Mode or run terminal as Administrator.',
      `Original error: ${error.message}`,
    ].join('\n');
    throw new Error(help);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
};

const loadMap = async () => {
  const raw = await fs.readFile(mapPath, 'utf8');
  return JSON.parse(raw);
};

const gatherTreeTargetFiles = async (targetRoot) => {
  const files = [];
  const visited = new Set();

  const walk = async (logicalDir) => {
    const realDir = await fs.realpath(logicalDir);
    if (visited.has(realDir)) {
      return;
    }
    visited.add(realDir);

    const entries = await fs.readdir(logicalDir, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(logicalDir, entry.name);
      const lstat = await fs.lstat(entryPath);

      if (lstat.isDirectory()) {
        await walk(entryPath);
      } else if (lstat.isFile()) {
        files.push(entryPath);
      } else if (lstat.isSymbolicLink()) {
        let followed;
        try {
          followed = await fs.stat(entryPath);
        } catch {
          throw new Error(`Broken symlink inside tree target: ${entryPath}`);
        }
        if (followed.isDirectory()) {
          await walk(entryPath);
        } else if (followed.isFile()) {
          files.push(entryPath);
        }
      }
    }
  };

  await walk(targetRoot);

  return files
    .map((filePath) => ({
      relativePath: path.relative(targetRoot, filePath),
      targetPath: filePath,
    }))
    .sort((a, b) => a.relativePath.localeCompare(b.relativePath));
};

const inspectMirrorTree = async (mirrorRoot, expectedEntries) => {
  if (!(await exists(mirrorRoot))) {
    return { ok: false, reason: 'missing-root' };
  }

  const rootStat = await fs.lstat(mirrorRoot);
  if (rootStat.isSymbolicLink()) {
    return { ok: false, reason: 'root-is-symlink' };
  }
  if (!rootStat.isDirectory()) {
    return { ok: false, reason: 'root-not-directory' };
  }

  const actual = new Map();
  const errors = [];

  const walk = async (currentDir) => {
    const entries = await fs.readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(currentDir, entry.name);
      const relPath = path.relative(mirrorRoot, entryPath);
      const lstat = await fs.lstat(entryPath);

      if (lstat.isDirectory()) {
        await walk(entryPath);
      } else if (lstat.isSymbolicLink()) {
        let followed;
        try {
          followed = await fs.stat(entryPath);
        } catch {
          errors.push(`Broken symlink in mirror: ${relPath}`);
          continue;
        }

        if (followed.isDirectory()) {
          errors.push(`Directory symlink found in mirror: ${relPath}`);
          continue;
        }

        if (!followed.isFile()) {
          errors.push(`Unsupported symlink target in mirror: ${relPath}`);
          continue;
        }

        const currentTarget = await fs.readlink(entryPath);
        actual.set(relPath, resolveLinkTarget(entryPath, currentTarget));
      } else {
        errors.push(`Expected symlink file in mirror, found regular file: ${relPath}`);
      }
    }
  };

  await walk(mirrorRoot);

  if (errors.length > 0) {
    return { ok: false, reason: errors[0] };
  }

  const expected = new Map(expectedEntries.map((entry) => [entry.relativePath, entry.targetPath]));
  if (expected.size !== actual.size) {
    return { ok: false, reason: 'different-file-count' };
  }

  for (const [relPath, expectedTarget] of expected.entries()) {
    const actualTarget = actual.get(relPath);
    if (!actualTarget) {
      return { ok: false, reason: `missing-file:${relPath}` };
    }
    if (actualTarget !== expectedTarget) {
      return { ok: false, reason: `wrong-target:${relPath}` };
    }
  }

  return { ok: true };
};

const ensureTreeMirror = async (entry) => {
  const mirrorRoot = path.resolve(repoRoot, entry.path);
  const targetRoot = path.resolve(repoRoot, entry.target);

  if (!(await exists(targetRoot))) {
    throw new Error(`Missing canonical target for ${entry.path}: ${entry.target}`);
  }

  const targetRootStat = await fs.stat(targetRoot);
  if (!targetRootStat.isDirectory()) {
    throw new Error(`Tree target must be a directory: ${entry.target}`);
  }

  const expectedEntries = await gatherTreeTargetFiles(targetRoot);
  const mirrorState = await inspectMirrorTree(mirrorRoot, expectedEntries);
  if (mirrorState.ok) {
    return 'ok';
  }

  const hadExistingMirror = await exists(mirrorRoot);
  if (hadExistingMirror) {
    await fs.rm(mirrorRoot, { recursive: true, force: true });
  }
  await fs.mkdir(mirrorRoot, { recursive: true });

  for (const expected of expectedEntries) {
    const mirrorFile = path.join(mirrorRoot, expected.relativePath);
    await fs.mkdir(path.dirname(mirrorFile), { recursive: true });
    const relativeTarget = path.relative(path.dirname(mirrorFile), expected.targetPath) || '.';
    await fs.symlink(relativeTarget, mirrorFile, 'file');
  }

  return hadExistingMirror ? 'repaired' : 'created';
};

const ensureDirectLink = async (entry) => {
  const linkPath = path.resolve(repoRoot, entry.path);
  const targetPath = path.resolve(repoRoot, entry.target);

  if (!(await exists(targetPath))) {
    throw new Error(`Missing canonical target for ${entry.path}: ${entry.target}`);
  }

  await fs.mkdir(path.dirname(linkPath), { recursive: true });

  let status = 'created';
  if (await exists(linkPath)) {
    const stat = await fs.lstat(linkPath);
    if (stat.isSymbolicLink()) {
      const currentTarget = await fs.readlink(linkPath);
      const resolvedCurrentTarget = resolveLinkTarget(linkPath, currentTarget);
      if (resolvedCurrentTarget === targetPath) {
        return 'ok';
      }
    }

    await fs.rm(linkPath, { recursive: true, force: true });
    status = 'repaired';
  }

  const relativeTarget = path.relative(path.dirname(linkPath), targetPath) || '.';
  await fs.symlink(relativeTarget, linkPath, entry.type === 'dir' ? 'dir' : 'file');
  return status;
};

const ensureLink = async (entry) => {
  if (entry.type === 'tree') {
    return ensureTreeMirror(entry);
  }

  return ensureDirectLink(entry);
};

const run = async () => {
  await ensureSymlinkSupport();
  const map = await loadMap();

  let created = 0;
  let repaired = 0;
  let ok = 0;

  for (const entry of map.links) {
    const result = await ensureLink(entry);
    if (result === 'created') {
      created += 1;
    } else if (result === 'repaired') {
      repaired += 1;
    } else {
      ok += 1;
    }
  }

  console.log(
    `Symlink sync complete. created=${created} repaired=${repaired} already-correct=${ok}`,
  );
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
