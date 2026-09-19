import { readFile, writeFile, mkdir } from 'node:fs/promises';
import site from '../src/config/site.json' with { type: 'json' };
import { assertSocialMetadata } from './social-metadata.mjs';

const template = await readFile('dist/index.html', 'utf8');
const escape = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

function pageHtml(page, indexable = true) {
  let html = template.replace(/<title>[\s\S]*?<\/title>/, `<title>${escape(page.title)}</title>`);
  const values = {
    description: page.description,
    robots: indexable ? 'index, follow, max-image-preview:large' : 'noindex, follow',
    'og:title': page.title, 'twitter:title': page.title,
    'og:description': page.description, 'twitter:description': page.description,
    'og:url': `${site.origin}${page.path}`,
    'og:image': `${site.origin}${site.image}`, 'og:image:secure_url': `${site.origin}${site.image}`,
    'twitter:image': `${site.origin}${site.image}`,
    'og:image:alt': site.imageAlt, 'twitter:image:alt': site.imageAlt,
    'og:image:type': 'image/jpeg',
  };
  html = html.replace(/(<meta (?:name|property)="([^"]+)" content=")[^"]*("\s*\/?\s*>)/g, (tag, before, key, after) => key in values ? `${before}${escape(values[key])}${after}` : tag);
  html = html.replace(/(<link rel="canonical" href=")[^"]+"/, `$1${site.origin}${page.path}"`);
  assertSocialMetadata(html);
  return html;
}

await mkdir('dist/_pages', { recursive: true });
for (const page of site.pages) {
  const output = page.path === '/' ? 'dist/index.html' : `dist/_pages${page.path}.html`;
  await writeFile(output, pageHtml(page));
}
await writeFile('dist/_pages/app.html', pageHtml({ path: '/', title: 'Your practice — Optimus Code', description: 'Sign in to manage your practice, assessments, and account on Optimus Code.' }, false));

let notFound = pageHtml({ path: '/', title: 'Page not found — Optimus Code', description: 'This page could not be found. Return to Optimus Code to continue your practice.' }, false);
notFound = notFound.replace('<div id="root"></div>', '<div id="root"><main style="max-width:42rem;margin:15vh auto;padding:24px;text-align:center"><p>404 · OPTIMUS CODE</p><h1>This page took a wrong turn.</h1><p>The link may be outdated or the page may have moved.</p><a href="/" style="color:#c4b5fd;text-decoration:underline">Back to home</a></main></div>');
await writeFile('dist/404.html', notFound);
await writeFile('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${site.pages.map((page) => `  <url><loc>${site.origin}${page.path}</loc></url>`).join('\n')}\n</urlset>\n`);
console.log('Generated crawler-readable public pages, private noindex shell, 404, and sitemap.');
