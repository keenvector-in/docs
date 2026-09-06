# SDKs

No official client libraries yet — call the HTTP API directly.

The [interactive API reference](/reference.html) generates request snippets in cURL,
JavaScript, Python, Go, and more for every endpoint straight from the
[OpenAPI spec](/openapi.yaml) (via the language picker on each endpoint), so they can't
drift out of sync with the documented request/response shape the way hand-written examples
can.

A couple of starting points, kept minimal on purpose:

::: code-group

```bash [cURL]
curl -X POST https://api.keenvector.in/v1/messages \
  -H "Authorization: Bearer kv_live_..." \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: order-4471-confirmation" \
  -d '{"channel":"whatsapp","to":"919876543210","body":"Hello!"}'
```

```js [Node.js]
const res = await fetch('https://api.keenvector.in/v1/messages', {
  method: 'POST',
  headers: {
    Authorization: 'Bearer kv_live_...',
    'Content-Type': 'application/json',
    'Idempotency-Key': 'order-4471-confirmation',
  },
  body: JSON.stringify({ channel: 'whatsapp', to: '919876543210', body: 'Hello!' }),
})
const message = await res.json()
```

```ts [TypeScript]
interface SendMessageRequest {
  channel: 'whatsapp'
  to: string
  body: string
}

interface Message {
  ID: string
  Status: 'QUEUED' | 'SENT' | 'FAILED'
  ProviderMessageID: string
  CreatedAt: string
}

async function sendMessage(apiKey: string, req: SendMessageRequest): Promise<Message> {
  const res = await fetch('https://api.keenvector.in/v1/messages', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Idempotency-Key': crypto.randomUUID(),
    },
    body: JSON.stringify(req),
  })
  if (!res.ok) throw new Error(`keenvector: ${res.status} ${await res.text()}`)
  return res.json()
}
```

```go [Go]
req, _ := http.NewRequest(http.MethodPost, "https://api.keenvector.in/v1/messages",
	strings.NewReader(`{"channel":"whatsapp","to":"919876543210","body":"Hello!"}`))
req.Header.Set("Authorization", "Bearer kv_live_...")
req.Header.Set("Content-Type", "application/json")
req.Header.Set("Idempotency-Key", "order-4471-confirmation")

resp, err := http.DefaultClient.Do(req)
```

```python [Python]
import requests

resp = requests.post(
    "https://api.keenvector.in/v1/messages",
    headers={
        "Authorization": "Bearer kv_live_...",
        "Idempotency-Key": "order-4471-confirmation",
    },
    json={"channel": "whatsapp", "to": "919876543210", "body": "Hello!"},
)
message = resp.json()
```

:::

Want a maintained SDK for your language? Talk to your account team.
