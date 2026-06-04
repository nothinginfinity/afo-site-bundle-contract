--1770ef90374e4f891100c8f08782bad703a39b179c4e6538fac29b9a3e2c
Content-Disposition: form-data; name="worker.js"

// Contractor v0.05 - Contractor + Admin Chat Demo
// Preview-safe Cloudflare Worker. No production routes, no custom domains, no secrets.

const VERSION = '0.05';
const WORKER_SLUG = 'contractor-v005-afo';
const CURRENT_WORKER_SLUG = 'contractor-v004-afo';
const LIVE_URL = 'https://contractor-v005-afo.jaredtechfit.workers.dev/';
const CURRENT_LIVE_URL = 'https://contractor-v004-afo.jaredtechfit.workers.dev/';
const BACKEND_WORKER = 'afo-demo-backend-v001';
const REPO_LINK = 'https://github.com/nothinginfinity/afo-site-bundle-contract';

const routeList = [
  '/', '/admin', '/admin/prompts.json', '/admin/actions.json', '/admin/chat', '/admin/export-prompt',
  '/projects/featured', '/featured-project.json', '/health', '/services.json', '/projects.json',
  '/knowledge.json', '/articles.json', '/chat', '/leads', '/schema.json', '/llms.txt', '/robots.txt', '/sitemap.xml'
];

const services = [
  { id: 'kitchen-remodeling', title: 'Kitchen Remodeling', description: 'Design-forward kitchen upgrades, cabinets, counters, lighting, tile, and finish coordination.', cta: 'Estimate a kitchen remodel' },
  { id: 'bathroom-renovation', title: 'Bathroom Renovation', description: 'Tub-to-shower conversions, tile, vanities, fixtures, waterproofing, and finish packages.', cta: 'Estimate a bathroom renovation' },
  { id: 'decks-patios', title: 'Decks & Outdoor Living', description: 'Deck repairs, patio refreshes, railings, shade structures, and outdoor project planning.', cta: 'Estimate an outdoor project' },
  { id: 'whole-home-repairs', title: 'Whole-home Repairs', description: 'Punch-list repairs, drywall, trim, paint, doors, flooring, and pre-listing improvements.', cta: 'Estimate home repairs' },
  { id: 'featured-projects', title: 'Featured Project Pages', description: 'Preview-safe landing pages that explain project scope, timeline, budget, services, and next-step CTAs.', cta: 'Build a featured project page' }
];

const projects = [
  { id: 'modern-kitchen-refresh', title: 'Modern Kitchen Refresh', type: 'Kitchen', budget: '$18k-$32k', timeline: '3-5 weeks', summary: 'A bright cabinet, counter, backsplash, and lighting refresh for a busy family kitchen.' },
  { id: 'spa-bath-upgrade', title: 'Spa Bath Upgrade', type: 'Bathroom', budget: '$12k-$24k', timeline: '2-4 weeks', summary: 'A calming bathroom renovation with tile, new vanity, fixtures, and improved storage.' },
  { id: 'backyard-deck-repair', title: 'Backyard Deck Repair', type: 'Outdoor', budget: '$6k-$15k', timeline: '1-3 weeks', summary: 'A safer, cleaner outdoor entertaining space with repaired boards, rails, and finish.' }
];

const articles = [
  { slug: 'questions-before-calling-a-contractor', title: 'Questions to Ask Before Calling a Contractor', excerpt: 'A quick checklist for scope, budget, timing, photos, and must-have outcomes before requesting an estimate.' },
  { slug: 'how-to-scope-a-remodel', title: 'How to Scope a Remodel Without Overbuilding', excerpt: 'Separate must-haves from nice-to-haves and turn a fuzzy idea into an estimate-ready scope.' },
  { slug: 'preview-safe-ai-contractor-sites', title: 'Preview-safe AI Contractor Sites', excerpt: 'How a demo site can collect requests, generate prompts, and avoid autonomous production writes.' }
];

const knowledge = [
  { id: 'estimate-flow', question: 'How do estimates work?', answer: 'The preview demo gathers project type, location, timeline, budget, and photos or notes, then creates a structured lead handoff.' },
  { id: 'admin-mode', question: 'Can the admin update the site automatically?', answer: 'Not in v0.05. Admin mode only generates prompt handoffs for ChatGPT, Claude, Alice, or MCP tools.' },
  { id: 'backend-fallback', question: 'What happens if the backend is unavailable?', answer: 'The frontend keeps local fallback content and returns preview-safe responses.' }
];

