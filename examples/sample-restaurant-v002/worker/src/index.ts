const SITE = {
  name: 'Sample Restaurant v0.02',
  worker: 'sample-restaurant-v002-afo',
  schema: 'afo.site.bundle',
  schemaVersion: '1.0.0',
  baseUrl: 'https://sample-restaurant-v002.example',
  previewUrl: 'https://sample-restaurant-v002-afo.jaredtechfit.workers.dev/',
  description: 'A premium, preview-safe restaurant demo for AFO Restaurant v0.02.',
  cuisine: 'Seasonal Coastal American',
  phone: '(949) 555-0202'
};

const SCHEMA_JSON = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: SITE.name,
  url: SITE.baseUrl,
  description: SITE.description,
  servesCuisine: SITE.cuisine,
  telephone: SITE.phone,
  address: {
    '@type': 'PostalAddress',
    streetAddress: '202 Avenida Demo',
    addressLocality: 'San Juan Capistrano',
    addressRegion: 'CA'
  },
  hasMenu: `${SITE.baseUrl}/#menu`
};

const LLMS_TXT = `# ${SITE.name}\n\n${SITE.description}\n\n## Routes\n- / text/html\n- /health application/json\n- /llms.txt text/plain\n- /robots.txt text/plain\n- /sitemap.xml application/xml\n- /schema.json application/json\n\n## Guardrails\nPreview only. No production routes. No custom domains. No account IDs. No secrets.\n`;
const ROBOTS_TXT = `User-agent: *\nAllow: /\nSitemap: ${SITE.baseUrl}/sitemap.xml\n`;
const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE.baseUrl}/</loc></url>\n  <url><loc>${SITE.baseUrl}/health</loc></url>\n  <url><loc>${SITE.baseUrl}/llms.txt</loc></url>\n  <url><loc>${SITE.baseUrl}/robots.txt</loc></url>\n  <url><loc>${SITE.baseUrl}/sitemap.xml</loc></url>\n  <url><loc>${SITE.baseUrl}/schema.json</loc></url>\n</urlset>\n`;
const HTML = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${SITE.name}</title><meta name="description" content="${SITE.description}"><script type="application/ld+json">${JSON.stringify(SCHEMA_JSON)}</script></head><body><main><h1>Premium dining demo, ready for a sales call.</h1><p>${SITE.description}</p><h2>Featured dish cards</h2><h2>Chef & story</h2><h2>Hours / location / contact</h2><h2>Private events & catering</h2><h2>Testimonials</h2><h2>FAQ accordion</h2><h2>AI-readable routes panel</h2><h2>Schema/discovery callout</h2></main></body></html>`;

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/') return html(HTML);
    if (url.pathname === '/health') return json({ ok: true, worker: SITE.worker, bundle_schema: SITE.schema, schema_version: SITE.schemaVersion, preview_only: true, production_routes: [], custom_domains: [] });
    if (url.pathname === '/llms.txt') return text(LLMS_TXT, 'text/plain');
    if (url.pathname === '/robots.txt') return text(ROBOTS_TXT, 'text/plain');
    if (url.pathname === '/sitemap.xml') return text(SITEMAP_XML, 'application/xml');
    if (url.pathname === '/schema.json') return json(SCHEMA_JSON);
    return new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }
};

function html(body: string): Response {
  return new Response(body, { headers: { 'content-type': 'text/html; charset=utf-8', 'x-afo-preview-only': 'true' } });
}
function text(body: string, contentType: string): Response {
  return new Response(body, { headers: { 'content-type': `${contentType}; charset=utf-8`, 'x-afo-preview-only': 'true' } });
}
function json(body: unknown): Response {
  return new Response(JSON.stringify(body, null, 2), { headers: { 'content-type': 'application/json; charset=utf-8', 'x-afo-preview-only': 'true' } });
}
