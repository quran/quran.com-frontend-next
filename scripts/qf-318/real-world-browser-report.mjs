#!/usr/bin/env node
/**
 * Real-world browser performance report for ssr.quran.com (and optional comparison to quran.com).
 *
 * Captures:
 * - navigation timings (DOM content loaded / load / networkidle)
 * - key UX paints (FCP/LCP/CLS) when available
 * - long tasks summary (proxy for hydration / main-thread work)
 * - request waterfall summary (top slow XHR/fetch, top slow resources)
 * - document response caching headers (x-qdc-edge-cache, cf-cache-status, age)
 *
 * Usage:
 *   node scripts/qf-318/real-world-browser-report.mjs
 *
 * Env vars:
 *   URLS="https://ssr.quran.com/ https://ssr.quran.com/vi https://ssr.quran.com/vi/5"
 *   RUNS=2
 *   OUT_DIR="test-results/qf-318-real-world"
 *   HEADLESS=1
 *   COOKIE="name=value; name2=value2"           # optional Cookie header for all runs
 */

import fs from 'fs';
import path from 'path';

import { chromium } from '@playwright/test';

const DEFAULT_URLS = [
  'https://ssr.quran.com/',
  'https://ssr.quran.com/vi',
  'https://ssr.quran.com/5',
  'https://ssr.quran.com/vi/5',
  'https://quran.com/vi',
  'https://quran.com/5',
  'https://quran.com/vi/5',
];

const URLS = (process.env.URLS || DEFAULT_URLS.join(' '))
  .split(/\s+/)
  .map((u) => u.trim())
  .filter(Boolean);

const RUNS = Number(process.env.RUNS || 2);
const OUT_DIR = process.env.OUT_DIR || 'test-results/qf-318-real-world';
const HEADLESS = process.env.HEADLESS !== '0';
const HEADLESS_MODE = process.env.PLAYWRIGHT_HEADLESS_MODE || 'old';
const COOKIE = process.env.COOKIE || '';

const nowId = () => new Date().toISOString().replace(/[:.]/g, '-');

const safeFilename = (value) =>
  value
    .replace(/^https?:\/\//, '')
    .replace(/[/?#:&=]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

const ms = (n) => (typeof n === 'number' && Number.isFinite(n) ? Math.round(n) : null);

const pick = (obj, keys) =>
  keys.reduce((acc, k) => {
    acc[k] = obj?.[k];
    return acc;
  }, {});

const initPerfObserverScript = () => {
  // This runs in the browser context.
  // eslint-disable-next-line no-undef
  window.__qdcPerf = {
    fcp: null,
    lcp: null,
    cls: 0,
    longTasksTotalMs: 0,
    longTasks: [],
  };

  try {
    // FCP
    // eslint-disable-next-line no-undef
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // eslint-disable-next-line no-undef
        if (entry.name === 'first-contentful-paint') window.__qdcPerf.fcp = entry.startTime;
      }
    }).observe({ type: 'paint', buffered: true });
  } catch {}

  try {
    // LCP
    // eslint-disable-next-line no-undef
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      if (last) {
        // eslint-disable-next-line no-undef
        window.__qdcPerf.lcp = last.startTime;
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {}

  try {
    // CLS
    // eslint-disable-next-line no-undef
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Ignore shifts caused by user input
        if (entry.hadRecentInput) continue;
        // eslint-disable-next-line no-undef
        window.__qdcPerf.cls += entry.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  } catch {}

  try {
    // Long tasks
    // eslint-disable-next-line no-undef
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // eslint-disable-next-line no-undef
        window.__qdcPerf.longTasksTotalMs += entry.duration;
        // Keep only a small sample for debugging.
        // eslint-disable-next-line no-undef
        if (window.__qdcPerf.longTasks.length < 50) {
          // eslint-disable-next-line no-undef
          window.__qdcPerf.longTasks.push({
            startTime: entry.startTime,
            duration: entry.duration,
            name: entry.name,
          });
        }
      }
    }).observe({ type: 'longtask', buffered: true });
  } catch {}
};

const selectorForUrl = (finalUrl) => {
  const { pathname } = new URL(finalUrl);
  const parts = pathname.split('/').filter(Boolean);
  const last = parts[parts.length - 1] || '';

  // Surah pages like /<locale>/5 or /5 (after redirect) should have chapter title.
  if (/^\d+$/.test(last)) return '[data-testid="chapter-title"]';

  // Locale home pages like /vi should have chapter list entry.
  return '[data-testid="chapter-1-container"]';
};

