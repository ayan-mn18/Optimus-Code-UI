const PUBLIC_KEYS = new Set(['VITE_API_URL', 'VITE_GOOGLE_CLIENT_ID']);

export function validatePublicConfig(values: Record<string, string>, production: boolean) {
  for (const key of Object.keys(values)) {
    if (key.startsWith('VITE_') && !PUBLIC_KEYS.has(key)) throw new Error(`Unreviewed browser-exposed variable: ${key}. Never prefix server secrets with VITE_.`);
  }
  if (!production) return;
  const api = values.VITE_API_URL;
  if (!api) throw new Error('Set VITE_API_URL to the production HTTPS API before building.');
  const parsed = new URL(api);
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password) throw new Error('Production VITE_API_URL must use HTTPS without embedded credentials.');
}
