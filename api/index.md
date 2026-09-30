# KeenVector API

KeenVector lets your backend send messages to your customers over the channels your
business has connected, like WhatsApp and email, through one HTTP API. You connect your own
provider accounts and KeenVector sends through them. You make one request, and the
channel-specific delivery happens in the background.

New here? Start with the [Quickstart](/api/quickstart).

## Core concepts

| Concept | What it is |
|---|---|
| **Tenant** | Your business's workspace on KeenVector. Every message, contact, connection and key belongs to exactly one tenant. |
| **API key** | A `kv_live_...` secret that identifies your tenant on every request. See [Authentication](/api/authentication). |
| **Channel** | A way to reach a customer: `whatsapp` and `email` can be sent through the API today. See [Connectors](/api/connectors/). |
| **Connection** | Your own provider account linked to your tenant: a WhatsApp Business Account, or a verified email sending domain. Without one, sends on that channel fail. |
| **Message** | One outbound send. It is accepted as `QUEUED` and then moves to `SENT` or `FAILED`. See [Messages](/api/messages). |
| **Contact** | A person your business talks to. Contacts are managed in the console. There is no public contacts API yet. |
| **Workflow** | An automation built in the console, for example "when a website lead arrives, send a WhatsApp". See [Workflows](/api/workflows). |
| **Webhooks** | These go in two directions. See below. |

### How a send flows

```text
your backend ──POST /v1/messages──▶ message-api ──queue──▶ channel worker ──▶ Meta / mail server
     ▲                                  │                         │
     │            202 + message (QUEUED)│                         │ verdict
     └──────────GET /v1/messages◀───────┴──── status: SENT/FAILED ◀┘
```

### Webhooks in two directions

```text
provider (Meta, mail) ──▶ KeenVector      "receiving webhooks": live, you configure it once
KeenVector ──▶ your server               "events": endpoint, signing, test and log live; no platform events yet
```

- **Provider to KeenVector.** Meta and other providers call KeenVector with inbound
  messages and delivery updates. You set this up once per connection. See
  [Receiving provider webhooks](/api/receiving-webhooks).
- **KeenVector to your server.** You can register an endpoint in the console, get a
  signing secret, send a signed test event and read the delivery log. But nothing on the
  platform emits events yet: the only delivery your endpoint receives today is the
  console's `webhook.test`. Keep polling `GET /v1/messages` for status. See
  [Events](/api/events).

## What's available

| Capability | Status |
|---|---|
| Send WhatsApp free-form text (`POST /v1/messages`, `channel: "whatsapp"`) | Live |
| Send email (`POST /v1/messages`, `channel: "email"`) | Live. Needs a verified sending domain. |
| List messages and their status (`GET /v1/messages`) | Live |
| Idempotent retries (`Idempotency-Key` header) | Live |
| Connect WhatsApp or Instagram with an API key (`/whatsapp/connections`, `/instagram/connections`) | Live |
| Send on Instagram or website chat through the API | Not available |
| Send WhatsApp templates through the API | Not available. Templates can be sent from campaigns and workflows in the console. |
| Self-serve API keys (create, list and revoke in the console) | Live. Business admins create and revoke; any team member can see the list. See [Authentication](/api/authentication). |
| Outbound webhooks: register an endpoint, signing secret, test event, delivery log | Live. See [Events](/api/events). |
| Outbound events for messages, campaigns and workflows (`message.*`, `campaign.completed`, `workflow.completed`) | Not produced yet. You can subscribe to them, but no service sends them. |
| Rate limits (`429`) | Not enforced yet. See [Rate limits](/api/rate-limits). |
| Test or sandbox keys | Not available. See [Environments](/api/environments). |

## Developer pages in the console

Keys and your webhook endpoint are managed in the console (business admin portal), not
through the API:

| Page | Path | What it does |
|---|---|---|
| **API keys** | `/developer` | Create, list and revoke API keys. |
| **Webhooks** | `/developer/webhooks` | Your endpoint URL, event filter, signing secret, test send and recent deliveries. |
| **SDK & code samples** | `/developer/sdk` | Copy-ready send and signature-verification snippets. |
| **Connectors** | `/developer/connectors` | REST endpoints the AI assistant may call for live data. |

::: info Open these by path
The console sidebar does not link the Developer pages yet. Open them by path, for example
`/developer/webhooks` after the console's address.
:::

## Sections

**Get started:** [Quickstart](/api/quickstart) · [Authentication](/api/authentication) ·
[Environments & base URL](/api/environments)

**Sending:** [Messages](/api/messages) · [Idempotency](/api/idempotency) ·
[Pagination](/api/pagination) · [Errors](/api/errors) · [Rate limits](/api/rate-limits) ·
[Versioning](/api/versioning)

**Channels:** [Connectors overview](/api/connectors/) · [WhatsApp](/api/channels/whatsapp) ·
[Instagram](/api/channels/instagram) · [Email](/api/channels/email) ·
[Website chat & forms](/api/channels/website)

**Webhooks and automation:** [Receiving provider webhooks](/api/receiving-webhooks) ·
[Events](/api/events) · [Workflows](/api/workflows) · [Recipes](/api/recipes/)

**Reference:** [Interactive API reference](/reference.html)
