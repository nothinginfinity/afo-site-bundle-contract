import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const templateRoot = path.join(repoRoot, 'templates', 'restaurant-v1');
const dataPath = path.join(templateRoot, 'sample-data', 'sample-restaurant.json');
const templatePath = path.join(templateRoot, 'worker.template.js');
const outputRoot = path.join(templateRoot, 'sample-output');

const data = JSON.parse(await readFile(dataPath, 'utf8'));
const discovery = buildDiscovery(data);
data.discovery = {
  ...(data.discovery || {}),
  llms_txt: discovery.llms_txt,
  robots_txt: discovery.robots_txt,
  sitemap_xml: discovery.sitemap_xml,
  schema_jsonld: discovery.schema_jsonld
};

const template = await readFile(templatePath, 'utf8');
const worker = template.replace('__AFO_RESTAURANT_DATA_JSON__', JSON.stringify(data));

await mkdir(outputRoot, { recursive: true });
await writeFile(path.join(outputRoot, 'worker.js'), worker);
await writeFile(path.join(outputRoot, 'llms.txt'), discovery.llms_txt);
await writeFile(path.join(outputRoot, 'robots.txt'), discovery.robots_txt);
await writeFile(path.join(outputRoot, 'sitemap.xml'), discovery.sitemap_xml);
await writeFile(path.join(outputRoot, 'schema.json'), `${JSON.stringify(discovery.schema_jsonld, null, 2)}\n`);

console.log(JSON.stringify({
  ok: true,
  template: 'restaurant-v1',
  output_dir: path.relative(repoRoot, outputRoot),
  files: ['worker.js', 'llms.txt', 'robots.txt', 'sitemap.xml', 'schema.json'],
  deployed: false
}, null, 2));

function buildDiscovery(data) {
  const business = data.business || {};
  const discovery = data.discovery || {};
  const routes = data.routes || ['/', '/health', '/llms.txt', '/robots.txt', '/sitemap.xml', '/schema.json'];
  const base = String(discovery.base_url || 'https://sample-restaurant.example').replace(/\/$/, '');
  const schema_jsonld = Object.keys(discovery.schema_jsonld || {}).length ? discovery.schema_jsonld : {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: business.name,
    url: base,
    description: business.description,
    servesCuisine: business.cuisine,
    telephone: business.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: business.address,
      addressLocality: business.city,
      addressRegion: business.region
    },
    hasMenu: `${base}/#menu`
  };
  const llms_txt = discovery.llms_txt || `# ${business.name}\n\n${business.description}\n\nThis is a preview-safe AFO Restaurant Template v1 Worker output. It is suitable for AI discovery, validation, and workers.dev preview demos.\n\n## Business\n- Name: ${business.name}\n- Cuisine: ${business.cuisine}\n- Location: ${business.location}\n- Phone: ${business.phone || 'not provided'}\n\n## Routes\n${routes.map(route => `- ${route}`).join('\n')}\n\n## Guardrails\n- Preview only\n- No production routes\n- No custom domains\n- No secrets\n- No account IDs\n`;
  const robots_txt = discovery.robots_txt || `User-agent: *\nAllow: /\nSitemap: ${base}/sitemap.xml\n`;
  const sitemap_xml = discovery.sitemap_xml || `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes.map(route => `  <url><loc>${base}${route === '/' ? '/' : route}</loc></url>`).join('\n')}\n</urlset>\n`;
  return { llms_txt, robots_txt, sitemap_xml, schema_jsonld };
}
