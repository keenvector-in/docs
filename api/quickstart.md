# Quickstart: send your first WhatsApp message

KeenVector is a technology provider, not a message sender in our own name — you connect
**your own** WhatsApp Business Account, and every message goes out under your business,
your number, your Meta App. We route the API call, verify signatures, and record delivery
status; the WhatsApp relationship is between you and Meta.

Three steps: get an API key, connect your WhatsApp Business Account, send a message.

## 1. Get an API key

Your account team issues your first live key when your workspace is set up. Keep it secret
— it authenticates every request as your business.

```
Authorization: Bearer kv_live_...
```

See [Authentication](/api/authentication) for details.

## 2. Connect your WhatsApp Business Account

You need:
- A Meta Business Account and a WhatsApp Business Account (WABA) — Meta's own signup, not
  ours
- Your own Meta App (Facebook Developers) with the WhatsApp product added
- From that App: **App Secret** (App Settings → Basic) and an **access token** (WhatsApp →
  API Setup)

```bash
curl -X POST https://api.keenvector.in/whatsapp/connections \
  -H "Authorization: Bearer kv_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "waba_id": "<your WABA id>",
    "phone_number_id": "<your phone number id>",
    "access_token": "<your access token>"
  }'
```

Full details, including how to receive delivery receipts back, are in
[Connecting WhatsApp](/api/channels/whatsapp).

## 3. Send a message

```bash
curl -X POST https://api.keenvector.in/v1/messages \
  -H "Authorization: Bearer kv_live_..." \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: order-4471-confirmation" \
  -d '{
    "channel": "whatsapp",
    "to": "919876543210",
    "body": "Hi! Your order #4471 has shipped."
  }'
```

```json
{
  "ID": "e6b4ce10-...",
  "Status": "SENT",
  "ProviderMessageID": "wamid.HBgMOTE...",
  "CreatedAt": "2026-09-06T09:42:07Z"
}
```

`Status` is `SENT` or `FAILED` — a successful HTTP response means we accepted and
forwarded the request, not that WhatsApp delivered it. See
[Sending messages](/api/messages) for the full field reference and
[Webhooks](/api/webhooks) for how to know when it's actually delivered/read.

::: tip First message to a new customer?
Free-form text only works if the customer has messaged you in the last 24 hours (WhatsApp's
own rule, not ours). For a cold first contact — an order confirmation, an OTP — you send an
**approved message template** instead. See
[Connecting WhatsApp § Templates](/api/channels/whatsapp#templates).
:::
