# Authentication

Every API request is authenticated with a bearer API key:

```
Authorization: Bearer kv_live_...
```

There's no session, no cookie, no OAuth dance — the key **is** the credential, scoped to
your business (tenant).

## Getting a key

Your account team issues your first key when your workspace is set up. Self-serve key
management (generate, list, revoke from a dashboard) is planned but not live yet.

## Rotating a key

Generate a new key and switch your integration over to it, then revoke the old one.
Revocation is immediate — the old key stops working on your very next request.

## Keeping it safe

- Never put an API key in client-side code (a mobile app, a browser). Anyone who can read
  your JavaScript can read your key. Call KeenVector from your own backend only.
- If a key leaks — committed to a public repo, pasted somewhere it shouldn't be — revoke it
  immediately and rotate. There's no way to see whether a leaked key has already been used
  maliciously, only to make sure it can't be used again.
- One key per environment (staging vs. production) makes it easy to tell which side of a
  leak or bug you're dealing with.

## Errors

| HTTP | Meaning |
|---|---|
| `401 missing_api_key` | No `Authorization` header on the request |
| `401 invalid_api_key` | The key doesn't exist, or has been revoked |
