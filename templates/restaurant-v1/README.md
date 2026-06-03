# AFO Restaurant Template v1

Restaurant Template v1 turns structured restaurant data into a polished, preview-safe Cloudflare Worker website.

## Files

- `template.config.json` declares template identity, runtime, output files, routes, and preview guardrails.
- `content.schema.json` defines the structured data shape expected by the template.
- `worker.template.js` is a single-file Cloudflare Worker template with a data placeholder.
- `sample-data/sample-restaurant.json` is the checked-in sample input.
- `sample-output/` contains generated reviewable output.

## Supported structured data

The template supports these top-level blocks:

- `business`: name, tagline, description, cuisine, location, phone, booking URL, address, city, region, and hours.
- `theme`: style name, color palette, typography, mood, and hero variant.
- `content`: hero, menu sections, menu items, featured items, hours, FAQs, calls to action, route panel, and proof points.
- `discovery`: llms.txt, robots.txt, sitemap.xml, and schema JSON-LD.
- `routes`: `/`, `/health`, `/llms.txt`, `/robots.txt`, `/sitemap.xml`, and `/schema.json`.

## Design goals

Generated sites should feel business-ready while staying preview-safe. The homepage includes a premium hero, CSS-gradient visual placeholders, visual menu cards, hours/location, reservation/contact CTA, FAQ accordion, AI-readable routes panel, schema/discovery callout, and responsive spacing.

## Generate sample output

From the repo root:

```bash
npm run generate:restaurant
```

The generator writes the sample Worker and discovery files into `templates/restaurant-v1/sample-output/`.

## Preview-safe guarantees

Restaurant Template v1 does not add production routes, custom domains, account IDs, secrets, external image URLs, external JavaScript, or a frontend build system. Deployment remains a separate, explicit Worker Transport step.
