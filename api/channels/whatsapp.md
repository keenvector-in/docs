# WhatsApp

You bring your own WhatsApp Business Account (WABA) and Meta app. KeenVector stores your
token, sends through the WhatsApp Cloud API, and receives your inbound messages. Every
message comes from your business and your number.

::: tip Two ways to set up Meta
**Sign up through KeenVector** (one link, KeenVector is the Meta Tech Provider — not available
yet) or **bring your own Meta app** (available today, the path this page describes). Compare them
in [Connect WhatsApp & Instagram: two ways](/api/connectors/meta).
:::

## What you need from Meta

1. A verified **Meta Business Account**.
2. A **WhatsApp Business Account** with a phone number attached.
3. Your own **Meta app** (developers.facebook.com) with the WhatsApp product added.
4. From that app, go to **WhatsApp → API Setup** and copy:
   - the **WhatsApp Business Account ID** (`waba_id`)
   - the **Phone number ID** (`phone_number_id`), which is not the phone number itself
   - an **access token**

Meta runs this signup and verification. KeenVector can't shortcut it and never sees your
Meta login.

::: tip Use a permanent token
The temporary token on API Setup expires within a day. For production, create a
**System User** token (Meta Business Settings → System Users) with WhatsApp permissions.
It doesn't expire. If you connect with a user token instead, KeenVector exchanges it for a
long-lived token and renews it before it expires, as long as the Meta permission stays in
place.
:::

## Connect

### In the console

Go to **Integrations**, then **WhatsApp**, then **Connect WhatsApp**. Enter the three
values and select **Connect**. Only a business admin can connect or disconnect.

### With the API

```bash
curl -X POST "$KV_BASE_URL/whatsapp/connections" \
  -H "Authorization: Bearer kv_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "waba_id": "<your WABA id>",
    "phone_number_id": "<your phone number id>",
    "access_token": "<your Meta access token>"
  }'
```

`201 Created`:

```json
{
  "tenant_id": "…",
  "waba_id": "<your WABA id>",
  "phone_number_id": "<your phone number id>",
  "status": "CONNECTED"
}
```

All three fields are required. A missing field returns `400 invalid_request`. To rotate
the token, call the endpoint again with a new `access_token`. There is no separate rotate
endpoint.

Check the connection:

```bash
curl "$KV_BASE_URL/whatsapp/connections" -H "Authorization: Bearer kv_live_..."
```

This returns the same shape with `200`, or `404 whatsapp_not_connected` if nothing is
connected. `status` is either:

| Status | Meaning |
|---|---|
| `CONNECTED` | Ready to send. |
| `REAUTH_REQUIRED` | Meta rejected the stored token because it expired or was revoked. Sends fail until you connect again with a fresh token. KeenVector checks tokens every 6 hours and on every call to Meta. |

Disconnect:

```bash
curl -X DELETE "$KV_BASE_URL/whatsapp/connections" -H "Authorization: Bearer kv_live_..."
```

`204 No Content`. This deletes the stored token on KeenVector's side only. The token stays
valid at Meta until you revoke it there.

## Receive messages

To receive customer messages, register a webhook. You give KeenVector your Meta app's
**App Secret** and get back a callback URL and a verify token. You paste both into your
Meta app under **WhatsApp → Configuration → Webhooks** and subscribe to the `messages`
field. The steps are in [Receiving provider webhooks](/api/receiving-webhooks).

Once that's done, each inbound message starts your published workflows that use the
**Incoming Message** trigger for WhatsApp. See [Workflows](/api/workflows).

## Send messages

### With the API: free text only

```bash
curl -X POST "$KV_BASE_URL/v1/messages" \
  -H "Authorization: Bearer kv_live_..." \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: order-1042-shipped" \
  -d '{
    "channel": "whatsapp",
    "to": "919876543210",
    "body": "Your order #1042 has shipped."
  }'
```

- `to` is the number in international format, digits only.
- Don't send `subject`. It returns `400` on WhatsApp.
- The response is `202 Accepted`: the message is queued, not delivered yet. Its status
  moves from `QUEUED` to `SENT` (Meta accepted it) or `FAILED` (with the reason). See
  [Messages](/api/messages).

::: warning The 24-hour window is Meta's rule
Free-form text reaches a customer only within 24 hours of their last message to you.
Outside that window, Meta accepts the request but doesn't deliver the message. For a first
contact, an OTP or anything else outside the window, you need an approved **message
template**.
:::

::: warning Not available yet: templates through the API
`POST /v1/messages` has no template field. Today, templates are sent only from the console:
**Campaigns** sends an approved WhatsApp template to a list of recipients. The picker shows
the templates in your WABA and their approval status. You create and submit templates in
Meta's **WhatsApp Manager → Message Templates**, not in KeenVector.
:::

::: warning Delivered and read receipts
KeenVector records Meta's `delivered` and `read` status callbacks when they arrive at your
webhook, but they don't change the message status in `GET /v1/messages`, and they aren't
forwarded to your server yet. See [Events to your server](/api/events).
:::

### From workflows

- **Reply** answers a WhatsApp message on WhatsApp.
- **Send WhatsApp** sends to any number, for example after **Form Submitted**. Its `to`
  defaults to the sender of the triggering message.

Both send free text, so the 24-hour window applies.

::: tip Meta's `hello_world` template
The `hello_world` template that Meta provisions for you works only from Meta's test number.
From your real business number it fails with error `#131058`. Create your own template.
:::

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Status is `REAUTH_REQUIRED`, and sends fail with a `401` from Meta | The token expired or was revoked | Connect again with a fresh token, preferably a System User token |
| `409 whatsapp_not_connected` or `404 whatsapp_not_connected` | No connection for your business | Connect first |
| Meta's **Verify and save** fails | The verify token in Meta doesn't match the one KeenVector issued (KeenVector answers `403 verify token mismatch`), or the callback URL is wrong (`404`) | Copy the callback URL and verify token again from your webhook registration |
| Meta's webhook deliveries fail with `403` | The signature check failed: the App Secret registered with KeenVector isn't your Meta app's current secret | Register the webhook again with the current App Secret |
| The message is `SENT` but never arrives | You sent free text outside the 24-hour window | Send a template from Campaigns |