const featuredProject = {
  id: 'featured-family-kitchen-refresh',
  title: 'Featured Project Concept: Family Kitchen Refresh',
  hero_image: 'https://images.unsplash.com/photo-1556912173-3bb406ef7e77?auto=format&fit=crop&w=1600&q=80',
  before_after_narrative: 'Before: dated finishes, limited prep space, and dim task lighting. After: brighter surfaces, a cleaner work triangle, improved storage, and a warmer place to gather. This is static sample data for Contractor v0.05.',
  scope: ['Cabinet paint or refacing concept', 'Quartz-style counter package placeholder', 'Backsplash and under-cabinet lighting', 'Sink, faucet, and hardware refresh', 'Project photography and featured page copy'],
  timeline: '3-5 weeks after material selections',
  budget_range: '$18,000-$32,000 sample planning range',
  services_used: ['Kitchen Remodeling', 'Finish Carpentry', 'Tile & Backsplash', 'Lighting', 'Featured Project Page'],
  ctas: [
    { label: 'Estimate a similar project', href: '/leads' },
    { label: 'Chat about a similar project', href: '/chat' }
  ],
  preview_only: true
};

const promptTemplates = [
  template('update_images', 'Update images', 'Generate a handoff to replace or improve site imagery while preserving preview-only rules.', 'Update site images for the customer request. Identify target image slots, desired style, alt text, source/asset requirements, and receipt updates.', ['Do not upload to production storage without confirmation.', 'Register media as preview-safe metadata only unless instructed.'], ['Image slot plan', 'Suggested file/routes', 'Alt text', 'Receipt entry']),
  template('rewrite_articles', 'Rewrite articles', 'Generate an article rewrite handoff for contractor SEO/AFO pages.', 'Rewrite or add articles based on the customer request. Preserve route compatibility and keep content preview-safe.', ['Avoid claims not supplied by the customer.', 'No production publishing.'], ['Article drafts', 'Slug list', 'Schema notes', 'Receipt entry']),
  template('create_featured_project', 'Create featured project page', 'Generate a featured project page handoff with scope, before/after story, budget, timeline, and CTAs.', 'Create a featured project page concept from the customer change request.', ['Use sample placeholders when customer proof is missing.', 'Do not imply completed work unless verified.'], ['Project page copy', 'JSON data updates', 'CTA plan', 'Receipt entry']),
  template('improve_sticky_cta', 'Improve sticky CTA', 'Generate UI/UX prompt for mobile sticky CTA improvements.', 'Improve the sticky CTA while avoiding layout overlap and preserving call/estimate/chat actions.', ['Keep mobile-safe spacing.', 'Preserve existing CTA functions.'], ['CTA copy', 'CSS changes', 'Accessibility notes', 'Receipt entry']),
  template('update_services', 'Update services', 'Generate prompt for service list, service detail copy, and structured data updates.', 'Update services for the customer request.', ['Avoid unsupported licensing or insurance claims.', 'Keep preview-only.'], ['Services JSON plan', 'Homepage cards', 'Schema notes', 'Receipt entry']),
  template('improve_hero_copy', 'Improve hero copy', 'Generate prompt for stronger above-the-fold copy and CTA hierarchy.', 'Improve hero copy and CTA clarity for the contractor demo.', ['Do not remove functional CTAs.', 'Keep local fallback.'], ['Hero headline options', 'CTA copy', 'Files/routes', 'Receipt entry']),
  template('add_customer_faqs', 'Add customer-specific FAQs', 'Generate prompt for FAQ additions based on customer questions and objections.', 'Add customer-specific FAQs to the knowledge base and page copy.', ['No legal/permit advice unless sourced.', 'Mark preview-only.'], ['FAQ entries', 'Knowledge JSON updates', 'Schema notes', 'Receipt entry']),
  template('seed_backend_knowledge', 'Seed backend knowledge', 'Generate a preview-safe backend knowledge seed prompt.', 'Prepare backend knowledge seed data for the customer request.', ['Do not mutate backend in v0.05 admin chat.', 'Require separate confirmation for D1/R2 writes.'], ['Seed records', 'Dry-run plan', 'Validation checklist', 'Receipt entry']),
  template('register_media_asset', 'Register media asset', 'Generate media registration prompt for images/videos with metadata.', 'Register a media asset for preview use.', ['Do not store secrets or account IDs.', 'Do not write R2 from admin chat.'], ['Asset metadata', 'Usage slots', 'Alt/caption text', 'Receipt entry']),
  template('create_customer_demo_version', 'Create customer-specific demo version', 'Generate a next-version handoff for isolated customer demo builds.', 'Create a customer-specific preview version without modifying older Workers.', ['Never redeploy prior versions unless Jared explicitly asks.', 'workers.dev preview only.'], ['New Worker slug', 'Route plan', 'Deploy receipt', 'Smoke tests'])
];

