# API reference

This is a quick lookup table. For request/response schemas, live examples in cURL /
JavaScript / TypeScript / Go / Python, and "Try it" against a base URL you configure, use
the **[interactive reference](/reference.html)** — generated from the same
[`openapi.yaml`](/openapi.yaml) that backs this page, so the two can't drift apart.

Only `POST`/`GET /v1/messages` requires `Authorization: Bearer kv_live_...` today. Every
other endpoint below is **Preview**: it authenticates with a development-only
`X-Tenant-ID` header instead, since the platform's real auth middleware isn't wired in for
these services yet. See [Authentication](/api/authentication). Base URL is a
placeholder — see [note on the overview page](/api/#base-url).

## Messages

| Method | Path | Description |
|---|---|---|
| `POST` | `/v1/messages` | Send a message. See [Sending messages](/api/messages). |
| `GET` | `/v1/messages` | List your messages, newest first. |

## WhatsApp

| Method | Path | Description |
|---|---|---|
| `POST` | `/whatsapp/connections` | Connect your WABA credentials |
| `GET` | `/whatsapp/connections` | View your current connection |
| `DELETE` | `/whatsapp/connections` | Disconnect |
| `POST` | `/whatsapp/messages/template` | Send a pre-approved template message |

See [Connecting WhatsApp](/api/channels/whatsapp) for request/response detail.

| `GET` | `/whatsapp/templates` | List templates and their Meta approval status |
| `POST` | `/whatsapp/templates` | Submit a new template for Meta's approval |

## Campaigns

Bulk-send an approved template to many recipients at once.

| Method | Path | Description |
|---|---|---|
| `POST` | `/campaigns` | Create a campaign |
| `GET` | `/campaigns` | List campaigns |
| `GET` | `/campaigns/{id}` | Get one campaign |
| `GET` | `/campaigns/{id}/targets` | Per-recipient status |
| `POST` | `/campaigns/{id}/trigger` | Send to every recipient |

## Outbound webhooks

KeenVector delivering events *to* your endpoint (separate from the inbound webhook
configuration below, which is providers calling *us*).

| Method | Path | Description |
|---|---|---|
| `POST` | `/outbound-webhooks/endpoints` | Set your event-delivery URL + signing secret |
| `POST` | `/outbound-webhooks/events` | Enqueue an event for delivery |
| `GET` | `/outbound-webhooks/deliveries` | List delivery attempts |

## Webhooks

| Method | Path | Description |
|---|---|---|
| `POST` | `/webhooks/tenants/{id}/webhook-config/{provider}` | Register your app secret, get back a callback URL + verify token |
| `GET` | `/webhooks/tenants/{id}/webhook-config/{provider}` | View your current webhook config |
| `DELETE` | `/webhooks/tenants/{id}/webhook-config/{provider}` | Disconnect a webhook |
| `GET` | `/webhooks/tenants/{id}/webhook-config/{provider}/recent` | Last 20 verified events received |

`{provider}` is `whatsapp`, `instagram`, or `slack`. See
[Webhooks](/api/webhooks) for detail.

## Error format

Every error response:

```json
{ "error_code": "invalid_api_key", "message": "the api key is invalid or revoked" }
```

The HTTP status carries the category — `401` auth, `400` bad request, `502` upstream
provider error. See each endpoint's page for its specific `error_code` values.
