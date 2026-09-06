# Sending messages

## `POST /v1/messages`

```bash
curl -X POST https://api.keenvector.in/v1/messages \
  -H "Authorization: Bearer kv_live_..." \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: <unique per request>" \
  -d '{
    "channel": "whatsapp",
    "to": "919876543210",
    "body": "Hello!"
  }'
```

### Request fields

| Field | Type | Required | Notes |
|---|---|---|---|
| `channel` | string | yes | `"whatsapp"` today; more channels are planned |
| `to` | string | yes | Recipient's number in international format, digits only — `919876543210`, not `+91 98765 43210` |
| `body` | string | yes | Free-form text. Only deliverable inside WhatsApp's 24h session window — see [Connecting WhatsApp § Templates](/api/channels/whatsapp#templates) for reaching someone outside it |

### `Idempotency-Key` header

Optional, strongly recommended for anything triggered by a retryable action (a webhook
handler, a queue consumer, a "did that request actually go through?" retry). Reusing the
same key for the same business within 24 hours returns the **original** result — the
message is never sent twice.

Pick a key that's naturally unique to the event you're sending for — an order id, a queue
message id — not a random value generated fresh on every attempt, or it stops protecting
you.

### Response

`201 Created`:

```json
{
  "ID": "e6b4ce10-d887-4b22-8e5a-e4892eff8546",
  "TenantID": "...",
  "IdempotencyKey": "order-4471-confirmation",
  "Channel": "whatsapp",
  "To": "919876543210",
  "Body": "Hello!",
  "Status": "SENT",
  "ProviderMessageID": "wamid.HBgMOTE...",
  "Error": "",
  "CreatedAt": "2026-09-06T09:42:07Z"
}
```

**A `201` means we accepted and forwarded your request — not that WhatsApp delivered it.**
Check `Status`:

| `Status` | Meaning |
|---|---|
| `SENT` | WhatsApp accepted the message for delivery |
| `FAILED` | WhatsApp rejected it — see `Error` for why. Most common cause: sending free-form text outside the 24h session window |

For the actual delivered/read status, subscribe to [Webhooks](/api/webhooks) —
sending and delivery are two different events, on purpose, because delivery can take
seconds and your request shouldn't wait for it.

### Errors

| HTTP | `error_code` | Meaning |
|---|---|---|
| 401 | `missing_api_key` / `invalid_api_key` | see [Authentication](/api/authentication) |
| 400 | `invalid_request` | e.g. unsupported `channel`, or a missing required field |
| 502 | `send_failed` | We reached WhatsApp and it rejected the request outright (not the same as a `FAILED` status on an otherwise-accepted message — this is for requests WhatsApp wouldn't even queue) |

## `GET /v1/messages`

Lists your business's messages, newest first.

```bash
curl https://api.keenvector.in/v1/messages -H "Authorization: Bearer kv_live_..."
```
