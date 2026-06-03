// Source-aligned TypeScript entry for Restaurant v0.05 conversion content engine.
// Runtime preview app mirror lives at apps/sample-restaurant-v005-afo/worker.js.

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const body = {
      ok: true,
      worker: 'sample-restaurant-v005-afo',
      version: '0.05',
      description: 'Conversion-ready content engine with sticky Menu/Reserve/Event CTA, menu.json, deep schema, testimonials, ARIA, and dark A/B preview.',
      routes: [
        '/',
        '/menu',
        '/menu?variant=dark',
        '/menu.json',
        '/menu.md',
        '/registry.json',
        '/items/101',
        '/items/101?format=md',
        '/menu/starters/seared-scallops',
        '/menu/starters/seared-scallops.md',
        '/articles/behind-the-seared-scallops',
        '/health',
        '/llms.txt',
        '/robots.txt',
        '/sitemap.xml',
        '/schema.json'
      ],
      preview_only: true,
      production_routes: [],
      custom_domains: []
    };
    if (url.pathname === '/health') return json(body);
    return html(`<h1>Sample Restaurant v0.05</h1><p>${body.description}</p><p>See app mirror for full conversion content-engine implementation.</p>`);
  }
};

function html(body: string): Response {
  return new Response(body, { headers: { 'content-type': 'text/html; charset=utf-8', 'x-afo-preview-only': 'true' } });
}

function json(body: unknown): Response {
  return new Response(JSON.stringify(body, null, 2), { headers: { 'content-type': 'application/json; charset=utf-8', 'x-afo-preview-only': 'true' } });
}
