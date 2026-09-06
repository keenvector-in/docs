# Rate limits

**Not enforced yet.** The platform has a `ratelimit` library reserved for this
(`libs/core/ratelimit` in the backend) but no service currently wires it into the request
path — there is no `429` response and no `Retry-After` header today.

This page will be filled in with real limits (requests/second per tenant, burst
allowance, the exact `429` error shape) once rate limiting ships. Until then:

- Don't rely on the absence of a limit — it's an implementation gap, not a guarantee.
- Keep sends reasonably paced client-side, especially bulk sends — see
  [Campaigns](/api/reference#campaigns) for the one bulk-send path that exists today.
- [`Idempotency-Key`](/api/messages#idempotency-key-header) already protects you from
  duplicate sends on retry, independent of rate limiting.
