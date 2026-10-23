# Connectors

A connector is a channel your business talks to customers on. You bring your own account
on each channel (your WhatsApp number, your Instagram account, your email domain), and
KeenVector sends and receives through it. Nothing goes out under KeenVector's name.

## What works today

| Channel | Connect | Receive inbound | Send with `POST /v1/messages` | Status |
|---|---|---|---|---|
| [WhatsApp](/api/channels/whatsapp) | Console or API | Yes, through a provider webhook you register | Yes, `channel: "whatsapp"`, free text and templates | Available |
| [Instagram](/api/channels/instagram) | Console (Instagram login) or API | Yes (DMs), through a provider webhook you register | No | Available |
| [Email](/api/channels/email) | Console (verify a sending domain) | No | Yes, `channel: "email"` with `subject` | Available (send only) |
| [Website chat & forms](/api/channels/website) | Console (publish your site, paste the widget) | Yes, chat messages and form submissions | No | Available |
| [SMS](/api/channels/sms) | None | No | No | Not available yet |
| [Slack](/api/channels/slack) | None | No | No | Not available yet |
<!-- hidden until the business is registered (original table):
| Channel | Connect | Receive inbound | Send with `POST /v1/messages` | Send from workflows | Status |
|---|---|---|---|---|---|
| [WhatsApp](/api/channels/whatsapp) | Console or API | Yes, through a provider webhook you register | Yes, `channel: "whatsapp"`, free text | **Reply**, **Send WhatsApp** | Available |
| [Instagram](/api/channels/instagram) | Console (Instagram login) or API | Yes (DMs), through a provider webhook you register | No | **Reply** | Available |
| [Email](/api/channels/email) | Console (verify a sending domain) | No | Yes, `channel: "email"` with `subject` | No | Available (send only) |
| [Website chat & forms](/api/channels/website) | Console (publish your site, paste the widget) | Yes, chat messages and form submissions | No | **Reply** (chat only) | Available |
| [SMS](/api/channels/sms) | None | No | No | No | Not available yet |
| [Slack](/api/channels/slack) | None | No | No | No | Not available yet |
-->

Some notes on the table:

<!-- hidden until the business is registered:
- **Receive inbound** means that customer messages reach KeenVector and can start
  [workflows](/api/workflows) through the **Incoming Message** trigger. Website chat also
  starts **Chatbot Message** and website forms start **Form Submitted**.
- **Reply** answers on the channel the triggering message came in on. **Send WhatsApp**
  sends to any number. The builder also shows **Send Email**, **Send Instagram**,
  **Send SMS** and **Send Slack**, but they can't run yet: a workflow that contains one
  stays a draft and can't be published.
-->
- **Receive inbound** means that customer messages reach KeenVector and show up in your inbox.
- `POST /v1/messages` accepts only `whatsapp` and `email`. Any other `channel` returns
  `400 invalid_request` with the list of supported channels. See [Messages](/api/messages).

## Meta: sign up through KeenVector or bring your own app

WhatsApp and Instagram need a Meta setup first. Either sign up through KeenVector's app with
one link (KeenVector is the Meta Tech Provider — not available yet), or bring your own Meta app
(available today). See [Connect WhatsApp & Instagram: two ways](/api/connectors/meta).

## Two ways to connect

**Console.** A business admin connects channels in the KeenVector console under
**Integrations** (`/settings/integrations`) and **Email domains** (`/settings/email`). The
website and its chatbot are under **Website & Chatbot**. Use the console when a person is
setting things up once.

**API.** `message-api` exposes connection endpoints that use the same API key you send
with (`Authorization: Bearer kv_live_...`). Use them when you provision connections from
your own systems.

| Channel | Endpoints |
|---|---|
| WhatsApp | `POST` / `GET` / `DELETE /whatsapp/connections` |
| Instagram | `POST` / `GET` / `DELETE /instagram/connections` |

Email domains and websites have no API-key endpoints. You set them up in the console.

Both ways write the same connection, so you can connect through the API and see the status
in the console, or the other way round. See [Authentication](/api/authentication) for API
keys.

## Receiving provider webhooks

WhatsApp and Instagram deliver inbound messages to a webhook URL that is unique to your
business and provider. You register it once with your Meta app's secret. See
[Receiving provider webhooks](/api/receiving-webhooks).
