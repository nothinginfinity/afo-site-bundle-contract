// Example TypeScript-compatible content mirror for Restaurant v0.06.
// Canonical runtime source: apps/sample-restaurant-v006-afo/worker.js
// This example intentionally introduces no build step and no external libraries.

import menuSections from "../../content/menu-sections.json";
import menuItems from "../../content/menu-items.json";
import testimonials from "../../content/testimonials.json";
import articles from "../../content/articles.json";
import pages from "../../content/pages.json";
import schema from "../../content/schema.json";

export { menuSections, menuItems, testimonials, articles, pages, schema };

export const previewOnly = true;
export const workerSlug = "sample-restaurant-v006-afo";
export const previewUrl = "https://sample-restaurant-v006-afo.jaredtechfit.workers.dev/";
export const canonicalRuntimeSource = "apps/sample-restaurant-v006-afo/worker.js";

const headers = {
  "content-type": "application/json; charset=utf-8",
  "x-afo-preview-only": "true"
};

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/menu.json") {
      return json({ ...pages, sections: menuSections, items: menuItems, testimonials, articles });
    }

    if (path === "/registry.json") {
      return json({
        version: "0.06",
        preview_only: true,
        business: pages.site,
        menu: { sections: menuSections, items: menuItems },
        testimonials,
        articles,
        safety: pages.safety
      });
    }

    if (path === "/schema.json") {
      return json(schema);
    }

    if (path === "/mcp/actions") {
      return json({
        preview_only: true,
        dry_run_only: true,
        production_deploy: false,
        actions: [{ ...pages.mcp_action, href: "/mcp/actions/update-seasonal-menu?dry_run=true" }]
      });
    }

    if (path === "/mcp/actions/update-seasonal-menu") {
      return json({
        ...pages.mcp_action,
        dry_run: true,
        preview_only: true,
        route: path,
        proposed_preview_changes: (menuItems as any[])
          .filter((item: any) => item.availableToday && item.isSpecial)
          .map((item: any) => ({
            id: item.id,
            name: item.name,
            badge: item.badge,
            season: item.season,
            specialMessage: item.specialMessage
          }))
      });
    }

    if (path === "/health") {
      return json({
        ok: true,
        worker: workerSlug,
        version: "0.06",
        preview_only: true,
        item_count: (menuItems as any[]).length,
        article_count: (articles as any[]).length,
        production_routes: [],
        custom_domains: [],
        bindings: [],
        secrets_required: []
      });
    }

    return json({
      preview_only: true,
      note: "Example data mirror only. Canonical deployed runtime is apps/sample-restaurant-v006-afo/worker.js.",
      supported_example_routes: ["/menu.json", "/registry.json", "/schema.json", "/mcp/actions", "/mcp/actions/update-seasonal-menu", "/health"]
    });
  }
};

function json(value: unknown): Response {
  return new Response(JSON.stringify(value, null, 2), { headers });
}
