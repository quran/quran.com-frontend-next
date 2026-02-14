#!/usr/bin/env node

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..', '..');
const mapPath = path.join(repoRoot, '.agents', 'quran', 'symlink-map.json');
const verbose = process.argv.includes('--verbose') || process.env.AI_CHECK_VERBOSE === '1';

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
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'quran-ai-check-'));
  const target = path.join(tempDir, 'target.txt');
  const link = path.join(tempDir, 'link.txt');

  try {
    await fs.writeFile(target, 'ok', 'utf8');
    await fs.symlink('target.txt', link, 'file');
  } catch (error) {
    const help = [
      'Symlink support is unavailable in this environment.',
      'Enable symlink support before running `yarn ai:check`.',
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

const checkTreeEntry = async (entry, errors, linkStatuses) => {
  const linkPath = path.resolve(repoRoot, entry.path);
  const targetPath = path.resolve(repoRoot, entry.target);

  if (!(await exists(targetPath))) {
    errors.push(`Missing canonical target for ${entry.path}: ${entry.target}`);
    linkStatuses.push({
      path: entry.path,
      target: entry.target,
      status: 'error',
      reason: 'missing-target',
    });
    return;
  }

  const targetStat = await fs.stat(targetPath);
  if (!targetStat.isDirectory()) {
    errors.push(`Tree target must be a directory: ${entry.target}`);
    linkStatuses.push({
      path: entry.path,
      target: entry.target,
      status: 'error',
      reason: 'target-not-directory',
    });
    return;
  }

  const expectedEntries = await gatherTreeTargetFiles(targetPath);
  const mirrorState = await inspectMirrorTree(linkPath, expectedEntries);
  if (!mirrorState.ok) {
    errors.push(`Tree mirror invalid at ${entry.path}: ${mirrorState.reason}`);
    linkStatuses.push({
      path: entry.path,
      target: entry.target,
      status: 'error',
      reason: mirrorState.reason,
    });
    return;
  }

  linkStatuses.push({
    path: entry.path,
    target: entry.target,
    status: 'ok',
  });
};

const checkDirectLinkEntry = async (entry, errors, linkStatuses) => {
  const linkPath = path.resolve(repoRoot, entry.path);
  const targetPath = path.resolve(repoRoot, entry.target);

  if (!(await exists(targetPath))) {
    errors.push(`Missing canonical target for ${entry.path}: ${entry.target}`);
    linkStatuses.push({
      path: entry.path,
      target: entry.target,
      status: 'error',
      reason: 'missing-target',
    });
    return;
  }

  if (!(await exists(linkPath))) {
    errors.push(`Missing compatibility path: ${entry.path}`);
    linkStatuses.push({
      path: entry.path,
      target: entry.target,
      status: 'error',
      reason: 'missing-link',
    });
    return;
  }

  const stat = await fs.lstat(linkPath);
  if (!stat.isSymbolicLink()) {
    const type = stat.isDirectory() ? 'directory' : 'file';
    errors.push(`Expected symlink at ${entry.path}, found ${type}`);
    linkStatuses.push({
      path: entry.path,
      target: entry.target,
      status: 'error',
      reason: `not-symlink-${type}`,
    });
    return;
  }

  const currentTarget = await fs.readlink(linkPath);
  const resolvedCurrentTarget = resolveLinkTarget(linkPath, currentTarget);
  if (resolvedCurrentTarget !== targetPath) {
    errors.push(
      `Incorrect symlink target at ${entry.path}: expected ${entry.target}, found ${currentTarget}`,
    );
    linkStatuses.push({
      path: entry.path,
      target: entry.target,
      status: 'error',
      reason: 'wrong-target',
      currentTarget,
    });
    return;
  }

  linkStatuses.push({
    path: entry.path,
    target: entry.target,
    status: 'ok',
  });
};

const checkLinkEntry = async (entry, errors, linkStatuses) => {
  if (entry.type === 'tree') {
    await checkTreeEntry(entry, errors, linkStatuses);
    return;
  }

  await checkDirectLinkEntry(entry, errors, linkStatuses);
};

const stripCodeBlocks = (content) => content.replace(/```[\s\S]*?```/g, '');

const normalizeMarkdownLink = (rawLink) => {
  let value = rawLink.trim();

  if (value.startsWith('<') && value.endsWith('>')) {
    value = value.slice(1, -1);
  }

  if (!value) {
    return null;
  }

  const firstToken = value.split(/\s+/)[0];
  if (
    firstToken.startsWith('#') ||
    firstToken.startsWith('http://') ||
    firstToken.startsWith('https://') ||
    firstToken.startsWith('mailto:') ||
    firstToken.startsWith('tel:') ||
    firstToken.startsWith('data:')
  ) {
    return null;
  }

  return firstToken;
};

const collectMarkdownFiles = async (rootPath, files) => {
  const stat = await fs.lstat(rootPath);

  if (stat.isFile() && rootPath.endsWith('.md')) {
    files.push(rootPath);
    return;
  }

  if (!stat.isDirectory()) {
    return;
  }

  const entries = await fs.readdir(rootPath, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(rootPath, entry.name);
    if (entry.isSymbolicLink()) {
      continue;
    }
    if (entry.isDirectory()) {
      await collectMarkdownFiles(entryPath, files);
    } else if (entry.isFile() && entryPath.endsWith('.md')) {
      files.push(entryPath);
    }
  }
};

const checkMarkdownLinks = async (canonicalRoots, errors) => {
  const markdownFiles = [];
  const markdownStats = {
    filesScanned: 0,
    markdownLinksSeen: 0,
    localLinksChecked: 0,
    externalOrAnchorLinksSkipped: 0,
    brokenLocalLinks: 0,
  };

  for (const root of canonicalRoots) {
    const absRoot = path.resolve(repoRoot, root);
    if (await exists(absRoot)) {
      await collectMarkdownFiles(absRoot, markdownFiles);
    } else {
      errors.push(`Missing canonical markdown root: ${root}`);
    }
  }

  const regex = /\[[^\]]+\]\(([^)]+)\)/g;
  markdownStats.filesScanned = markdownFiles.length;

  for (const markdownFile of markdownFiles) {
    const content = await fs.readFile(markdownFile, 'utf8');
    const scanContent = stripCodeBlocks(content);
    let match;

    while ((match = regex.exec(scanContent)) !== null) {
      markdownStats.markdownLinksSeen += 1;
      const normalized = normalizeMarkdownLink(match[1]);
      if (!normalized) {
        markdownStats.externalOrAnchorLinksSkipped += 1;
        continue;
      }

      const [linkPath] = normalized.split('#');
      if (!linkPath) {
        markdownStats.externalOrAnchorLinksSkipped += 1;
        continue;
      }
      markdownStats.localLinksChecked += 1;

      const resolvedPath = linkPath.startsWith('/')
        ? path.resolve(repoRoot, linkPath.slice(1))
        : path.resolve(path.dirname(markdownFile), linkPath);

      if (!(await exists(resolvedPath))) {
        const fileLabel = path.relative(repoRoot, markdownFile) || markdownFile;
        errors.push(`Broken markdown link in ${fileLabel}: ${normalized}`);
        markdownStats.brokenLocalLinks += 1;
      }
    }
  }

  return markdownStats;
};

