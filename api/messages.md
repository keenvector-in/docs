# Messages

Send a message with `POST /v1/messages`. Read status back with `GET /v1/messages`. Both
need an [API key](/api/authentication).

## `POST /v1/messages`

```bash
curl -X POST "$KV_BASE_URL/v1/messages" \
  -H "Authorization: Bearer $KV_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: order-4471-shipped" \
  -d '{"channel": "whatsapp", "to": "919876543210", "body": "Your order #4471 has shipped."}'
```

```js
// Node 18+
const res = await fetch(`${process.env.KV_BASE_URL}/v1/messages`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.KV_API_KEY}`,
    "Content-Type": "application/json",
    "Idempotency-Key": "order-4471-shipped",
  },
  body: JSON.stringify({ channel: "email", to: "asha@example.com", subject: "Order #4471 shipped", body: "Hi Asha, ..." }),
});
const msg = await res.json(); // 202: msg.ID, msg.Status === "QUEUED"
```

### Request body

| Field | Type | Required | Notes |
|---|---|---|---|
| `channel` | string | yes | `"whatsapp"` or `"email"`. Any other value is a `400 invalid_request`. |
| `to` | string | yes | WhatsApp: the recipient's phone number with country code, for example `919876543210`. Email: a single address, for example `asha@example.com`, with no display name and no list. |
| `body` | string | yes | Message text. Email is sent as plain text. |
| `subject` | string | email only | **Required** for `email`. **Rejected** for `whatsapp` (`400`: "whatsapp has no subject line — put everything in body"). Leading and trailing spaces are trimmed. |

Unknown fields are ignored. KeenVector does not check the format of `to` or the length of
`body` when it accepts the request. The channel worker checks them, and a bad value makes
the message `FAILED` rather than returning a `400`. Email limits applied by the worker:
subject up to 200 characters, body up to 256 KiB.

### Headers

| Header | Required | Notes |
|---|---|---|
| `Authorization` | yes | `Bearer kv_live_...` |
| `Content-Type` | recommended | `application/json` |
| `Idempotency-Key` | recommended | Makes retries safe. See below. |

### `Idempotency-Key` header

If you send the same key again within 2 hours, you get the original message back and
nothing is sent twice. Use one key per logical message, and reuse it on every retry. The
full rules are in [Idempotency](/api/idempotency).

### Response: `202 Accepted`

```json
{
  "ID": "01928f3a-7c2e-7b4a-9d61-3f0a8c2e5b17",
  "TenantID": "6f1d2c9e-…",
  "IdempotencyKey": "order-4471-shipped",
  "Channel": "whatsapp",
  "To": "919876543210",
  "Subject": "",
  "Body": "Your order #4471 has shipped.",
  "Status": "QUEUED",
  "ProviderMessageID": "",
  "Error": "",
  "CreatedAt": "2026-09-30T09:42:07.123456Z"
}
```

| Field | Notes |
|---|---|
| `ID` | Message id (UUIDv7, so ids sort by creation time). Used as the [pagination](/api/pagination) cursor. |
| `TenantID` | Your tenant. |
| `IdempotencyKey` | The key you sent, or `""`. |
| `Channel`, `To`, `Subject`, `Body` | What you sent. `Subject` is `""` except on email. |
| `Status` | `QUEUED`, `SENT` or `FAILED`. |
| `ProviderMessageID` | The provider's id once sent, for example a WhatsApp `wamid.…`. Empty until then. |
| `Error` | Why it failed, when `Status` is `FAILED`. Human-readable text, not a stable code. |
| `CreatedAt` | RFC 3339 timestamp. |

`202` means the message is stored and queued. The request never waits for the provider.

::: warning Field names will change before GA
Response keys are currently Go-style PascalCase (`ID`, `ProviderMessageID`, …). They will
move to snake_case (`id`, `provider_message_id`, …) before general availability. That
change will be announced in the [changelog](/api/changelog). See
[Versioning](/api/versioning). Access fields in one place in your code so the switch
is easy.
:::

::: warning `Subject` can come back empty
On an idempotent replay and in `GET /v1/messages`, `Subject` is currently returned as `""`
even for email. The subject that was stored and sent is correct. Only the read-back
is missing it.
:::

### Status lifecycle

```text
QUEUED ──▶ SENT      provider accepted the message
       └─▶ FAILED    not sent; see Error
```

- `SENT` means Meta or the receiving mail server accepted the message. It does **not**
  confirm delivery or a read. For WhatsApp free-form text sent outside the 24-hour customer
  window, Meta can accept it (so it shows `SENT`) and then not deliver it.
- Common `FAILED` reasons: no WhatsApp connection, no verified email domain, a suppressed
  email address, an invalid address, or a provider rejection.
- Delivered and read receipts are not available through the API yet. See
  [Events](/api/events).

### Errors

| HTTP | Body | When |
|---|---|---|
| 400 | plain text | The body is not valid JSON, or `channel`, `to` or `body` is missing. |
| 400 | `invalid_request` | Unsupported `channel`, `subject` missing on email, or `subject` present on WhatsApp. |
| 401 | `missing_api_key` / `invalid_api_key` | See [Authentication](/api/authentication). |
| 503 | `queue_unavailable` | Not queued and nothing sent. Retry with the same `Idempotency-Key`. |
| 500 | plain text | Unexpected server error. Retry with the same `Idempotency-Key`. |

See [Errors](/api/errors).

## `GET /v1/messages`

Lists your tenant's messages, newest first.

```bash
curl "$KV_BASE_URL/v1/messages?limit=50" -H "Authorization: Bearer $KV_API_KEY"
```

| Query | Notes |
|---|---|
| `limit` | Default `50`, maximum `200`. Values above 200 are capped. Zero, negative or non-numeric values use the default. |
| `before` | A message `ID`. Returns messages older than that one. Must be a UUID, otherwise you get a plain-text `400` ("before must be a message id"). |

The response is `200` with a JSON array of messages, shaped like the send response. An
empty page is `[]`. There is no filter by status or channel, and there is no
`GET /v1/messages/{id}`. To find one message, page through until you see its `ID`. See
[Pagination](/api/pagination).
