import assert from 'node:assert/strict';
import site from '../src/config/site.json' with { type: 'json' };
import { assertSocialMetadata, jpegDimensions } from './social-metadata.mjs';

// Read-only deployment smoke check. It does not post, alter caches, or send credentials.
const option = process.argv.indexOf('--url');
const target = new URL(option >= 0 ? process.argv[option + 1] : `${site.origin}/`);
assert.equal(target.protocol, 'https:', 'Use a public HTTPS page');
assert.ok(!target.username && !target.password, 'Do not pass credentials in the URL');

async function fetchPublic(url, accept) {
  const response = await fetch(url, {
    headers: { 'user-agent': 'Twitterbot/1.0', accept },
    redirect: 'follow', signal: AbortSignal.timeout(20_000),
  });
  console.log(`${response.status} ${response.url} · ${response.headers.get('content-type') ?? 'missing Content-Type'}`);
  for (const key of ['x-vercel-mitigated', 'cf-mitigated', 'x-robots-tag', 'x-vercel-cache']) {
    if (response.headers.has(key)) console.log(`${key}: ${response.headers.get(key)}`);
  }
  assert.equal(response.status, 200, 'Crawler must receive HTTP 200, not an error, login, or bot challenge');
  return response;
}

try {
  const page = await fetchPublic(target, 'text/html');
  assert.ok(page.headers.get('content-type')?.includes('text/html'), 'Page did not return HTML');
  const tags = assertSocialMetadata(await page.text());
  console.log(`Card: ${tags.get('twitter:card')} · ${tags.get('twitter:title')}`);
  const imageUrl = new URL(tags.get('twitter:image'));
  const image = await fetchPublic(imageUrl, 'image/jpeg,image/png');
  assert.equal(image.headers.get('content-type')?.split(';')[0], 'image/jpeg', 'Expected the new JPEG preview');
  const reader = image.body.getReader();
  const chunks = [];
  let size = 0;
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    size += part.value.byteLength;
    if (size > 5_000_000) { await reader.cancel(); throw new Error('Preview exceeds 5 MB'); }
    chunks.push(Buffer.from(part.value));
  }
  assert.deepEqual(jpegDimensions(Buffer.concat(chunks)), { width: 1200, height: 630 });
  const robots = await fetchPublic(new URL('/robots.txt', page.url), 'text/plain');
  console.log(`robots.txt (review Twitterbot and wildcard rules):\n${await robots.text()}`);
  if (imageUrl.href !== `${site.origin}${site.image}`) throw new Error('Production still references an older image. Verify the deployed commit.');
  console.log('PASS: page and current image are reachable using the Twitterbot user agent. This cannot prove access from X’s own IPs or clear X’s cached cards.');
} catch (error) {
  console.error(`FAIL: ${error.message}`);
  process.exitCode = 1;
}
