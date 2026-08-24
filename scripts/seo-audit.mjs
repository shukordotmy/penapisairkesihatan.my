import { existsSync } from 'node:fs';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(scriptDirectory, '..');
const outputDirectory = path.resolve(process.argv[2] || path.join(repositoryRoot, 'dist'));
const configuredSiteUrl = process.env.SEO_SITE_URL || 'https://penapisairkesihatan.my/';

const issues = new Map();
const issueKeys = new Set();

function report(scope, code, detail = '') {
  const message = detail ? `${code}: ${detail}` : code;
  const key = `${scope}\0${message}`;
  if (issueKeys.has(key)) return;
  issueKeys.add(key);
  if (!issues.has(scope)) issues.set(scope, []);
  issues.get(scope).push(message);
}

function decodeEntities(value) {
  const named = {
    amp: '&',
    apos: "'",
    gt: '>',
    lt: '<',
    nbsp: '\u00a0',
    quot: '"',
  };

  return String(value).replace(/&(#(?:x[\da-f]+|\d+)|[a-z][\da-z]+);/gi, (entity, body) => {
    if (body[0] !== '#') return named[body.toLowerCase()] ?? entity;
    const hexadecimal = body[1]?.toLowerCase() === 'x';
    const codePoint = Number.parseInt(body.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
    if (!Number.isInteger(codePoint) || codePoint < 0 || codePoint > 0x10ffff) return entity;
    try {
      return String.fromCodePoint(codePoint);
    } catch {
      return entity;
    }
  });
}

function parseAttributes(source) {
  const attributes = Object.create(null);
  const pattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  for (const match of source.matchAll(pattern)) {
    const name = match[1].toLowerCase();
    const value = match[2] ?? match[3] ?? match[4] ?? '';
    attributes[name] = decodeEntities(value);
  }
  return attributes;
}

function openingTags(markup, tagName) {
  const tags = [];
  const pattern = new RegExp(`<${tagName}\\b([^>]*)>`, 'gi');
  for (const match of markup.matchAll(pattern)) {
    tags.push({ attributes: parseAttributes(match[1]), source: match[0] });
  }
  return tags;
}

function rawElementContents(markup, tagName) {
  const contents = [];
  const pattern = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}\\s*>`, 'gi');
  for (const match of markup.matchAll(pattern)) contents.push(match[1]);
  return contents;
}

function renderedMarkup(markup) {
  return markup
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<(script|style|template|textarea)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '');
}

function normalizedText(value) {
  return decodeEntities(String(value).replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function metaValues(head, attributeName, expectedValue) {
  return openingTags(head, 'meta')
    .filter(({ attributes }) => attributes[attributeName]?.toLowerCase() === expectedValue.toLowerCase())
    .map(({ attributes }) => (attributes.content ?? '').trim());
}

function requiredSingle(values, scope, code) {
  if (values.length === 0) {
    report(scope, `${code}.missing`);
    return '';
  }
  if (values.length > 1) report(scope, `${code}.duplicate`, `${values.length} declarations`);
  if (!values[0].trim()) report(scope, `${code}.empty`);
  return values[0].trim();
}

function isPositiveInteger(value) {
  return /^(?:[1-9]\d*)$/.test(value ?? '');
}

function toPosix(relativePath) {
  return relativePath.split(path.sep).join('/');
}

function encodePath(relativePath) {
  return relativePath.split('/').map((segment) => encodeURIComponent(segment)).join('/');
}

function routeForHtmlFile(relativePath) {
  const posixPath = toPosix(relativePath);
  if (posixPath === 'index.html') return '/';
  if (posixPath === '404.html') return '/404/';
  if (posixPath.endsWith('/index.html')) {
    return `/${encodePath(posixPath.slice(0, -'index.html'.length))}`;
  }
  return `/${encodePath(posixPath)}`;
}

async function listFiles(directory, base = directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(absolutePath, base));
    else if (entry.isFile()) files.push(toPosix(path.relative(base, absolutePath)));
  }
  return files;
}

function normalizeSiteBase(value) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('SEO_SITE_URL must use http or https.');
  if (url.search || url.hash) throw new Error('SEO_SITE_URL must not contain a query string or fragment.');
  url.pathname = `${url.pathname.replace(/\/+$/, '')}/`;
  return url;
}

function pageUrlForRoute(siteBase, route) {
  return new URL(route.replace(/^\/+/, ''), siteBase);
}

function safeDecodePathname(pathname) {
  try {
    const decoded = decodeURIComponent(pathname);
    if (decoded.includes('\0') || decoded.split('/').includes('..')) return null;
    return decoded;
  } catch {
    return null;
  }
}

function relativeOutputPathForUrl(url, siteBase) {
  const decodedPath = safeDecodePathname(url.pathname);
  const decodedBase = safeDecodePathname(siteBase.pathname);
  if (decodedPath === null || decodedBase === null) return null;
  const basePrefix = decodedBase.endsWith('/') ? decodedBase : `${decodedBase}/`;
  if (!decodedPath.startsWith(basePrefix) && decodedPath !== basePrefix.slice(0, -1)) return null;
  return decodedPath.slice(basePrefix.length).replace(/^\/+/, '');
}

function resolveOutputUrl(url, siteBase, fileSet, { htmlFallback = false } = {}) {
  const relativePath = relativeOutputPathForUrl(url, siteBase);
  if (relativePath === null) return null;

  const cleanPath = relativePath.replace(/\/+$/, '');
  const candidates = [];
  if (relativePath === '' || url.pathname.endsWith('/')) {
    candidates.push(cleanPath ? `${cleanPath}/index.html` : 'index.html');
  } else {
    candidates.push(relativePath);
    if (htmlFallback) {
      candidates.push(`${relativePath}.html`, `${relativePath}/index.html`);
    }
  }

  if (relativePath === '404/') candidates.push('404.html');

  const match = candidates.find((candidate) => fileSet.has(candidate));
  return match ?? null;
}

function parseSrcset(value) {
  if (!value.trim() || value.trim().startsWith('data:')) return [];
  return value.split(',').map((candidate) => candidate.trim().split(/\s+/)[0]).filter(Boolean);
}

function sameSiteHostname(url, siteBase) {
  const stripWww = (hostname) => hostname.toLowerCase().replace(/^www\./, '');
  return stripWww(url.hostname) === stripWww(siteBase.hostname);
}

function parseUrl(value, base, scope, code) {
  try {
    return new URL(value, base);
  } catch {
    report(scope, code, JSON.stringify(value));
    return null;
  }
}

function auditLocalResource(value, page, code, siteBase, fileSet, counters, { absolute = false } = {}) {
  if (!value) {
    report(page.route, `${code}.empty`);
    return;
  }
  if (/^(?:data|blob):/i.test(value)) return;
  if (absolute && !/^[a-z][a-z\d+.-]*:\/\//i.test(value)) {
    report(page.route, `${code}.not-absolute`, value);
    return;
  }

  const url = parseUrl(value, page.expectedUrl, page.route, `${code}.invalid-url`);
  if (!url || !['http:', 'https:'].includes(url.protocol)) return;
  if (!sameSiteHostname(url, siteBase)) return;
  if (url.origin !== siteBase.origin) {
    report(page.route, `${code}.wrong-origin`, url.href);
    return;
  }
  counters.localResources += 1;
  if (!resolveOutputUrl(url, siteBase, fileSet)) report(page.route, `${code}.missing-file`, url.pathname);
}

function extractPageIds(markup) {
  const ids = new Set();
  const cleaned = renderedMarkup(markup);
  const pattern = /<[a-z][^>]*>/gi;
  for (const match of cleaned.matchAll(pattern)) {
    const attributes = parseAttributes(match[0].replace(/^<[a-z][^\s>]*|\/?\s*>$/gi, ''));
    if (attributes.id) ids.add(attributes.id);
    if (/^<a\b/i.test(match[0]) && attributes.name) ids.add(attributes.name);
  }
  return ids;
}

function robotsDirectives(values) {
  return values.flatMap((value) => value.toLowerCase().split(/[\s,]+/).filter(Boolean));
}

function parseRobotsFile(source) {
  const groups = [];
  const sitemaps = [];
  let group = null;

  for (const rawLine of source.replace(/^\ufeff/, '').split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, '').trim();
    if (!line) continue;
    const separator = line.indexOf(':');
    if (separator < 0) continue;
    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (field === 'sitemap') {
      if (value) sitemaps.push(value);
      continue;
    }
    if (field === 'user-agent') {
      if (!group || group.rules.length > 0) {
        group = { agents: [], rules: [] };
        groups.push(group);
      }
      group.agents.push(value.toLowerCase());
      continue;
    }
    if ((field === 'allow' || field === 'disallow') && group) {
      group.rules.push({ type: field, value });
    }
  }
  return { groups, sitemaps };
}

function robotsPatternMatches(pathname, pattern) {
  if (!pattern) return false;
  const endsAtPath = pattern.endsWith('$');
  const body = endsAtPath ? pattern.slice(0, -1) : pattern;
  const escaped = body.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escaped}${endsAtPath ? '$' : ''}`).test(pathname);
}

