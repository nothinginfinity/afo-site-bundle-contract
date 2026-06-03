# Restaurant Template v1

Restaurant Template v1 is a reusable AFO website template for generating polished restaurant preview sites from structured data. It is intended to turn AFO Micro SEO Builder output into a deployable app mirror without introducing production risk.

## How it works

The template lives in `templates/restaurant-v1/`. Its sample input is `sample-data/sample-restaurant.json`, organized into these blocks:

- `business`: restaurant identity, location, phone, booking URL, address, city, region, cuisine, and hours.
- `theme`: style name, color palette, typography, mood, and hero variant.
- `content`: hero copy, menu sections, menu items, featured items, hours, FAQs, calls to action, route panel, and proof points.
- `discovery`: `llms.txt`, `robots.txt`, `sitemap.xml`, and JSON-LD schema output.
- `routes`: the smoke-testable Worker routes.

The Worker template is `worker.template.js`. It embeds structured data into a single Cloudflare Worker module and renders all required routes without external images, external JavaScript libraries, or a frontend build step.

## Mapping data to Worker output

`scripts/generate-restaurant-template.mjs` reads `templates/restaurant-v1/sample-data/sample-restaurant.json`, renders `templates/restaurant-v1/worker.template.js`, and writes:

- `templates/restaurant-v1/sample-output/worker.js`
- `templates/restaurant-v1/sample-output/llms.txt`
- `templates/restaurant-v1/sample-output/robots.txt`
- `templates/restaurant-v1/sample-output/sitemap.xml`
- `templates/restaurant-v1/sample-output/schema.json`

The generated Worker serves `/` as the restaurant homepage, `/health` as JSON with `ok: true`, `/llms.txt` as AI-readable text, `/robots.txt` as crawler policy text, `/sitemap.xml` as XML, and `/schema.json` as JSON-LD.

## Mobile Terminal validation

AFO Mobile Terminal validates the Site Bundle and Worker source before deploy. For Restaurant Template v1, validation should confirm required bundle fields, required app mirror files, default Worker export, required routes, preview-safe manifest values, and a deploy spec with no production routes, custom domains, account IDs, or secrets.

## Worker Transport preview deploy

Worker Transport deploys app mirrors from GitHub to Cloudflare Workers. The intended deploy target is workers.dev preview only. For the sample restaurant app mirror, keep `worker_slug: sample-restaurant-afo`, `script_name: sample-restaurant-afo`, `bindings: []`, `confirm_deploy: true`, and `write_receipt: true`. This must not create production routes or custom domains.

## Creating another restaurant demo

1. Copy `templates/restaurant-v1/sample-data/sample-restaurant.json` to a new restaurant data file.
2. Replace the `business`, `theme`, `content`, and `discovery` fields.
3. Generate output with the restaurant generator.
4. Copy generated output into a new `apps/<restaurant-slug>/` app mirror.
5. Keep `mcp.manifest.json` preview-safe.
6. Keep `deploy.spec.json` preview-safe.
7. Validate through AFO Mobile Terminal.
8. Deploy to workers.dev preview through Worker Transport.
9. Smoke-test and write a preview deploy receipt.

## Preview-safe guarantees

Restaurant Template v1 preserves AFO guardrails: no production deploy, no custom domain creation, no production route creation, no account IDs in source, no secrets in source, no external image URLs, no external JavaScript libraries, and no change to `deployment.confirmed`.
