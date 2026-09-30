# Events (outbound webhooks)

Outbound webhooks are KeenVector POSTing signed events to an endpoint on **your** server.
For the other direction (Meta calling KeenVector), see
[Receiving provider webhooks](/api/receiving-webhooks).

::: warning No platform events are sent yet
You can register an endpoint, choose events, get a signing secret, send a test event and
read the delivery log today. But **no KeenVector service emits events yet**. The only
delivery your endpoint receives is the console's `webhook.test`. The event names below can
be selected, but nothing sends them, and their payloads are not defined yet.
See [What is sent today](#what-is-sent-today).

To react to incoming messages today, use a [workflow](/api/workflows). For message status,
poll `GET /v1/messages`.
:::

Everything on this page happens on the console's **Webhooks** page at `/developer/webhooks`
(see [Developer pages in the console](/api/#developer-pages-in-the-console)). Any team member
can view it. Only a **business admin** can save, delete, test, rotate the secret or see the
secret.

## 1. Register your endpoint

1. Open **Webhooks**.
2. Enter your **Endpoint URL**, for example `https://example.com/keenvector/webhooks`.
3. Choose events (next section).
4. Click **Save endpoint** (or **Save changes** when you edit it later).

Each tenant has one endpoint. The URL must be absolute and use `https://`. Plain `http://`
is refused, except on a local development stack.

To stop all deliveries, click **Delete endpoint** and confirm. Deliveries still waiting
to be retried are cancelled (marked failed with `endpoint deleted`), and the signing secret
is discarded. Saving an endpoint again creates a new secret.

## 2. Choose events

The **Events** checkboxes are a filter. **Leave all unchecked to receive every event.**
Check some to receive only those.

| Event | Sent today? |
|---|---|
| `message.sent` | No |
| `message.delivered` | No |
| `message.failed` | No |
| `message.received` | No |
| `campaign.completed` | No |
| `workflow.completed` | No |

Any other name is rejected when you save. `webhook.test` is not in the filter: a test is
always sent, whatever you have checked.

## 3. Get the signing secret

Saving an endpoint creates a signing secret. It is shown on **Webhooks** under
**Signing secret** to business admins only. Team members see "Only a workspace admin can
view the signing secret."

The secret looks like `whsec_` followed by 64 hex characters. Use the **whole** string,
`whsec_` included, as the HMAC key. Store it with your server's other secrets.

### Rotate the secret

1. Under **Signing secret**, click **Rotate secret**.
2. Confirm with **Rotate secret**.
3. Copy the new secret and deploy it to your server.

The old secret stops verifying on the very next delivery; there is no overlap period. To
avoid rejecting real events during the switch, have your receiver accept a signature from
either the old or the new secret until the deploy is done. A delivery you reject with a
non-2xx is retried, and every retry is signed with the secret current at that moment.

## 4. Verify each request

Each delivery is a `POST` with the event's JSON as the body and these headers:

| Header | Value |
|---|---|
| `Content-Type` | `application/json` |
| `X-KeenVector-Event` | The event name, for example `webhook.test` |
| `X-KeenVector-Delivery` | The delivery's id (a UUID). The same on every retry of one delivery. |
| `X-KeenVector-Signature` | `sha256=` + hex HMAC-SHA256 of the raw body, keyed with your signing secret |

Compute the HMAC over the **raw request body**, before any JSON parsing (re-serialising
changes the bytes), and compare in constant time.

::: code-group

```js [Node.js]
import crypto from 'node:crypto'

// rawBody: Buffer, e.g. from express.raw({ type: 'application/json' })
function isFromKeenVector(rawBody, header, secret) {
  if (typeof header !== 'string') return false
  const expected = 'sha256=' + crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  const a = Buffer.from(header)
  const b = Buffer.from(expected)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}
```

```python [Python]
import hashlib
import hmac

# raw_body: bytes, e.g. request.get_data() in Flask
def is_from_keenvector(raw_body: bytes, header: str | None, secret: str) -> bool:
    if not header:
        return False
    expected = "sha256=" + hmac.new(secret.encode(), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(header, expected)
```

```go [Go]
import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
)

// rawBody: the bytes from io.ReadAll(r.Body)
func isFromKeenVector(rawBody []byte, header, secret string) bool {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(rawBody)
	expected := "sha256=" + hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(header), []byte(expected))
}
```

:::

Reject a request that fails verification with `401` or `403`. Because a non-2xx is retried,
don't return an error for events you simply don't handle: return `200` and ignore them.

## 5. Send a test event

1. Save your endpoint (the button is disabled while you have unsaved changes).
2. Under **Send a test event**, click **Send test**.

KeenVector signs and POSTs a `webhook.test` event right away and shows the result:
"Delivered — your server answered HTTP 200", or "Failed —" with the reason. The body is:

```json
{
  "type": "webhook.test",
  "tenant_id": "6f1c2d3e-…",
  "sent_at": "2026-10-01T09:42:07Z"
}
```

A test is sent once, with no retries, and appears in the delivery log like any other
delivery.

## 6. Read the delivery log

**Recent deliveries** on **Webhooks** lists your newest 50 deliveries:

| Column | Meaning |
|---|---|
| **Event** | The event name. |
| **Status** | `pending` (waiting for a retry), `delivered` (your server answered `2xx`) or `failed` (a test that failed, out of attempts, or cancelled by deleting the endpoint). |
| **HTTP** | The status your server last answered, or "—" if there was no answer (timeout, connection error). |
| **Attempts** | Attempts made so far. |
| **Last error** | Why the last attempt failed, for example `endpoint answered HTTP 500 Internal Server Error`. |
| **When** | When the delivery was created, or for a `pending` one, when the next retry is due. |

## Delivery and retries

- Answer with any `2xx` within **10 seconds**. That counts as delivered.
- Anything else (non-2xx, timeout, connection error) is retried. There are **6 attempts**
  in total: the first at once, then retries about 2, 4, 8, 16 and 32 minutes after each
  failure (retries are picked up by a scan that runs every 30 seconds). After the sixth
  failure the delivery is marked `failed`.
- Every attempt sends the exact same bytes, so a signature you verified once verifies again
  (as long as the secret was not rotated in between).

::: tip At-least-once: dedupe on X-KeenVector-Delivery
Delivery is **at-least-once**. The same delivery can reach you more than once, for example
if your `2xx` arrives after the 10-second timeout. Store each `X-KeenVector-Delivery` value
you have processed and skip repeats. Each test send has its own id.
:::

## What is sent today

Only `webhook.test`, from **Send test**. No KeenVector service sends message, campaign or
workflow events to this pipeline yet. When one does, this page will document its payload
and the [changelog](/api/changelog) will say so. Until then:

- For message status, poll [`GET /v1/messages`](/api/messages).
- To act on inbound messages, website leads or new contacts, build a
  [workflow](/api/workflows).
