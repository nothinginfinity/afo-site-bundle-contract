--6fb3215e4702cd8202270da3da0b9080a0d1bbd0bb9d0d9e11a3455816bf
Content-Disposition: form-data; name="worker.js"

// contractor-v003-1-afo — CCS Services Group — v0.1.0
// v003 frontend + RAG chat + conversational estimate flow + /admin + full API backend

const VERSION = '0.1.0';
const COMPANY = 'CCS Services Group';
const PHONE = '(818) 624-7212';
const PHONE_URL = 'tel:+18186247212';
const EMBEDDING_MODEL = '@cf/baai/bge-base-en-v1.5';
const CHAT_MODEL = '@cf/meta/llama-3.1-8b-instruct';
const ADMIN_PASSWORD = 'demo';

function uid() { return 'c31-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2,6); }
function now() { return new Date().toISOString(); }
function jsonRes(data, status=200) {
  return new Response(JSON.stringify(data, null, 2), {
    status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
function htmlRes(content) {
  return new Response(content, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
}
async function parseBody(req) { try { return await req.json(); } catch { return {}; } }

async function embed(env, text) {
  const r = await env.AI.run(EMBEDDING_MODEL, { text: [text.slice(0, 2000)] });
  return r.data[0];
}
async function vectorSearch(env, query, topK=5) {
  const vec = await embed(env, query);
  const r = await env.V003_1_VECTORIZE.query(vec, { topK, returnMetadata: 'all' });
  return r.matches || [];
}
async function dbRun(env, sql, params=[]) { return env.V003_1_DB.prepare(sql).bind(...params).run(); }
async function dbAll(env, sql, params=[]) { const r = await env.V003_1_DB.prepare(sql).bind(...params).all(); return r.results || []; }
async function dbFirst(env, sql, params=[]) { return env.V003_1_DB.prepare(sql).bind(...params).first(); }
async function upsertVec(env, id, text, meta) {
  const vec = await embed(env, text);
  await env.V003_1_VECTORIZE.upsert([{ id, values: vec, metadata: meta }]);
  return vec.length;
}

async function handleChat(req, env) {
  const body = await parseBody(req);
  const message = (body.message || '').trim();
  const state = body.state || 'init';
  if (!message && state === 'init') {
    return jsonRes({
      answer: `Hi! Welcome to ${COMPANY}. Are you looking for a **free estimate** or do you have a question about our services?`,
      state: 'init',
      suggested_actions: [
        { type: 'state', label: '📋 Free Estimate', value: 'estimate_start' },
        { type: 'state', label: '💬 Ask a Question', value: 'qa' }
      ]
    });
  }
  const reqId = uid();
  let answer = '', newState = state, actions = [], citations = [], model = 'flow';
  if (state === 'init' && (message.toLowerCase().includes('estimate') || message === 'estimate_start')) {
    answer = `Great! What kind of project are you thinking about?`;
    newState = 'estimate_project';
    actions = [
      { type: 'quick', label: '🍳 Kitchen' }, { type: 'quick', label: '🚿 Bathroom' },
      { type: 'quick', label: '🏠 ADU' }, { type: 'quick', label: '➕ Addition' },
      { type: 'quick', label: '🏗️ New Construction' }, { type: 'quick', label: '🔧 Other' }
    ];
  } else if (state === 'estimate_project') {
    answer = `Got it — **${message}**. Where is the property located? (City or neighborhood is fine)`;
    newState = 'estimate_location';
    actions = [
      { type: 'quick', label: 'Silver Lake' }, { type: 'quick', label: 'Burbank' },
      { type: 'quick', label: 'Glendale' }, { type: 'quick', label: 'Pasadena' }
    ];
  } else if (state === 'estimate_location') {
    answer = `Perfect. How would you like to connect with us for your free estimate?`;
    newState = 'estimate_contact';
    actions = [
      { type: 'call', label: `📞 Call us now — ${PHONE}`, url: PHONE_URL },
      { type: 'upload', label: '📸 Upload photos/video — we\'ll call you' }
    ];
  } else if (state === 'estimate_contact') {
    if (message.toLowerCase().includes('upload') || message.toLowerCase().includes('photo')) {
      answer = `Perfect — go ahead and share your photos or video below. Also, what's your name and best phone number so we can follow up?`;
      newState = 'estimate_upload';
      actions = [{ type: 'upload', label: '📎 Attach photos / video' }];
    } else {
      answer = `Great, give us a call at ${PHONE} and we'll get you scheduled for a free on-site estimate. We typically schedule within 1-2 business days.`;
      newState = 'done';
      actions = [{ type: 'call', label: `📞 Call ${PHONE}`, url: PHONE_URL }];
    }
  } else if (state === 'estimate_upload') {
    const leadId = uid();
    try {
      await dbRun(env, 'INSERT INTO customers (id,name,email,phone,project_type,message,source,notified,created_at) VALUES (?,?,?,?,?,?,?,0,?)',
        [leadId, 'Chat lead', '', '', 'via chat', message, 'chat_estimate', now()]);
      await dbRun(env, 'INSERT INTO receipts (id,receipt_type,payload_json,created_at) VALUES (?,?,?,?)',
        [uid(), 'chat_lead', JSON.stringify({customer_id: leadId, message}), now()]);
    } catch(e) {}
    answer = `Thank you! We have your info and will call you within one business day to discuss your project. You can also reach us anytime at ${PHONE}.`;
    newState = 'done';
    actions = [{ type: 'call', label: `📞 Call ${PHONE} now`, url: PHONE_URL }];
  } else {
    newState = 'qa';
    let matches = [];
    try { matches = await vectorSearch(env, message, 5); } catch(e) {}
    const context = matches.map((m,i) => `[${i+1}] ${m.metadata?.title||m.id}: ${m.metadata?.snippet||''}`).join('\n');
    citations = matches.slice(0,3).map(m => ({ title: m.metadata?.title || m.id, score: m.score }));
    try {
      const sys = `You are a helpful assistant for ${COMPANY}, a licensed general contractor in Los Angeles (CSLB #890991, phone ${PHONE}). Answer questions using the context below. Be concise and warm. Always mention the free estimate offer. Never quote exact prices without saying it depends on scope.\n\nContext:\n${context}`;
      const result = await env.AI.run(CHAT_MODEL, {
        messages: [{ role: 'system', content: sys }, { role: 'user', content: message }],
        max_tokens: 400
      });
      answer = result.response || result.choices?.[0]?.message?.content || '';
      model = CHAT_MODEL;
    } catch(e) {
      answer = matches.length > 0
        ? `${matches[0].metadata?.snippet || ''} For details, call us at ${PHONE}.`
        : `${COMPANY} handles kitchen remodels, bathroom renovations, ADUs, additions, and new construction throughout LA. Call ${PHONE} for a free estimate.`;
      model = 'fallback';
    }
    answer += `\n\n*Want a free estimate? Call us at ${PHONE} or upload project photos and we'll reach out.*`;
    actions = [
      { type: 'call', label: `📞 Call ${PHONE}`, url: PHONE_URL },
      { type: 'state', label: '📋 Get Free Estimate', value: 'estimate_start' }
    ];
  }
  try {
    await dbRun(env, 'INSERT INTO prompt_requests (id,request_type,user_input,retrieved_context,model,response,created_at) VALUES (?,?,?,?,?,?,?)',
      [reqId, 'chat', message, JSON.stringify(citations), model, answer, now()]);
  } catch(e) {}
  return jsonRes({ answer, state: newState, citations, suggested_actions: actions, ok: true });
}

async function handleLeads(req, env) {
  const body = await parseBody(req);
  const { name, email, phone, intent, budget_range, timeline, message, project_type, location } = body;
  if (!name || !email) return jsonRes({ ok: false, error: 'Name and email required' }, 400);
  const id = uid();
  await dbRun(env, 'INSERT INTO customers (id,name,email,phone,project_type,location,message,source,notified,created_at) VALUES (?,?,?,?,?,?,?,?,0,?)',
    [id, name, email, phone||'', project_type||intent||'', location||'', message||'', 'lead_form', now()]);
  const rId = uid();
  await dbRun(env, 'INSERT INTO receipts (id,receipt_type,payload_json,created_at) VALUES (?,?,?,?)',
    [rId, 'lead_form', JSON.stringify({customer_id:id, name, intent, budget_range, timeline}), now()]);
  return jsonRes({ ok: true, lead_id: id, message: `Thank you! CCS will follow up within one business day. You can also call ${PHONE} directly.` });
}

async function handleUpload(req, env) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const customerId = formData.get('customer_id') || uid();
    const name = formData.get('name') || '';
    const phone = formData.get('phone') || '';
    if (!file) return jsonRes({ ok: false, error: 'No file provided' }, 400);
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    const allowed = ['jpg','jpeg','png','gif','webp','mp4','mov','heic','heif','pdf'];
    if (!allowed.includes(ext)) return jsonRes({ ok: false, error: 'File type not allowed' }, 400);
    const key = `contractor-v003-1/uploads/${customerId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g,'_')}`;
    const buf = await file.arrayBuffer();
    await env.V003_1_R2.put(key, buf, { httpMetadata: { contentType: file.type } });
    const uploadId = uid();
    await dbRun(env, 'INSERT INTO upload_metadata (id,r2_key,customer_id,filename,content_type,file_size,created_at) VALUES (?,?,?,?,?,?,?)',
      [uploadId, key, customerId, file.name, file.type, buf.byteLength, now()]);
    if (name || phone) {
      try {
        await dbRun(env, 'INSERT OR IGNORE INTO customers (id,name,email,phone,upload_r2_keys,source,notified,created_at) VALUES (?,?,?,?,?,?,0,?)',
          [customerId, name||'Chat upload', '', phone, key, 'chat_upload', now()]);
      } catch(e) {}
    }
    await dbRun(env, 'INSERT INTO receipts (id,receipt_type,payload_json,created_at) VALUES (?,?,?,?)',
      [uid(), 'upload', JSON.stringify({upload_id:uploadId, r2_key:key, customer_id:customerId}), now()]);
    return jsonRes({ ok: true, upload_id: uploadId, r2_key: key, customer_id: customerId });
  } catch(e) {
    return jsonRes({ ok: false, error: e.message }, 500);
  }
}

async function handleStatus(env) {
  let d1Ok=false,vecOk=false,r2Ok=false,seeds=0,articles=0,leads=0,receipts=0;
  try { const r=await dbFirst(env,'SELECT COUNT(*) as c FROM knowledge_seeds'); seeds=r?.c||0; d1Ok=true; } catch{}
  try { const r=await dbFirst(env,'SELECT COUNT(*) as c FROM generated_articles'); articles=r?.c||0; } catch{}
  try { const r=await dbFirst(env,'SELECT COUNT(*) as c FROM customers'); leads=r?.c||0; } catch{}
  try { const r=await dbFirst(env,'SELECT COUNT(*) as c FROM receipts'); receipts=r?.c||0; } catch{}
  try { const v=await embed(env,'test'); vecOk=v.length===768; } catch{}
  try { await env.V003_1_R2.list({prefix:'contractor-v003-1/',limit:1}); r2Ok=true; } catch{}
  return jsonRes({ worker:'contractor-v003-1-afo', version:VERSION, company:COMPANY, d1_connected:d1Ok, vectorize_connected:vecOk, r2_connected:r2Ok, embedding_model:EMBEDDING_MODEL, vectorize_index:'contractor-v003-1-afo-vector', seed_count:seeds, article_count:articles, lead_count:leads, receipt_count:receipts, timestamp:now() });
}

async function handleSearch(req, env) {
  const url = new URL(req.url);
  const q = url.searchParams.get('q') || '';
  if (!q) return jsonRes({ error: 'q required' }, 400);
  const matches = await vectorSearch(env, q, 5);
  return jsonRes({ query:q, results: matches.map(m=>({ id:m.id, score:m.score, title:m.metadata?.title||m.id, snippet:m.metadata?.snippet||'' })) });
}

async function handleSeed(req, env) {
  const body = await parseBody(req);
  const { table='knowledge_seeds', limit=20 } = body;
  const configs = {
    knowledge_seeds: { text_cols:['title','body'], title_col:'title' },
    faqs: { text_cols:['question','answer'], title_col:'question' },
    service_areas: { text_cols:['city','state','service','body'], title_col:'city' }
  };
  const config = configs[table];
  if (!config) return jsonRes({ error: 'unsupported table' }, 400);
  const rows = await dbAll(env, `SELECT * FROM ${table} WHERE vector_status='pending' OR vector_status IS NULL LIMIT ?`, [limit]);
  const results = [];
  for (const row of rows) {
    try {
      const text = config.text_cols.map(c=>row[c]||'').join(' ').trim();
      const meta = { source:table, source_id:row.id, title:row[config.title_col]||row.id, snippet:text.slice(0,200) };
      const dims = await upsertVec(env, row.id, text, meta);
      await dbRun(env, `UPDATE ${table} SET vector_status='indexed', indexed_at=? WHERE id=?`, [now(), row.id]);
      results.push({ id:row.id, dims, ok:true });
    } catch(e) { results.push({ id:row.id, ok:false, error:e.message }); }
  }
  const rId = uid();
  await dbRun(env, 'INSERT INTO receipts (id,receipt_type,payload_json,created_at) VALUES (?,?,?,?)',
    [rId, 'seed', JSON.stringify({table, total:results.length, ok:results.filter(r=>r.ok).length}), now()]);
  return jsonRes({ table, total:results.length, results, receipt_id:rId });
}

async function handleGenerateArticle(req, env) {
  const body = await parseBody(req);
  const { topic, service, city, tone='helpful expert' } = body;
  if (!topic) return jsonRes({ error: 'topic required' }, 400);
  let matches = [];
  try { matches = await vectorSearch(env, [topic,service,city].filter(Boolean).join(' '), 5); } catch(e) {}
  const context = matches.map((m,i)=>`[${i+1}] ${m.metadata?.title||m.id}: ${m.metadata?.snippet||''}`).join('\n');
  const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') + '-' + Date.now().toString(36);
  const artId = uid();
  let title=topic, body_text='', model='fallback';
  try {
    const prompt = `Write a helpful home improvement article about "${topic}"${city?' for homeowners in '+city:''}${service?' covering '+service:''}. Tone: ${tone}.\n\nContext:\n${context}\n\n400-600 words. H1 title, intro, 2-3 sections, CTA mentioning ${PHONE}.`;
    const result = await env.AI.run(CHAT_MODEL, { messages:[{role:'user',content:prompt}], max_tokens:800 });
    body_text = result.response || result.choices?.[0]?.message?.content || '';
    const m = body_text.match(/^#\s+(.+)/m); if(m) title=m[1].trim();
    model = CHAT_MODEL;
  } catch(e) {
    const snips = matches.map(m=>m.metadata?.snippet||'').filter(Boolean).slice(0,2);
    body_text = `# ${title}\n\n${snips[0]||COMPANY+' serves all of Los Angeles.'}\n\n## What to Expect\n\n${snips[1]||'Licensed, bonded, and insured. CSLB #890991.'}\n\n## Get a Free Estimate\n\nCall ${PHONE} or send us project photos and we will follow up within one business day.`;
  }
  await dbRun(env, 'INSERT INTO generated_articles (id,title,slug,topic,body,source_context,status,created_at) VALUES (?,?,?,?,?,?,?,?)',
    [artId, title, slug, topic, body_text, JSON.stringify(matches.map(m=>({id:m.id,score:m.score}))), 'draft', now()]);
  const rId = uid();
  await dbRun(env, 'INSERT INTO receipts (id,receipt_type,payload_json,created_at) VALUES (?,?,?,?)',
    [rId, 'article', JSON.stringify({article_id:artId,title,slug,model,topic,city,service}), now()]);
  return jsonRes({ article_id:artId, title, slug, body:body_text, model, sources:matches.map(m=>({id:m.id,score:m.score,title:m.metadata?.title||m.id})), receipt_id:rId });
}

async function handleArticlesList(env) {
  const rows = await dbAll(env, 'SELECT id,title,slug,topic,status,created_at FROM generated_articles ORDER BY created_at DESC LIMIT 50');
  return jsonRes({ articles: rows });
}

function buildAdmin() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>CCS Admin</title>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{--primary:#1a2744;--accent:#c8a84b;--bg:#0f1a2e;--card:#1a2744;--border:#2a3a5c;--text:#e8eaf0;--muted:#8899aa;--radius:8px;--fh:'Oswald',sans-serif;--fb:'Inter',system-ui,sans-serif}
body{font-family:var(--fb);background:var(--bg);color:var(--text);min-height:100vh}
#lockScreen{position:fixed;inset:0;background:var(--bg);display:flex;align-items:center;justify-content:center;z-index:100}
.lock-box{background:var(--card);border:1px solid var(--border);border-radius:12px;padding:3rem 2.5rem;max-width:380px;width:90%;text-align:center}
.lock-logo{font-family:var(--fh);font-size:1.6rem;color:#fff;letter-spacing:.06em;margin-bottom:.25rem}
.lock-logo span{color:var(--accent)}
.lock-sub{color:var(--muted);font-size:.85rem;margin-bottom:2rem}
.lock-input{width:100%;background:rgba(255,255,255,.06);border:1.5px solid var(--border);border-radius:var(--radius);padding:.8rem 1rem;font-size:1rem;font-family:var(--fb);color:#fff;outline:none;text-align:center;letter-spacing:.2em;margin-bottom:1rem}
.lock-input:focus{border-color:var(--accent)}
.lock-btn{width:100%;background:var(--accent);color:#fff;font-family:var(--fh);font-size:1rem;font-weight:600;letter-spacing:.08em;border:none;border-radius:var(--radius);padding:.85rem;cursor:pointer}
.lock-err{color:#f87171;font-size:.82rem;margin-top:.5rem;display:none}
#adminApp{display:none}
.admin-nav{background:var(--primary);border-bottom:3px solid var(--accent);padding:.75rem 2rem;display:flex;align-items:center;justify-content:space-between}
.admin-logo{font-family:var(--fh);color:#fff;font-size:1.25rem;letter-spacing:.06em}
.admin-logo span{color:var(--accent)}
.admin-tag{background:rgba(200,168,75,.2);color:var(--accent);font-size:.72rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;padding:.25rem .7rem;border-radius:10px}
.logout-btn{background:transparent;border:1px solid var(--border);color:var(--muted);font-family:var(--fb);font-size:.8rem;padding:.35rem .85rem;border-radius:var(--radius);cursor:pointer}
.logout-btn:hover{border-color:var(--accent);color:var(--accent)}
.admin-body{max-width:1100px;margin:0 auto;padding:2rem 1.5rem;display:grid;gap:2rem}
.admin-section{background:var(--card);border:1px solid var(--border);border-radius:12px;overflow:hidden}
.admin-section-head{padding:1.25rem 1.5rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between}
.admin-section-head h2{font-family:var(--fh);font-size:1.1rem;color:#fff;letter-spacing:.06em}
.admin-section-body{padding:1.5rem}
.status-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:1rem}
.stat-card{background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:var(--radius);padding:1.25rem}
.stat-card h4{font-size:.7rem;text-transform:uppercase;letter-spacing:.1em;color:var(--muted);margin-bottom:.4rem;font-weight:500}
.stat-val{font-size:1.2rem;font-weight:700;color:#fff}
.stat-ok{color:#4ade80}.stat-err{color:#f87171}
.btn{display:inline-block;padding:.6rem 1.25rem;border-radius:var(--radius);font-family:var(--fb);font-weight:600;font-size:.85rem;cursor:pointer;border:none;transition:opacity .15s}
.btn:hover{opacity:.85}
.btn-gold{background:var(--accent);color:#fff}
.btn-outline{background:transparent;border:1px solid var(--border);color:var(--muted)}
.btn-outline:hover{border-color:var(--accent);color:var(--accent)}
.btn-sm{padding:.4rem .85rem;font-size:.78rem}
.seed-btns{display:flex;flex-wrap:wrap;gap:.75rem;margin-bottom:1rem}
.seed-result{background:rgba(0,0,0,.3);border-radius:var(--radius);padding:1rem;font-size:.8rem;font-family:monospace;color:#94a3b8;white-space:pre-wrap;max-height:200px;overflow:auto;display:none}
.search-row{display:flex;gap:.75rem;margin-bottom:1rem}
.search-input{flex:1;background:rgba(255,255,255,.06);border:1.5px solid var(--border);border-radius:var(--radius);padding:.65rem 1rem;font-size:.9rem;font-family:var(--fb);color:#fff;outline:none}
.search-input:focus{border-color:var(--accent)}
.search-results{display:grid;gap:.75rem}
.search-card{background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:var(--radius);padding:1rem}
.search-card-score{font-size:.72rem;color:var(--accent);font-weight:600;margin-bottom:.3rem}
.search-card-title{font-size:.9rem;font-weight:600;color:#fff;margin-bottom:.25rem}
.search-card-snippet{font-size:.78rem;color:var(--muted);line-height:1.55}
.art-form-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem}
.form-group{display:flex;flex-direction:column;gap:.35rem}
.form-group label{font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}
.form-group input,.form-group select{background:rgba(255,255,255,.06);border:1.5px solid var(--border);border-radius:var(--radius);padding:.65rem 1rem;font-size:.9rem;font-family:var(--fb);color:#fff;outline:none}
.form-group input:focus,.form-group select:focus{border-color:var(--accent)}
.form-group select option{background:var(--primary)}
.art-output{background:rgba(0,0,0,.3);border:1px solid var(--border);border-radius:var(--radius);padding:1.5rem;font-size:.88rem;line-height:1.75;color:var(--text);white-space:pre-wrap;display:none;margin-top:1rem;max-height:400px;overflow:auto}
.art-status{margin-top:.75rem;font-size:.82rem;color:var(--muted)}
.art-list-item{display:flex;justify-content:space-between;align-items:center;padding:.875rem 0;border-bottom:1px solid var(--border)}
.art-list-item:last-child{border-bottom:none}
.art-list-title{font-size:.9rem;font-weight:600;color:#fff}
.art-list-meta{font-size:.75rem;color:var(--muted);margin-top:.2rem}
.art-list-slug{font-size:.72rem;color:var(--accent);font-family:monospace}
.loading{display:inline-block;width:14px;height:14px;border:2px solid currentColor;border-right-color:transparent;border-radius:50%;animation:spin .6s linear infinite;vertical-align:middle;margin-right:6px}
@keyframes spin{to{transform:rotate(360deg)}}
@media(max-width:600px){.art-form-grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<div id="lockScreen">
  <div class="lock-box">
    <div class="lock-logo">CCS<span>.</span>Admin</div>
    <div class="lock-sub">contractor-v003-1-afo &middot; Preview Demo</div>
    <input class="lock-input" type="password" id="pwInput" placeholder="Password" autocomplete="off"/>
    <button class="lock-btn" id="pwBtn">Enter</button>
    <div class="lock-err" id="pwErr">Incorrect password</div>
  </div>
</div>
<div id="adminApp">
  <div class="admin-nav">
    <div class="admin-logo">CCS<span> Services Group</span> Admin</div>
    <div style="display:flex;align-items:center;gap:1rem">
      <span class="admin-tag">Preview Demo</span>
      <button class="logout-btn" id="logoutBtn">Log out</button>
    </div>
  </div>
  <div class="admin-body">
    <div class="admin-section">
      <div class="admin-section-head"><h2>System Status</h2><button class="btn btn-outline btn-sm" id="refreshStatus">Refresh</button></div>
      <div class="admin-section-body">
        <div class="status-grid" id="statusGrid"><div class="stat-card"><h4>Loading</h4><div class="stat-val"><span class="loading"></span></div></div></div>
        <details style="margin-top:1.25rem"><summary style="cursor:pointer;font-size:.8rem;color:var(--muted)">Raw JSON</summary><pre id="statusRaw" style="margin-top:.75rem;background:rgba(0,0,0,.4);border-radius:var(--radius);padding:1rem;font-size:.72rem;color:#64748b;overflow:auto;max-height:200px"></pre></details>
      </div>
    </div>
    <div class="admin-section">
      <div class="admin-section-head"><h2>Seed Knowledge Base</h2></div>
      <div class="admin-section-body">
        <p style="font-size:.85rem;color:var(--muted);margin-bottom:1rem">Embed pending rows from D1 into the Vectorize index.</p>
        <div class="seed-btns">
          <button class="btn btn-gold btn-sm" onclick="seedTable('knowledge_seeds')">Seed Knowledge</button>
          <button class="btn btn-gold btn-sm" onclick="seedTable('faqs')">Seed FAQs</button>
          <button class="btn btn-gold btn-sm" onclick="seedTable('service_areas')">Seed Service Areas</button>
          <button class="btn btn-outline btn-sm" onclick="seedAll()">Seed All</button>
        </div>
        <div class="seed-result" id="seedResult"></div>
      </div>
    </div>
    <div class="admin-section">
      <div class="admin-section-head"><h2>Knowledge Search Tester</h2></div>
      <div class="admin-section-body">
        <div class="search-row">
          <input class="search-input" id="searchInput" placeholder="e.g. ADU permits in Los Angeles"/>
          <button class="btn btn-gold btn-sm" id="searchBtn">Search</button>
        </div>
        <div class="search-results" id="searchResults"></div>
      </div>
    </div>
    <div class="admin-section">
      <div class="admin-section-head"><h2>AI Article Generator</h2></div>
      <div class="admin-section-body">
        <div class="art-form-grid">
          <div class="form-group"><label>Topic *</label><input id="artTopic" placeholder="ADU Construction in Silver Lake"/></div>
          <div class="form-group"><label>Service</label><input id="artService" placeholder="ADU construction"/></div>
          <div class="form-group"><label>City</label><input id="artCity" placeholder="Silver Lake"/></div>
          <div class="form-group"><label>Tone</label><select id="artTone"><option>helpful expert</option><option>educational</option><option>friendly and conversational</option><option>urgent and action-oriented</option></select></div>
        </div>
        <button class="btn btn-gold" id="artGenBtn">Generate Article</button>
        <div class="art-status" id="artStatus"></div>
        <div class="art-output" id="artOutput"></div>
      </div>
    </div>
    <div class="admin-section">
      <div class="admin-section-head"><h2>Saved Articles</h2><button class="btn btn-outline btn-sm" onclick="loadArticles()">Refresh</button></div>
      <div class="admin-section-body"><div id="articlesList"><div style="color:var(--muted);font-size:.85rem">Loading...</div></div></div>
    </div>
  </div>
</div>
<script>
var PASS='${ADMIN_PASSWORD}';
var authed=sessionStorage.getItem('ccs_admin')===\'1\';
if(authed){unlock();}
function unlock(){document.getElementById('lockScreen').style.display='none';document.getElementById('adminApp').style.display='block';loadStatus();loadArticles();}
function tryLogin(){var pw=document.getElementById('pwInput').value;if(pw===PASS){sessionStorage.setItem('ccs_admin','1');unlock();}else{document.getElementById('pwErr').style.display='block';document.getElementById('pwInput').value='';}}
document.getElementById('pwBtn').addEventListener('click',tryLogin);
document.getElementById('pwInput').addEventListener('keydown',function(e){if(e.key==='Enter')tryLogin();});
document.getElementById('logoutBtn').addEventListener('click',function(){sessionStorage.removeItem('ccs_admin');document.getElementById('adminApp').style.display='none';document.getElementById('lockScreen').style.display='flex';document.getElementById('pwInput').value='';});
async function loadStatus(){try{var r=await fetch('/api/status');var d=await r.json();var items=[['Worker',d.worker,false],['Version',d.version,false],['D1',d.d1_connected,true],['Vectorize',d.vectorize_connected,true],['R2',d.r2_connected,true],['Seeds',d.seed_count,false],['Articles',d.article_count,false],['Leads',d.lead_count,false],['Receipts',d.receipt_count,false]];document.getElementById('statusGrid').innerHTML=items.map(function(row){var display=row[2]?(row[1]?'Yes':'No'):String(row[1]==null?'--':row[1]);var cls=row[2]?(row[1]?'stat-ok':'stat-err'):'';return'<div class="stat-card"><h4>'+row[0]+'</h4><div class="stat-val '+cls+'">'+display+'</div></div>';}).join('');document.getElementById('statusRaw').textContent=JSON.stringify(d,null,2);}catch(e){document.getElementById('statusGrid').innerHTML='<div class="stat-card"><h4>Error</h4><div class="stat-val stat-err">'+e.message+'</div></div>';}}
document.getElementById('refreshStatus').addEventListener('click',loadStatus);
async function seedTable(table){var el=document.getElementById('seedResult');el.style.display='block';el.textContent+='Seeding '+table+'...\n';try{var r=await fetch('/api/knowledge/seed',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({table:table,limit:30})});var d=await r.json();el.textContent+=table+': '+d.total+' rows, '+d.results.filter(function(r){return r.ok;}).length+' ok\n'+d.results.map(function(r){return'  '+r.id+': '+(r.ok?'ok '+r.dims+'dims':r.error);}).join('\n')+'\n';loadStatus();}catch(e){el.textContent+='Error: '+e.message+'\n';}}
async function seedAll(){document.getElementById('seedResult').style.display='block';document.getElementById('seedResult').textContent='';for(var t of['knowledge_seeds','faqs','service_areas']){await seedTable(t);}}
document.getElementById('searchBtn').addEventListener('click',async function(){var q=document.getElementById('searchInput').value.trim();if(!q)return;var container=document.getElementById('searchResults');container.innerHTML='<div style="color:var(--muted);font-size:.85rem"><span class="loading"></span> Searching...</div>';try{var r=await fetch('/api/knowledge/search?q='+encodeURIComponent(q));var d=await r.json();if(!d.results||!d.results.length){container.innerHTML='<div style="color:var(--muted);font-size:.85rem">No results.</div>';return;}container.innerHTML=d.results.map(function(r){return'<div class="search-card"><div class="search-card-score">Score: '+(r.score*100).toFixed(1)+'% &mdash; '+r.id+'</div><div class="search-card-title">'+r.title+'</div><div class="search-card-snippet">'+r.snippet+'</div></div>';}).join('');}catch(e){container.innerHTML='<div style="color:#f87171">Error: '+e.message+'</div>';}});
document.getElementById('searchInput').addEventListener('keydown',function(e){if(e.key==='Enter')document.getElementById('searchBtn').click();});
document.getElementById('artGenBtn').addEventListener('click',async function(){var topic=document.getElementById('artTopic').value.trim();if(!topic){document.getElementById('artStatus').innerHTML='<span style="color:#f87171">Topic required.</span>';return;}document.getElementById('artStatus').innerHTML='<span class="loading"></span> Generating (10-20s)...';document.getElementById('artOutput').style.display='none';try{var r=await fetch('/api/generate-article',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({topic:topic,service:document.getElementById('artService').value,city:document.getElementById('artCity').value,tone:document.getElementById('artTone').value})});var d=await r.json();document.getElementById('artStatus').innerHTML='<span style="color:#4ade80">Generated &mdash; Model: '+d.model+'</span>';document.getElementById('artOutput').textContent=d.body||d.error;document.getElementById('artOutput').style.display='block';loadArticles();}catch(e){document.getElementById('artStatus').innerHTML='<span style="color:#f87171">Error: '+e.message+'</span>';}});
async function loadArticles(){try{var r=await fetch('/api/articles');var d=await r.json();var el=document.getElementById('articlesList');if(!d.articles||!d.articles.length){el.innerHTML='<div style="color:var(--muted);font-size:.85rem">No articles yet.</div>';return;}el.innerHTML=d.articles.map(function(a){return'<div class="art-list-item"><div><div class="art-list-title">'+a.title+'</div><div class="art-list-meta">'+a.topic+' &middot; '+a.status+' &middot; '+a.created_at.slice(0,10)+'</div></div><div class="art-list-slug">'+a.slug+'</div></div>';}).join('');}catch(e){}}
</script>
</body>
</html>`;
}

function buildPublic() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<title>CCS Services Group &mdash; Licensed Construction Experts | Los Angeles</title>
<meta name="description" content="CCS Services Group &mdash; Los Angeles kitchen, bathroom, ADU, home addition &amp; new construction experts. Licensed, bonded &amp; insured. CSLB #890991. Call (818) 624-7212."/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet"/>
<style>
:root{--primary:#1a2744;--accent:#c8a84b;--bg:#f8f7f5;--dark:#0f1a2e;--text:#1c1c1e;--muted:#666;--border:#e4e4e4;--radius:8px;--shadow:0 2px 12px rgba(0,0,0,.08);--fh:'Oswald',sans-serif;--fb:'Inter',system-ui,sans-serif}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:var(--fb);background:var(--bg);color:var(--text);line-height:1.65;-webkit-font-smoothing:antialiased}
h1,h2,h3,h4{font-family:var(--fh);letter-spacing:.02em;font-weight:600}
a{color:inherit;text-decoration:none}
img{display:block;width:100%;height:auto}
.container{max-width:1100px;margin:0 auto;padding:0 1.5rem}
.section{padding:5rem 0}
.section-alt{background:#fff}
.section-dark{background:var(--primary)}
.section-darker{background:var(--dark)}
.section-head{margin-bottom:3rem}
.section-head h2{font-size:2.2rem;color:var(--primary);margin-bottom:.4rem}
.section-dark .section-head h2,.section-darker .section-head h2{color:#fff}
.section-sub{color:var(--muted);font-size:.97rem}
.section-dark .section-sub,.section-darker .section-sub{color:rgba(255,255,255,.65)}
nav{position:sticky;top:0;z-index:200;background:var(--primary);border-bottom:3px solid var(--accent)}
.nav-inner{display:flex;align-items:center;justify-content:space-between;padding:.8rem 1.5rem;gap:1rem}
.logo{font-family:var(--fh);color:#fff;font-size:1.4rem;letter-spacing:.06em;white-space:nowrap}
.logo span{color:var(--accent)}
.nav-menu{display:flex;align-items:center;gap:1.5rem}
.nav-menu a{color:rgba(255,255,255,.8);font-size:.84rem;font-weight:400;transition:color .15s}
.nav-menu a:hover{color:var(--accent)}
.nav-phone{color:var(--accent)!important;font-weight:600!important}
.nav-cta{background:var(--accent);color:#fff!important;padding:.38rem .9rem;border-radius:3px;font-weight:600!important;white-space:nowrap}
.hamburger{display:none;flex-direction:column;gap:5px;cursor:pointer;padding:4px}
.hamburger span{display:block;width:22px;height:2px;background:#fff;border-radius:2px;transition:all .25s}
.hamburger.open span:nth-child(1){transform:translateY(7px) rotate(45deg)}
.hamburger.open span:nth-child(2){opacity:0}
.hamburger.open span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
.mobile-menu{display:none;flex-direction:column;background:var(--primary);border-top:1px solid rgba(255,255,255,.1)}
.mobile-menu a{padding:.85rem 1.5rem;color:rgba(255,255,255,.85);font-size:.92rem;border-bottom:1px solid rgba(255,255,255,.07)}
.trust-bar{background:var(--dark);padding:.55rem 0}
.trust-inner{display:flex;flex-wrap:wrap;gap:.6rem 2rem;align-items:center;justify-content:center}
.trust-item{color:rgba(255,255,255,.75);font-size:.78rem;white-space:nowrap}
.trust-item a{color:var(--accent);font-weight:700}
.btn{display:inline-block;padding:.72rem 1.6rem;border-radius:3px;font-weight:600;cursor:pointer;border:none;font-size:.93rem;font-family:var(--fb);transition:opacity .15s,transform .1s;text-align:center}
.btn:hover{opacity:.88;transform:translateY(-1px)}
.btn-primary{background:var(--accent);color:#fff}
.btn-ghost{background:transparent;color:#fff;border:2px solid rgba(255,255,255,.55)}
.hero{position:relative;min-height:92vh;display:flex;align-items:center;overflow:hidden}
.hero-bg{position:absolute;inset:0}
.hero-bg img{width:100%;height:100%;object-fit:cover;object-position:center;transform:scale(1.03);animation:heroZoom 12s ease-out forwards}
@keyframes heroZoom{from{transform:scale(1.03)}to{transform:scale(1)}}
.hero-grad{position:absolute;inset:0;background:linear-gradient(115deg,rgba(15,26,46,.96) 40%,rgba(15,26,46,.5) 75%,rgba(15,26,46,.2) 100%)}
.hero-content{position:relative;z-index:2;padding:2rem 2rem 2rem 2.5rem;max-width:660px;color:#fff}
.hero-eyebrow{display:inline-flex;gap:.6rem;align-items:center;background:rgba(200,168,75,.18);border:1px solid rgba(200,168,75,.4);color:var(--accent);font-size:.72rem;letter-spacing:.16em;text-transform:uppercase;padding:.35rem .85rem;border-radius:20px;margin-bottom:1.2rem;font-family:var(--fb);font-weight:500}
.hero h1{font-size:clamp(2.2rem,4.5vw,3.6rem);line-height:1.06;margin-bottom:1.1rem}
.hero h1 span{color:var(--accent)}
.hero-sub{font-size:clamp(.95rem,1.8vw,1.1rem);opacity:.85;margin-bottom:2rem;line-height:1.65;font-weight:300;max-width:520px}
.hero-ctas{display:flex;gap:1rem;flex-wrap:wrap;margin-bottom:1.75rem}
.hero-phone{font-size:.9rem;opacity:.8}
.hero-phone a{color:#fff}
.hero-phone strong{color:var(--accent)}
.hero-stats{display:flex;gap:2rem;flex-wrap:wrap;margin-top:2.5rem;padding-top:2rem;border-top:1px solid rgba(255,255,255,.15)}
.stat{text-align:left}
.stat-num{font-family:var(--fh);font-size:2rem;color:var(--accent);line-height:1}
.stat-label{font-size:.75rem;color:rgba(255,255,255,.6);margin-top:.2rem}
.svc-tabs{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:2rem;border-bottom:2px solid var(--border);padding-bottom:.5rem}
.svc-tab{background:transparent;border:none;font-family:var(--fb);font-size:.85rem;font-weight:500;color:var(--muted);cursor:pointer;padding:.5rem .9rem;border-radius:4px 4px 0 0;transition:all .2s;white-space:nowrap}
.svc-tab.active{color:var(--accent);border-bottom:2px solid var(--accent);margin-bottom:-2px;font-weight:600}
.svc-panel{display:none}
.svc-panel.active{display:block;animation:fadeIn .25s ease}
@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
.svc-panel-inner{display:grid;grid-template-columns:1fr 1fr;gap:2.5rem;align-items:start}
.svc-img-wrap{border-radius:var(--radius);overflow:hidden;aspect-ratio:4/3;box-shadow:var(--shadow)}
.svc-img{width:100%;height:100%;object-fit:cover;transition:transform .4s ease}
.svc-img-wrap:hover .svc-img{transform:scale(1.04)}
.svc-panel-body h3{font-size:1.6rem;color:var(--primary);margin-bottom:.75rem}
.svc-desc{color:#555;font-size:.94rem;line-height:1.7;margin-bottom:1.25rem}
.svc-hi{list-style:none;display:grid;grid-template-columns:1fr 1fr;gap:.35rem .75rem;margin-bottom:1.5rem}
.svc-hi li{font-size:.85rem;color:#444;padding-left:1.1rem;position:relative;line-height:1.45}
.svc-hi li::before{content:"\\2713";position:absolute;left:0;color:var(--accent);font-weight:700}
.proj-filter{display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:2rem}
.proj-filter-btn{background:transparent;border:1px solid var(--border);color:var(--muted);font-family:var(--fb);font-size:.82rem;padding:.38rem .85rem;border-radius:20px;cursor:pointer;transition:all .2s}
.proj-filter-btn.active{background:var(--accent);border-color:var(--accent);color:#fff}
.proj-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem}
.proj-card{border-radius:var(--radius);overflow:hidden;background:#fff;box-shadow:var(--shadow);cursor:pointer;transition:transform .2s,box-shadow .2s}
.proj-card:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,0,0,.13)}
.proj-img-wrap{position:relative;aspect-ratio:4/3;overflow:hidden}
.proj-img{width:100%;height:100%;object-fit:cover;transition:transform .35s ease}
.proj-card:hover .proj-img{transform:scale(1.06)}
.proj-overlay{position:absolute;inset:0;background:linear-gradient(to top,rgba(15,26,46,.85) 30%,transparent 70%);display:flex;align-items:flex-end;padding:1rem}
.proj-type{font-size:.72rem;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:var(--accent);background:rgba(0,0,0,.4);padding:.25rem .6rem;border-radius:10px}
.proj-body{padding:1.1rem 1.25rem 1.25rem}
.proj-body h3{font-size:1rem;color:var(--primary);margin-bottom:.25rem}
.proj-loc{font-size:.78rem;color:var(--muted);margin-bottom:.4rem}
.proj-desc{font-size:.82rem;color:#555;line-height:1.55;margin-bottom:.6rem}
.proj-more{font-size:.82rem;color:var(--accent);font-weight:600}
.lb-backdrop{display:none;position:fixed;inset:0;background:rgba(0,0,0,.82);z-index:1000;align-items:center;justify-content:center;padding:1.5rem}
.lb-backdrop.open{display:flex;animation:fadeIn .2s ease}
.lb-box{background:#fff;border-radius:var(--radius);max-width:820px;width:100%;max-height:90vh;overflow-y:auto;position:relative}
.lb-close{position:absolute;top:1rem;right:1rem;width:32px;height:32px;background:rgba(0,0,0,.5);color:#fff;border:none;border-radius:50%;cursor:pointer;font-size:1.1rem;display:flex;align-items:center;justify-content:center;z-index:10}
.lb-item{display:none}
.lb-item.active{display:block}
.lb-img{width:100%;max-height:380px;object-fit:cover;border-radius:var(--radius) var(--radius) 0 0}
.lb-info{padding:1.5rem 1.75rem 1.75rem}
.lb-type{font-size:.72rem;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:var(--accent);margin-bottom:.5rem;display:block}
.lb-info h3{font-size:1.5rem;color:var(--primary);margin-bottom:.4rem}
.lb-loc{font-size:.82rem;color:var(--muted);margin-bottom:.75rem}
.lb-desc{font-size:.92rem;color:#555;line-height:1.65;margin-bottom:1rem}
.lb-meta{display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:1.25rem}
.lb-chip{background:var(--bg);border:1px solid var(--border);font-size:.8rem;color:#444;padding:.3rem .7rem;border-radius:10px}
.rev-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem}
.rev-card{background:#fff;border-radius:var(--radius);padding:1.5rem;box-shadow:var(--shadow);border-top:3px solid var(--accent)}
.rev-stars{color:var(--accent);font-size:1.05rem;margin-bottom:.6rem;letter-spacing:.05em}
.rev-text{color:#444;font-size:.88rem;line-height:1.65;font-style:italic;margin-bottom:.85rem}
.rev-footer{display:flex;justify-content:space-between;align-items:center}
.rev-name{font-size:.82rem;font-weight:600;color:var(--primary)}
.rev-proj{font-size:.75rem;color:var(--muted)}
.proc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1.1rem}
.proc-step{background:rgba(255,255,255,.07);border-radius:var(--radius);padding:1.5rem;border-left:3px solid var(--accent)}
.proc-num{font-family:var(--fh);font-size:2.2rem;color:var(--accent);line-height:1;margin-bottom:.6rem}
.proc-step h3{font-size:.97rem;color:#fff;margin-bottom:.35rem}
.proc-step p{font-size:.83rem;color:rgba(255,255,255,.65);line-height:1.55}
.leads-grid{display:grid;grid-template-columns:1fr 1fr;gap:1rem;margin-bottom:1rem}
.leads-input,.leads-select,.leads-textarea{width:100%;padding:.72rem .9rem;border:1px solid var(--border);border-radius:var(--radius);font-family:var(--fb);font-size:16px;background:#fff;color:var(--text);outline:none;-webkit-appearance:none}
.leads-input:focus,.leads-select:focus,.leads-textarea:focus{border-color:var(--accent)}
.leads-textarea{resize:vertical;min-height:90px;grid-column:1/-1}
.leads-result{margin-top:1rem;font-size:.88rem;padding:.6rem .9rem;border-radius:var(--radius);display:none}
.leads-result.ok{background:#dcfce7;color:#15803d}
.leads-result.err{background:#fee2e2;color:#b91c1c}
footer{background:#060d18;color:rgba(255,255,255,.42);padding:2rem 0;font-size:.81rem}
/* Sticky Chat FAB */
#chatFab{position:fixed;bottom:1.5rem;right:1.5rem;z-index:500;background:var(--accent);color:#fff;font-family:var(--fh);font-size:.95rem;font-weight:600;letter-spacing:.06em;padding:.75rem 1.35rem;border-radius:50px;border:none;cursor:pointer;box-shadow:0 4px 20px rgba(200,168,75,.45);display:flex;align-items:center;gap:.5rem;transition:transform .2s,box-shadow .2s}
#chatFab:hover{transform:translateY(-2px);box-shadow:0 6px 28px rgba(200,168,75,.55)}
/* Chat Drawer */
#chatDrawer{position:fixed;bottom:0;right:0;width:100%;max-width:420px;z-index:600;transform:translateY(110%);transition:transform .3s cubic-bezier(.4,0,.2,1);border-radius:16px 16px 0 0;overflow:hidden;box-shadow:0 -8px 40px rgba(0,0,0,.25)}
#chatDrawer.open{transform:translateY(0)}
.chat-phone-bar{background:var(--dark);padding:.65rem 1.25rem;display:flex;align-items:center;justify-content:space-between}
.chat-phone-bar a{color:var(--accent);font-family:var(--fh);font-size:1rem;font-weight:600;letter-spacing:.04em;display:flex;align-items:center;gap:.5rem}
.chat-close-btn{background:transparent;border:none;color:rgba(255,255,255,.5);cursor:pointer;font-size:1.3rem;line-height:1;padding:0 2px}
.chat-close-btn:hover{color:#fff}
.chat-drawer-header{background:var(--primary);padding:1rem 1.25rem;display:flex;align-items:center;gap:.75rem;border-bottom:1px solid rgba(255,255,255,.08)}
.chat-drawer-avatar{width:36px;height:36px;border-radius:50%;background:var(--accent);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:1rem}
.chat-drawer-title{color:#fff;font-family:var(--fh);font-size:1rem;letter-spacing:.04em}
.chat-drawer-sub{color:rgba(255,255,255,.5);font-size:.75rem;margin-top:.1rem}
.chat-msgs-wrap{background:#fff;height:320px;overflow-y:auto;padding:1rem;display:flex;flex-direction:column;gap:.75rem}
.cmsg{max-width:88%}
.cmsg.user{align-self:flex-end}
.cmsg.user .cmsg-bubble{background:var(--primary);color:#fff;border-radius:16px 16px 3px 16px}
.cmsg.assistant .cmsg-bubble{background:#f1f1f1;color:var(--text);border-radius:16px 16px 16px 3px}
.cmsg-bubble{padding:.6rem 1rem;font-size:.88rem;line-height:1.55}
.cmsg-actions{display:flex;gap:.4rem;flex-wrap:wrap;margin-top:.4rem}
.caction{font-size:.78rem;padding:.28rem .7rem;border:1.5px solid var(--accent);color:var(--accent);border-radius:10px;cursor:pointer;background:transparent;font-family:var(--fb);text-decoration:none;display:inline-block;transition:all .15s}
.caction:hover,.caction.call-btn{background:var(--accent);color:#fff;border-color:var(--accent)}
.chat-input-area{background:#f8f7f5;border-top:1px solid var(--border);display:flex;align-items:center;gap:.5rem;padding:.75rem 1rem}
.chat-text-input{flex:1;border:1.5px solid var(--border);border-radius:20px;padding:.55rem 1rem;font-size:16px;font-family:var(--fb);outline:none;background:#fff;-webkit-appearance:none}
.chat-text-input:focus{border-color:var(--accent)}
.chat-send-btn{background:var(--accent);color:#fff;border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.chat-upload-area{padding:.75rem 1rem;background:#f8f7f5;border-top:1px solid var(--border)}
.chat-upload-label{display:flex;align-items:center;gap:.5rem;cursor:pointer;font-size:.83rem;color:var(--accent);font-weight:600;padding:.5rem .9rem;border:1.5px dashed var(--accent);border-radius:var(--radius);justify-content:center}
.chat-upload-label input{display:none}
.upload-progress{font-size:.78rem;color:var(--muted);margin-top:.4rem;text-align:center}
@keyframes spin{to{transform:rotate(360deg)}}
@media(max-width:768px){.nav-menu{display:none}.hamburger{display:flex}.svc-panel-inner,.proj-grid,.rev-grid,.proc-grid,.leads-grid{grid-template-columns:1fr}.svc-hi{grid-template-columns:1fr}.hero-content{padding:1.5rem 1.5rem 1.5rem 1.75rem}#chatDrawer{max-width:100%}}
</style>
</head>
<body>
<nav>
  <div class="nav-inner">
    <a href="/" class="logo">CCS<span>.</span></a>
    <div class="nav-menu">
      <a href="#services">Services</a><a href="#projects">Projects</a><a href="#process">Process</a><a href="#reviews">Reviews</a><a href="#leads">Contact</a>
      <a href="tel:+18186247212" class="nav-phone">(818) 624-7212</a>
      <a href="#leads" class="nav-cta">Free Estimate</a>
    </div>
    <div class="hamburger" id="hamburger" onclick="toggleMenu()"><span></span><span></span><span></span></div>
  </div>
  <div class="mobile-menu" id="mobileMenu">
    <a href="#services" onclick="toggleMenu()">Services</a><a href="#projects" onclick="toggleMenu()">Projects</a><a href="#process" onclick="toggleMenu()">Process</a><a href="#reviews" onclick="toggleMenu()">Reviews</a><a href="#leads" onclick="toggleMenu()">Contact</a>
    <a href="tel:+18186247212" style="color:var(--accent);font-weight:600">(818) 624-7212</a>
  </div>
</nav>
<div class="trust-bar"><div class="trust-inner container"><span class="trust-item">&#10003; CSLB #890991</span><span class="trust-item">&#10003; Licensed, Bonded &amp; Insured</span><span class="trust-item">&#10003; Los Angeles County</span><span class="trust-item">&#10003; Free Estimates</span><span class="trust-item"><a href="tel:+18186247212">(818) 624-7212</a></span></div></div>
<div class="hero">
  <div class="hero-bg"><img src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1600&q=80&auto=format&fit=crop" alt="Modern kitchen" loading="eager"/><div class="hero-grad"></div></div>
  <div class="hero-content container">
    <div class="hero-eyebrow">&#10003; Licensed &nbsp;|&nbsp; &#10003; Bonded &nbsp;|&nbsp; &#10003; Insured</div>
    <h1>LA&rsquo;s Trusted <span>General Contractor</span></h1>
    <p class="hero-sub">Kitchens, bathrooms, ADUs, home additions &amp; new construction across Los Angeles County. On budget. On time. Every time.</p>
    <div class="hero-ctas">
      <button class="btn btn-primary" onclick="openChat()">Estimate / Chat</button>
      <a href="tel:+18186247212" class="btn btn-ghost">Call (818) 624-7212</a>
    </div>
    <p class="hero-phone">Or text your project details to <a href="tel:+18186247212"><strong>(818) 624-7212</strong></a></p>
    <div class="hero-stats">
      <div class="stat"><div class="stat-num">500+</div><div class="stat-label">Projects Completed</div></div>
      <div class="stat"><div class="stat-num">15+</div><div class="stat-label">Years in LA</div></div>
      <div class="stat"><div class="stat-num">100%</div><div class="stat-label">Licensed &amp; Insured</div></div>
      <div class="stat"><div class="stat-num">5&#9733;</div><div class="stat-label">Client Rating</div></div>
    </div>
  </div>
</div>
<section class="section section-alt" id="services"><div class="container">
  <div class="section-head"><h2>Our Services</h2><p class="section-sub">Full-scope residential construction throughout Los Angeles County</p></div>
  <div class="svc-tabs">
    <button class="svc-tab active" data-svc="kitchen">Kitchen Remodeling</button>
    <button class="svc-tab" data-svc="bathroom">Bathroom Remodeling</button>
    <button class="svc-tab" data-svc="adu">ADUs &amp; Additions</button>
    <button class="svc-tab" data-svc="newbuild">New Construction</button>
    <button class="svc-tab" data-svc="exterior">Exterior &amp; Structural</button>
  </div>
  <div class="svc-panel active" data-panel="kitchen"><div class="svc-panel-inner"><div class="svc-img-wrap"><img class="svc-img" src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80&auto=format&fit=crop" alt="Kitchen"/></div><div class="svc-panel-body"><h3>Kitchen Remodeling</h3><p class="svc-desc">From cabinet replacements to full layout changes with plumbing and electrical relocation. Turnkey kitchens that add lasting value.</p><ul class="svc-hi"><li>Custom cabinetry</li><li>Countertop installation</li><li>Tile &amp; backsplash</li><li>Plumbing relocation</li><li>Electrical &amp; lighting</li><li>Permit coordination</li></ul><button class="btn btn-primary" onclick="openChat('estimate_start')">Get Free Estimate</button></div></div></div>
  <div class="svc-panel" data-panel="bathroom"><div class="svc-panel-inner"><div class="svc-img-wrap"><img class="svc-img" src="https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&q=80&auto=format&fit=crop" alt="Bathroom"/></div><div class="svc-panel-body"><h3>Bathroom Remodeling</h3><p class="svc-desc">Full gut-and-rebuild or targeted upgrades. Tile, shower enclosures, soaking tubs, waterproofing, vanities, plumbing, and lighting.</p><ul class="svc-hi"><li>Tile &amp; waterproofing</li><li>Shower &amp; tub installs</li><li>Vanity &amp; fixtures</li><li>Plumbing upgrades</li><li>Lighting &amp; ventilation</li><li>ADA-accessible design</li></ul><button class="btn btn-primary" onclick="openChat('estimate_start')">Get Free Estimate</button></div></div></div>
  <div class="svc-panel" data-panel="adu"><div class="svc-panel-inner"><div class="svc-img-wrap"><img class="svc-img" src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80&auto=format&fit=crop" alt="ADU"/></div><div class="svc-panel-body"><h3>ADUs &amp; Home Additions</h3><p class="svc-desc">Garage conversions, detached ADUs, JADUs, room additions, and second-story builds. Full design, permits, and construction.</p><ul class="svc-hi"><li>Garage conversions</li><li>Detached ADUs to 1,200 sq ft</li><li>Room &amp; second-story additions</li><li>LADBS permit handling</li><li>Foundation &amp; framing</li><li>Full MEP &amp; finishes</li></ul><button class="btn btn-primary" onclick="openChat('estimate_start')">Get Free Estimate</button></div></div></div>
  <div class="svc-panel" data-panel="newbuild"><div class="svc-panel-inner"><div class="svc-img-wrap"><img class="svc-img" src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80&auto=format&fit=crop" alt="New construction"/></div><div class="svc-panel-body"><h3>New Construction</h3><p class="svc-desc">Ground-up residential construction for custom homes, spec homes, and lot splits throughout Los Angeles.</p><ul class="svc-hi"><li>Site prep &amp; foundation</li><li>Structural framing</li><li>All MEP trades</li><li>Insulation &amp; drywall</li><li>Interior &amp; exterior finishes</li><li>City inspection coordination</li></ul><button class="btn btn-primary" onclick="openChat('estimate_start')">Get Free Estimate</button></div></div></div>
  <div class="svc-panel" data-panel="exterior"><div class="svc-panel-inner"><div class="svc-img-wrap"><img class="svc-img" src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80&auto=format&fit=crop" alt="Exterior"/></div><div class="svc-panel-body"><h3>Exterior &amp; Structural</h3><p class="svc-desc">Stucco, siding, decks, retaining walls, garage construction, structural repairs, foundation work, and seismic retrofitting.</p><ul class="svc-hi"><li>Stucco &amp; siding</li><li>Deck construction</li><li>Retaining walls</li><li>Foundation repair</li><li>Seismic retrofitting</li><li>Garage construction</li></ul><button class="btn btn-primary" onclick="openChat('estimate_start')">Get Free Estimate</button></div></div></div>
</div></section>
<section class="section" id="projects"><div class="container">
  <div class="section-head"><h2>Recent Projects</h2><p class="section-sub">A selection of completed work across Los Angeles County</p></div>
  <div class="proj-filter">
    <button class="proj-filter-btn active" data-filter="all">All</button>
    <button class="proj-filter-btn" data-filter="Kitchen Remodeling">Kitchen</button>
    <button class="proj-filter-btn" data-filter="Bathroom Remodeling">Bathroom</button>
    <button class="proj-filter-btn" data-filter="Home Addition &amp; ADU">ADU / Addition</button>
    <button class="proj-filter-btn" data-filter="New Construction">New Build</button>
  </div>
  <div class="proj-grid">
    <div class="proj-card" onclick="openLightbox('p1')"><div class="proj-img-wrap"><img class="proj-img" src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&q=75&auto=format&fit=crop" alt=""/><div class="proj-overlay"><span class="proj-type">Kitchen Remodeling</span></div></div><div class="proj-body"><h3>Silver Lake Full Kitchen Renovation</h3><div class="proj-loc">Silver Lake, CA</div><p class="proj-desc">Complete gut-and-rebuild with custom cabinetry, quartz counters, and full electrical upgrade.</p><span class="proj-more">View details &rarr;</span></div></div>
    <div class="proj-card" onclick="openLightbox('p2')"><div class="proj-img-wrap"><img class="proj-img" src="https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&q=75&auto=format&fit=crop" alt=""/><div class="proj-overlay"><span class="proj-type">Bathroom Remodeling</span></div></div><div class="proj-body"><h3>Burbank Primary Bath Remodel</h3><div class="proj-loc">Burbank, CA</div><p class="proj-desc">Freestanding tub, walk-in shower, heated tile floors, and custom vanity.</p><span class="proj-more">View details &rarr;</span></div></div>
    <div class="proj-card" onclick="openLightbox('p3')"><div class="proj-img-wrap"><img class="proj-img" src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=600&q=75&auto=format&fit=crop" alt=""/><div class="proj-overlay"><span class="proj-type">Home Addition &amp; ADU</span></div></div><div class="proj-body"><h3>Glendale Garage Conversion ADU</h3><div class="proj-loc">Glendale, CA</div><p class="proj-desc">1-car garage converted to 480 sq ft studio ADU with full kitchen and bath.</p><span class="proj-more">View details &rarr;</span></div></div>
    <div class="proj-card" onclick="openLightbox('p4')"><div class="proj-img-wrap"><img class="proj-img" src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=75&auto=format&fit=crop" alt=""/><div class="proj-overlay"><span class="proj-type">New Construction</span></div></div><div class="proj-body"><h3>Pasadena Custom Home Build</h3><div class="proj-loc">Pasadena, CA</div><p class="proj-desc">2,400 sq ft custom home on infill lot. Full scope from foundation to finishes.</p><span class="proj-more">View details &rarr;</span></div></div>
    <div class="proj-card" onclick="openLightbox('p5')"><div class="proj-img-wrap"><img class="proj-img" src="https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=600&q=75&auto=format&fit=crop" alt=""/><div class="proj-overlay"><span class="proj-type">Home Addition &amp; ADU</span></div></div><div class="proj-body"><h3>Los Feliz Second-Story Addition</h3><div class="proj-loc">Los Feliz, CA</div><p class="proj-desc">800 sq ft second-story addition with 2 bedrooms and a primary bath.</p><span class="proj-more">View details &rarr;</span></div></div>
    <div class="proj-card" onclick="openLightbox('p6')"><div class="proj-img-wrap"><img class="proj-img" src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=75&auto=format&fit=crop" alt=""/><div class="proj-overlay"><span class="proj-type">Kitchen Remodeling</span></div></div><div class="proj-body"><h3>Studio City Open-Plan Kitchen</h3><div class="proj-loc">Studio City, CA</div><p class="proj-desc">Wall removal, open-plan layout, waterfall island, and appliance package.</p><span class="proj-more">View details &rarr;</span></div></div>
  </div>
</div></section>
<section class="section section-dark" id="process"><div class="container">
  <div class="section-head"><h2>Our Process</h2><p class="section-sub">Straightforward from first call to final walkthrough</p></div>
  <div class="proc-grid">
    <div class="proc-step"><div class="proc-num">01</div><h3>Free Estimate</h3><p>We visit your property, listen to your vision, and provide a detailed written estimate at no cost.</p></div>
    <div class="proc-step"><div class="proc-num">02</div><h3>Plan &amp; Permit</h3><p>We coordinate architectural plans, engineering if needed, and handle all permit filings with LADBS or your local city.</p></div>
    <div class="proc-step"><div class="proc-num">03</div><h3>Build &amp; Deliver</h3><p>Experienced crews, consistent communication, and a final walkthrough to make sure everything is exactly right.</p></div>
  </div>
</div></section>
<section class="section section-alt" id="reviews"><div class="container">
  <div class="section-head"><h2>What Clients Say</h2><p class="section-sub">Real feedback from LA homeowners</p></div>
  <div class="rev-grid">
    <div class="rev-card"><div class="rev-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p class="rev-text">&ldquo;Construction Connection Services is one of the best in town &mdash; on budget, on time. Joseph runs a tight crew and the kitchen turned out better than we imagined.&rdquo;</p><div class="rev-footer"><span class="rev-name">Gary R.</span><span class="rev-proj">Kitchen &mdash; Silver Lake</span></div></div>
    <div class="rev-card"><div class="rev-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p class="rev-text">&ldquo;Joseph did three projects for us &mdash; each one incredible. He comes in with a plan and gets it done. The ADU is now rented and cash-flowing beautifully.&rdquo;</p><div class="rev-footer"><span class="rev-name">Bobby S.</span><span class="rev-proj">ADU + Kitchen &mdash; Burbank</span></div></div>
    <div class="rev-card"><div class="rev-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div><p class="rev-text">&ldquo;Most timely, professional crew I&rsquo;ve worked with. Did my addition, stayed courteous throughout. Amazing job.&rdquo;</p><div class="rev-footer"><span class="rev-name">Silvia K.</span><span class="rev-proj">Room Addition &mdash; Glendale</span></div></div>
  </div>
</div></section>
<section class="section section-darker" id="leads"><div class="container" style="max-width:680px">
  <div class="section-head"><h2>Get Your Free Estimate</h2><p class="section-sub">Tell us about your project and we&rsquo;ll follow up within one business day</p></div>
  <div class="leads-grid">
    <input class="leads-input" id="lfName" placeholder="Full Name *"/>
    <input class="leads-input" id="lfEmail" type="email" placeholder="Email Address *"/>
    <input class="leads-input" id="lfPhone" placeholder="Phone Number"/>
    <select class="leads-select" id="lfIntent"><option value="">Project Type</option><option>Kitchen Remodeling</option><option>Bathroom Remodeling</option><option>ADU / Accessory Dwelling</option><option>Home Addition</option><option>New Construction</option><option>Exterior / Structural</option><option>Other</option></select>
    <select class="leads-select" id="lfBudget"><option value="">Estimated Budget</option><option>Under $30,000</option><option>$30,000&ndash;$75,000</option><option>$75,000&ndash;$150,000</option><option>$150,000+</option><option>Not sure yet</option></select>
    <select class="leads-select" id="lfTimeline"><option value="">Timeline</option><option>ASAP</option><option>1&ndash;3 months</option><option>3&ndash;6 months</option><option>6+ months</option></select>
    <textarea class="leads-textarea" id="lfMsg" placeholder="Tell us about your project..."></textarea>
  </div>
  <button class="btn btn-primary" id="lfBtn">Send My Project Details</button>
  <div id="lfResult" class="leads-result"></div>
</div></section>
<footer><div class="container" style="text-align:center"><p style="margin-bottom:.4rem"><strong style="color:rgba(255,255,255,.7);font-family:var(--fh);letter-spacing:.04em">CCS Services Group</strong></p><p>CSLB #890991 &nbsp;&bull;&nbsp; <a href="tel:+18186247212" style="color:var(--accent)">(818) 624-7212</a> &nbsp;&bull;&nbsp; Los Angeles County, CA</p><p style="margin-top:.5rem;font-size:.72rem;color:rgba(255,255,255,.25)">contractor-v003-1-afo v${VERSION} &middot; Preview</p></div></footer>

<!-- Lightbox -->
<div class="lb-backdrop" id="lbBackdrop" onclick="if(event.target===this)closeLightbox()">
  <div class="lb-box">
    <button class="lb-close" onclick="closeLightbox()">&#10005;</button>
    <div class="lb-item" id="lb-p1"><img class="lb-img" src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=820&q=80&auto=format&fit=crop" alt=""/><div class="lb-info"><span class="lb-type">Kitchen Remodeling</span><h3>Silver Lake Full Kitchen Renovation</h3><div class="lb-loc">Silver Lake, CA</div><p class="lb-desc">Complete gut-and-rebuild with custom cabinetry, quartz countertops, full electrical panel upgrade, and new plumbing rough-in. Project completed in 5 weeks on budget.</p><div class="lb-meta"><span class="lb-chip">Custom Cabinetry</span><span class="lb-chip">Quartz Counters</span><span class="lb-chip">Electrical Upgrade</span></div><button class="btn btn-primary" onclick="closeLightbox();openChat('estimate_start')">Get a Similar Estimate</button></div></div>
    <div class="lb-item" id="lb-p2"><img class="lb-img" src="https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=820&q=80&auto=format&fit=crop" alt=""/><div class="lb-info"><span class="lb-type">Bathroom Remodeling</span><h3>Burbank Primary Bath Remodel</h3><div class="lb-loc">Burbank, CA</div><p class="lb-desc">Freestanding soaking tub, frameless walk-in shower, heated tile floors, custom floating vanity. Completed in 4 weeks.</p><div class="lb-meta"><span class="lb-chip">Heated Tile</span><span class="lb-chip">Custom Vanity</span><span class="lb-chip">Frameless Shower</span></div><button class="btn btn-primary" onclick="closeLightbox();openChat('estimate_start')">Get a Similar Estimate</button></div></div>
    <div class="lb-item" id="lb-p3"><img class="lb-img" src="https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=820&q=80&auto=format&fit=crop" alt=""/><div class="lb-info"><span class="lb-type">ADU</span><h3>Glendale Garage Conversion ADU</h3><div class="lb-loc">Glendale, CA</div><p class="lb-desc">Single-car garage converted to 480 sq ft studio ADU. Full kitchen, bathroom, separate entrance, all permits through City of Glendale.</p><div class="lb-meta"><span class="lb-chip">480 sq ft</span><span class="lb-chip">Full Kitchen</span><span class="lb-chip">Permitted</span></div><button class="btn btn-primary" onclick="closeLightbox();openChat('estimate_start')">Get a Similar Estimate</button></div></div>
    <div class="lb-item" id="lb-p4"><img class="lb-img" src="https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=820&q=80&auto=format&fit=crop" alt=""/><div class="lb-info"><span class="lb-type">New Construction</span><h3>Pasadena Custom Home Build</h3><div class="lb-loc">Pasadena, CA</div><p class="lb-desc">2,400 sq ft custom 4-bed/3-bath home on infill lot. Foundation, framing, MEP, insulation, drywall, custom finishes.</p><div class="lb-meta"><span class="lb-chip">2,400 sq ft</span><span class="lb-chip">4 Bed / 3 Bath</span><span class="lb-chip">Ground-Up</span></div><button class="btn btn-primary" onclick="closeLightbox();openChat('estimate_start')">Get a Similar Estimate</button></div></div>
    <div class="lb-item" id="lb-p5"><img class="lb-img" src="https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=820&q=80&auto=format&fit=crop" alt=""/><div class="lb-info"><span class="lb-type">Home Addition</span><h3>Los Feliz Second-Story Addition</h3><div class="lb-loc">Los Feliz, CA</div><p class="lb-desc">800 sq ft second-story addition on a craftsman home. 2 bedrooms, primary bath, structural engineering, seamless roofline integration.</p><div class="lb-meta"><span class="lb-chip">800 sq ft</span><span class="lb-chip">2 Bedrooms</span><span class="lb-chip">Structural Eng.</span></div><button class="btn btn-primary" onclick="closeLightbox();openChat('estimate_start')">Get a Similar Estimate</button></div></div>
    <div class="lb-item" id="lb-p6"><img class="lb-img" src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=820&q=80&auto=format&fit=crop" alt=""/><div class="lb-info"><span class="lb-type">Kitchen Remodeling</span><h3>Studio City Open-Plan Kitchen</h3><div class="lb-loc">Studio City, CA</div><p class="lb-desc">Load-bearing wall removal, open plan, waterfall island, high-end appliance package, under-cabinet lighting.</p><div class="lb-meta"><span class="lb-chip">Wall Removal</span><span class="lb-chip">Waterfall Island</span><span class="lb-chip">High-End Appliances</span></div><button class="btn btn-primary" onclick="closeLightbox();openChat('estimate_start')">Get a Similar Estimate</button></div></div>
  </div>
</div>

<!-- Sticky FAB -->
<button id="chatFab" onclick="openChat()">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="width:18px;height:18px;flex-shrink:0"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
  Estimate / Chat
</button>

<!-- Chat Drawer -->
<div id="chatDrawer">
  <div class="chat-phone-bar">
    <a href="tel:+18186247212">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="width:16px;height:16px"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.87 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
      (818) 624-7212 &mdash; Tap to Call
    </a>
    <button class="chat-close-btn" onclick="closeChat()">&#10005;</button>
  </div>
  <div class="chat-drawer-header">
    <div class="chat-drawer-avatar">&#127968;</div>
    <div><div class="chat-drawer-title">CCS Services Group</div><div class="chat-drawer-sub">Licensed General Contractor &bull; Free Estimates</div></div>
  </div>
  <div class="chat-msgs-wrap" id="chatMsgs"></div>
  <div class="chat-upload-area" id="chatUploadArea" style="display:none">
    <label class="chat-upload-label">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
      Attach photos or video of your project
      <input type="file" id="chatFileInput" accept="image/*,video/*,.pdf" multiple/>
    </label>
    <div class="upload-progress" id="uploadProgress"></div>
  </div>
  <div class="chat-input-area">
    <input class="chat-text-input" id="chatTextInput" placeholder="Type a message..." autocomplete="off"/>
    <button class="chat-send-btn" id="chatSendBtn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="width:16px;height:16px"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
    </button>
  </div>
</div>

<script>
function toggleMenu(){var m=document.getElementById('mobileMenu'),h=document.getElementById('hamburger');var open=m.style.display==='flex';m.style.display=open?'none':'flex';h.classList.toggle('open',!open);}
document.querySelectorAll('.svc-tab').forEach(function(tab){tab.addEventListener('click',function(){document.querySelectorAll('.svc-tab').forEach(function(t){t.classList.remove('active');});document.querySelectorAll('.svc-panel').forEach(function(p){p.classList.remove('active');});tab.classList.add('active');document.querySelector('[data-panel="'+tab.dataset.svc+'"]').classList.add('active');});});
var allCards=Array.from(document.querySelectorAll('.proj-card'));
var types=['Kitchen Remodeling','Bathroom Remodeling','Home Addition & ADU','New Construction','Home Addition & ADU','Kitchen Remodeling'];
allCards.forEach(function(c,i){c.dataset.type=types[i]||'';});
document.querySelectorAll('.proj-filter-btn').forEach(function(btn){btn.addEventListener('click',function(){document.querySelectorAll('.proj-filter-btn').forEach(function(b){b.classList.remove('active');});btn.classList.add('active');var f=btn.dataset.filter;allCards.forEach(function(card){card.style.display=(f==='all'||card.dataset.type===f)?'':'none';});});});
function openLightbox(id){document.querySelectorAll('.lb-item').forEach(function(el){el.classList.remove('active');});var item=document.getElementById('lb-'+id);if(item){item.classList.add('active');document.getElementById('lbBackdrop').classList.add('open');document.body.style.overflow='hidden';}}
function closeLightbox(){document.getElementById('lbBackdrop').classList.remove('open');document.body.style.overflow='';}
document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeLightbox();closeChat();}});
document.getElementById('lfBtn').addEventListener('click',function(){var name=(document.getElementById('lfName').value||'').trim();var email=(document.getElementById('lfEmail').value||'').trim();var res=document.getElementById('lfResult');if(!name||!email){res.textContent='Name and email are required.';res.className='leads-result err';res.style.display='block';return;}res.textContent='Submitting...';res.className='leads-result';res.style.display='block';fetch('/leads',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:name,email:email,phone:document.getElementById('lfPhone').value,intent:document.getElementById('lfIntent').value,budget_range:document.getElementById('lfBudget').value,timeline:document.getElementById('lfTimeline').value,message:document.getElementById('lfMsg').value})}).then(function(r){return r.json();}).then(function(d){res.textContent=d.message||'Thank you!';res.className='leads-result '+(d.ok?'ok':'err');res.style.display='block';}).catch(function(){res.textContent='Failed. Please call (818) 624-7212.';res.className='leads-result err';res.style.display='block';});});
var chatState='init',customerId='cust-'+Date.now().toString(36),chatOpen=false;
function openChat(init){chatOpen=true;document.getElementById('chatDrawer').classList.add('open');document.getElementById('chatFab').style.display='none';document.body.style.overflow='hidden';if(!document.getElementById('chatMsgs').children.length){sendChatMsg(init==='estimate_start'?'estimate_start':'',true);}else if(init==='estimate_start'&&chatState==='init'){sendChatMsg('estimate_start',true);}}
function closeChat(){chatOpen=false;document.getElementById('chatDrawer').classList.remove('open');document.getElementById('chatFab').style.display='flex';document.body.style.overflow='';}
function addBotMsg(text,actions){var msgs=document.getElementById('chatMsgs');var div=document.createElement('div');div.className='cmsg assistant';var safe=text.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');var html='<div class="cmsg-bubble">'+safe+'</div>';if(actions&&actions.length){html+='<div class="cmsg-actions">';actions.forEach(function(a){if(a.type==='call'){html+='<a class="caction call-btn" href="'+a.url+'">'+a.label+'</a>';}else if(a.type==='upload'){html+='<button class="caction" onclick="showUploadArea()">'+a.label+'</button>';}else if(a.type==='state'){html+='<button class="caction" onclick="sendChatMsg(\''+a.value+'\',true)">'+a.label+'</button>';}else if(a.type==='quick'){html+='<button class="caction" onclick="sendChatMsg(\''+a.label.replace(/[^a-zA-Z0-9 ]/g,'')+'\',true)">'+a.label+'</button>';}});html+='</div>';}div.innerHTML=html;msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;}
function addUserMsg(text){var msgs=document.getElementById('chatMsgs');var div=document.createElement('div');div.className='cmsg user';div.innerHTML='<div class="cmsg-bubble">'+text+'</div>';msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;}
function addThinking(){var msgs=document.getElementById('chatMsgs');var div=document.createElement('div');div.className='cmsg assistant';div.id='thinkMsg';div.innerHTML='<div class="cmsg-bubble" style="color:#aaa"><span style="display:inline-block;width:8px;height:8px;border:2px solid #c8a84b;border-right-color:transparent;border-radius:50%;animation:spin .6s linear infinite;vertical-align:middle;margin-right:6px"></span>Typing...</div>';msgs.appendChild(div);msgs.scrollTop=msgs.scrollHeight;}
function removeThinking(){var t=document.getElementById('thinkMsg');if(t)t.remove();}
async function sendChatMsg(text,isQuick){var input=document.getElementById('chatTextInput');var msg=isQuick?text:(input.value.trim());if(!msg&&chatState!=='init')return;if(!isQuick){addUserMsg(msg);input.value='';}else if(msg&&msg!=='estimate_start'&&msg!=='qa'){addUserMsg(msg);}document.getElementById('chatSendBtn').disabled=true;addThinking();try{var res=await fetch('/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:msg,state:chatState})});if(!res.ok)throw new Error('Server error '+res.status);var text2=await res.text();var data;try{data=JSON.parse(text2);}catch(e){throw new Error('Parse error');}removeThinking();chatState=data.state||chatState;addBotMsg(data.answer||'Sorry, something went wrong.',data.suggested_actions);if(chatState==='estimate_upload')showUploadArea();}catch(e){removeThinking();addBotMsg('Connection issue \u2014 please call us at (818) 624-7212.',[{type:'call',label:'\uD83D\uDCDE Call Now',url:'tel:+18186247212'}]);}document.getElementById('chatSendBtn').disabled=false;}
function showUploadArea(){document.getElementById('chatUploadArea').style.display='block';}
document.getElementById('chatSendBtn').addEventListener('click',function(){sendChatMsg('',false);});
document.getElementById('chatTextInput').addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendChatMsg('',false);}});
document.getElementById('chatFileInput').addEventListener('change',async function(){var files=Array.from(this.files);if(!files.length)return;var prog=document.getElementById('uploadProgress');prog.textContent='Uploading '+files.length+' file(s)...';var uploaded=0;for(var i=0;i<files.length;i++){var fd=new FormData();fd.append('file',files[i]);fd.append('customer_id',customerId);try{var r=await fetch('/upload',{method:'POST',body:fd});var d=await r.json();if(d.ok)uploaded++;}catch(e){}}prog.textContent='';document.getElementById('chatUploadArea').style.display='none';addUserMsg('Uploaded '+uploaded+' file(s)');chatState='estimate_upload';await sendChatMsg('I uploaded '+uploaded+' photo(s) of my project.',true);});
</script>
</body>
</html>`;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    if (method === 'OPTIONS') return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': '*', 'Access-Control-Allow-Headers': '*' } });
    if (path === '/admin' || path === '/admin/') return htmlRes(buildAdmin());
    if (path === '/' || path === '') return htmlRes(buildPublic());
    if (path === '/chat' && method === 'POST') return handleChat(request, env);
    if (path === '/leads' && method === 'POST') return handleLeads(request, env);
    if (path === '/upload' && method === 'POST') return handleUpload(request, env);
    if (path === '/api/status') return handleStatus(env);
    if (path === '/api/knowledge/search') return handleSearch(request, env);
    if (path === '/api/knowledge/seed' && method === 'POST') return handleSeed(request, env);
    if (path === '/api/generate-article' && method === 'POST') return handleGenerateArticle(request, env);
    if (path === '/api/articles') return handleArticlesList(env);
    return jsonRes({ error: 'not found', path }, 404);
  }
};
--6fb3215e4702cd8202270da3da0b9080a0d1bbd0bb9d0d9e11a3455816bf--
