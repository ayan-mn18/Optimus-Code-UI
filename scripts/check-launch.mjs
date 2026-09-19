import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';
import site from '../src/config/site.json' with { type: 'json' };
import { assertSocialMetadata, metaTags, jpegDimensions, assertNoSecrets } from './social-metadata.mjs';

const config = JSON.parse(await readFile('vercel.json', 'utf8'));
const image = await readFile(`dist${site.image}`);
assert.deepEqual(jpegDimensions(image), { width: 1200, height: 630 });
assert.ok(image.length < 300_000, 'Keep the preview below 300 KB');
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
assert.ok((await readFile('dist/robots.txt', 'utf8')).includes(`Sitemap: ${site.origin}/sitemap.xml`));
for (const page of site.pages) {
  const file = page.path === '/' ? '/index.html' : `/_pages${page.path}.html`;
  const html = await readFile(`dist${file}`, 'utf8');
  const tags = assertSocialMetadata(html);
  assert.equal(tags.get('og:image'), `${site.origin}${site.image}`);
  assert.equal(tags.get('og:image:type'), 'image/jpeg');
  assert.equal(tags.get('og:url'), `${site.origin}${page.path}`);
  assert.equal(tags.get('robots'), 'index, follow, max-image-preview:large');
  assert.ok(sitemap.includes(`<loc>${site.origin}${page.path}</loc>`));
  assert.ok(config.rewrites.some((rule) => rule.source === page.path && rule.destination === file), `Missing rewrite for ${page.path}`);
}
for (const file of ['dist/404.html', 'dist/_pages/app.html']) assert.equal(metaTags(await readFile(file, 'utf8')).get('robots'), 'noindex, follow');
assert.ok(!config.rewrites.some((rule) => rule.source === '/:path*' || rule.source === '/(.*)'), 'Do not rewrite missing assets/pages to a soft 200');
for (const { destination } of config.rewrites) await stat(`dist${destination}`);
for (const path of ['/favicon.svg', '/favicon-32.png', '/apple-touch-icon.png']) await stat(`dist${path}`);

async function walk(dir) {
  const paths = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    paths.push(...(entry.isDirectory() ? await walk(path) : [path]));
  }
  return paths;
}
for (const path of await walk('dist')) {
  assert.ok(!/\.(?:env|pem|key)$|client_secret|\.map$/i.test(path), `Private/debug artifact in ${path}`);
  if (/\.(?:js|html|json|css)$/.test(path)) assertNoSecrets(await readFile(path, 'utf8'), path);
}
const routePatterns = config.rewrites.map((rule) => new RegExp(`^${rule.source.split('/').map((segment) => segment.startsWith(':') ? '[^/]+' : segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('/')}/?$`));
for (const path of await walk('src')) {
  if (!/\.tsx$/.test(path)) continue;
  const source = await readFile(path, 'utf8');
  for (const match of source.matchAll(/\b(?:to|href)="(\/[^"#?]*)"/g)) assert.ok(routePatterns.some((pattern) => pattern.test(match[1])), `Broken internal link ${match[1]} in ${path}`);
  for (const match of source.matchAll(/<img\b[^>]*>/g)) assert.ok(/\balt=/.test(match[0]), `Missing image alt in ${path}`);
}

const manifest = JSON.parse(await readFile('dist/.vite/manifest.json', 'utf8'));
const visited = new Set();
async function initialBytes(key) {
  if (visited.has(key)) return { raw: 0, gzip: 0 };
  visited.add(key);
  const item = manifest[key];
  const bytes = await readFile(`dist/${item.file}`);
  const total = { raw: bytes.length, gzip: gzipSync(bytes).length };
  for (const dependency of item.imports ?? []) {
    const nested = await initialBytes(dependency);
    total.raw += nested.raw;
    total.gzip += nested.gzip;
  }
  return total;
}
const size = await initialBytes('index.html');
assert.ok(size.raw < 512_000, 'Landing initial JavaScript exceeded 500 KB; check eager imports');
console.log(`PASS: social metadata/image (${Math.round(image.length / 1024)} KB), sitemap, noindex, rewrites, links, image alt, secret-pattern scan.`);
console.log(`Landing initial JS: ${Math.round(size.raw / 1024)} KB raw / ${Math.round(size.gzip / 1024)} KB gzip (excludes deferred routes).`);
