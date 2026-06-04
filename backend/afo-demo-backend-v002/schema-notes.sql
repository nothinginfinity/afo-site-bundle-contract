-- AFO Demo Backend v0.02 Schema Notes
-- These are the expected D1 tables for v0.02.
-- Run via POST /admin/schema on the deployed worker.
-- Do NOT run directly against production D1 without review.

CREATE TABLE IF NOT EXISTS businesses (
  id TEXT PRIMARY KEY,
  name TEXT,
  slug TEXT,
  description TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS demo_sites (
  id TEXT PRIMARY KEY,
  business_id TEXT,
  name TEXT,
  slug TEXT,
  status TEXT DEFAULT 'preview',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  business_id TEXT,
  demo_site_id TEXT,
  title TEXT,
  alt_text TEXT,
  role TEXT,
  media_type TEXT,
  mime_type TEXT,
  r2_key_original TEXT,
  public_url TEXT,
  item_id TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_sections (
  id TEXT PRIMARY KEY,
  demo_site_id TEXT,
  name TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  section_id TEXT,
  demo_site_id TEXT,
  name TEXT,
  description TEXT,
  price TEXT,
  tags TEXT,
  available INTEGER DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  demo_site_id TEXT,
  title TEXT,
  body TEXT,
  published_at TEXT,
  status TEXT DEFAULT 'published',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id TEXT PRIMARY KEY,
  business_id TEXT,
  demo_site_id TEXT,
  source_type TEXT,
  source_id TEXT,
  title TEXT,
  content TEXT,
  tags TEXT,
  priority INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  embedding_ref TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_sessions (
  id TEXT PRIMARY KEY,
  demo_site_id TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  role TEXT,
  content TEXT,
  intent TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  demo_site_id TEXT,
  name TEXT,
  email TEXT,
  phone TEXT,
  intent TEXT,
  message TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mcp_action_receipts (
  id TEXT PRIMARY KEY,
  action TEXT,
  payload TEXT,
  result TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
