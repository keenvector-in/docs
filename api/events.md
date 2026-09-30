# Events (outbound webhooks)

Outbound webhooks are KeenVector POSTing events to an HTTPS endpoint on **your** server.
For the other direction (Meta calling KeenVector), see
[Receiving provider webhooks](/api/receiving-webhooks).

::: warning Not available yet
The delivery machinery exists: signing, retries and a delivery log. What's missing:

- **No way to register an endpoint.** There's no console page or public API to set your
  URL and signing secret.
- **No service sends events.** Nothing on the platform emits events to this pipeline yet.
- **No event catalogue.** Event names and payload shapes aren't defined.

Until then you can't receive anything. This page describes how delivery works so you can
build your receiver in advance. To react to incoming messages today, use a
[workflow](/api/workflows).
:::

## How a delivery will look

Each event is a `POST` with the event's JSON as the body and these headers:

| Header | Value |
|---|---|
| `Content-Type` | `application/json` |
| `X-KeenVector-Event` | the event name |
| `X-KeenVector-Signature` | `sha256=` + hex HMAC-SHA256 of the raw body, keyed with your endpoint's signing secret |

There is no delivery-id header. If you need to dedupe, use an id in the payload once the
event catalogue defines one.

## Delivery and retries

- Answer with any `2xx` within **10 seconds**. That counts as delivered.
- Anything else (non-2xx, timeout, connection error) is retried. There are **6 attempts**
  in total: the first at once, then retries after 2, 4, 8, 16 and 32 minutes. After the
  sixth failure the delivery is marked failed.
- Delivery is **at-least-once**. The same event can reach you more than once, so your
  handler must be safe to run twice.
- Every attempt sends the exact same bytes, so a signature you verified once verifies again.

## Verify the signature

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
