# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Developer docs for KeenVector's public APIs/SDKs (webhooks, integrations, etc.). Meant to be reached only from inside `business-admin-portal` after login — not a standalone public site like `web-portal`, and not the internal KB (`core-engine/kb`, which documents the platform for KeenVector's own engineers). Repo is currently empty — no scaffold yet.

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
