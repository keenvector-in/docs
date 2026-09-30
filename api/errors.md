# Errors

Most errors return a JSON body:

```json
{ "error_code": "invalid_request", "message": "subject is required on email: a message with no subject is filed as spam by most receivers" }
```

Write your code against `error_code`, which is stable. `message` is for people. It
says what to change, and its wording can change.

::: warning Not every error is JSON yet
Some errors return a **plain-text** body (`Content-Type: text/plain`) with no
`error_code`:

- `400` when the request body is not valid JSON, or `channel`, `to` or `body` is missing.
- `400` when `before` on `GET /v1/messages` is not a message id.
- `500` for unexpected server errors, including a problem reaching KeenVector's auth
  service.

Your client should check `Content-Type` before parsing, and fall back to the HTTP status
and raw text.
:::

## Error codes on `/v1/messages`

| HTTP | `error_code` | Meaning | What to do |
|---|---|---|---|
| 400 | `invalid_request` | Unsupported `channel`, `subject` missing on email, or `subject` sent on WhatsApp. | Fix the request. `message` says how. |
| 401 | `missing_api_key` | No `Authorization: Bearer …` header. | Add the header. |
| 401 | `invalid_api_key` | The key is unknown or revoked. | Use a valid key. See [Authentication](/api/authentication). |
| 503 | `queue_unavailable` | The message was not queued and nothing was sent. | Retry with the same `Idempotency-Key`. |

The connection endpoints (`/whatsapp/connections`, `/instagram/connections`) also return
`invalid_request` when a required field is missing, plus channel-specific codes. See
[WhatsApp](/api/channels/whatsapp) and [Instagram](/api/channels/instagram).

## Send failures are not HTTP errors

A `202` only means the message was queued. If the provider later refuses it, or there
is no WhatsApp connection or verified email domain, the message becomes `Status: "FAILED"`
with a human-readable `Error`. Check this with `GET /v1/messages`. See
[Messages § Status lifecycle](/api/messages#status-lifecycle).

## Retry guidance

| Response | Retry? |
|---|---|
| `4xx` | No. Change the request first. |
| `503`, `500`, timeout or connection error | Yes, with backoff and the **same** `Idempotency-Key`. See [Idempotency](/api/idempotency). |

There is no `429` today. See [Rate limits](/api/rate-limits).