function template(id, title, description, prompt_template, safety_notes, expected_outputs) {
  return { id, title, description, prompt_template, safety_notes, expected_outputs };
}

const adminActions = [
  action('update_site_copy', 'Update site copy', 'Generate a copy update prompt for hero, services, FAQs, and CTAs.', ['customer request', 'target pages', 'tone'], 'Copy the generated prompt into ChatGPT/Claude and review file diffs.'),
  action('update_project_images', 'Update project images', 'Plan image replacements, captions, alt text, and preview asset registration.', ['image goals', 'target route', 'asset references'], 'Generate an image update handoff and require confirmation before storage writes.'),
  action('create_featured_project_page', 'Create featured project page', 'Draft a polished project page concept and JSON content update.', ['project title', 'scope', 'timeline', 'budget range'], 'Create preview page copy and receipt notes.'),
  action('update_articles', 'Update articles', 'Draft article rewrites or additions for contractor AFO content.', ['article topics', 'customer niche', 'service area'], 'Review generated article prompt and commit preview changes only.'),
  action('update_knowledge_base', 'Update knowledge base', 'Create FAQ and knowledge records for chat/project assistant fallback.', ['questions', 'answers', 'source notes'], 'Seed preview knowledge only after explicit tool confirmation.'),
  action('register_media', 'Register media', 'Describe media assets and usage slots without mutating storage.', ['asset name', 'type', 'alt text', 'usage route'], 'Prepare media metadata for later confirmed R2 registration.'),
  action('improve_ui_cta', 'Improve UI CTA', 'Suggest mobile sticky CTA and footer CTA improvements.', ['CTA goal', 'device focus', 'conversion objective'], 'Apply preview UI changes and smoke-test mobile-safe routes.'),
  action('create_next_version', 'Create next version', 'Plan an isolated version with a new Worker slug and receipt.', ['next version', 'worker slug', 'safety rules'], 'Deploy only the new Worker and write a receipt.')
];

function action(action_id, title, description, expected_inputs, next_step) {
  return { action_id, title, dry_run: true, requires_confirmation: true, production_deploy: false, description, expected_inputs, next_step };
}

const safetyRules = [
  'Do not create production routes.',
  'Do not add custom domains.',
  'Do not add account IDs.',
  'Do not add secrets or real auth secrets.',
  'Do not add bindings except BACKEND service binding.',
  'Do not set deployment.confirmed to true.',
  'Do not modify or redeploy contractor v001-v004 unless Jared explicitly asks.',
  'Keep preview deploy workers.dev only.',
  'Admin password demo is preview-only and not production security.',
  'Admin routes must not mutate GitHub, D1, R2, or Cloudflare in v0.05.'
];

function generatePrompt(change, intent = 'update_site_copy') {
  const matched = promptTemplates.find(t => t.id === intent) || promptTemplates[0];
  const suggested = suggestFiles(intent);
  return `# Contractor v0.05 Update Handoff\n\nRepo: ${REPO_LINK}\nCurrent Worker slug: ${CURRENT_WORKER_SLUG}\nTarget Worker slug: ${WORKER_SLUG}\nCurrent live URL: ${LIVE_URL}\nBackend Worker: ${BACKEND_WORKER}\n\n## Mode\nPreview-only admin prompt cockpit. Do not perform autonomous production writes.\n\n## Customer requested change\n${change || '[Describe the exact customer-requested change here.]'}\n\n## Update type\n${matched.title} (${matched.id})\n\n## Suggested files/routes to update\n${suggested.map(x => `- ${x}`).join('\n')}\n\n## Safety rules\n${safetyRules.map(x => `- ${x}`).join('\n')}\n\n## Template guidance\n${matched.prompt_template}\n\n## Expected outputs\n${matched.expected_outputs.map(x => `- ${x}`).join('\n')}\n\n## Required completion report\n- Keep changes preview-only.\n- Write/update receipt at receipts/contractor-v005-afo.deploy.json.\n- Report commit SHA and deploy SHA/deployment ID.\n- Report smoke test results for touched routes.\n- Confirm no prior contractor versions were modified or redeployed.\n`;
}

