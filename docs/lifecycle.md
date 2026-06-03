# AFO Site Bundle Lifecycle

This document describes the full lifecycle of an AFO Site Bundle from creation through deployment and registration.

---

## Stages

### 1. `draft` — Bundle Created

- **Actor:** AFO Micro SEO Site Builder MCP
- **What happens:**
  - `afo.site.bundle.json` is generated with all sections populated
  - Worker files (`src/index.ts`, `wrangler.toml`, `package.json`, public assets) are generated
  - All files are committed to GitHub
  - `deployment.confirmed = false` (always)
- **GitHub state:** All files committed to repo
- **Next step:** Validate

---

### 2. `validating` → `validated` — Pre-Deploy Validation

- **Actor:** AFO Mobile Terminal MCP
- **What happens:**
  - Terminal reads bundle from GitHub
  - Runs validation checks:
    - `wrangler.toml` is present and parseable
    - `src/index.ts` entry point exists
    - `bundle_id` is a valid UUID
    - `deployment.confirmed` is `false` (safety check)
    - Required fields present
  - Populates `validation.checks[]` and `validation.passed`
  - Updates `status` → `validated`
- **GitHub state:** Bundle updated with validation results
- **Next step:** Operator confirms

---

### 3. Operator Confirmation

- **Actor:** Jared (via iPhone / AFO Mobile Terminal)
- **What happens:**
  - Terminal shows validation summary and deploy preview
  - Operator explicitly sets `deployment.confirmed = true`
  - Bundle committed back to GitHub
- **Safety rule:** Deploy MCP will refuse to proceed if `deployment.confirmed != true`
- **Next step:** Deploy

---

### 4. `deploying` → `deployed` — Cloudflare Deploy

- **Actor:** AFO Mobile Deploy MCP (via service binding from Mobile Terminal)
- **What happens:**
  - Reads Worker source from GitHub
  - Deploys to Cloudflare Workers
  - Populates `deployment.deployed_at`, `deployment.cloudflare_worker_id`, `deployment.deploy_url`
  - Updates `status` → `deployed`
- **Next step:** Smoke tests

---

### 5. Smoke Tests

- **Actor:** AFO Mobile Terminal MCP
- **What happens:**
  - Runs each test defined in `smoke_tests.tests[]`
  - Checks status codes and optional content matches
  - Populates `smoke_tests.all_passed` and per-test `passed` fields
- **Next step:** Write receipt

---

### 6. Receipt Written to GitHub

- **Actor:** AFO Mobile Terminal MCP
- **What happens:**
  - Writes a timestamped receipt file to `/receipts/{bundle_id}-{timestamp}.json`
  - Updates `deployment.receipt_path` in the bundle
  - Final bundle state committed to GitHub
- **GitHub state:** Receipt present, bundle fully updated

---

### 7. Registry

- **Actor:** AFO Mobile Terminal MCP or Control Center
- **What happens:**
  - Worker is registered in Toolsmith / AFO Control Center
  - `registry.registered = true`, IDs populated

---

## Status State Machine

```
draft → validating → validated → deploying → deployed
                  ↘                        ↗
                   failed ←————————————————
```

---

## Key Invariants

- `deployment.confirmed` starts as `false` and only becomes `true` via explicit operator action
- GitHub is always updated before and after each stage
- A receipt is always written after a successful deploy
- `status` in the bundle reflects the last known state