const formatHeaders = (headers) => {
  const keys = [
    'x-qdc-edge-cache',
    'x-qdc-edge-cache-key',
    'cf-cache-status',
    'age',
    'cache-control',
    'content-encoding',
    'content-type',
    'server-timing',
  ];
  const out = {};
  for (const k of keys) {
    const v = headers[k];
    if (v) out[k] = v;
  }
  return out;
};

const runOnce = async ({ browser, url, runIndex }) => {
  const context = await browser.newContext({
    // keep caching enabled (realistic)
    ignoreHTTPSErrors: true,
  });

  if (COOKIE) {
    await context.setExtraHTTPHeaders({ cookie: COOKIE });
  }

  const page = await context.newPage();
  await page.addInitScript(initPerfObserverScript);

  const responses = [];
  const errors = [];

  page.on('pageerror', (err) => errors.push({ type: 'pageerror', message: String(err) }));
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push({ type: 'console', message: msg.text() });
  });

  page.on('response', async (res) => {
    try {
      const req = res.request();
      const timing = req.timing();
      const resourceType = req.resourceType();

      responses.push({
        url: res.url(),
        status: res.status(),
        ok: res.ok(),
        resourceType,
        isNavigationRequest: req.isNavigationRequest(),
        method: req.method(),
        timing,
        headers: res.headers(),
      });
    } catch {
      // ignore
    }
  });

  const t0 = Date.now();
  const navResponse = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  const tDomContentLoaded = Date.now();

  const finalUrl = page.url();
  const contentSelector = selectorForUrl(finalUrl);

  // Content ready (best-effort)
  let tContentReady = null;
  try {
    await page.waitForSelector(contentSelector, { state: 'visible', timeout: 30_000 });
    tContentReady = Date.now();
  } catch {
    // ignore
  }

  // Load + network idle (best-effort)
  let tLoad = null;
  try {
    await page.waitForLoadState('load', { timeout: 30_000 });
    tLoad = Date.now();
  } catch {
    // ignore
  }

  let tNetworkIdle = null;
  try {
    await page.waitForLoadState('networkidle', { timeout: 30_000 });
    tNetworkIdle = Date.now();
  } catch {
    // ignore
  }

  // Give any pending perf observers a tiny bit of time.
  await page.waitForTimeout(250);

  const perf = await page.evaluate(() => window.__qdcPerf || null);
  const navigation = await page.evaluate(
    () => performance.getEntriesByType('navigation')[0] || null,
  );

  const htmlBytes = navResponse ? (await navResponse.body()).length : null;

  const navHeaders = navResponse ? navResponse.headers() : {};
  const navHeadersPicked = formatHeaders(navHeaders);

  const durationTo = (t) => (t ? t - t0 : null);

  const summary = {
    inputUrl: url,
    finalUrl,
    runIndex,
    htmlBytes,
    documentHeaders: navHeadersPicked,
    milestones: {
      domContentLoadedMs: durationTo(tDomContentLoaded),
      contentReadyMs: durationTo(tContentReady),
      loadMs: durationTo(tLoad),
      networkIdleMs: durationTo(tNetworkIdle),
    },
    webVitals: {
      fcpMs: ms(perf?.fcp),
      lcpMs: ms(perf?.lcp),
      cls: typeof perf?.cls === 'number' ? Number(perf.cls.toFixed(4)) : null,
      longTasksTotalMs: ms(perf?.longTasksTotalMs),
      longTasksCount: Array.isArray(perf?.longTasks) ? perf.longTasks.length : null,
    },
    navigationTiming: navigation
      ? pick(navigation, [
          'type',
          'startTime',
          'duration',
          'domContentLoadedEventEnd',
          'loadEventEnd',
          'responseStart',
          'responseEnd',
        ])
      : null,
    errors,
    responses,
  };

  await page.close();
  await context.close();

  return summary;
};