function suggestFiles(intent) {
  const base = ['frontend/contractor-v005-afo/README.md', 'receipts/contractor-v005-afo.deploy.json'];
  const map = {
    update_images: ['/projects.json', '/featured-project.json', '/projects/featured', 'frontend/contractor-v005-afo/admin-prompts.md'],
    rewrite_articles: ['/articles.json', '/schema.json', '/sitemap.xml'],
    create_featured_project: ['/projects/featured', '/featured-project.json', '/projects.json'],
    improve_sticky_cta: ['/', '/chat', '/leads', 'mobile sticky CTA styles'],
    update_services: ['/services.json', '/', '/schema.json'],
    improve_hero_copy: ['/', '/llms.txt', '/schema.json'],
    add_customer_faqs: ['/knowledge.json', '/schema.json', '/chat'],
    seed_backend_knowledge: ['/knowledge.json', 'BACKEND service handoff only'],
    register_media_asset: ['/featured-project.json', '/projects.json', 'media metadata only'],
    create_customer_demo_version: ['new isolated Worker slug', 'new receipt', 'route smoke tests']
  };
  return [...(map[intent] || ['/']), ...base];
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}

function text(body, contentType = 'text/plain; charset=utf-8') {
  return new Response(body, { headers: { 'content-type': contentType, 'cache-control': 'no-store' } });
}

