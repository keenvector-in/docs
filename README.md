# KeenVector Docs

Developer documentation for the KeenVector API — [VitePress](https://vitepress.dev) for the
guide content, [Scalar](https://github.com/scalar/scalar) for the interactive API reference,
both driven by one OpenAPI spec.

## Layout

```
docs/
├── public/
│   ├── openapi.yaml     ← source of truth for the API reference. Edit this, not generated output.
│   ├── reference.html   ← standalone Scalar page, loads /openapi.yaml at runtime
│   ├── favicon.svg, brand/  ← copied from web-portal/public — keep these two in sync by hand
├── api/                 ← guide content (Markdown)
│   ├── index.md, quickstart.md, authentication.md, messages.md, webhooks.md,
│   │   errors.md, rate-limits.md, sdks.md, changelog.md, reference.md (quick-lookup table)
│   └── channels/         ← one page per channel
├── .vitepress/
│   ├── config.mts       ← nav, sidebar, site config
│   └── theme/           ← brand color override on top of the default theme
├── redocly.yaml          ← OpenAPI lint config
└── .github/workflows/     ← CI validate+build, optional GitHub Pages deploy
```

## Local development

```bash
npm install
npm run docs:dev        # http://localhost:5173
```

`public/reference.html` (the Scalar page) is served as a static file — visiting it directly
in dev works the same as in production, since it fetches `/openapi.yaml` at runtime rather
than being built into the VitePress bundle.

## Updating the OpenAPI spec

1. Edit `public/openapi.yaml` directly. It's one file with reusable `components` (schemas,
   parameters, responses, security schemes) — add new operations under `paths`, new shared
   pieces under `components`, and reference them with `$ref` rather than repeating a schema.
2. **Ground every endpoint in the actual backend code** (`core-engine/services/*/service`
   or `.../internal/handler`) before adding it here — do not add an endpoint that doesn't
   exist, and do not describe fields the handler doesn't actually read/write. If a route
   exists but isn't safe to call externally yet (see the *Preview* / `tenantHeader` note in
   the spec's `info.description`), document it as such rather than omitting it or hiding
   the caveat.
3. Validate:
   ```bash
   npm run docs:validate
   ```
   This runs [Redocly](https://redocly.com/docs/cli/) against `redocly.yaml`'s ruleset —
   catches invalid syntax, broken `$ref`s, and schema mistakes. It exits non-zero (and CI
   fails) on **errors**; warnings (e.g. "add a 4xx response") are advisory.
4. Preview it: `npm run docs:dev`, then open `/reference.html`.
5. If backend behavior changed (new field, new status code, renamed error), update
   `public/openapi.yaml` in the **same PR** as the backend change — that's what keeps this
   spec from drifting out of sync, not a scheduled review.

## Build

```bash
npm run docs:build      # → .vitepress/dist
npm run docs:preview    # serve the built output locally
```

CI (`.github/workflows/ci.yml`) runs `docs:validate` then `docs:build` on every push and PR
— a broken spec or a VitePress build error fails the check.

## Deploying `docs.keenvector.in`

**Vercel**, connected to this repo; it builds and deploys on every push to `master`.
Build settings live in `vercel.json` (`npm run docs:build`, output `.vitepress/dist`), so the
dashboard import needs no overrides. `docs.keenvector.in` already resolves to Vercel; add it under
the project's Settings → Domains.

**Alternative: GitHub Pages** — `.github/workflows/deploy-gh-pages.yml` is included but
disabled (`workflow_dispatch` only) to avoid double-deploying with Vercel.
To use it instead: uncomment the `push: branches: [master]` trigger, enable Pages in repo
settings with source "GitHub Actions", and set the custom domain there.

Either way, this repo deploys independently of `core-engine` — no backend build or runtime
dependency, matching the platform's own rule that services don't reach into each other.

## What's real vs. planned

This spec documents only endpoints that exist in `core-engine` today. Two things worth
knowing before you extend it:

- **Only `POST`/`GET /v1/messages` (message-api) has real API-key auth.** Every other
  documented endpoint (`/whatsapp/*`, `/campaigns/*`, `/webhooks/*`) is served by a service
  whose own code comments say its tenant isolation is a development stand-in
  (`X-Tenant-ID` header), not the real thing yet. They're tagged **Preview** in the spec
  for exactly this reason.
- **API keys and outbound webhooks are gRPC-only behind edge-gateway's console routes**
  (`/api/developer/*`, JWT-authenticated) — auth-service and outbound-webhooks have no
  public HTTP surface of their own, so they're not in `openapi.yaml`. Tenants manage both
  from the business-admin-portal console (**Developer → API keys**, **Developer →
  Webhooks**), not by calling `/keys`, `/verify` or `/outbound-webhooks/*` directly.
- **SMS, Email, Instagram, Slack, RCS, voice, push, Contacts, Media, and tenant
  self-service have no HTTP endpoints yet** — several services in `core-engine/services/`
  (`contact-service`, `analytics-service`, `billing-service`, `dispatcher`,
  `workflow-engine`, `edge-gateway`) only expose their scaffolding's placeholder
  `/examples` route. Don't add OpenAPI paths for them until a real handler exists — add the
  channel/module to the roadmap table in `api/index.md` instead.