const summarizeNetwork = (responses) => {
  const completed = responses
    .map((r) => {
      const t = r.timing || {};
      const { startTime } = t;
      const { responseEnd } = t;
      const { responseStart } = t;

      // Playwright timings are shaped like:
      // - startTime: epoch ms
      // - everything else: offsets (ms) from startTime
      // So total duration is simply responseEnd (offset).
      let durationMs = null;
      if (typeof startTime === 'number' && typeof responseEnd === 'number') {
        durationMs = startTime > 1e12 ? responseEnd : Math.max(0, responseEnd - startTime);
      }

      let ttfbMs = null;
      if (typeof startTime === 'number' && typeof responseStart === 'number') {
        ttfbMs = startTime > 1e12 ? responseStart : Math.max(0, responseStart - startTime);
      }
      const cfCache = r.headers?.['cf-cache-status'];
      const qdcEdge = r.headers?.['x-qdc-edge-cache'];
      return {
        url: r.url,
        status: r.status,
        type: r.resourceType,
        durationMs,
        ttfbMs,
        cfCache,
        qdcEdge,
      };
    })
    .filter((r) => r.durationMs !== null);

  const byType = {};
  for (const r of completed) {
    if (!byType[r.type]) byType[r.type] = { count: 0, totalMs: 0 };
    byType[r.type].count += 1;
    byType[r.type].totalMs += r.durationMs;
  }

  const slowest = [...completed]
    .sort((a, b) => (b.durationMs || 0) - (a.durationMs || 0))
    .slice(0, 12);
  const slowFetch = completed
    .filter((r) => r.type === 'xhr' || r.type === 'fetch')
    .sort((a, b) => (b.durationMs || 0) - (a.durationMs || 0))
    .slice(0, 12);

  return { byType, slowest, slowFetch };
};

const toMd = (results) => {
  const lines = [];
  lines.push(`# QF-318 — Real-world browser report`);
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push(`Runs per URL: ${RUNS}`);
  lines.push('');

  for (const r of results) {
    const net = summarizeNetwork(r.responses || []);
    lines.push(`## ${r.inputUrl}`);
    lines.push('');
    lines.push(`- Final URL: \`${r.finalUrl}\``);
    lines.push(`- HTML bytes: ${r.htmlBytes ?? 'n/a'}`);
    lines.push(`- Document cache headers:`);
    lines.push('  ```json');
    lines.push(`  ${JSON.stringify(r.documentHeaders || {}, null, 2)}`);
    lines.push('  ```');
    lines.push(`- Milestones (ms since navigation start):`);
    lines.push('  ```json');
    lines.push(`  ${JSON.stringify(r.milestones || {}, null, 2)}`);
    lines.push('  ```');
    lines.push(`- Web Vitals / main-thread:`);
    lines.push('  ```json');
    lines.push(`  ${JSON.stringify(r.webVitals || {}, null, 2)}`);
    lines.push('  ```');

    if (r.errors?.length) {
      lines.push(`- Console/page errors (${r.errors.length}):`);
      lines.push('  ```json');
      lines.push(`  ${JSON.stringify(r.errors, null, 2)}`);
      lines.push('  ```');
    }

    lines.push(`- Requests by type (count, totalMs):`);
    lines.push('  ```json');
    lines.push(`  ${JSON.stringify(net.byType, null, 2)}`);
    lines.push('  ```');

    const fmt = (item) =>
      `  - ${item.durationMs.toFixed(0)}ms (ttfb ${item.ttfbMs?.toFixed?.(0) ?? 'n/a'}ms) [${
        item.type
      }] ${item.status} cf=${item.cfCache || '-'} qdc=${item.qdcEdge || '-'} ${item.url}`;

    lines.push(`- Slowest requests:`);
    lines.push(...net.slowest.map(fmt));

    if (net.slowFetch.length) {
      lines.push(`- Slowest fetch/xhr:`);
      lines.push(...net.slowFetch.map(fmt));
    }

    lines.push('');
  }

  return lines.join('\n');
};

const main = async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const useNewHeadless = HEADLESS && HEADLESS_MODE === 'new';
  const browser = await chromium.launch({
    headless: useNewHeadless ? false : HEADLESS,
    args: useNewHeadless ? ['--headless=new', '--disable-crashpad'] : undefined,
  });

  const results = [];
  for (const url of URLS) {
    for (let i = 0; i < RUNS; i += 1) {
      // eslint-disable-next-line no-console
      console.log(`Running [${i + 1}/${RUNS}] ${url}`);
      // eslint-disable-next-line no-await-in-loop
      const res = await runOnce({ browser, url, runIndex: i + 1 });
      results.push(res);
    }
  }

  await browser.close();

  const outMd = toMd(results);
  const outPath = path.join(OUT_DIR, `report-${nowId()}.md`);
  fs.writeFileSync(outPath, outMd);

  // eslint-disable-next-line no-console
  console.log(`\nSaved report: ${outPath}\n`);
  // eslint-disable-next-line no-console
  console.log(outMd);
};

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