function html(body, title = 'Contractor v0.05') {
  return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title><meta name="description" content="Contractor v0.05 preview-safe admin chat demo"><style>${css()}</style></head><body>${body}${stickyCTA()}<script>${clientJS()}</script></body></html>`, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' } });
}

async function tryBackend(env, path) {
  if (!env || !env.BACKEND || typeof env.BACKEND.fetch !== 'function') return null;
  try {
    const res = await env.BACKEND.fetch(new Request('https://backend.local' + path, { headers: { 'x-preview-worker': WORKER_SLUG } }));
    if (!res.ok) return null;
    return await res.text();
  } catch (e) { return null; }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/$/, '') || '/';
    if (path === '/') return html(homePage(), 'Contractor v0.05 Demo');
    if (path === '/admin') return html(adminPage(), 'Admin Prompt Cockpit');
    if (path === '/admin/prompts.json') return json({ ok: true, version: VERSION, preview_only: true, templates: promptTemplates });
    if (path === '/admin/actions.json') return json({ ok: true, version: VERSION, preview_only: true, actions: adminActions });
    if (path === '/admin/chat') return handleAdminChat(request);
    if (path === '/admin/export-prompt') return text(generatePrompt(url.searchParams.get('change') || '', url.searchParams.get('intent') || 'update_site_copy'), 'text/markdown; charset=utf-8');
    if (path === '/projects/featured') return html(featuredProjectPage(), 'Featured Project Concept');
    if (path === '/featured-project.json') return json({ ok: true, version: VERSION, featured_project: featuredProject });
    if (path === '/health') return json({ ok: true, version: VERSION, worker_slug: WORKER_SLUG, preview_only: true, backend_binding: 'BACKEND -> afo-demo-backend-v001', routes: routeList });
    if (path === '/services.json') return json({ ok: true, source: 'local_fallback', services });
    if (path === '/projects.json') return json({ ok: true, source: 'local_fallback', projects });
    if (path === '/knowledge.json') return json({ ok: true, source: 'local_fallback', knowledge });
    if (path === '/articles.json') return json({ ok: true, source: 'local_fallback', articles });
    if (path === '/chat') return html(chatPage(), 'Project Assistant');
    if (path === '/leads') return html(leadsPage(), 'Get Estimate');
    if (path === '/schema.json') return json(schema());
    if (path === '/llms.txt') return text(llms());
    if (path === '/robots.txt') return text('User-agent: *\nAllow: /\nSitemap: ' + LIVE_URL + 'sitemap.xml\n');
    if (path === '/sitemap.xml') return text(sitemap(), 'application/xml; charset=utf-8');
    const backend = await tryBackend(env, path);
    if (backend) return text(backend, 'application/json; charset=utf-8');
    return html(notFound(path), 'Not Found');
  }
};

async function handleAdminChat(request) {
  if (request.method !== 'POST') return json({ ok: true, preview_only: true, admin_mode: 'prompt_generator', usage: 'POST JSON { "message": "...", "intent": "update_images" }' });
  let body = {};
  try { body = await request.json(); } catch (e) { return json({ ok: false, preview_only: true, error: 'Expected JSON body.' }, 400); }
  const intent = body.intent || 'update_site_copy';
  return json({ ok: true, preview_only: true, admin_mode: 'prompt_generator', intent, generated_prompt: generatePrompt(body.message || '', intent), suggested_actions: adminActions.filter(a => relatedAction(a.action_id, intent)).slice(0, 3) });
}

function relatedAction(actionId, intent) {
  const joined = `${actionId} ${intent}`;
  return ['copy','image','project','article','knowledge','media','cta','version','service','hero','faq','backend'].some(k => joined.includes(k));
}

function homePage() {
  return `<header class="hero"><nav><b>AFO Contractor Demo</b><span>v0.05 preview</span><a href="/admin">Admin</a></nav><div class="hero-grid"><section><p class="eyebrow">Contractor + Admin Chat Demo</p><h1>Turn homeowner questions into estimate-ready conversations.</h1><p class="lead">A preview-safe contractor site with estimate CTAs, project assistant chat, local fallback content, and a new password-gated admin prompt cockpit.</p><div class="actions"><a class="btn primary" href="tel:+15550101234">Call for Free Estimate</a><a class="btn" href="/leads">Get Estimate</a><a class="btn ghost" href="/chat">Chat with Project Assistant</a></div><p class="micro">Preview-only · BACKEND service binding preserved · workers.dev demo</p></section><aside class="card"><h2>What v0.05 adds</h2><ul><li>Password-gated <code>/admin</code></li><li>Admin prompt generator</li><li>Preview-safe <code>/admin/chat</code></li><li>Featured project foundation</li><li>Improved mobile sticky CTA</li></ul></aside></div></header><main><section class="cards">${services.map(s => `<article class="card"><h3>${s.title}</h3><p>${s.description}</p><a href="/leads">${s.cta} →</a></article>`).join('')}</section><section class="split"><div><p class="eyebrow">Featured project foundation</p><h2>Show the work before the homeowner calls.</h2><p>Use a polished project page concept to frame scope, timeline, budget range, before/after narrative, and next-step CTAs.</p><a class="btn primary" href="/projects/featured">View featured project</a></div><div class="card"><h3>Admin cockpit</h3><p>Jared can describe a requested change and generate a clean handoff prompt for ChatGPT, Claude, Alice, or MCP tools.</p><a href="/admin">Open admin →</a></div></section></main><footer><b>Ready to scope a project?</b><a class="btn primary" href="/leads">Get Estimate</a><a class="btn ghost" href="/chat">Ask AI first</a></footer>`;
}

function adminPage() {
  const options = promptTemplates.map(t => `<option value="${t.id}">${t.title}</option>`).join('');
  return `<main class="admin-wrap"><section class="login card" id="loginBox"><p class="eyebrow">Preview admin only</p><h1>Admin Prompt Cockpit</h1><p class="warning">Preview admin only. Default password demo is not production security.</p><label>Password<input id="adminPassword" type="password" placeholder="demo"></label><button class="btn primary" onclick="unlockAdmin()">Unlock admin</button></section><section class="admin card hidden" id="adminBox"><p class="eyebrow">Contractor v0.05</p><h1>Generate ChatGPT Update Prompt</h1><p class="warning">Preview admin only. Default password demo is not production security.</p><label>What did the customer ask you to change?<textarea id="changeText" rows="7" placeholder="Example: Customer wants a featured kitchen remodel page with warmer images and FAQs about timelines."></textarea></label><label>Update type<select id="intentSelect">${options}</select></label><div class="actions"><button class="btn primary" onclick="generateAdminPrompt()">Generate ChatGPT Update Prompt</button><button class="btn" onclick="copyPrompt()">Copy prompt</button><a class="btn ghost" href="/admin/prompts.json">Templates JSON</a><a class="btn ghost" href="/admin/actions.json">Actions JSON</a></div><pre id="promptOutput" class="output">Generated prompt will appear here.</pre></section></main>`;
}

function chatPage() {
  return `<main class="narrow"><p class="eyebrow">Project Assistant</p><h1>Chat with Project Assistant</h1><p>Describe the project, timeline, budget range, and what you want to change. This preview route keeps local fallback behavior if the backend is unavailable.</p><div class="chatbox"><p><b>Assistant:</b> What are you hoping to repair, remodel, or improve?</p><textarea placeholder="Tell me about your project..."></textarea><a class="btn primary" href="/leads">Turn this into an estimate request</a></div></main>`;
}

function leadsPage() {
  return `<main class="narrow"><p class="eyebrow">Free Estimate</p><h1>Get an estimate</h1><p>This preview lead route demonstrates the estimate flow without storing production data.</p><form class="lead-form"><input placeholder="Name"><input placeholder="Phone or email"><select><option>Kitchen remodel</option><option>Bathroom renovation</option><option>Deck/outdoor project</option><option>Home repairs</option></select><textarea placeholder="Project notes"></textarea><button class="btn primary" type="button">Preview submit</button></form></main>`;
}

function featuredProjectPage() {
  return `<main class="featured"><p class="eyebrow">Featured Project Foundation</p><h1>${featuredProject.title}</h1><img class="hero-img" src="${featuredProject.hero_image}" alt="Bright modern kitchen sample"><section class="split"><div><h2>Before / after narrative</h2><p>${featuredProject.before_after_narrative}</p><h2>Project scope</h2><ul>${featuredProject.scope.map(x => `<li>${x}</li>`).join('')}</ul></div><aside class="card"><h3>Planning snapshot</h3><p><b>Timeline:</b> ${featuredProject.timeline}</p><p><b>Budget:</b> ${featuredProject.budget_range}</p><p><b>Services:</b> ${featuredProject.services_used.join(', ')}</p><a class="btn primary" href="/leads">Estimate similar project</a><a class="btn ghost" href="/chat">Chat about similar project</a></aside></section></main>`;
}

function schema() {
  return { '@context': 'https://schema.org', '@type': 'LocalBusiness', name: 'AFO Contractor Demo v0.05', url: LIVE_URL, description: 'Preview-safe contractor and admin chat demo.', makesOffer: services.map(s => ({ '@type': 'Offer', name: s.title, description: s.description })), sameAs: [REPO_LINK], version: VERSION, previewOnly: true };
}

function llms() {
  return `# AFO Contractor Demo v0.05\n\nPreview-safe contractor site with admin prompt cockpit.\n\nKey routes:\n${routeList.map(r => `- ${r}`).join('\n')}\n\nSafety: no production routes, no custom domains, no secrets, no autonomous writes from admin routes.\n`;
}

