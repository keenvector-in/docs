# Authentication

Send your API key as a bearer token on every request:

```http
Authorization: Bearer kv_live_3f9c…
```

A key looks like `kv_live_` followed by 64 hex characters. It identifies your tenant, and
every message you send or list is scoped to that tenant. There are no sessions, cookies or
OAuth. The `Bearer ` prefix is case-sensitive.

The key works on `/v1/messages`, `/whatsapp/connections` and `/instagram/connections`.

## Getting a key

KeenVector issues keys for now. Ask your KeenVector contact. Self-serve key management in
the console is **not available yet**.

KeenVector stores only a hash of each key, so the full key is shown once, when it is
issued. A lost key cannot be recovered. You get a new one instead.

For local development against your own stack, see
[Quickstart § Get an API key](/api/quickstart#_1-get-an-api-key).

## Keys belong on your server

Call the API only from your backend. `message-api` sends **no CORS headers on
purpose**, so browsers block cross-origin calls from web pages. Also keep keys out of
mobile apps and anything else you ship to users. Anyone who can read the key can send as
your business.

## Rotating a key

A tenant can have several active keys at once, so you can rotate without downtime:

1. Ask KeenVector to issue a new key for your tenant.
2. Deploy the new key and confirm your requests succeed with it.
3. Ask KeenVector to revoke the old key. Revocation takes effect immediately.

If a key leaks, ask for it to be revoked straight away, then rotate.

Keys do not expire. They stay valid until revoked.

## Errors

| HTTP | `error_code` | When |
|---|---|---|
| 401 | `missing_api_key` | No `Authorization` header, or it does not start with `Bearer `. |
| 401 | `invalid_api_key` | The key does not exist or has been revoked. |

```json
{ "error_code": "invalid_api_key", "message": "the api key is invalid or revoked" }
```

::: info Check order on POST /v1/messages
The header is checked first. The key itself is verified **after** the request body is
parsed. So a request with a bad key *and* a malformed body gets the plain-text `400` for
the body, not the `401`. See [Errors](/api/errors).
:::
