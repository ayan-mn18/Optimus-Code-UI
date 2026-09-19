import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import site from '@/config/site.json';
import { pageMetadata } from '@/lib/pageMetadata';

export function PageMetadata() {
  const { pathname } = useLocation();
  useEffect(() => {
    const page = pageMetadata(pathname);
    const { title, description } = page;
    document.title = title;
    const update = (selector: string, value: string) => document.querySelector<HTMLMetaElement>(selector)?.setAttribute('content', value);
    update('meta[name="description"]', description);
    update('meta[property="og:title"]', title);
    update('meta[name="twitter:title"]', title);
    update('meta[property="og:description"]', description);
    update('meta[name="twitter:description"]', description);
    update('meta[name="robots"]', page.indexable ? 'index, follow, max-image-preview:large' : 'noindex, follow');
    const canonical = `${site.origin}${page.path}`;
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.setAttribute('href', canonical);
    update('meta[property="og:url"]', canonical);
  }, [pathname]);
  return null;
}
