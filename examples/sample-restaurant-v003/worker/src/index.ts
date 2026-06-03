const SITE = {
  name: 'Sample Restaurant v0.03',
  worker: 'sample-restaurant-v003-afo',
  version: '0.03',
  baseUrl: 'https://sample-restaurant-v003.example',
  previewUrl: 'https://sample-restaurant-v003-afo.jaredtechfit.workers.dev/',
  description: 'A visual-first, preview-safe restaurant demo with real photo backgrounds, menu tabs, event packages, and a gallery snippet.',
  cuisine: 'California Coastal',
  phone: '(949) 555-0303'
};

const HERO = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1800&q=80';
const SCHEMA_JSON = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: SITE.name,
  url: SITE.baseUrl,
  description: SITE.description,
  servesCuisine: SITE.cuisine,
  telephone: SITE.phone,
  image: [HERO],
  address: {
    '@type': 'PostalAddress',
    streetAddress: '303 Camino del Mar Demo',
    addressLocality: 'San Juan Capistrano',
    addressRegion: 'CA'
  },
  hasMenu: `${SITE.baseUrl}/#menu`
};
const LLMS_TXT = `# ${SITE.name}\n\n${SITE.description}\n\n## Visual capability\n- Remote hero background image\n- Image gallery snippet\n- Menu tabs: starters, mains, desserts\n- Event packages and calendar teaser\n\n## Routes\n- / text/html\n- /health application/json\n- /llms.txt text/plain\n- /robots.txt text/plain\n- /sitemap.xml application/xml\n- /schema.json application/json\n\n## Guardrails\nPreview only. No production routes. No custom domains. No account IDs. No secrets.\n`;
const ROBOTS_TXT = `User-agent: *\nAllow: /\nSitemap: ${SITE.baseUrl}/sitemap.xml\n`;
const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE.baseUrl}/</loc></url>\n  <url><loc>${SITE.baseUrl}/health</loc></url>\n  <url><loc>${SITE.baseUrl}/llms.txt</loc></url>\n  <url><loc>${SITE.baseUrl}/robots.txt</loc></url>\n  <url><loc>${SITE.baseUrl}/sitemap.xml</loc></url>\n  <url><loc>${SITE.baseUrl}/schema.json</loc></url>\n</urlset>\n`;
const HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${SITE.name}</title><meta name="description" content="${SITE.description}"><script type="application/ld+json">${JSON.stringify(SCHEMA_JSON)}</script></head><body><main><h1>California coastal dining with real image energy.</h1><p>${SITE.description}</p><h2>Menu tabs: starters, mains, desserts</h2><h2>Event packages and calendar teaser</h2><h2>Image gallery snippet</h2><h2>Sticky CTA</h2><h2>AI-readable routes</h2></main></body></html>`;

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/') return html(HTML);
    if (url.pathname === '/health') return json({ ok: true, worker: SITE.worker, version: SITE.version, preview_only: true, production_routes: [], custom_domains: [] });
    if (url.pathname === '/llms.txt') return text(LLMS_TXT, 'text/plain');
    if (url.pathname === '/robots.txt') return text(ROBOTS_TXT, 'text/plain');
    if (url.pathname === '/sitemap.xml') return text(SITEMAP_XML, 'application/xml');
    if (url.pathname === '/schema.json') return json(SCHEMA_JSON);
    return new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }
};
function html(body: string): Response { return new Response(body, { headers: { 'content-type': 'text/html; charset=utf-8', 'x-afo-preview-only': 'true' } }); }
function text(body: string, type: string): Response { return new Response(body, { headers: { 'content-type': `${type}; charset=utf-8`, 'x-afo-preview-only': 'true' } }); }
function json(body: unknown): Response { return new Response(JSON.stringify(body, null, 2), { headers: { 'content-type': 'application/json; charset=utf-8', 'x-afo-preview-only': 'true' } }); }