function isBlockedByRobots(pathname, wildcardRules) {
  const matches = wildcardRules.filter((rule) => robotsPatternMatches(pathname, rule.value));
  if (matches.length === 0) return false;
  matches.sort((left, right) => {
    const specificity = right.value.replace(/\*/g, '').length - left.value.replace(/\*/g, '').length;
    if (specificity !== 0) return specificity;
    if (left.type === right.type) return 0;
    return left.type === 'allow' ? -1 : 1;
  });
  return matches[0].type === 'disallow';
}

function rulesForRobot(groups, robotName) {
  const exactGroups = groups.filter((group) => group.agents.includes(robotName));
  if (exactGroups.length > 0) return exactGroups.flatMap((group) => group.rules);
  return groups.filter((group) => group.agents.includes('*')).flatMap((group) => group.rules);
}

function xmlLocs(source, parentName) {
  const locations = [];
  const parentPattern = new RegExp(`<${parentName}\\b[^>]*>([\\s\\S]*?)<\\/${parentName}\\s*>`, 'gi');
  for (const parent of source.matchAll(parentPattern)) {
    const loc = parent[1].match(/<loc\b[^>]*>([\s\S]*?)<\/loc\s*>/i);
    if (loc) locations.push(normalizedText(loc[1]));
  }
  return locations;
}

