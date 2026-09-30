# Rate limits

::: warning Not enforced yet
KeenVector does not apply rate limits to `/v1/messages` today. There is no `429`
response and no `Retry-After` header. This is a gap that will close, not a guarantee.
When limits ship, this page and the [changelog](/api/changelog) will say what they are.
:::

The channels still have limits of their own:

- **WhatsApp:** Meta limits how fast each phone number can send, and how many new customers
  a business can start conversations with per day, based on your account's messaging tier.
  Free-form text also only reaches people inside the 24-hour customer window. These limits
  show up as `FAILED` messages, not as HTTP errors.
- **Email:** receiving mail servers throttle or reject senders that ramp up too fast.
  Addresses that hard-bounce, complain or unsubscribe are suppressed, and later sends to
  them fail.

Until limits are enforced:

- Pace bulk sends on your side, and back off with jitter when you see `5xx` or a rise
  in `FAILED` messages.
- Retry with the same [`Idempotency-Key`](/api/idempotency) so backoff never causes
  duplicates.
