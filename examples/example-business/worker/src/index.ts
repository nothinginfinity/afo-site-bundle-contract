/**
 * Capistrano Plumbing Co. — Micro SEO Site Worker
 * Bundle: afo.site.bundle.v1
 *
 * GitHub is source of truth.
 * Deploy via AFO Mobile Terminal MCP only — never manually.
 */

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // Static discovery files
    if (path === '/robots.txt') {
      return serveText(ROBOTS_TXT, 'text/plain');
    }
    if (path === '/sitemap.xml') {
      return serveText(SITEMAP_XML, 'application/xml');
    }
    if (path === '/llms.txt') {
      return serveText(LLMS_TXT, 'text/plain');
    }

    // All other routes → homepage
    return new Response(HTML, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  },
};

function serveText(content: string, contentType: string): Response {
  return new Response(content, {
    headers: { 'Content-Type': `${contentType}; charset=utf-8` },
  });
}

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Capistrano Plumbing Co. — Emergency Plumber San Juan Capistrano</title>
  <meta name="description" content="Fast, reliable plumbing service in San Juan Capistrano. Available 24/7 for emergency repairs, drain cleaning, and water heater installation." />
  <meta property="og:title" content="Capistrano Plumbing Co. — Emergency Plumber" />
  <meta property="og:description" content="24/7 emergency plumbing in San Juan Capistrano. Fast response, licensed &amp; insured." />
  <link rel="canonical" href="https://capistranopiping.com" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "Capistrano Plumbing Co.",
    "url": "https://capistranopiping.com",
    "telephone": "+1-949-555-0100",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "San Juan Capistrano",
      "addressRegion": "CA",
      "addressCountry": "US"
    }
  }
  </script>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; background: #fff; color: #222; }
    header { background: #003580; color: #fff; padding: 1.5rem 2rem; }
    header h1 { margin: 0; font-size: 1.5rem; }
    .hero { padding: 4rem 2rem; text-align: center; background: #f5f5f5; }
    .hero h2 { font-size: 2rem; margin-bottom: 1rem; }
    .cta-btn { display: inline-block; background: #e63; color: #fff; padding: 1rem 2rem; border-radius: 4px; text-decoration: none; font-size: 1.25rem; font-weight: bold; }
    .services { padding: 3rem 2rem; max-width: 800px; margin: 0 auto; }
    footer { background: #003580; color: #fff; text-align: center; padding: 1rem; font-size: 0.875rem; }
  </style>
</head>
<body>
  <header><h1>Capistrano Plumbing Co.</h1></header>
  <main>
    <section class="hero">
      <h2>San Juan Capistrano's Trusted Emergency Plumber</h2>
      <p>Available 24/7. Fast response. Licensed &amp; insured.</p>
      <a class="cta-btn" href="tel:+19495550100">Call Now: (949) 555-0100</a>
    </section>
    <section class="services">
      <h3>Our Services</h3>
      <ul>
        <li>Emergency Plumbing Repairs</li>
        <li>Drain Cleaning</li>
        <li>Water Heater Installation &amp; Repair</li>
        <li>Leak Detection</li>
      </ul>
    </section>
  </main>
  <footer>&copy; 2026 Capistrano Plumbing Co. | San Juan Capistrano, CA</footer>
</body>
</html>`;

const ROBOTS_TXT = `User-agent: *
Allow: /
Sitemap: https://capistranopiping.com/sitemap.xml
`;

const SITEMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://capistranopiping.com/</loc>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`;

const LLMS_TXT = `# Capistrano Plumbing Co.

Local plumbing company in San Juan Capistrano, CA.
Services: Emergency repairs, drain cleaning, water heater installation, leak detection.
Phone: (949) 555-0100
Available 24/7.
`;
