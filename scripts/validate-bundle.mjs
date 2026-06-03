#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');
const errors = [];

const requiredFiles = [
  'schema/afo.site.bundle.schema.json',
  'examples/example-business/afo.site.bundle.json',
  'examples/example-business/content/pages.json',
  'examples/example-business/content/articles.json',
  'examples/example-business/content/faqs.json',
  'examples/example-business/content/schema.json',
  'examples/example-business/worker/package.json',
  'examples/example-business/worker/wrangler.toml',
  'examples/example-business/worker/src/index.ts'
];

const requiredRoutes = [
  { path: '/', type: 'text/html' },
  { path: '/health', type: 'application/json' },
  { path: '/llms.txt', type: 'text/plain' },
  { path: '/robots.txt', type: 'text/plain' },
  { path: '/sitemap.xml', type: 'application/xml' },
  { path: '/schema.json', type: 'application/json' }
];

function repoPath(relativePath) {
  return path.join(repoRoot, relativePath);
}

function fail(message) {
  errors.push(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function readJson(relativePath) {
  try {
    return JSON.parse(fs.readFileSync(repoPath(relativePath), 'utf8'));
  } catch (error) {
    fail(`${relativePath} is not valid JSON: ${error.message}`);
    return null;
  }
}

for (const file of requiredFiles) {
  assert(fs.existsSync(repoPath(file)), `Missing required file: ${file}`);
}

const schema = readJson('schema/afo.site.bundle.schema.json');
const bundle = readJson('examples/example-business/afo.site.bundle.json');

for (const file of [
  'examples/example-business/content/pages.json',
  'examples/example-business/content/articles.json',
  'examples/example-business/content/faqs.json',
  'examples/example-business/content/schema.json'
]) {
  readJson(file);
}

if (schema && bundle) {
  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  if (!validate(bundle)) {
    for (const error of validate.errors ?? []) {
      fail(`Bundle schema validation failed at ${error.instancePath || '/'}: ${error.message}`);
    }
  }

  assert(bundle.schema === 'afo.site.bundle', 'Bundle schema must be afo.site.bundle.');
  assert(bundle.schema_version === '1.0.0', 'Bundle schema_version must be 1.0.0.');
  assert(bundle.deployment?.deploy_mode === 'preview_first', 'deployment.deploy_mode must be preview_first.');
  assert(bundle.deployment?.confirmed === false, 'deployment.confirmed must remain false.');
  assert(bundle.deployment?.environment === 'preview', 'deployment.environment must remain preview.');
  assert(bundle.worker?.compatibility_date === '2026-06-01', 'worker.compatibility_date must be 2026-06-01.');

  for (const route of requiredRoutes) {
    const hasSmokeTest = bundle.smoke_tests?.routes?.some((test) => test.path === route.path && test.expect_status === 200);
    assert(hasSmokeTest, `Bundle smoke_tests.routes must include ${route.path}.`);
  }
}

const workerPackage = readJson('examples/example-business/worker/package.json');
if (workerPackage) {
  const scripts = workerPackage.scripts ?? {};
  assert(scripts.dev === 'wrangler dev', 'Worker dev script must be exactly: wrangler dev');
  assert(scripts.preview === 'wrangler dev --remote', 'Worker preview script must be exactly: wrangler dev --remote');
  assert(typeof scripts.deploy === 'string', 'Worker must define a blocked deploy script.');
  assert(!/wrangler\s+deploy/.test(scripts.deploy ?? ''), 'Worker deploy script must not call wrangler deploy.');
  assert(/exit\s+1/.test(scripts.deploy ?? ''), 'Worker deploy script must exit non-zero.');
}

const wranglerPath = 'examples/example-business/worker/wrangler.toml';
const wranglerToml = fs.existsSync(repoPath(wranglerPath)) ? fs.readFileSync(repoPath(wranglerPath), 'utf8') : '';
if (wranglerToml) {
  const forbiddenWranglerPatterns = [
    { label: 'production route', pattern: /^\s*route\s*=/m },
    { label: 'production routes', pattern: /^\s*routes\s*=/m },
    { label: 'route table', pattern: /^\s*\[\[routes\]\]/m },
    { label: 'account_id', pattern: /^\s*account_id\s*=/m },
    { label: 'zone_id', pattern: /^\s*zone_id\s*=/m },
    { label: 'custom domain', pattern: /^\s*custom_domain\s*=/m },
    { label: 'custom domains', pattern: /^\s*custom_domains\s*=/m },
    { label: 'vars section', pattern: /^\s*\[vars\]/m }
  ];

  for (const { label, pattern } of forbiddenWranglerPatterns) {
    assert(!pattern.test(wranglerToml), `wrangler.toml must not include ${label}.`);
  }

  assert(/^\s*compatibility_date\s*=\s*['"]2026-06-01['"]/m.test(wranglerToml), 'wrangler.toml compatibility_date must be 2026-06-01.');
}

const workerSourcePath = 'examples/example-business/worker/src/index.ts';
const workerSource = fs.existsSync(repoPath(workerSourcePath)) ? fs.readFileSync(repoPath(workerSourcePath), 'utf8') : '';
if (workerSource) {
  for (const route of requiredRoutes) {
    assert(workerSource.includes(`'${route.path}'`) || workerSource.includes(`"${route.path}"`), `Worker source must explicitly serve ${route.path}.`);
    assert(workerSource.includes(route.type), `Worker source must include content type ${route.type} for ${route.path}.`);
  }
  assert(/ok:\s*true/.test(workerSource), 'Worker /health response must include ok: true.');
}

if (errors.length > 0) {
  console.error('AFO Site Bundle validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('AFO Site Bundle validation passed.');
console.log(`Validated ${requiredFiles.length} files, schema conformance, preview safety, and ${requiredRoutes.length} routes.`);
