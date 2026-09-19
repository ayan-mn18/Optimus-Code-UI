# Launch readiness — 20 September 2026

Scope: the supplied 20-item checklist, Optimus Code (India), and X/Meta previews. Analytics is deliberately disabled at the owner's request. Branding and fonts are retained; secondary text and small white button labels have stronger contrast.

These are implementation and local verification results, not confirmation of a production deployment, a complete security audit, or legal compliance. Have the legal drafts reviewed for actual operating practices, provider arrangements, retention requirements, and applicable Indian law before launch.

Verification: 9 frontend launch tests and 89 non-network backend tests passed; modified backend files pass ESLint, both repositories pass diff checks, and the production-mode frontend build passes with the test-only HTTPS API override described below. Browser/device testing and the backend HTTP smoke suite were not run in this verification.

| Checklist item | Implementation / remaining verification |
| --- | --- |
| 1. Privacy policy | `/privacy`, based on current account, assessment, billing, email, support, and storage flows. Operator: Optimus Code, India; contact: info@optimusco.de. Legal review remains. |
| 2. Terms & conditions | `/terms`, with subscription renewal/cancellation, acceptable use, educational limitations, and applicable Indian law. Legal review remains; no invented refund promise or jurisdiction city. |
| 3. Secrets off frontend | Only API URL and public Google client ID are allowed as `VITE_` variables. Build scans common secret patterns; source maps are off. Server keys and local environment files were not copied or changed. This does not replace a full security audit. |
| 4. HTTPS | Production builds require an HTTPS API URL without credentials. HSTS and a conservative CSP are configured. Vercel's HTTP-to-HTTPS redirect and live response headers still need verification. Local development remains HTTP on localhost. |
| 5. Cookie banner | Reopenable essential-storage notice. No optional analytics/ad tracking or misleading “accept all” consent; preference stored locally and storage failures handled. |
| 6. Titles & descriptions | Individual initial-HTML metadata for `/`, `/pricing`, `/privacy`, `/terms`. Private routes and 404 are noindex. Client navigation updates metadata too. |
| 7. Social preview | Owner-supplied artwork, 1200×630 JPEG, approximately 48 KB, absolute HTTPS URL, MIME/dimensions/alt tags, large-image X card. Old image files remain for cached links. Live X result is unconfirmed. |
| 8. Favicon | Existing SVG preserved; PNG fallback and Apple touch icon added. |
| 9. Sitemap + robots | Sitemap generated from public-page configuration; robots links to it. Authenticated app content is excluded from the sitemap. |
| 10. Image alternatives | Current UI uses vector/decorative visuals; compact logo link has an accessible label. Build checks literal image tags for alt attributes; social artwork has descriptive alt text. |
| 11. Image compression | Current social artwork reduced from roughly 1 MB PNG to roughly 48 KB JPEG without changing dimensions or adding text. Untracked user image files left untouched. |
| 12. Page speed | Non-landing routes, app shell/search, and diagrams lazy-loaded. Initial JS approximately 371 KB raw / 120 KB gzip, versus the previous ~743 KB raw / 227 KB gzip. Build enforces a 500 KiB initial-JS budget. These are bundle measurements, not real-user Core Web Vitals or Lighthouse scores. |
| 13. Contrast | Dim body text and both primary-button gradient stops tested at >=4.5:1 against relevant surfaces. A full interactive accessibility audit remains. |
| 14. Mobile | Responsive legal/footer/notice/404 layouts; flexible topic-chart columns; mobile-nav safe-area padding; skip links. Browser/device QA remains. |
| 15. Custom 404 | React not-found page plus generated `404.html` with a non-JS fallback. No catch-all rewrite hiding missing assets. Verify actual HTTP 404 on Vercel. |
| 16. Broken links | Fixed Topic Mastery's `/problems` link to `/dsa`. Build checks literal internal links against static/parameterized rewrites. External links and database-driven links require a live crawl. |
| 17. Validation | Login/invite/name validation and limits, accessible field errors, guarded local login redirects, profile/goals errors, safe integer goals, duplicate report-submit guard. Server validation retained and strengthened. |
| 18. Spam protection | Existing global/auth/invite/waitlist rate limits retained. Refresh endpoint rate-limited; reports capped per IP and per authenticated account. Uploads check MIME/header/filename/decoded 4 MB size; report URLs strip query/fragment secrets. No new CAPTCHA dependency/key required. |
| 19. Analytics | Intentionally not installed or enabled, as requested. Practice statistics remain normal product functionality. |
| 20. Clear CTA | “Start practicing free” leads to sign-in from hero and closing section; pricing comparison is visually secondary. |

## Build and deploy correctly

- Use Node 22.13 or later and `npm ci`.
- Keep `VITE_API_URL=http://localhost:4000` for development. In Vercel's production environment, configure the real HTTPS API origin and the public Google client ID. Do not add payment, SMTP, OAuth client-secret, database, or LLM secrets to `VITE_` variables.
- Vercel build command must be **`npm run build`**, output **`dist`**. Calling `vite build` alone skips generated pages and launch checks.
- `npm run test:launch` checks validation, redirects, config guards, metadata, image dimensions, and contrast.
- `npm run check:launch` checks the generated artifact, public routing, sitemap, secret patterns, links, and size budget.
- Local build verification used a temporary `VITE_API_URL=https://api.example.invalid` override because the local environment intentionally targets localhost. This URL is a test placeholder, not a production API. No environment files were changed. Never deploy that local verification artifact; rebuild with the real production configuration.
- Backend changes are in the sibling Optimus-Code repository and need their normal deployment too.

## X preview diagnosis after deployment

Run `npm run check:social -- --url https://www.optimusco.de/` and repeat for `https://optimusco.de/`. This is a read-only check that sends a Twitterbot user agent and prints page/image HTTP status, MIME type, challenge/cache headers, current card URL, and robots.txt.

Confirm the page's initial HTML references `https://www.optimusco.de/social-preview-v4.jpg`, and both HTML and image return 200 without login or a bot challenge. Review robots rules for both the page and image path. A successful check from this machine is not proof that X's own crawler IPs are allowed. Inspect Vercel/firewall request logs if X alone remains blocked; do not disable site-wide protections without evidence.

X may retain older or failed card fetches. Only after deployment and crawler accessibility are verified should a fresh post/URL or a re-scrape be used to investigate caching. A versioned image avoids old *image* caches; it does not force X to refresh an already cached *page*. Missing previews in the composer and missing previews on published posts are distinct checks.

Live inspection was blocked by the command-approval service returning HTTP 404. That error came from the tooling service, not from Optimus Code. No production preview fix or deployment is claimed until live verification succeeds.
