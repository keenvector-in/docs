# Idempotency

Networks fail. If a `POST /v1/messages` times out, you can't tell whether KeenVector got
it. Send an `Idempotency-Key` header, and a retry with the same key cannot send the message
twice.

```http
Idempotency-Key: order-4471-shipped
```

## Rules

- **Scope:** per tenant. Two tenants can use the same key without conflict.
- **Window:** 2 hours from when the original message was created. If you reuse a key within
  the window, you get the **original message** back (`202`, same `ID`, its current
  `Status`) and nothing new is sent. If you reuse it after the window, a new message is
  sent.
- **Different body, same key:** the original message is returned and the new body is
  ignored. The key is checked before anything else in the request, including `channel`
  and `subject` validation. KeenVector does not compare bodies or return an error for a
  mismatch.
- **No key:** every request sends a new message.
- The key is optional. Use any string that is unique per logical message.

## Choosing a key

Generate **one key per logical message** and reuse it on every retry of that message.
Derive it from what you are sending for, like an order id plus the event, or a job id from
your queue. Do **not** generate a fresh random value on each attempt. That turns every
retry into a new message.

```python
import os, requests

def notify_shipped(order):
    key = f"order-{order.id}-shipped"          # same on every retry
    for attempt in range(5):
        try:
            r = requests.post(
                f"{os.environ['KV_BASE_URL']}/v1/messages",
                headers={"Authorization": f"Bearer {os.environ['KV_API_KEY']}",
                         "Idempotency-Key": key},
                json={"channel": "whatsapp", "to": order.phone,
                      "body": f"Order #{order.id} has shipped."},
                timeout=10,
            )
        except requests.RequestException:
            continue                              # unknown outcome: retry, same key
        if r.status_code == 202:
            return r.json()
        if r.status_code < 500:
            r.raise_for_status()                  # 4xx: fix the request, don't retry
        # 5xx (incl. 503 queue_unavailable): retry, same key
        # (add a backoff sleep between attempts)
    raise RuntimeError("send did not go through")
```

## When retrying is safe

| Response | Retry with the same key? |
|---|---|
| Timeout or connection error | Yes. Either the original is returned or it is sent now. |
| `503 queue_unavailable` | Yes. Nothing was stored or sent. |
| `500` (plain text) | Yes. |
| `4xx` | No. Fix the request first. A corrected request with the same key is fine, because a failed request stores nothing under the key. |

::: info Concurrent duplicates
If two requests with the same key arrive at the same moment, one can fail with a plain-text
`500`. Retry it and it returns the original message. Avoid sending the same key in
parallel.
:::

::: info At-least-once in one edge case
If KeenVector's queue does not confirm in time, the send is reported as
`503 queue_unavailable`, but the queue may have taken it anyway. A retry can then send
twice. This is rare, and it is the platform's stated at-least-once behaviour.
:::
