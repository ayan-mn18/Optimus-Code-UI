export function metaTags(html) {
  const tags = new Map();
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? html;
  for (const [tag] of head.matchAll(/<meta\b[^>]*>/gi)) {
    const attributes = Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(["'])([\s\S]*?)\2/g)].map((m) => [m[1].toLowerCase(), m[3].replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")]));
    const key = attributes.property ?? attributes.name;
    if (!key) continue;
    if (tags.has(key)) throw new Error(`Duplicate metadata: ${key}`);
    tags.set(key, attributes.content);
  }
  return tags;
}

export function assertSocialMetadata(html) {
  const tags = metaTags(html);
  for (const key of ['description', 'og:type', 'og:site_name', 'og:url', 'og:title', 'og:description', 'og:image', 'og:image:alt', 'og:image:type', 'og:image:width', 'og:image:height', 'twitter:card', 'twitter:title', 'twitter:description', 'twitter:image', 'twitter:image:alt']) {
    if (!tags.get(key)) throw new Error(`Missing ${key} in initial HTML`);
  }
  if (tags.get('twitter:card') !== 'summary_large_image') throw new Error('X must use a large-image card');
  if (tags.get('og:image') !== tags.get('twitter:image')) throw new Error('X and Open Graph images differ');
  if (tags.get('og:image:secure_url') !== tags.get('og:image')) throw new Error('Secure image URL differs');
  if (tags.get('og:image:alt') !== tags.get('twitter:image:alt')) throw new Error('Image alternatives differ');
  const image = new URL(tags.get('og:image'));
  if (image.protocol !== 'https:' || image.username || image.password) throw new Error('Preview image must use a public HTTPS URL');
  if (tags.get('og:image:width') !== '1200' || tags.get('og:image:height') !== '630') throw new Error('Unexpected preview dimensions');
  return tags;
}

export function jpegDimensions(bytes) {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) throw new Error('Preview is not a JPEG');
  let offset = 2;
  while (offset < bytes.length) {
    if (bytes[offset++] !== 0xff) throw new Error('Malformed JPEG marker');
    while (bytes[offset] === 0xff) offset++;
    const marker = bytes[offset++];
    if (marker === 0xda || marker === 0xd9) break;
    const length = bytes.readUInt16BE(offset);
    if (length < 2) throw new Error('Malformed JPEG segment');
    if ([0xc0, 0xc1, 0xc2].includes(marker)) return { width: bytes.readUInt16BE(offset + 5), height: bytes.readUInt16BE(offset + 3) };
    offset += length;
  }
  throw new Error('JPEG dimensions not found');
}

export function assertNoSecrets(text, label) {
  const patterns = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /\bAKIA[0-9A-Z]{16}\b/,
    /\b(?:xkeysib|xsmtpsib)-[a-zA-Z0-9-]{24,}/,
    /\b(?:sk-proj-|sk-live-|sb_secret_)[a-zA-Z0-9_-]{24,}/,
    /["'](?:client_secret|private_key|service_role_key)["']\s*:\s*["'][^"']{12,}["']/i,
  ];
  if (patterns.some((pattern) => pattern.test(text))) throw new Error(`Possible secret in ${label}; inspect locally. Value intentionally not logged.`);
}