const run = async () => {
  await ensureSymlinkSupport();
  const map = await loadMap();
  const errors = [];
  const linkStatuses = [];

  for (const entry of map.links) {
    await checkLinkEntry(entry, errors, linkStatuses);
  }

  const markdownStats = await checkMarkdownLinks(map.canonicalRoots || ['.agents/quran'], errors);
  const okLinks = linkStatuses.filter((status) => status.status === 'ok').length;
  const failedLinks = linkStatuses.length - okLinks;

  if (errors.length > 0) {
    console.error('AI standards check failed:');
    console.error(`- Managed symlinks: ${map.links.length} (ok=${okLinks}, failed=${failedLinks})`);
    console.error(
      `- Markdown scan: files=${markdownStats.filesScanned}, localLinksChecked=${markdownStats.localLinksChecked}, broken=${markdownStats.brokenLocalLinks}`,
    );
    if (verbose) {
      console.error('- Canonical roots:');
      for (const root of map.canonicalRoots || ['.agents/quran']) {
        console.error(`  - ${root}`);
      }
      console.error('- Symlink status:');
      for (const status of linkStatuses) {
        if (status.status === 'ok') {
          console.error(`  - OK ${status.path} -> ${status.target}`);
        } else if (status.currentTarget) {
          console.error(
            `  - FAIL ${status.path} -> ${status.target} (${status.reason}; current=${status.currentTarget})`,
          );
        } else {
          console.error(`  - FAIL ${status.path} -> ${status.target} (${status.reason})`);
        }
      }
    }
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log('AI standards check passed.');
  console.log(`- Map file: ${path.relative(repoRoot, mapPath)}`);
  console.log(`- Managed symlinks: ${map.links.length} (ok=${okLinks}, failed=${failedLinks})`);
  console.log(`- Canonical roots: ${(map.canonicalRoots || ['.agents/quran']).join(', ')}`);
  console.log(
    `- Markdown scan: files=${markdownStats.filesScanned}, markdownLinksSeen=${markdownStats.markdownLinksSeen}, localLinksChecked=${markdownStats.localLinksChecked}, skipped=${markdownStats.externalOrAnchorLinksSkipped}, broken=${markdownStats.brokenLocalLinks}`,
  );
  if (verbose) {
    console.log('- Symlink status:');
    for (const status of linkStatuses) {
      console.log(`  - OK ${status.path} -> ${status.target}`);
    }
  } else {
    console.log('- Tip: run `yarn ai:check --verbose` for per-path symlink output.');
  }
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
