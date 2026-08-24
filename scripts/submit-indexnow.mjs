import { execFileSync } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import path from 'node:path';

const siteUrl = 'https://penapisairkesihatan.my';
const key = '167cdd53e4056317d641c96438dc0f5c1b803472';
const endpoint = 'https://api.indexnow.org/indexnow';
const requestTimeoutMs = 10_000;
const maxSubmissionAttempts = 4;
const maxKeyChecks = 6;
const scriptDeadline = Date.now() + 240_000;

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

function pageFileToPath(file) {
  const normalized = file.replaceAll('\\', '/');
  if (!normalized.startsWith('src/pages/') || !normalized.endsWith('.astro')) return undefined;

  const relative = normalized.slice('src/pages/'.length, -'.astro'.length);
  if (relative === '404') return undefined;
  if (relative === 'index') return '/';
  if (relative.endsWith('/index')) return `/${relative.slice(0, -'/index'.length)}/`;
  return `/${relative}/`;
}

async function listPageFiles(directory = 'src/pages') {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const fullPath = path.posix.join(directory.replaceAll('\\', '/'), entry.name);
    return entry.isDirectory() ? listPageFiles(fullPath) : [fullPath];
  }));
  return files.flat();
}

function changedFiles(fromSha, toSha) {
  if (!fromSha || /^0+$/.test(fromSha) || !toSha) return undefined;

  let output;
  try {
    output = execFileSync('git', ['diff', '--name-status', `${fromSha}..${toSha}`], {
      encoding: 'utf8',
    });
  } catch (error) {
    console.warn(`Unable to inspect ${fromSha}..${toSha}; submitting all current routes.`, error.message);
    return undefined;
  }

  return output
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .flatMap((line) => {
      const [, ...files] = line.split('\t');
      return files;
    });
}

const allRoutes = (await listPageFiles())
  .map(pageFileToPath)
  .filter(Boolean)
  .sort();

const fromSha = process.env.INDEXNOW_FROM_SHA;
const toSha = process.env.INDEXNOW_TO_SHA;
const changed = changedFiles(fromSha, toSha);
const sharedSiteFiles = [
  'astro.config.mjs',
  'src/components/',
  'src/data/',
  'src/layouts/',
];
const changedPageRoutes = changed
  ? [...new Set(changed.map(pageFileToPath).filter(Boolean))]
  : [];

let routes;
if (!changed) {
  routes = allRoutes;
} else if (changed.some((file) => sharedSiteFiles.some((prefix) => file === prefix || file.startsWith(prefix)))) {
  routes = [...new Set([...allRoutes, ...changedPageRoutes])].sort();
} else {
  routes = changedPageRoutes.sort();
}

if (routes.length === 0) {
  console.log(JSON.stringify({ submitted: 0, reason: 'No indexable page changed.' }));
  process.exit(0);
}

const urlList = routes.map((route) => new URL(route, siteUrl).toString());
const payload = {
  host: new URL(siteUrl).hostname,
  key,
  keyLocation: `${siteUrl}/${key}.txt`,
  urlList,
};

if (urlList.length > 10_000) {
  throw new Error(`IndexNow accepts at most 10,000 URLs per request; received ${urlList.length}.`);
}

if (process.env.INDEXNOW_DRY_RUN === '1') {
  console.log(JSON.stringify({ dryRun: true, submitted: urlList.length, urlList }, null, 2));
  process.exit(0);
}

async function fetchWithTimeout(url, options = {}) {
  return fetch(url, { ...options, signal: AbortSignal.timeout(requestTimeoutMs) });
}

function retryDelay(response, attempt) {
  const retryAfter = response?.headers.get('retry-after');
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (Number.isFinite(seconds) && seconds >= 0) {
      const milliseconds = seconds * 1000;
      return milliseconds <= scriptDeadline - Date.now() ? milliseconds : undefined;
    }

    const retryDate = Date.parse(retryAfter);
    if (Number.isFinite(retryDate)) {
      const milliseconds = Math.max(retryDate - Date.now(), 0);
      return milliseconds <= scriptDeadline - Date.now() ? milliseconds : undefined;
    }
  }
  const milliseconds = Math.min(1000 * (2 ** (attempt - 1)), 8000);
  return milliseconds <= scriptDeadline - Date.now() ? milliseconds : undefined;
}

async function verifyKeyLocation() {
  let lastProblem = 'not checked';
  for (let attempt = 1; attempt <= maxKeyChecks; attempt += 1) {
    try {
      const response = await fetchWithTimeout(payload.keyLocation, {
        headers: { 'cache-control': 'no-cache' },
      });
      const body = await response.text();
      if (response.ok && body.trim() === key) {
        console.log(`Verified IndexNow key at ${payload.keyLocation}.`);
        return;
      }
      lastProblem = `HTTP ${response.status}${body ? `: ${body.slice(0, 160)}` : ''}`;
    } catch (error) {
      lastProblem = error.message;
    }

    if (attempt < maxKeyChecks) await wait(Math.min(1000 * (2 ** (attempt - 1)), 5000));
  }
  throw new Error(`IndexNow key was not available after deployment (${lastProblem}).`);
}

async function submitWithRetry() {
  let lastProblem = 'not submitted';
  let attemptsMade = 0;
  for (let attempt = 1; attempt <= maxSubmissionAttempts; attempt += 1) {
    attemptsMade = attempt;
    let response;
    try {
      response = await fetchWithTimeout(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      lastProblem = error.message;
      if (attempt === maxSubmissionAttempts) break;
      const delay = retryDelay(undefined, attempt);
      if (delay === undefined) {
        lastProblem += '; retry would exceed the workflow time budget';
        break;
      }
      await wait(delay);
      continue;
    }

    if ([200, 202].includes(response.status)) return response;

    const detail = await response.text();
    lastProblem = `HTTP ${response.status}${detail ? `: ${detail.slice(0, 500)}` : ''}`;
    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt === maxSubmissionAttempts) break;
    const delay = retryDelay(response, attempt);
    if (delay === undefined) {
      lastProblem += '; Retry-After exceeds the remaining workflow time budget';
      break;
    }
    await wait(delay);
  }
  const attemptLabel = attemptsMade === 1 ? 'attempt' : 'attempts';
  throw new Error(`IndexNow submission failed after ${attemptsMade} ${attemptLabel} (${lastProblem}).`);
}

await verifyKeyLocation();
const response = await submitWithRetry();

console.log(JSON.stringify({ submitted: urlList.length, status: response.status, urlList }, null, 2));
