# Connecting WhatsApp

You bring your own WhatsApp Business Account (WABA) and your own Meta App — KeenVector
routes through it, verifies signatures, and tracks delivery. Nothing is sent under
KeenVector's name; every message is from your business, your number.

## What you need first (from Meta, not from us)

1. A verified **Meta Business Account**
2. A **WhatsApp Business Account (WABA)**, with a phone number attached
3. Your own **Meta App** (developers.facebook.com) with the WhatsApp product added to it

These are entirely Meta's signup and verification process — KeenVector can't shortcut it,
and doesn't see your Meta login at any point.

## 1. Connect your credentials

From your Meta App:
- **Phone number ID** and an **access token** — WhatsApp → API Setup

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

`204 No Content` on success. Calling this again with a new `access_token` rotates it — no
separate rotate endpoint.

**Access tokens expire.** A temporary token from API Setup lasts 24 hours; for anything
beyond testing, generate a permanent token from a System User (Meta Business Settings →
System Users). If your token expires or is revoked, your connection status flips to
`REAUTH_REQUIRED` and sends fail until you reconnect.

## 2. Receive delivery receipts and inbound messages

Set up a webhook so you (and KeenVector) know when a message is delivered, read, or
replied to.

1. Give KeenVector your Meta App's **App Secret** (App Settings → Basic → Show):

```bash
curl -X POST https://api.keenvector.in/webhooks/tenants/<your-tenant-id>/webhook-config/whatsapp \
  -H "Authorization: Bearer kv_live_..." \
  -H "Content-Type: application/json" \
  -d '{"app_secret": "<from Meta App Basic Settings>"}'
```

  Response:
  ```json
  { "callback_url": "/webhooks/whatsapp/<your-tenant-id>", "verify_token": "..." }
  ```

2. In your Meta App's WhatsApp → Configuration → Webhooks page, set:
   - **Callback URL**: `https://api.keenvector.in` + the `callback_url` above
   - **Verify Token**: the `verify_token` above
3. Subscribe to the **messages** field
4. Click "Verify and save" — Meta confirms the URL immediately

See [Webhooks](/api/webhooks) for the event payloads you'll receive.

## Templates

Free-form text (a normal `POST /v1/messages` call) only reaches a customer within 24 hours
of their last message to you — that's WhatsApp's rule, not ours. For anything outside that
window — an OTP, an order confirmation, any first contact — you need an **approved message
template**.

1. Create and submit a template in Meta Business Manager → WhatsApp Manager → Message
   Templates. Approval usually takes minutes to a few hours.
2. Send it:

```bash
curl -X POST https://api.keenvector.in/whatsapp/messages/template \
  -H "Authorization: Bearer kv_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "to": "919876543210",
    "template_name": "order_confirmation",
    "language_code": "en_US"
  }'
```

`language_code` defaults to `en_US` if omitted.

::: warning
Meta's auto-provisioned `hello_world` template only works from Meta's own test number, not
from your real business number — you'll see error `#131058` if you try. Create your own
template.
:::

## Disconnecting

```bash
curl -X DELETE https://api.keenvector.in/whatsapp/connections -H "Authorization: Bearer kv_live_..."
```

Deletes your stored access token from our side. Your token remains valid at Meta until you
revoke it there too — disconnecting here only stops KeenVector from using it.
