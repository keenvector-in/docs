# Webhooks

KeenVector doesn't push events to your own server yet (that's on the roadmap) — today, you
query for the latest received events. This page also covers what KeenVector itself receives
from Meta/Slack on your behalf, so you understand the flow end to end.

## How it works

Each channel provider (Meta, Slack, ...) calls **our** webhook, signed with the secret from
**your own** App — not a shared KeenVector App. That's set up per channel; see
[Connecting WhatsApp § Receive delivery receipts](/api/channels/whatsapp#receive-delivery-receipts-and-inbound-messages)
for the WhatsApp setup steps.

## Checking recent events

```bash
curl "https://api.keenvector.in/webhooks/tenants/<your-tenant-id>/webhook-config/whatsapp/recent" \
  -H "Authorization: Bearer kv_live_..."
```

Returns your last 20 verified events, newest first:

```json
[
  {
    "Provider": "whatsapp",
    "ProviderMessageID": "wamid.HBgMOTE3NTc0MDMxNTg2FQIAERgSMzVGM0YxQUY0QTNBMjg2MkQ0AA==",
    "Status": "delivered",
    "OccurredAt": "2026-09-06T08:53:11Z",
    "ReceivedAt": "2026-09-06T08:53:12Z"
  }
]
```

`Status` progresses `sent` → `delivered` → `read` as WhatsApp reports each stage — match
`ProviderMessageID` back to the `ProviderMessageID` you got from `POST /v1/messages` to
track a specific message's lifecycle.

## Testing your setup

There's no "send test webhook" button on our side that means anything — a fabricated event
we sign ourselves proves our code runs, not that your actual secret and callback URL are
wired correctly. The real test:

1. In your Meta/Slack App dashboard, trigger their own "Send test event" (or just send a
   real WhatsApp message and wait for the delivery receipt)
2. Check `/recent` above — if it shows up, your webhook is correctly configured

## Managing your webhook config

```bash
# See your current callback URL and verify token again, without re-registering
curl "https://api.keenvector.in/webhooks/tenants/<your-tenant-id>/webhook-config/whatsapp" \
  -H "Authorization: Bearer kv_live_..."

# Disconnect
curl -X DELETE "https://api.keenvector.in/webhooks/tenants/<your-tenant-id>/webhook-config/whatsapp" \
  -H "Authorization: Bearer kv_live_..."
```
