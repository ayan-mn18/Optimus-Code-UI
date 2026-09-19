import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { validateLogin, validateInvite, safeReturnPath } from '../src/lib/formValidation';
import { validatePublicConfig } from '../src/lib/publicConfig';
import { assertNoSecrets, assertSocialMetadata, jpegDimensions, metaTags } from '../scripts/social-metadata.mjs';
import site from '../src/config/site.json';
import { pageMetadata } from '../src/lib/pageMetadata';

test('login validates fields before contacting the API', () => {
  assert.deepEqual(validateLogin({ email: ' user@example.com ', password: 'password' }), {});
  assert.ok(validateLogin({ email: 'bad', password: '' }).email);
  assert.ok(validateLogin({ email: 'user@example.com', password: 'x'.repeat(129) }).password);
});

test('invites validate name, password length, and confirmation', () => {
  assert.deepEqual(validateInvite({ name: 'User', password: 'abcdefgh', confirm: 'abcdefgh' }), {});
  assert.equal(Object.keys(validateInvite({ name: 'x', password: 'short', confirm: 'different' })).length, 3);
});

test('post-login redirects stay within the app', () => {
  assert.equal(safeReturnPath('/pricing'), '/pricing');
  for (const path of ['https://example.com', '//example.com', '/\\example.com', '\n/pricing', undefined]) assert.equal(safeReturnPath(path), '/dashboard');
});

test('only reviewed public build settings can reach browser code', () => {
  assert.doesNotThrow(() => validatePublicConfig({ VITE_API_URL: 'https://api.example.com', VITE_GOOGLE_CLIENT_ID: 'public-client-id' }, true));
  assert.throws(() => validatePublicConfig({ VITE_API_URL: 'http://api.example.com' }, true));
  assert.throws(() => validatePublicConfig({ VITE_API_URL: 'https://user:password@api.example.com' }, true));
  assert.throws(() => validatePublicConfig({ VITE_API_KEY: 'must-stay-server-side' }, false));
  assert.throws(() => validatePublicConfig({}, true));
  assert.doesNotThrow(() => validatePublicConfig({ VITE_API_URL: 'http://localhost:4000' }, false));
});

test('root has static X tags and the supplied compressed artwork', () => {
  const tags = assertSocialMetadata(readFileSync('index.html', 'utf8'));
  assert.equal(tags.get('twitter:image'), `${site.origin}${site.image}`);
  assert.deepEqual(jpegDimensions(readFileSync(`public${site.image}`)), { width: 1200, height: 630 });
  assert.throws(() => assertSocialMetadata('<html><head></head></html>'));
});

test('metadata parser handles apostrophes and attribute order and rejects duplicates', () => {
  assert.equal(metaTags('<meta content="Optimus Code\'s practice" property="og:title">').get('og:title'), "Optimus Code's practice");
  assert.throws(() => metaTags('<meta name="description" content="one"><meta name="description" content="two">'));
});

test('public routes have individual metadata; private and missing routes stay noindex', () => {
  assert.equal(pageMetadata('/pricing/').path, '/pricing');
  assert.equal(pageMetadata('/privacy').indexable, true);
  assert.equal(pageMetadata('/optimus/new/problem-id').indexable, false);
  assert.equal(pageMetadata('/settings').indexable, false);
  assert.equal(pageMetadata('/missing-page').title, 'Page not found — Optimus Code');
});

test('secret scan fails without logging matched values', () => {
  const fake = 'xkeysib-' + 'a'.repeat(32);
  assert.throws(() => assertNoSecrets(fake, 'fixture'), (error: Error) => !error.message.includes(fake));
  assert.doesNotThrow(() => assertNoSecrets('public-client-id.apps.googleusercontent.com', 'fixture'));
});

function luminance(hex: string) {
  const channels = hex.replace('#', '').match(/../g)!.map((part) => parseInt(part, 16) / 255).map((v) => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}
function contrast(a: string, b: string) {
  const values = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (values[0] + 0.05) / (values[1] + 0.05);
}

test('small secondary text and primary button text meet 4.5:1 contrast', () => {
  const css = readFileSync('src/index.css', 'utf8');
  const token = (name: string) => css.match(new RegExp(`--color-${name}: (#[a-fA-F0-9]{6})`))![1];
  for (const background of ['canvas', 'surface', 'card', 'elevated']) assert.ok(contrast(token('ink-dim'), token(background)) >= 4.5);
  for (const background of [token('brand-deep'), '#6849ce']) assert.ok(contrast('#ffffff', background) >= 4.5);
});
