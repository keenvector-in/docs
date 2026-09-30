# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Developer docs for KeenVector's public APIs (messages, connectors, webhooks, workflows). Reached from `business-admin-portal`'s sidebar ("Developer docs", `VITE_DOCS_BASE_URL`) — not a standalone marketing site like `web-portal`, and not the internal KB (`core-engine/kb`, which documents the platform for KeenVector's own engineers).

VitePress guide in `api/` (sidebar in `.vitepress/config.mts`) + Scalar reference at `public/reference.html` driven by `public/openapi.yaml`.

```bash
npm run docs:dev        # local (the parent start.sh runs it on :5190)
npm run docs:build      # must pass — dead links fail the build
npm run docs:validate   # redocly lint public/openapi.yaml
```

**Ground every claim in code.** Document only routes/fields/limits that exist in `core-engine` (message-api, tenant-site, webhook-ingress, workflow-engine). Anything unbuilt gets a `::: warning Not available yet` container, never a guide written as if it works. When a backend change touches a documented endpoint, update the spec and the page in the same PR, and add a line to `api/changelog.md`.

For content shape, `sandesha_v1.0`'s `/app/developer/*` pages (`src/pages/app/DeveloperApiKeysPage.tsx`, `DeveloperWebhooksPage.tsx`, `DeveloperSdkPage.tsx`, `DeveloperConnectorsPage.tsx` — see its `src/layouts/nav.ts`) are the closest existing reference for what a tenant developer expects to find here.

## Related repos (siblings under `keenvector.in/`)

- `business-admin-portal` — the app this is linked from after login.
- `core-engine` — Go backend whose APIs/webhooks this documents.
- `super-admin-portal`, `web-portal` — other role-specific frontends; not related to this repo's audience.

## Product role map

`/login` (in `business-admin-portal`) routes a user into one of the role-specific apps:
- **Business admin** (`business-admin-portal`) — a tenant's own onboarding, admin/team, and integrations.
- **Super admin** (`super-admin-portal`) — KeenVector staff, cross-tenant.
- **Public website** (`web-portal`) — logged-out marketing site.
- **Developer docs** (this repo) — reachable only after logging into `business-admin-portal`.
