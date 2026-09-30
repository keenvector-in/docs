# Authentication

Send your API key as a bearer token on every request:

```http
Authorization: Bearer kv_live_3f9c…
```

A key looks like `kv_live_` followed by 64 hex characters. It identifies your tenant, and
every message you send or list is scoped to that tenant. There are no sessions, cookies or
OAuth. The `Bearer ` prefix is case-sensitive.

The key works on `/v1/messages`, `/whatsapp/connections` and `/instagram/connections`.

## Managing keys in the console

Keys live on the console's **API keys** page at `/developer` (see
[Developer pages in the console](/api/#developer-pages-in-the-console)). Every key acts for
your whole tenant.

| Who | Can |
|---|---|
| Business admin | See keys, create keys, revoke keys |
| Team member (business user) | See the key list only |

### Create a key

1. On **API keys**, click **Create key**.
2. Enter a **Name** (optional, up to 64 characters), for example "Order service
   (production)". A key without a name is listed as "Untitled key".
3. Click **Create key**, copy the key and click **Done**.

KeenVector stores only a hash of each key, so the full key is shown once, when you create
it. A lost key cannot be recovered. Create a new one instead.

### The key list

Each key is listed with its **Name**, a **Key** column showing only its display prefix,
**Created**, and **Status** (**Active**, or **Revoked** with the date). The display prefix is
`kv_live_` plus the key's first four hex characters, for example `kv_live_3f9c••••••••`,
which is enough to tell your keys apart and useless to anyone else. Revoked keys stay in
the list.

### Revoke a key

1. Click **Revoke** on the key's row.
2. Confirm with **Revoke key**.

The key stops working immediately. Requests that use it get `401 invalid_api_key`.

For local development against your own stack, see
[Quickstart § Get an API key](/api/quickstart#_1-get-an-api-key).

## Keys belong on your server

Call the API only from your backend. `message-api` sends **no CORS headers on
purpose**, so browsers block cross-origin calls from web pages. Also keep keys out of
mobile apps and anything else you ship to users. Anyone who can read the key can send as
your business.

## Rotating a key

A tenant can have several active keys at once, so you can rotate without downtime:

1. Create a new key on **API keys**.
2. Deploy it and confirm your requests succeed with it.
3. Revoke the old key. Revocation takes effect immediately.

If a key leaks, revoke it straight away, then create and deploy a replacement.

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
