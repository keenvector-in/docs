# KeenVector API

KeenVector is a multi-channel messaging platform. This section covers everything a
developer needs to send and receive messages through the API — authentication, connecting
a channel, sending messages, and receiving delivery/inbound events.

- **[Quickstart](/api/quickstart)** — get your API key and send your first message
- **[Authentication](/api/authentication)** — how API keys work
- **[Sending messages](/api/messages)** — the `/v1/messages` endpoint
- **[Connecting WhatsApp](/api/channels/whatsapp)** — link your own WhatsApp
  Business Account
- **[Webhooks](/api/webhooks)** — receive delivery receipts and inbound messages
- **[API reference](/api/reference)** — full endpoint reference

## Base URL

`https://api.keenvector.in` is used throughout these docs as a placeholder, along with a
single unified path structure (`/v1/messages`, `/whatsapp/...`, `/webhooks/...`) — this is
the API surface the platform is being built toward. The platform is not publicly hosted
yet; your account team gives you the actual base URL for your environment.

## Channels

| Channel | Status |
|---|---|
| [WhatsApp](/api/channels/whatsapp) | Available |
| [Instagram](/api/channels/instagram) | Coming soon |
| [SMS](/api/channels/sms) | Coming soon |
| [Email](/api/channels/email) | Coming soon |
| [Slack](/api/channels/slack) | Coming soon |
| RCS, Voice, Push | Planned |
