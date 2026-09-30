# Code samples

There are no official client libraries yet — call the HTTP API directly. The
[interactive API reference](/reference.html) also generates a request snippet for every
endpoint, in any language, straight from the [OpenAPI spec](/openapi.yaml).

The console's **SDK & code samples** page (`/developer/sdk`, see
[Developer pages in the console](/api/#developer-pages-in-the-console)) has the same send
request in cURL, Node.js, Python and Go, filled in with your API base URL, plus
signature-verification snippets for [events](/api/events#_4-verify-each-request). Its
samples read the key from `KEENVECTOR_API_KEY`; the ones below use `KV_API_KEY`.

All samples read the base URL from `KV_BASE_URL` (see [Environments](/api/environments)) and
the key from `KV_API_KEY`. Keys are server-side only — never ship one to a browser or app.

## Send a message

::: code-group

```bash [cURL]
curl -X POST "$KV_BASE_URL/v1/messages" \
  -H "Authorization: Bearer $KV_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: order-4471-shipped" \
  -d '{"channel":"whatsapp","to":"919876543210","body":"Your order #4471 has shipped."}'
```

```js [Node.js]
const res = await fetch(`${process.env.KV_BASE_URL}/v1/messages`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${process.env.KV_API_KEY}`,
    'Content-Type': 'application/json',
    'Idempotency-Key': 'order-4471-shipped',
  },
  body: JSON.stringify({ channel: 'whatsapp', to: '919876543210', body: 'Your order #4471 has shipped.' }),
})
const message = await res.json() // 202 → { ID, Status: "QUEUED", ... }
```

```python [Python]
import os, requests

resp = requests.post(
    f"{os.environ['KV_BASE_URL']}/v1/messages",
    headers={
        "Authorization": f"Bearer {os.environ['KV_API_KEY']}",
        "Idempotency-Key": "order-4471-shipped",
    },
    json={"channel": "email", "to": "asha@example.com",
          "subject": "Order #4471 shipped", "body": "Your order is on its way."},
)
message = resp.json()  # 202 → {"ID": ..., "Status": "QUEUED", ...}
```

```go [Go]
body := strings.NewReader(`{"channel":"whatsapp","to":"919876543210","body":"Your order #4471 has shipped."}`)
req, _ := http.NewRequest(http.MethodPost, os.Getenv("KV_BASE_URL")+"/v1/messages", body)
req.Header.Set("Authorization", "Bearer "+os.Getenv("KV_API_KEY"))
req.Header.Set("Content-Type", "application/json")
req.Header.Set("Idempotency-Key", "order-4471-shipped")
resp, err := http.DefaultClient.Do(req)
```

:::

## A small client with safe retries (TypeScript)

The idempotency key comes from **your** business event and is reused on every retry, so a
retry after a timeout can never send twice. Some errors are still plain text, so the client
reads the body as text before trying JSON ([Errors](/api/errors)).

```ts
type Channel = 'whatsapp' | 'email'

interface SendMessageRequest {
  channel: Channel
  to: string
  body: string
  subject?: string // required for email, rejected for whatsapp
}

// Field names are Go-style today; they move to snake_case before GA (see Versioning).
interface Message {
  ID: string
  Channel: Channel
  To: string
  Status: 'QUEUED' | 'SENT' | 'FAILED'
  ProviderMessageID: string
  Error: string
  CreatedAt: string
}

class KeenVectorError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message)
  }
}

async function sendMessage(req: SendMessageRequest, idempotencyKey: string, attempts = 3): Promise<Message> {
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`${process.env.KV_BASE_URL}/v1/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.KV_API_KEY}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(req),
    })
    const text = await res.text()
    if (res.ok) return JSON.parse(text) as Message

    let code = 'unknown', message = text
    try {
      const err = JSON.parse(text)
      code = err.error_code ?? code
      message = err.message ?? message
    } catch {
      // plain-text error body
    }
    // 5xx (including 503 queue_unavailable) is safe to retry with the same key; 4xx means fix the request.
    if (res.status >= 500 && attempt < attempts) {
      await new Promise((r) => setTimeout(r, 2 ** attempt * 500))
      continue
    }
    throw new KeenVectorError(res.status, code, message)
  }
}

// One key per business event, reused across retries:
await sendMessage({ channel: 'whatsapp', to: '919876543210', body: 'Your order #4471 has shipped.' }, 'order-4471-shipped')
```

## Check delivery status

Subscribe to `message.sent` and `message.failed` on your webhook endpoint
([Events](/api/events)) to be told, or poll:

```bash
curl "$KV_BASE_URL/v1/messages?limit=20" -H "Authorization: Bearer $KV_API_KEY"
```

`Status` moves from `QUEUED` to `SENT` (the provider accepted it) or `FAILED` (with `Error`).
See [Pagination](/api/pagination) to walk older messages.

Want a maintained SDK for your language? Tell your KeenVector contact which one.
