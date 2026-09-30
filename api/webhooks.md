# Webhooks

Webhooks run in two directions on KeenVector. Pick the one you need:

| Direction | What it is | Status |
|---|---|---|
| **Provider → KeenVector** | Meta (WhatsApp, Instagram) and Slack call KeenVector when a customer messages you or a message changes status. You wire your own Meta or Slack app to a per-tenant callback URL. | Live. See [Receiving provider webhooks](/api/receiving-webhooks). |
| **KeenVector → your server** | KeenVector POSTs signed events to an endpoint you own. | Endpoint, signing secret, test event and delivery log are live in the console. No platform events are sent yet: only the console's `webhook.test`. See [Events](/api/events). |

If you want to *act* on an incoming message (auto-reply, forward it to your team), you
don't need your own webhook endpoint: build a [workflow](/api/workflows) in the console.
