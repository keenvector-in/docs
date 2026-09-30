# Changelog

Dates are when each change landed in this documentation, not the backend commit date.

## 2026-09-30

- **Docs:** the API reference now lists only endpoints that exist. Removed `/whatsapp/messages`, `/whatsapp/templates`, `/campaigns/*`, `/keys`, `/verify` and the `X-Tenant-ID` scheme — none were callable with an API key. Added `/instagram/connections` and the website public API (leads, chat).
- **Docs:** `POST /v1/messages` returns `202` with `Status: QUEUED` (not `201`); `channel` accepts `whatsapp` and `email`; the idempotency window is 2 hours (not 24).
- **Workflows:** Chatbot Message, Form Submitted and Contact Created triggers are live.
- New guide: [Connect WhatsApp & Instagram: two ways](/api/connectors/meta) — sign up through KeenVector (Tech Provider, not available yet) or bring your own Meta app.
- New guides: Environments, Idempotency, Pagination, Versioning, Connectors, Website chat & forms, Receiving provider webhooks, Workflows and Recipes.


## 2026-09-06

- Initial public API reference: `POST`/`GET /v1/messages`, WhatsApp connect/send/templates,
  campaigns, webhook configuration and receipt, outbound webhook delivery.
- Published as an OpenAPI 3.1 spec ([`/openapi.yaml`](/openapi.yaml)) with an interactive
  [Scalar reference](/reference.html).
- Endpoints outside `/v1/messages` are marked **Preview** — they authenticate with a
  development-only `X-Tenant-ID` header, not a real API key, until the platform's auth
  middleware ships.
