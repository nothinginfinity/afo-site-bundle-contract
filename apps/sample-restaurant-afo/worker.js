const SITE = {
  name: 'Sample Restaurant',
  worker: 'sample-restaurant-afo',
  schema: 'afo.site.bundle',
  schemaVersion: '1.0.0',
  baseUrl: 'https://sample-restaurant.example',
  previewUrl: 'https://sample-restaurant-afo.jaredtechfit.workers.dev',
  location: 'San Juan Capistrano, CA',
  cuisine: 'Seasonal American',
  tagline: 'Seasonal local dining, packaged as a preview-safe AFO Site Bundle.',
  description: 'Preview-safe restaurant website example for AFO Site Bundle Manifest v1.'
};

const MENU = [
  { name: 'Market Garden Toast', description: 'Herbed ricotta, roasted local vegetables, citrus greens.', price: '$14' },
  { name: 'Coastal Grain Bowl', description: 'Farro, avocado, pickled onion, grilled seasonal squash.', price: '$18' },
  { name: 'Weekend Brunch Plate', description: 'Soft eggs, crispy potatoes, greens, house sourdough.', price: '$19' },
  { name: 'Private Dining Sampler', description: 'A preview menu block for validating catering and events content.', price: 'Preview' }
];

const HOURS = [
  ['Mon - Thu', '4:00 PM - 9:00 PM'],
  ['Fri', '4:00 PM - 10:00 PM'],
  ['Sat', '10:00 AM - 10:00 PM'],
  ['Sun', '10:00 AM - 8:00 PM']
];

const FAQS = [
  ['Is this a live restaurant website?', 'No. This is a preview-safe sample bundle used for AFO validation.'],
  ['Can this be production deployed?', 'No production action is allowed in this workflow. This preview stays on workers.dev only.'],
  ['What does this page demonstrate?', 'A reusable restaurant layout with menu, hours, FAQs, AI-readable metadata, and smoke-testable routes.']
];

const SCHEMA_JSON = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: SITE.name,
  url: SITE.baseUrl,
  servesCuisine: SITE.cuisine,
  description: SITE.description,
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'San Juan Capistrano',
    addressRegion: 'CA'
  },
  hasMenu: `${SITE.baseUrl}/#menu`,
  sameAs: [SITE.previewUrl]
};

const LLMS_TXT = `# ${SITE.name}

${SITE.description}

This is a preview-safe AFO Site Bundle reference site. It is not a live restaurant and should not be treated as a production deployment.

## Important Routes
- Home: ${SITE.baseUrl}/
- Health: ${SITE.baseUrl}/health
- Schema: ${SITE.baseUrl}/schema.json
- Sitemap: ${SITE.baseUrl}/sitemap.xml

## Content Summary
- Cuisine: ${SITE.cuisine}
- Location: ${SITE.location}
- Features: seasonal menu, hours, FAQs, structured data, smoke-testable discovery files
`;

const ROBOTS_TXT = `User-agent: *
Allow: /
Sitemap: ${SITE.baseUrl}/sitemap.xml
`;

const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE.baseUrl}/</loc></url>
  <url><loc>${SITE.baseUrl}/health</loc></url>
  <url><loc>${SITE.baseUrl}/llms.txt</loc></url>
  <url><loc>${SITE.baseUrl}/robots.txt</loc></url>
  <url><loc>${SITE.baseUrl}/sitemap.xml</loc></url>
  <url><loc>${SITE.baseUrl}/schema.json</loc></url>
