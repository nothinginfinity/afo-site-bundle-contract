# MCP Handoff Protocol

This document describes how MCPs pass the AFO Site Bundle between agents.

---

## The `handoff` Section

Every bundle includes a `handoff` object that tracks which agent last touched it and what should happen next:

```json
"handoff": {
  "created_by": "afo-micro-seo-site-builder-mcp",
  "last_updated_by": "afo-micro-seo-site-builder-mcp",
  "next_action": "validate_worker",
  "next_agent": "afo-mobile-terminal-mcp",
  "notes": "Bundle is draft. Worker files committed. Awaiting validation."
}
```

---

## Handoff Values by Stage

| Stage | `created_by` | `next_action` | `next_agent` |
|---|---|---|---|
| Bundle created | `afo-micro-seo-site-builder-mcp` | `validate_worker` | `afo-mobile-terminal-mcp` |
| Validation complete | `afo-mobile-terminal-mcp` | `confirm_deploy` | `operator` |
| Operator confirmed | `operator` | `deploy_worker` | `afo-mobile-deploy-mcp` |
| Deploy complete | `afo-mobile-deploy-mcp` | `run_smoke_tests` | `afo-mobile-terminal-mcp` |
| Smoke tests passed | `afo-mobile-terminal-mcp` | `write_receipt` | `afo-mobile-terminal-mcp` |
| Receipt written | `afo-mobile-terminal-mcp` | `register` | `afo-control-center-mcp` |
| Registered | `afo-control-center-mcp` | `none` | `none` |

---

## How MCPs Should Read the Bundle

1. Read `afo.site.bundle.json` from GitHub (always — never cache)
2. Check `status` to understand current lifecycle stage
3. Check `handoff.next_agent` to confirm the bundle is addressed to you
4. Check `handoff.next_action` for what to do
5. After completing work, update `handoff.last_updated_by`, `handoff.next_action`, `handoff.next_agent`
6. Commit updated bundle back to GitHub

---

## Source of Truth Rule

GitHub is always the source of truth. No MCP should hold bundle state in memory between sessions. Always read from and write to GitHub.