async function main() {
  let siteBase;
  try {
    siteBase = normalizeSiteBase(configuredSiteUrl);
  } catch (error) {
    report('config', 'site-url.invalid', error.message);
    return { pages: [], counters: emptyCounters(), sitemapEntries: new Map() };
  }

  if (!existsSync(outputDirectory) || !(await stat(outputDirectory)).isDirectory()) {
    report('dist', 'output.missing', path.relative(repositoryRoot, outputDirectory) || '.');
    return { pages: [], counters: emptyCounters(), sitemapEntries: new Map() };
  }

  const allFiles = (await listFiles(outputDirectory)).sort();
  const fileSet = new Set(allFiles);
  const htmlFiles = allFiles.filter((file) => file.toLowerCase().endsWith('.html'));
  const counters = emptyCounters();
  const pages = [];
  const pagesByFile = new Map();

  if (htmlFiles.length === 0) report('dist', 'html.missing');

  for (const relativePath of htmlFiles) {
    const route = routeForHtmlFile(relativePath);
    const scope = route;
    const expectedUrl = pageUrlForRoute(siteBase, route);
    const html = await readFile(path.join(outputDirectory, ...relativePath.split('/')), 'utf8');
    const cleaned = renderedMarkup(html);
    const headMatch = html.match(/<head\b[^>]*>([\s\S]*?)<\/head\s*>/i);
    const head = headMatch?.[1] ?? '';
    const headMarkup = renderedMarkup(head);
    if (!headMatch) report(scope, 'head.missing');

    const htmlTags = openingTags(cleaned, 'html');
    if (htmlTags.length !== 1) report(scope, 'html-element.count', String(htmlTags.length));
    const language = htmlTags[0]?.attributes.lang ?? '';
    if (language !== 'ms-MY') report(scope, 'lang.invalid', language || '(missing)');

    const titleElements = rawElementContents(headMarkup, 'title').map(normalizedText);
    const title = requiredSingle(titleElements, scope, 'title');
    const descriptions = metaValues(headMarkup, 'name', 'description').map(normalizedText);
    const description = requiredSingle(descriptions, scope, 'description');

    const h1Count = openingTags(cleaned, 'h1').length;
    if (h1Count !== 1) report(scope, 'h1.count', String(h1Count));

    const canonicalLinks = openingTags(headMarkup, 'link')
      .filter(({ attributes }) => (attributes.rel ?? '').toLowerCase().split(/\s+/).includes('canonical'))
      .map(({ attributes }) => (attributes.href ?? '').trim());
    const canonical = requiredSingle(canonicalLinks, scope, 'canonical');
    let canonicalUrl = null;
    if (canonical) {
      if (!/^[a-z][a-z\d+.-]*:\/\//i.test(canonical)) report(scope, 'canonical.not-absolute', canonical);
      canonicalUrl = parseUrl(canonical, expectedUrl, scope, 'canonical.invalid-url');
      if (canonicalUrl && canonicalUrl.href !== expectedUrl.href) {
        report(scope, 'canonical.not-self', `expected ${expectedUrl.href}, found ${canonicalUrl.href}`);
      }
    }

    const genericRobotsValues = metaValues(headMarkup, 'name', 'robots');
    const googlebotRobotsValues = metaValues(headMarkup, 'name', 'googlebot');
    for (const value of genericRobotsValues) {
      if (!value.trim()) report(scope, 'robots-meta.empty');
    }
    for (const value of googlebotRobotsValues) {
      if (!value.trim()) report(scope, 'googlebot-meta.empty');
    }
    const genericDirectives = robotsDirectives(genericRobotsValues);
    const googlebotDirectives = robotsDirectives(googlebotRobotsValues);
    for (const [agent, directives] of [['robots', genericDirectives], ['googlebot', googlebotDirectives]]) {
      if (directives.includes('index') && (directives.includes('noindex') || directives.includes('none'))) {
        report(scope, `${agent}-meta.conflict`, 'index and noindex');
      }
      if (directives.includes('follow') && (directives.includes('nofollow') || directives.includes('none'))) {
        report(scope, `${agent}-meta.conflict`, 'follow and nofollow');
      }
    }
    const directives = [...genericDirectives, ...googlebotDirectives];
    const noindex = directives.includes('noindex') || directives.includes('none');
    const is404 = relativePath === '404.html';
    if (is404 && !genericRobotsValues.some((value) => /(?:^|[\s,])(?:noindex|none)(?:$|[\s,])/i.test(value))) {
      report(scope, '404.not-noindex');
    }
    const indexable = !is404 && !noindex;

    const jsonLdBlocks = [];
    const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi;
    for (const match of html.matchAll(scriptPattern)) {
      const attributes = parseAttributes(match[1]);
      if ((attributes.type ?? '').split(';')[0].trim().toLowerCase() !== 'application/ld+json') continue;
      counters.jsonLdBlocks += 1;
      try {
        const parsed = JSON.parse(match[2]);
        if (parsed === null || (typeof parsed !== 'object')) throw new Error('top-level value must be an object or array');
        jsonLdBlocks.push(parsed);
      } catch (error) {
        report(scope, 'json-ld.invalid', error.message);
      }
    }
    if (indexable && jsonLdBlocks.length === 0) report(scope, 'json-ld.missing');

    const ogFields = ['type', 'locale', 'site_name', 'title', 'description', 'url', 'image', 'image:width', 'image:height', 'image:alt'];
    const og = Object.create(null);
    for (const field of ogFields) og[field] = requiredSingle(metaValues(headMarkup, 'property', `og:${field}`), scope, `og.${field}`);
    const twitterFields = ['card', 'title', 'description', 'image', 'image:alt'];
    const twitter = Object.create(null);
    for (const field of twitterFields) {
      twitter[field] = requiredSingle(metaValues(headMarkup, 'name', `twitter:${field}`), scope, `twitter.${field}`);
    }
    if (og.url) {
      const ogUrl = parseUrl(og.url, expectedUrl, scope, 'og.url.invalid-url');
      if (!/^[a-z][a-z\d+.-]*:\/\//i.test(og.url)) report(scope, 'og.url.not-absolute', og.url);
      if (ogUrl && canonicalUrl && ogUrl.href !== canonicalUrl.href) report(scope, 'og.url.not-canonical', ogUrl.href);
    }
    if (og['image:width'] && !isPositiveInteger(og['image:width'])) report(scope, 'og.image-width.invalid', og['image:width']);
    if (og['image:height'] && !isPositiveInteger(og['image:height'])) report(scope, 'og.image-height.invalid', og['image:height']);

    const page = {
      relativePath,
      route,
      expectedUrl,
      html,
      ids: extractPageIds(html),
      title,
      description,
      canonicalUrl,
      is404,
      indexable,
    };

    auditLocalResource(og.image, page, 'og.image', siteBase, fileSet, counters, { absolute: true });
    auditLocalResource(twitter.image, page, 'twitter.image', siteBase, fileSet, counters, { absolute: true });

    const images = openingTags(cleaned, 'img');
    counters.images += images.length;
    for (const [index, image] of images.entries()) {
      const label = `image[${index + 1}]`;
      const attributes = image.attributes;
      if (!Object.hasOwn(attributes, 'alt')) report(scope, `${label}.alt.missing`);
      if (!isPositiveInteger(attributes.width)) report(scope, `${label}.width.invalid`, attributes.width || '(missing)');
      if (!isPositiveInteger(attributes.height)) report(scope, `${label}.height.invalid`, attributes.height || '(missing)');
      if (!attributes.src) report(scope, `${label}.src.missing`);
      else auditLocalResource(attributes.src, page, `${label}.src`, siteBase, fileSet, counters);
      for (const [candidateIndex, candidate] of parseSrcset(attributes.srcset ?? '').entries()) {
        auditLocalResource(candidate, page, `${label}.srcset[${candidateIndex + 1}]`, siteBase, fileSet, counters);
      }
    }
    for (const [sourceIndex, source] of openingTags(cleaned, 'source').entries()) {
      if (source.attributes.src) {
        auditLocalResource(source.attributes.src, page, `source[${sourceIndex + 1}].src`, siteBase, fileSet, counters);
      }
      for (const [candidateIndex, candidate] of parseSrcset(source.attributes.srcset ?? '').entries()) {
        auditLocalResource(candidate, page, `source[${sourceIndex + 1}].srcset[${candidateIndex + 1}]`, siteBase, fileSet, counters);
      }
    }

    pages.push(page);
    pagesByFile.set(relativePath, page);
  }

  auditUniqueness(pages, 'title');
  auditUniqueness(pages, 'description');

  for (const page of pages) {
    for (const [index, anchor] of openingTags(renderedMarkup(page.html), 'a').entries()) {
      if (!Object.hasOwn(anchor.attributes, 'href')) continue;
      const href = anchor.attributes.href.trim();
      if (!href || /^(?:mailto|tel|sms|data|blob|javascript):/i.test(href)) continue;
      const target = parseUrl(href, page.expectedUrl, page.route, `link[${index + 1}].invalid-url`);
      if (!target || !['http:', 'https:'].includes(target.protocol) || !sameSiteHostname(target, siteBase)) continue;
      counters.internalLinks += 1;
      if (target.origin !== siteBase.origin) {
        report(page.route, `link[${index + 1}].wrong-origin`, target.href);
        continue;
      }
      const targetFile = resolveOutputUrl(target, siteBase, fileSet, { htmlFallback: true });
      if (!targetFile) {
        report(page.route, `link[${index + 1}].unresolved`, `${href} -> ${target.pathname}`);
        continue;
      }
      if (target.hash && !target.hash.startsWith('#:~:text=')) {
        const targetPage = pagesByFile.get(targetFile);
        if (!targetPage) {
          report(page.route, `link[${index + 1}].fragment-on-non-html`, href);
          continue;
        }
        let fragment;
        try {
          fragment = decodeURIComponent(target.hash.slice(1));
        } catch {
          report(page.route, `link[${index + 1}].invalid-fragment`, href);
          continue;
        }
        if (fragment && !targetPage.ids.has(fragment)) {
          report(page.route, `link[${index + 1}].missing-fragment`, href);
        }
      }
    }
  }

  const robotsPath = path.join(outputDirectory, 'robots.txt');
  let sitemapEntryPoints = [];
  if (!fileSet.has('robots.txt')) {
    report('robots.txt', 'file.missing');
  } else {
    const robotsSource = await readFile(robotsPath, 'utf8');
    const robots = parseRobotsFile(robotsSource);
    const wildcardGroups = robots.groups.filter((group) => group.agents.includes('*'));
    if (wildcardGroups.length === 0) report('robots.txt', 'wildcard-user-agent.missing');
    for (const page of pages.filter((candidate) => candidate.indexable)) {
      for (const robotName of ['*', 'googlebot', 'bingbot']) {
        const rules = rulesForRobot(robots.groups, robotName);
        if (isBlockedByRobots(page.expectedUrl.pathname, rules)) {
          report(page.route, 'robots-txt.blocked', `user-agent ${robotName}`);
        }
      }
    }
    if (robots.sitemaps.length === 0) report('robots.txt', 'sitemap-directive.missing');
    sitemapEntryPoints = robots.sitemaps;
  }

  const sitemapEntries = new Map();
  const visitedSitemaps = new Set();
  for (const sitemapValue of sitemapEntryPoints) {
    if (!/^[a-z][a-z\d+.-]*:\/\//i.test(sitemapValue)) {
      report('robots.txt', 'sitemap.not-absolute', sitemapValue);
      continue;
    }
    const sitemapUrl = parseUrl(sitemapValue, siteBase, 'robots.txt', 'sitemap.invalid-url');
    if (sitemapUrl) await readSitemap(sitemapUrl, siteBase, fileSet, sitemapEntries, visitedSitemaps);
  }

  const pageByCanonical = new Map();
  for (const page of pages) {
    if (!page.canonicalUrl) continue;
    const href = page.canonicalUrl.href;
    if (pageByCanonical.has(href)) report(page.route, 'canonical.duplicate', pageByCanonical.get(href).route);
    else pageByCanonical.set(href, page);
  }

  for (const [href, occurrences] of sitemapEntries) {
    if (occurrences.length > 1) report('sitemap', 'url.duplicate', `${href} (${occurrences.length} times)`);
    let url;
    try {
      url = new URL(href);
    } catch {
      continue;
    }
    if (url.origin !== siteBase.origin) {
      report('sitemap', 'url.wrong-origin', href);
      continue;
    }
    if (url.search || url.hash) report('sitemap', 'url.has-query-or-fragment', href);
    const page = pageByCanonical.get(url.href);
    if (!page) {
      const resolved = resolveOutputUrl(url, siteBase, fileSet, { htmlFallback: true });
      const resolvedPage = resolved ? pagesByFile.get(resolved) : null;
      if (resolvedPage?.is404 || /\/404(?:\.html)?\/?$/i.test(url.pathname)) report('sitemap', 'url.is-404', href);
      else if (resolvedPage && !resolvedPage.indexable) report('sitemap', 'url.is-noindex', href);
      else report('sitemap', 'url.not-canonical-html', href);
      continue;
    }
    if (page.is404) report('sitemap', 'url.is-404', href);
    else if (!page.indexable) report('sitemap', 'url.is-noindex', href);
  }

  for (const page of pages) {
    if (!page.canonicalUrl) continue;
    const inSitemap = sitemapEntries.has(page.canonicalUrl.href);
    if (page.indexable && !inSitemap) report(page.route, 'sitemap.missing-indexable-url', page.canonicalUrl.href);
    if (!page.indexable && inSitemap) report(page.route, 'sitemap.includes-nonindexable-url', page.canonicalUrl.href);
  }

  return { pages, counters, sitemapEntries };
}

function emptyCounters() {
  return { images: 0, internalLinks: 0, jsonLdBlocks: 0, localResources: 0 };
}

function auditUniqueness(pages, field) {
  const groups = new Map();
  for (const page of pages) {
    const value = normalizedText(page[field]).toLocaleLowerCase('ms-MY');
    if (!value) continue;
    if (!groups.has(value)) groups.set(value, []);
    groups.get(value).push(page);
  }
  for (const duplicates of groups.values()) {
    if (duplicates.length < 2) continue;
    const routes = duplicates.map((page) => page.route).join(', ');
    for (const page of duplicates) report(page.route, `${field}.not-unique`, routes);
  }
}

async function readSitemap(sitemapUrl, siteBase, fileSet, entries, visited) {
  if (sitemapUrl.origin !== siteBase.origin) {
    report('sitemap', 'file.wrong-origin', sitemapUrl.href);
    return;
  }
  if (sitemapUrl.search || sitemapUrl.hash) {
    report('sitemap', 'file.has-query-or-fragment', sitemapUrl.href);
    return;
  }
  if (visited.has(sitemapUrl.href)) return;
  visited.add(sitemapUrl.href);

  const relativePath = resolveOutputUrl(sitemapUrl, siteBase, fileSet);
  if (!relativePath) {
    report('sitemap', 'file.missing', sitemapUrl.pathname);
    return;
  }
  const source = await readFile(path.join(outputDirectory, ...relativePath.split('/')), 'utf8');
  if (/<sitemapindex\b/i.test(source)) {
    if (!/<\/sitemapindex\s*>/i.test(source)) {
      report('sitemap', 'index.unclosed', sitemapUrl.pathname);
      return;
    }
    const childLocations = xmlLocs(source, 'sitemap');
    const childCount = (source.match(/<sitemap\b/gi) ?? []).length;
    if (childLocations.length !== childCount) report('sitemap', 'index.entry-missing-loc', sitemapUrl.pathname);
    if (childLocations.length === 0) report('sitemap', 'index.empty', sitemapUrl.pathname);
    for (const location of childLocations) {
      if (!/^[a-z][a-z\d+.-]*:\/\//i.test(location)) {
        report('sitemap', 'child.not-absolute', location);
        continue;
      }
      const childUrl = parseUrl(location, siteBase, 'sitemap', 'child.invalid-url');
      if (childUrl) await readSitemap(childUrl, siteBase, fileSet, entries, visited);
    }
    return;
  }
  if (!/<urlset\b/i.test(source)) {
    report('sitemap', 'file.invalid-root', sitemapUrl.pathname);
    return;
  }
  if (!/<\/urlset\s*>/i.test(source)) {
    report('sitemap', 'urlset.unclosed', sitemapUrl.pathname);
    return;
  }

  const locations = xmlLocs(source, 'url');
  const urlEntries = [...source.matchAll(/<url\b[^>]*>([\s\S]*?)<\/url\s*>/gi)];
  const urlCount = (source.match(/<url\b/gi) ?? []).length;
  if (locations.length !== urlCount) report('sitemap', 'urlset.entry-missing-loc', sitemapUrl.pathname);
  if (locations.length === 0) report('sitemap', 'urlset.empty', sitemapUrl.pathname);
  for (const [index, urlEntry] of urlEntries.entries()) {
    const lastModifiedValues = [...urlEntry[1].matchAll(/<lastmod\b[^>]*>([\s\S]*?)<\/lastmod\s*>/gi)]
      .map((match) => normalizedText(match[1]));
    const scope = `${sitemapUrl.pathname} url[${index + 1}]`;
    if (lastModifiedValues.length !== 1) {
      report('sitemap', 'url.lastmod-count', `${scope}: ${lastModifiedValues.length}`);
      continue;
    }

    const timestamp = Date.parse(lastModifiedValues[0]);
    if (!Number.isFinite(timestamp)) {
      report('sitemap', 'url.lastmod-invalid', `${scope}: ${lastModifiedValues[0]}`);
    } else if (timestamp > Date.now() + 86_400_000) {
      report('sitemap', 'url.lastmod-in-future', `${scope}: ${lastModifiedValues[0]}`);
    }
  }
  for (const location of locations) {
    if (!/^[a-z][a-z\d+.-]*:\/\//i.test(location)) {
      report('sitemap', 'url.not-absolute', location);
      continue;
    }
    let url;
    try {
      url = new URL(location);
    } catch {
      report('sitemap', 'url.invalid', location);
      continue;
    }
    if (!entries.has(url.href)) entries.set(url.href, []);
    entries.get(url.href).push(sitemapUrl.pathname);
  }
}

let audit;
try {
  audit = await main();
} catch (error) {
  report('audit', 'unexpected-error', error?.stack || String(error));
  audit = { pages: [], counters: emptyCounters(), sitemapEntries: new Map() };
}

const failures = [...issues.entries()]
  .sort(([left], [right]) => left.localeCompare(right))
  .map(([scope, scopeIssues]) => ({ scope, issues: scopeIssues.sort() }));
const indexablePages = audit.pages.filter((page) => page.indexable).length;
const summary = {
  ok: failures.length === 0,
  dist: toPosix(path.relative(repositoryRoot, outputDirectory)) || '.',
  counts: {
    htmlRoutes: audit.pages.length,
    indexableRoutes: indexablePages,
    sitemapUrls: audit.sitemapEntries.size,
    internalLinks: audit.counters.internalLinks,
    images: audit.counters.images,
    localResources: audit.counters.localResources,
    jsonLdBlocks: audit.counters.jsonLdBlocks,
    failures: failures.reduce((total, failure) => total + failure.issues.length, 0),
  },
  failures,
};

console.log(JSON.stringify(summary, null, 2));
if (!summary.ok) process.exitCode = 1;
