const SITE_NAME = 'Sample Restaurant';
const WORKER_NAME = 'sample-restaurant-afo';
const BUNDLE_SCHEMA = 'afo.site.bundle';
const SCHEMA_VERSION = '1.0.0';

const SCHEMA_JSON = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: SITE_NAME,
  url: 'https://sample-restaurant.example',
  servesCuisine: 'Seasonal American'
};

const LLMS_TXT = `# Sample Restaurant

Preview-safe restaurant website example for AFO Site Bundle Manifest v1.

## Important Routes
- Home: https://sample-restaurant.example/
- Health: https://sample-restaurant.example/health
- Schema: https://sample-restaurant.example/schema.json
`;

const ROBOTS_TXT = `User-agent: *
Allow: /
Sitemap: https://sample-restaurant.example/sitemap.xml
`;

const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://sample-restaurant.example/</loc></url>
  <url><loc>https://sample-restaurant.example/health</loc></url>
  <url><loc>https://sample-restaurant.example/llms.txt</loc></url>
  <url><loc>https://sample-restaurant.example/robots.txt</loc></url>
  <url><loc>https://sample-restaurant.example/sitemap.xml</loc></url>
  <url><loc>https://sample-restaurant.example/schema.json</loc></url>
</urlset>
`;

const HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sample Restaurant - Seasonal Local Dining</title>
  <meta name="description" content="Preview-safe restaurant website example for AFO Site Bundle Manifest v1.">
  <link rel="canonical" href="https://sample-restaurant.example/">
  <script type="application/ld+json">${JSON.stringify(SCHEMA_JSON)}</script>
</head>
<body>
  <main>
    <h1>Sample Restaurant</h1>
    <p>This is a preview-safe restaurant reference website for AFO Site Bundle Manifest v1.</p>
    <h2>Routes</h2>
    <ul>
      <li><a href="/health">/health</a></li>
      <li><a href="/llms.txt">/llms.txt</a></li>
      <li><a href="/robots.txt">/robots.txt</a></li>
      <li><a href="/sitemap.xml">/sitemap.xml</a></li>
      <li><a href="/schema.json">/schema.json</a></li>
    </ul>
  </main>
</body>
</html>`;

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/') return html(HTML);
    if (url.pathname === '/health') return json({ ok: true, worker: WORKER_NAME, bundle_schema: BUNDLE_SCHEMA, schema_version: SCHEMA_VERSION });
    if (url.pathname === '/llms.txt') return text(LLMS_TXT, 'text/plain');
    if (url.pathname === '/robots.txt') return text(ROBOTS_TXT, 'text/plain');
    if (url.pathname === '/sitemap.xml') return text(SITEMAP_XML, 'application/xml');
    if (url.pathname === '/schema.json') return json(SCHEMA_JSON);

    return new Response('Not found', { status: 404 });
  }
};

function html(body: string): Response {
  return new Response(body, { headers: { 'content-type': 'text/html; charset=utf-8' } });
}

function text(body: string, contentType: string): Response {
  return new Response(body, { headers: { 'content-type': `${contentType}; charset=utf-8` } });
}

function json(body: unknown): Response {
  return new Response(JSON.stringify(body, null, 2), { headers: { 'content-type': 'application/json; charset=utf-8' } });
}
