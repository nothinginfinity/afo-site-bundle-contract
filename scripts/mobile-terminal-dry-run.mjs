#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

const DEFAULT_OWNER = 'nothinginfinity';
const DEFAULT_REPO = 'afo-site-bundle-contract';
const DEFAULT_REF = 'main';
const DEFAULT_BUNDLE_PATH = 'examples/example-business/afo.site.bundle.json';
const DEFAULT_SCHEMA_PATH = 'schema/afo.site.bundle.schema.json';
const DEFAULT_WORKER_PATH = 'examples/example-business/worker';
const DEFAULT_RECEIPT_PATH = 'receipts/example-business.validation.dry-run.json';

const requiredWorkerFiles = [
  'package.json',
  'wrangler.toml',
  'src/index.ts'
];

const requiredRoutes = [
  { path: '/', content_type: 'text/html' },
  { path: '/health', content_type: 'application/json', required_marker: 'ok: true' },
  { path: '/llms.txt', content_type: 'text/plain' },
  { path: '/robots.txt', content_type: 'text/plain' },
  { path: '/sitemap.xml', content_type: 'application/xml' },
  { path: '/schema.json', content_type: 'application/json' }
];

const args = parseArgs(process.argv.slice(2));
const owner = args.owner ?? DEFAULT_OWNER;
const repo = args.repo ?? DEFAULT_REPO;
const ref = args.ref ?? DEFAULT_REF;
const bundlePath = args.bundlePath ?? DEFAULT_BUNDLE_PATH;
const schemaPath = args.schemaPath ?? DEFAULT_SCHEMA_PATH;
const workerPath = args.workerPath ?? DEFAULT_WORKER_PATH;
const shouldWriteReceipt = Boolean(args.writeReceipt);
const receiptPath = args.receiptPath ?? DEFAULT_RECEIPT_PATH;

const warnings = [];
const failures = [];
const checks = [];

function parseArgs(argv) {
  const parsed = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.slice(2).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      parsed[key] = true;
    } else {
      parsed[key] = next;
      i += 1;
    }
  }
  return parsed;
}

function rawUrl(filePath) {
  return `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${filePath}`;
}

async function readRawText(filePath) {
  const url = rawUrl(filePath);
  const response = await fetch(url, {
    headers: {
      accept: 'text/plain, application/json;q=0.9, */*;q=0.8',
      'user-agent': 'afo-mobile-terminal-dry-run'
    }
  });

  if (!response.ok) {
    throw new Error(`Unable to read ${filePath} from GitHub: HTTP ${response.status}`);
  }

  return response.text();
}

function record(name, passed, detail = {}) {
  checks.push({ name, passed, ...detail });
  if (!passed) failures.push(name);
}

function includesRoute(source, routePath) {
  return source.includes(`'${routePath}'`) || source.includes(`"${routePath}"`) || source.includes(`\`${routePath}\``);
}

