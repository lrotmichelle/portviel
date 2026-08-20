---
kind: external_dependency
name: Next.js 16 dev server with cross-origin preview restriction
slug: nextjs
category: external_dependency
category_hints:
    - framework_behavior
    - client_constraint
scope:
    - '**'
---

### Next.js dev server
- Dev/build/start scripts all pre-run `scripts/run-migrations.mjs` before launching Next.js.
- Port 3000 cannot be used because the host's docker-proxy publishes it to a PostgreSQL container; choose another free port for the dev server.
- Verify exact `allowedDevOrigins` syntax and behavior against the Next.js 16 docs.