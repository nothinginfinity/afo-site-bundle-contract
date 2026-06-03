# AFO Site Bundle Lifecycle

This document defines the lifecycle states for AFO Site Bundle Manifest v1.

## Canonical States

1. `draft` - Bundle is being created.
2. `generated` - Micro SEO Builder generated the manifest and source files.
3. `validated` - Mobile Terminal validated the bundle and Worker source.
4. `preview_ready` - Bundle is ready for preview deployment.
5. `preview_deployed` - Preview deployment exists.
6. `smoke_tested` - Smoke tests have run against the preview or deployed URL.
7. `production_ready` - Operator has reviewed preview and is ready to confirm production.
8. `production_deployed` - Production deployment completed.
9. `registered` - Worker/site has been registered in AFO registry or control center.
10. `receipted` - Deployment and smoke-test receipts have been written back to GitHub.

`failed` may be used for a failed validation, preview, production deploy, smoke-test, registry, or receipt step.

## State Machine

```text
draft
-> generated
-> validated
-> preview_ready
-> preview_deployed
-> smoke_tested
-> production_ready
-> production_deployed
-> registered
-> receipted
```

## Safety Invariants

- GitHub is the source of truth.
- Cloudflare is the runtime target only.
- `deployment.confirmed` starts as `false`.
- Production deployment requires explicit operator confirmation.
- Preview deployment should happen before production deployment.
- Smoke tests should run after deployment.
- Receipts should be written back to GitHub.
