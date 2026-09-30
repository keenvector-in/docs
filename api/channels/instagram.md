# Instagram

Connect your Instagram professional account to receive direct messages and answer them
from workflows.

::: tip Two ways to set up Meta
**Sign up through KeenVector** (one link, KeenVector is the Meta Tech Provider — not available
yet) or **bring your own Meta app** (available today, the path this page describes). Compare them
in [Connect WhatsApp & Instagram: two ways](/api/connectors/meta).
:::

## What you need

- An Instagram **professional** account (Business or Creator).
- A webhook registration for the `instagram` provider. The console's connect button reads
  the OAuth redirect URI from it, and inbound DMs arrive through it. See
  [Receiving provider webhooks](/api/receiving-webhooks).

## Connect

### In the console

1. Go to **Integrations** and select **Connect Instagram**. Only a business admin sees
   this button.
2. Instagram's own login page opens. Sign in and approve access. The console requests the
   `instagram_business_basic` and `instagram_business_manage_messages` permissions.
3. You return to **Integrations**. The card shows **connected** once KeenVector confirms
   the connection.

KeenVector exchanges the login code for a long-lived token on its servers. The token never
passes through your browser. It also subscribes your account to message webhooks.

If you see the error "instagram isn't registered with webhook-ingress yet", complete the
webhook registration first.

### With the API

If you already have an access token for your account, connect it directly:

```bash
curl -X POST "$KV_BASE_URL/instagram/connections" \
  -H "Authorization: Bearer kv_live_..." \
  -H "Content-Type: application/json" \
  -d '{
    "ig_user_id": "<your Instagram professional account id>",
    "access_token": "<token with messaging permission>"
  }'
```

`201 Created`:

```json
{ "tenant_id": "…", "ig_user_id": "<id>", "status": "CONNECTED" }
```

Both fields are required. A missing field returns `400 invalid_request`. Call the endpoint
again with a new token to replace the stored one.

::: warning The API stores the token as given
Unlike the console login, `POST /instagram/connections` doesn't exchange the token for a
long-lived one and doesn't subscribe your account to webhooks. Subscribe the account
yourself in your Instagram app.
:::

Check and remove the connection:

```bash
curl "$KV_BASE_URL/instagram/connections" -H "Authorization: Bearer kv_live_..."
curl -X DELETE "$KV_BASE_URL/instagram/connections" -H "Authorization: Bearer kv_live_..."
```

`GET` returns the connection with `200`, or `404 instagram_not_connected` if nothing is
connected. `DELETE` returns `204`, deletes the stored token and leaves it valid at
Instagram.

| Status | Meaning |
|---|---|
| `CONNECTED` | Ready. |
| `REAUTH_REQUIRED` | Instagram rejected the token with a `401`. Connect again. |

::: warning Tokens are not renewed
A long-lived Instagram token lasts about 60 days, and KeenVector doesn't renew it yet.
When it expires, the connection turns `REAUTH_REQUIRED` and you need to connect again. If
the long-lived exchange fails during the console login, the short-lived token is stored.
It lasts about an hour.
:::

## Receive DMs

Instagram delivers DMs to your webhook URL for the `instagram` provider. The URL uses the
same Meta signature and verify-token handshake as WhatsApp. See
[Receiving provider webhooks](/api/receiving-webhooks). KeenVector ignores echoes of your
own outbound messages.

Each inbound text DM starts your published workflows that use the **Incoming Message**
trigger for Instagram. The sender is identified by their Instagram-scoped ID (IGSID) and
filed as a contact.

## Send

::: warning Not available: `POST /v1/messages`
`/v1/messages` doesn't accept `"channel": "instagram"`. It returns
`400 invalid_request` ("unsupported channel").
:::

Instagram messages go out only from [workflows](/api/workflows):

- **Reply** answers a DM on Instagram, to the person who sent it.
- **Send Instagram** appears in the builder but can't run yet. A workflow that contains it
  can't be published.

Instagram lets a business message someone only after that person messages first, and only
within 24 hours of their last message. A reply outside that window fails.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| "Instagram login was cancelled" | You declined on Instagram's page | Start again from **Integrations** |
| "this login link is invalid or expired" | The sign-in state expired or was reused | Start again from **Integrations** and don't reuse an old tab |
| "Instagram isn't connected yet" after a successful login | The connection didn't save | Try again. The console only reports success when the stored status is `CONNECTED` |
| No DMs arrive | The webhook isn't registered, or the account isn't subscribed (connections made through the API) | Check [Receiving provider webhooks](/api/receiving-webhooks), and reconnect through the console to subscribe |
| Webhook deliveries fail with `403` | Wrong app secret in the registration | Register again with the current secret |
| Status is `REAUTH_REQUIRED` | The token expired or was revoked | Connect again |