</urlset>
`;

const HTML = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${SITE.name} - Seasonal Local Dining</title>
  <meta name="description" content="${escapeHtml(SITE.description)}">
  <link rel="canonical" href="${SITE.baseUrl}/">
  <script type="application/ld+json">${JSON.stringify(SCHEMA_JSON)}</script>
  <style>
    :root {
      color-scheme: light;
      --ink: #1f1812;
      --muted: #6f6258;
      --paper: #fffaf2;
      --card: #ffffff;
      --accent: #a95f2b;
      --accent-dark: #713d1f;
      --sage: #5f7f63;
      --line: rgba(31, 24, 18, 0.14);
      --shadow: 0 24px 70px rgba(70, 45, 22, 0.16);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background:
        radial-gradient(circle at top left, rgba(169, 95, 43, 0.20), transparent 34rem),
        linear-gradient(180deg, #fff7ea 0%, var(--paper) 52%, #f6ead8 100%);
      color: var(--ink);
      line-height: 1.6;
    }
    a { color: inherit; }
    .shell { width: min(1120px, calc(100% - 32px)); margin: 0 auto; }
    .nav {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 24px 0;
    }
    .brand { display: flex; align-items: center; gap: 12px; font-weight: 800; letter-spacing: -0.03em; }
    .brand-mark { display: grid; place-items: center; width: 44px; height: 44px; border-radius: 16px; background: var(--ink); color: #fff7ea; box-shadow: var(--shadow); }
    .nav-links { display: flex; gap: 18px; color: var(--muted); font-size: 0.95rem; }
    .nav-links a { text-decoration: none; }
    .hero { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr); gap: 32px; align-items: center; padding: 56px 0 48px; }
    .eyebrow { color: var(--accent-dark); font-weight: 800; text-transform: uppercase; letter-spacing: 0.14em; font-size: 0.78rem; }
    h1 { margin: 12px 0 18px; font-size: clamp(3.2rem, 8vw, 6.8rem); line-height: 0.9; letter-spacing: -0.075em; }
    .hero p { color: var(--muted); max-width: 640px; font-size: 1.14rem; }
    .actions { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 26px; }
    .button { border: 1px solid transparent; border-radius: 999px; padding: 12px 18px; text-decoration: none; font-weight: 800; }
    .button.primary { background: var(--ink); color: #fffaf2; }
    .button.secondary { border-color: var(--line); background: rgba(255,255,255,0.58); }
    .hero-card { background: rgba(255,255,255,0.72); border: 1px solid var(--line); border-radius: 34px; padding: 24px; box-shadow: var(--shadow); backdrop-filter: blur(16px); }
    .plate { min-height: 310px; border-radius: 28px; background: linear-gradient(135deg, #2f241b, #89502a 48%, #e7bc78); display: grid; place-items: center; color: #fff8ec; text-align: center; padding: 30px; }
    .plate strong { display: block; font-size: 2rem; line-height: 1; letter-spacing: -0.06em; }
    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-top: 14px; }
    .stat { border: 1px solid var(--line); border-radius: 20px; padding: 14px; background: #fffaf5; }
    .stat b { display: block; font-size: 1.2rem; }
    section { padding: 48px 0; }
    .section-head { display: flex; justify-content: space-between; gap: 20px; align-items: end; margin-bottom: 22px; }
    h2 { margin: 0; font-size: clamp(2rem, 4vw, 3.4rem); line-height: 1; letter-spacing: -0.055em; }
    .section-head p { max-width: 560px; color: var(--muted); margin: 0; }
    .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
    .card { background: var(--card); border: 1px solid var(--line); border-radius: 24px; padding: 20px; box-shadow: 0 14px 34px rgba(70,45,22,0.08); }
    .menu-item { display: flex; flex-direction: column; min-height: 230px; }
    .menu-item h3, .card h3 { margin: 0 0 8px; letter-spacing: -0.03em; }
    .menu-item p, .card p { color: var(--muted); margin: 0; }
    .price { margin-top: auto; color: var(--accent-dark); font-weight: 900; font-size: 1.15rem; }
    .two-col { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 16px; }
    .hours-row { display: flex; justify-content: space-between; gap: 18px; padding: 12px 0; border-bottom: 1px solid var(--line); }
    .hours-row:last-child { border-bottom: 0; }
    .route-list { display: grid; gap: 10px; }
    .route { display: flex; align-items: center; justify-content: space-between; gap: 12px; border: 1px solid var(--line); border-radius: 16px; padding: 12px 14px; background: #fffaf5; text-decoration: none; }
    .route code { font-weight: 800; }
    .badge { border-radius: 999px; padding: 4px 10px; background: rgba(95,127,99,0.13); color: #36573b; font-size: 0.78rem; font-weight: 800; }
    .faq { display: grid; gap: 12px; }
    details { background: var(--card); border: 1px solid var(--line); border-radius: 20px; padding: 16px 18px; }
    summary { cursor: pointer; font-weight: 850; }
    details p { color: var(--muted); margin-bottom: 0; }
    footer { padding: 34px 0 44px; color: var(--muted); }
    @media (max-width: 860px) {
      .hero, .two-col { grid-template-columns: 1fr; }
      .grid { grid-template-columns: repeat(2, 1fr); }
      .section-head { display: block; }
      .nav { align-items: flex-start; }
      .nav-links { flex-wrap: wrap; justify-content: flex-end; }
    }
    @media (max-width: 560px) {
      .grid, .stats { grid-template-columns: 1fr; }
      .nav { display: block; }
      .nav-links { justify-content: flex-start; margin-top: 12px; }
    }
  </style>
</head>
<body>
  <header class="shell nav" aria-label="Site header">
    <div class="brand"><span class="brand-mark">SR</span><span>${SITE.name}</span></div>
    <nav class="nav-links" aria-label="Primary navigation">
      <a href="#menu">Menu</a>
      <a href="#hours">Hours</a>
      <a href="#routes">AI routes</a>
      <a href="#faq">FAQ</a>
    </nav>
  </header>

  <main>
    <section class="shell hero">
      <div>
        <div class="eyebrow">${SITE.location} · ${SITE.cuisine}</div>
        <h1>Seasonal local dining.</h1>
        <p>${SITE.tagline} This refreshed preview demonstrates a richer restaurant homepage while keeping every deployment guardrail intact.</p>
        <div class="actions">
          <a class="button primary" href="#menu">Explore menu</a>
          <a class="button secondary" href="/schema.json">View schema.json</a>
        </div>
      </div>
      <aside class="hero-card" aria-label="Restaurant preview card">
        <div class="plate"><div><span class="eyebrow" style="color:#ffe2b6">Preview menu</span><strong>Fresh, simple, local</strong><p>Reference content for bundle validation, not a production restaurant.</p></div></div>
        <div class="stats">
          <div class="stat"><b>6</b><span>Smoke routes</span></div>
          <div class="stat"><b>0</b><span>Prod routes</span></div>
          <div class="stat"><b>100%</b><span>Preview only</span></div>
        </div>
      </aside>
    </section>

    <section class="shell" id="menu">
      <div class="section-head">
        <h2>Menu highlights</h2>
        <p>Static sample items prove that a restaurant bundle can carry useful, structured content without using secrets, account IDs, custom domains, or production routes.</p>
      </div>
      <div class="grid">
        ${MENU.map(item => `<article class="card menu-item"><h3>${escapeHtml(item.name)}</h3><p>${escapeHtml(item.description)}</p><div class="price">${escapeHtml(item.price)}</div></article>`).join('')}
      </div>
    </section>

    <section class="shell two-col" id="hours">
      <div class="card">
        <div class="eyebrow">Visit preview</div>
        <h2>Hours</h2>
        <p>Representative hours for UI and content validation.</p>
        <div style="margin-top:18px">
          ${HOURS.map(([day, time]) => `<div class="hours-row"><strong>${day}</strong><span>${time}</span></div>`).join('')}
        </div>
      </div>
      <div class="card" id="routes">
        <div class="eyebrow">AI-readable routes</div>
        <h2>Discovery files</h2>
        <p>These endpoints remain smoke-testable and use stable content types.</p>
        <div class="route-list" style="margin-top:18px">
          <a class="route" href="/health"><code>/health</code><span class="badge">JSON</span></a>
          <a class="route" href="/llms.txt"><code>/llms.txt</code><span class="badge">text/plain</span></a>
          <a class="route" href="/robots.txt"><code>/robots.txt</code><span class="badge">text/plain</span></a>
          <a class="route" href="/sitemap.xml"><code>/sitemap.xml</code><span class="badge">XML</span></a>
          <a class="route" href="/schema.json"><code>/schema.json</code><span class="badge">JSON-LD</span></a>
        </div>
      </div>
    </section>

    <section class="shell" id="faq">
      <div class="section-head">
        <h2>Preview FAQ</h2>
        <p>Guardrail-aware content for reviewers, agents, and smoke-test automation.</p>
      </div>
      <div class="faq">
        ${FAQS.map(([question, answer]) => `<details><summary>${escapeHtml(question)}</summary><p>${escapeHtml(answer)}</p></details>`).join('')}
      </div>
    </section>
  </main>

  <footer class="shell">
    <strong>${SITE.name}</strong> · ${SITE.description} · Preview-safe workers.dev deployment only.
  </footer>
</body>
</html>`;

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (url.pathname === '/') return html(HTML);
    if (url.pathname === '/health') {
      return json({
        ok: true,
        worker: SITE.worker,
        bundle_schema: SITE.schema,
        schema_version: SITE.schemaVersion,
        preview_only: true,
        production_routes: 0,
        custom_domains: 0
      });
    }
    if (url.pathname === '/llms.txt') return text(LLMS_TXT, 'text/plain');
    if (url.pathname === '/robots.txt') return text(ROBOTS_TXT, 'text/plain');
    if (url.pathname === '/sitemap.xml') return text(SITEMAP_XML, 'application/xml');
    if (url.pathname === '/schema.json') return json(SCHEMA_JSON);

    return new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }
};

function html(body) {
  return new Response(body, { headers: { 'content-type': 'text/html; charset=utf-8' } });
}

function text(body, contentType) {
  return new Response(body, { headers: { 'content-type': `${contentType}; charset=utf-8` } });
}

function json(body) {
  return new Response(JSON.stringify(body, null, 2), { headers: { 'content-type': 'application/json; charset=utf-8' } });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
