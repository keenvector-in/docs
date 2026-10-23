# Endpoint summary

Every endpoint that exists today, grouped by who calls it. Full request and response shapes
are in the [interactive reference](/reference.html) ([raw OpenAPI](/openapi.yaml)).

## Message API — your server, with an API key

`Authorization: Bearer kv_live_…` on every call ([Authentication](/api/authentication)).
Base URL: see [Environments](/api/environments).

| Method | Path | What it does |
|---|---|---|
| `POST` | `/v1/messages` | Send a WhatsApp (free text) or email message → `202` + `Status: QUEUED`. Optional `Idempotency-Key` |
| `GET` | `/v1/messages` | List your messages, newest first; `before`, `limit` (≤200) |
| `POST` | `/whatsapp/connections` | Connect a WhatsApp Business Account → `201` |
| `GET` | `/whatsapp/connections` | Current WhatsApp connection |
| `DELETE` | `/whatsapp/connections` | Disconnect WhatsApp → `204` |
| `POST` | `/instagram/connections` | Connect an Instagram professional account → `201` |
| `GET` | `/instagram/connections` | Current Instagram connection |
| `DELETE` | `/instagram/connections` | Disconnect Instagram → `204` |
| `GET` | `/healthz` | Liveness |

## Website public API — browsers, no key

Keyed by your published site's slug. Served by a different host from the Message API
([Website chat & forms](/api/channels/website)).

| Method | Path | What it does |
|---|---|---|
| `GET` | `/public/sites/{slug}` | Published site config |
| `POST` | `/public/sites/{slug}/leads` | Contact form → `202` |
| `POST` | `/public/sites/{slug}/chat` | Website chat message (20/min per IP) |

## Not in the API (console only today)

Campaigns and templates, email domains, contacts, the webhook registration that
wires your Meta app to KeenVector ([Receiving provider webhooks](/api/receiving-webhooks)),
API key management ([Authentication](/api/authentication)) and your outbound webhook
endpoint ([Events](/api/events)).

## Errors

JSON errors look like `{"error_code": "...", "message": "..."}`; a few are still plain text.
See [Errors](/api/errors).
