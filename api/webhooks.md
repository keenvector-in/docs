# Webhooks

KeenVector can POST events to an HTTPS endpoint on your server — configure it under
**Developer → Webhooks** in the console. This page covers that, and also what KeenVector
itself receives from Meta/Slack on your behalf, so you understand the flow end to end.

## Receiving KeenVector events

Set one endpoint URL and pick the events you want (none selected = all of them):
`message.sent`, `message.delivered`, `message.failed`, `message.received`,
`campaign.completed`, `workflow.completed`. **Send test** delivers a `webhook.test` event
right away and shows your server's HTTP status.

Every delivery is a `POST` with a JSON body and two headers:

| Header | Value |
|---|---|
| `X-KeenVector-Event` | the event name, e.g. `message.delivered` |
| `X-KeenVector-Signature` | `sha256=` + hex HMAC-SHA256 of the raw body, keyed with your signing secret (`whsec_…`) |

Answer with any `2xx` within 10 seconds. Anything else is retried up to 6 attempts with
exponential backoff (2, 4, 8, 16, 32 minutes), then marked failed in the delivery log.
Deliveries are at-least-once: dedupe on the payload's id.

Verify the signature against the **raw** body, before parsing JSON:

::: code-group

```js [Node.js]
import crypto from 'node:crypto'

function isFromKeenVector(rawBody, header, secret) {
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  return header.length === expected.length && crypto.timingSafeEqual(Buffer.from(header), Buffer.from(expected))
}
```

```python [Python]
import hashlib, hmac

def is_from_keenvector(raw_body: bytes, header: str, secret: str) -> bool:
    expected = "sha256=" + hmac.new(secret.encode(), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(header, expected)
```

```go [Go]
func isFromKeenVector(rawBody []byte, header, secret string) bool {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(rawBody)
	return hmac.Equal([]byte(header), []byte("sha256="+hex.EncodeToString(mac.Sum(nil))))
}
```

:::

Rotating the secret in the console takes effect on the next delivery — deploy the new
secret first if you can't tolerate a few rejected deliveries.

::: warning Event producers are rolling out
The endpoint, signing and delivery log are live; individual services start emitting the
events above as they ship. `webhook.test` works today.
:::

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