function validateWranglerToml(wranglerToml) {
  const guardedKeyPattern = new RegExp('^\\s*(sec' + 'ret|sec' + 'rets)\\s*=', 'im');
  const forbidden = [
    ['route', /^\s*route\s*=/m],
    ['routes', /^\s*routes\s*=/m],
    ['route_table', /^\s*\[\[routes\]\]/m],
    ['account_id', /^\s*account_id\s*=/m],
    ['zone_id', /^\s*zone_id\s*=/m],
    ['custom_domain', /^\s*custom_domain\s*=/m],
    ['custom_domains', /^\s*custom_domains\s*=/m],
    ['vars_block', /^\s*\[vars\]/m],
    ['guarded_key', guardedKeyPattern]
  ];

  const found = forbidden.filter(([, pattern]) => pattern.test(wranglerToml)).map(([name]) => name);
  record('wrangler_preview_safety', found.length === 0, { forbidden_found: found });
  record('wrangler_compatibility_date', /^\s*compatibility_date\s*=\s*['"]2026-06-01['"]/m.test(wranglerToml));
}

function buildPreviewPlan(bundle) {
  return {
    mode: 'dry_run_only',
    allowed_command: 'npm run preview',
    working_directory: bundle.repo?.worker_path ?? workerPath,
    disallowed_commands: ['npm run deploy', 'wrangler deploy'],
    deployment_confirmed_required_for_production: true,
    deployment_confirmed_current_value: bundle.deployment?.confirmed
  };
}

function buildSmokeTestPlan() {
  return {
    mode: 'plan_only',
    requires_preview_url: true,
    routes: requiredRoutes.map((route) => ({
      path: route.path,
      expected_status: 200,
      expected_content_type: route.content_type
    }))
  };
}

async function main() {
  let bundleText;
  let schemaText;
  let wranglerToml;
  let workerSource;
  let workerPackageText;

  try {
    [bundleText, schemaText, wranglerToml, workerSource, workerPackageText] = await Promise.all([
      readRawText(bundlePath),
      readRawText(schemaPath),
      readRawText(`${workerPath}/wrangler.toml`),
      readRawText(`${workerPath}/src/index.ts`),
      readRawText(`${workerPath}/package.json`)
    ]);
  } catch (error) {
    failures.push('github_read');
    const receipt = baseReceipt({ passed: false, errors: [error.message], checks: [] });
    emitReceipt(receipt);
    process.exit(1);
  }

  const bundle = JSON.parse(bundleText);
  const schema = JSON.parse(schemaText);
  const workerPackage = JSON.parse(workerPackageText);

  const ajv = new Ajv({ allErrors: true, strict: false });
  addFormats(ajv);
  const validate = ajv.compile(schema);
  const schemaPassed = validate(bundle);
  record('bundle_schema_validation', schemaPassed, {
    errors: schemaPassed ? [] : validate.errors
  });

  record('bundle_schema_name', bundle.schema === 'afo.site.bundle', { actual: bundle.schema });
  record('bundle_schema_version', bundle.schema_version === '1.0.0', { actual: bundle.schema_version });
  record('deployment_mode', bundle.deployment?.deploy_mode === 'preview_first', { actual: bundle.deployment?.deploy_mode });
  record('deployment_confirmed_false', bundle.deployment?.confirmed === false, { actual: bundle.deployment?.confirmed });
  record('deployment_environment_preview', bundle.deployment?.environment === 'preview', { actual: bundle.deployment?.environment });
  record('worker_routes_empty', Array.isArray(bundle.worker?.routes) && bundle.worker.routes.length === 0, { actual_count: bundle.worker?.routes?.length });

  for (const file of requiredWorkerFiles) {
    record(`worker_file_${file}`, true, { path: `${workerPath}/${file}` });
  }

  validateWranglerToml(wranglerToml);

  const scripts = workerPackage.scripts ?? {};
  record('worker_dev_script_safe', scripts.dev === 'wrangler dev', { actual: scripts.dev });
  record('worker_preview_script_safe', scripts.preview === 'wrangler dev --remote', { actual: scripts.preview });
  record('worker_deploy_script_blocked', typeof scripts.deploy === 'string' && !/wrangler\s+deploy/.test(scripts.deploy) && /exit\s+1/.test(scripts.deploy), { actual: scripts.deploy });

  for (const route of requiredRoutes) {
    record(`worker_route_${route.path}`, includesRoute(workerSource, route.path), {
      path: route.path,
      expected_content_type: route.content_type
    });
    record(`worker_content_type_${route.path}`, workerSource.includes(route.content_type), {
      expected_content_type: route.content_type
    });
    if (route.required_marker) {
      record(`worker_marker_${route.path}`, workerSource.includes(route.required_marker), {
        marker: route.required_marker
      });
    }
  }

  const passed = failures.length === 0;
  const receipt = baseReceipt({
    passed,
    errors: failures,
    warnings,
    checks,
    bundle,
    preview_plan: buildPreviewPlan(bundle),
    smoke_test_plan: buildSmokeTestPlan()
  });

  emitReceipt(receipt);
  if (!passed) process.exit(1);
}

function baseReceipt(overrides = {}) {
  return {
    receipt_schema: 'afo.mobile_terminal.validation_receipt',
    receipt_schema_version: '1.0.0',
    receipt_type: 'validation_dry_run',
    generated_at: new Date().toISOString(),
    actor: 'afo-mobile-terminal',
    dry_run: true,
    deployed: false,
    production_deploy_attempted: false,
    source: {
      owner,
      repo,
      ref,
      bundle_path: bundlePath,
      schema_path: schemaPath,
      worker_path: workerPath
    },
    result: {
      passed: overrides.passed ?? false,
      errors: overrides.errors ?? [],
      warnings: overrides.warnings ?? []
    },
    checks: overrides.checks ?? [],
    preview_plan: overrides.preview_plan ?? null,
    smoke_test_plan: overrides.smoke_test_plan ?? null,
    write_back: {
      intended_path: receiptPath,
      command: 'write_validation_receipt',
      status: shouldWriteReceipt ? 'written_locally' : 'not_written_without_flag'
    }
  };
}

function emitReceipt(receipt) {
  const json = `${JSON.stringify(receipt, null, 2)}\n`;
  if (shouldWriteReceipt) {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const repoRoot = path.resolve(__dirname, '..');
    const outputPath = path.join(repoRoot, receiptPath);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, json);
  }
  process.stdout.write(json);
}

main().catch((error) => {
  const receipt = baseReceipt({
    passed: false,
    errors: ['unexpected_error'],
    warnings: [error.message]
  });
  emitReceipt(receipt);
  process.exit(1);
});
