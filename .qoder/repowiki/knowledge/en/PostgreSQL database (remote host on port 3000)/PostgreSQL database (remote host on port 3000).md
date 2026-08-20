---
kind: external_dependency
name: PostgreSQL database (remote host on port 3000)
slug: postgresql
category: external_dependency
category_hints:
    - client_constraint
scope:
    - '**'
---

### PostgreSQL
- Drizzle migrations are run automatically before every `dev`, `build`, and `start` via `scripts/run-migrations.mjs`.
- Verify exact connection string format and TLS settings against the provider's docs.