function sitemap() {
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routeList.filter(r => !r.endsWith('.json') && !r.includes('/admin/chat')).map(r => `<url><loc>${LIVE_URL.replace(/\/$/, '')}${r}</loc></url>`).join('')}</urlset>`;
}

function notFound(path) { return `<main class="narrow"><h1>Route not found</h1><p>${path} is not part of the v0.05 required route list.</p><a class="btn" href="/">Back home</a></main>`; }

function stickyCTA() { return `<div class="sticky-cta"><div class="sticky-micro">Free estimate · Ask before you call</div><div><a href="tel:+15550101234">Call / Estimate</a><a href="/chat">Ask AI</a></div></div>`; }

function css() { return `:root{--bg:#0d1b16;--panel:#12261f;--ink:#f5fff9;--muted:#b7d5c7;--brand:#73f0a7;--line:rgba(255,255,255,.14);--warn:#ffe08a}*{box-sizing:border-box}body{margin:0;font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif;background:linear-gradient(135deg,#07120f,#18382d);color:var(--ink);padding-bottom:104px}a{color:inherit}nav{display:flex;gap:18px;align-items:center;justify-content:space-between;padding:24px 6vw}nav span,.micro,.eyebrow{color:var(--muted)}.hero{min-height:76vh}.hero-grid,.split{display:grid;grid-template-columns:1.2fr .8fr;gap:28px;align-items:center;padding:42px 6vw}.eyebrow{text-transform:uppercase;letter-spacing:.12em;font-size:12px;font-weight:800}h1{font-size:clamp(38px,7vw,76px);line-height:.95;margin:8px 0 18px}h2{font-size:clamp(26px,4vw,44px)}.lead{font-size:clamp(18px,2vw,24px);color:var(--muted);max-width:760px}.actions{display:flex;flex-wrap:wrap;gap:12px;margin:24px 0}.btn,button{border:1px solid var(--line);border-radius:999px;padding:13px 18px;background:#1b332a;color:var(--ink);text-decoration:none;font-weight:800;cursor:pointer}.btn.primary,button.primary{background:var(--brand);color:#062015;border-color:transparent}.btn.ghost{background:transparent}.card{background:rgba(255,255,255,.07);border:1px solid var(--line);border-radius:28px;padding:24px;box-shadow:0 20px 80px rgba(0,0,0,.22)}.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:18px;padding:24px 6vw}main.narrow,.admin-wrap,.featured{max-width:1100px;margin:0 auto;padding:46px 6vw}.admin-wrap{display:grid;place-items:center;min-height:86vh}.admin-wrap .card{width:min(900px,100%)}label{display:grid;gap:8px;margin:16px 0;color:var(--muted);font-weight:700}input,textarea,select{width:100%;border:1px solid var(--line);border-radius:18px;background:#081611;color:var(--ink);padding:14px;font:inherit}.warning{background:rgba(255,224,138,.12);border:1px solid rgba(255,224,138,.45);color:var(--warn);border-radius:16px;padding:12px}.hidden{display:none}.output{white-space:pre-wrap;background:#07120f;border:1px solid var(--line);border-radius:20px;padding:18px;max-height:520px;overflow:auto}.chatbox,.lead-form{display:grid;gap:14px;background:rgba(255,255,255,.07);border:1px solid var(--line);border-radius:28px;padding:22px}.hero-img{width:100%;max-height:520px;object-fit:cover;border-radius:30px;border:1px solid var(--line)}footer{margin:40px 6vw 120px;padding:24px;border:1px solid var(--line);border-radius:28px;display:flex;gap:14px;align-items:center;justify-content:space-between;flex-wrap:wrap;background:rgba(255,255,255,.07)}.sticky-cta{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);width:min(94vw,520px);z-index:50;background:rgba(5,18,14,.94);border:1px solid rgba(115,240,167,.42);border-radius:999px;padding:8px 10px 10px;box-shadow:0 18px 60px rgba(0,0,0,.45);backdrop-filter:blur(12px);text-align:center}.sticky-micro{font-size:12px;color:var(--muted);margin-bottom:5px}.sticky-cta div:last-child{display:grid;grid-template-columns:1fr 1fr;gap:8px}.sticky-cta a{display:block;text-decoration:none;border-radius:999px;padding:12px 14px;font-weight:900;background:var(--brand);color:#051911}.sticky-cta a:last-child{background:#fff;color:#0d1b16}@media(max-width:760px){.hero-grid,.split{grid-template-columns:1fr;padding:28px 5vw}nav{padding:18px 5vw}.cards{padding:18px 5vw}footer{margin-bottom:130px}.btn,button{width:100%;text-align:center}.actions .btn{width:auto}body{padding-bottom:126px}}`; }

function clientJS() { return `function unlockAdmin(){const v=document.getElementById('adminPassword').value;if(v==='demo'){localStorage.setItem('contractor_v005_admin_unlocked','true');showAdmin()}else{alert('Incorrect preview password. Hint: demo')}}function showAdmin(){document.getElementById('loginBox')?.classList.add('hidden');document.getElementById('adminBox')?.classList.remove('hidden')}if(localStorage.getItem('contractor_v005_admin_unlocked')==='true'&&location.pathname==='/admin')setTimeout(showAdmin,0);async function generateAdminPrompt(){const message=document.getElementById('changeText').value;const intent=document.getElementById('intentSelect').value;const res=await fetch('/admin/chat',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({message,intent})});const data=await res.json();document.getElementById('promptOutput').textContent=data.generated_prompt||JSON.stringify(data,null,2)}async function copyPrompt(){const txt=document.getElementById('promptOutput').textContent;await navigator.clipboard.writeText(txt);alert('Prompt copied')}`; }

--1770ef90374e4f891100c8f08782bad703a39b179c4e6538fac29b9a3e2c--
