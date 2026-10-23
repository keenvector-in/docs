# Changelog

Dates are when each change landed in this documentation, not the backend commit date.

## 2026-10-23

- **Messages:** `POST /v1/messages` sends WhatsApp templates. Pass `template` (`name`,
  `language`, and optional `body_params`, `header` and `buttons`) instead of `body`. Covers
  authentication (OTP), utility and marketing templates. See
  [WhatsApp](/api/channels/whatsapp#with-the-api-templates).
- **Messages:** responses carry `TemplateName`. `Subject` now reads back correctly from
  `GET /v1/messages` and idempotent replays.

## 2026-10-01

- **Events:** `message.received`, `message.sent`, `message.failed` and `message.delivered` are delivered to your endpoint, in the `{type, tenant_id, occurred_at, data}` envelope.
- **Events:** endpoint URLs must be public — localhost and private addresses are refused.
- **API keys are self-serve.** Business admins create, name and revoke keys on the console's
  **API keys** page (`/developer`); any team member can see the list. Keys show a
  `kv_live_xxxx` display prefix. Rotation no longer needs KeenVector. See
  [Authentication](/api/authentication).
- **Outbound webhooks: endpoint registration is live.** On **Webhooks**
  (`/developer/webhooks`) you set your HTTPS endpoint and event filter, get and rotate a
  `whsec_` signing secret, send a signed `webhook.test`, and read the delivery log.
  Deliveries now carry `X-KeenVector-Delivery` for dedupe. No platform events
  (`message.*`, `campaign.completed`, `workflow.completed`) are sent yet. See
  [Events](/api/events).
- New console page **SDK & code samples** (`/developer/sdk`). See [Code samples](/api/sdks).

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
