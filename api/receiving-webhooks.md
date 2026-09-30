# Receiving provider webhooks

When a customer messages your WhatsApp number or Instagram account, Meta calls a webhook.
On KeenVector that webhook is **your own Meta app** calling a callback URL that belongs to
your tenant. You give KeenVector your app's secret, KeenVector gives you the callback URL
and a verify token, and you paste those into Meta.

Once it works, incoming messages start your [workflows](/api/workflows) and show up in
the recent-events log below.

::: info Only for your own Meta app
This page is for businesses that [bring their own Meta app](/api/connectors/meta#_2-bring-your-own-meta-app).
When [signing up through KeenVector](/api/connectors/meta#_1-sign-up-through-keenvector-tech-provider)
becomes available, KeenVector's app receives the webhooks and there is nothing to set up here.
:::

## Providers

| `provider` | What it receives | Notes |
|---|---|---|
| `whatsapp` | Inbound messages, delivery receipts (`sent`, `delivered`, `read`, `failed`), template approval decisions | Meta GET handshake + `X-Hub-Signature-256` |
| `instagram` | Inbound Instagram DMs | Same Meta handshake and signature as WhatsApp. The registry also returns the `redirect_uri` for Instagram Business Login, see [Instagram](/api/channels/instagram). |
| `slack` | Slack Events API callbacks | Slack's `url_verification` handshake and timestamped signature. Events are recorded but don't start workflows yet: Slack events carry no sender KeenVector can reply to. |
| `ses` | Amazon SES bounce, complaint and delivery notifications over SNS | Platform-side for the email channel, not something you set up with an app secret. See [Email](/api/channels/email). |

Only inbound **messages** from WhatsApp and Instagram reach workflows. Delivery receipts
and template decisions are recorded (you can see them in [recent events](#check-that-events-arrive))
but nothing else consumes them yet.

## Before you start

- A Meta app with the WhatsApp or Instagram product added, and its **App Secret**
  (Meta App Dashboard → App settings → Basic → App secret → Show).
- A console access token for a **business admin** of your tenant. The registry routes use
  your console session, not an API key: sign in with `POST /api/auth/login` (body
  `{"email": "...", "password": "..."}`) on the console API and use the `access_token` it
  returns. See [Authentication](/api/authentication).
- Your tenant id (it's the `tenant_id` in your access token).

In the examples, `$WEBHOOK_HOST` is KeenVector's webhook host. Your account team gives you
the real one for your environment; when running the stack locally it is `webhook-ingress`
on port `8082`.

::: tip The registry path has no `/webhooks` prefix
Registry routes are `/tenants/{tenantID}/webhook-config/{provider}` on the webhook host.
Provider callbacks are `/webhooks/{provider}/{tenantID}` on the same host.
:::

## 1. Register your app secret

```bash
curl -X POST "$WEBHOOK_HOST/tenants/<tenant-id>/webhook-config/whatsapp" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"app_secret": "<your Meta app secret>"}'
```

```json
{
  "callback_url": "/webhooks/whatsapp/<tenant-id>",
  "redirect_uri": "/oauth/whatsapp/<tenant-id>/callback",
  "verify_token": "<random token>"
}
```

- `callback_url` and `redirect_uri` are paths. Prefix them with `$WEBHOOK_HOST` before
  pasting them anywhere.
- Every `POST` issues a **new** `verify_token` and replaces the stored secret. If you
  register again, paste the new token into Meta too.
- `redirect_uri` is only used by Instagram Business Login. WhatsApp ignores it.
- The app secret is write-only. KeenVector stores it in its secrets store and never returns it.

Only a `business_admin` can register or delete. Any business user can read the config
and recent events.

## 2. Point Meta at KeenVector

1. In the Meta App Dashboard, open your product's webhook settings (for WhatsApp:
   **WhatsApp → Configuration → Webhook**).
2. **Callback URL**: `$WEBHOOK_HOST` + `callback_url`, e.g.
   `https://<webhook-host>/webhooks/whatsapp/<tenant-id>`.
3. **Verify token**: the `verify_token` from step 1.
4. Click **Verify and save**. Meta sends a `GET` with `hub.verify_token`; KeenVector echoes
   `hub.challenge` back only if the token matches.
5. Under the webhook fields, **subscribe to `messages`**. Without it Meta sends nothing.

## 3. Check that events arrive

Send a test from Meta's dashboard (the **Test** button next to the `messages` field), or
message your number from a real phone. Then read the last 20 events KeenVector accepted:

```bash
curl "$WEBHOOK_HOST/tenants/<tenant-id>/webhook-config/whatsapp/recent" \
  -H "Authorization: Bearer <access_token>"
```

```json
[
  {
    "ID": "0b6e4d1c-6a55-4d5f-9b1e-2f0f3c0d9a11",
    "TenantID": "<tenant-id>",
    "Provider": "whatsapp",
    "EventType": "message",
    "ProviderMessageID": "wamid.HBgMOTE3NTc0MDMxNTg2FQIAERgSMzVGM0YxQUY0QTNBMjg2MkQ0AA==",
    "Status": "text",
    "From": "919800000000",
    "Body": "Hi, is this open today?",
    "OccurredAt": "2026-09-06T08:53:11Z",
    "ReceivedAt": "2026-09-06T08:53:12Z"
  }
]
```

Newest first. `EventType` is `message` (an inbound message; `Status` is the message
type), `status` (a delivery receipt; `Status` is `sent`, `delivered`, `read` or `failed`
and `ProviderMessageID` matches the one `POST /v1/messages` returned) or
`template_status` (Meta approved or rejected a template). The response is `null` when
nothing has arrived yet.

Only events whose signature checked out are listed, and a retried duplicate is listed once.
There is no "send test" on KeenVector's side: a request KeenVector signs itself would prove
nothing about the secret in your app. The test is your app calling in.

::: warning Meta holds back real events from unpublished apps
This is Meta's rule, not KeenVector's: while your Meta app is unpublished (Development
mode), only the dashboard test webhooks are delivered. Real customer traffic starts once
the app is published.
:::

## Manage the config

```bash
# Read the callback URL and current verify token again (no new token is issued)
curl "$WEBHOOK_HOST/tenants/<tenant-id>/webhook-config/whatsapp" \
  -H "Authorization: Bearer <access_token>"

# Disconnect: deletes the stored secret and token (204 No Content)
curl -X DELETE "$WEBHOOK_HOST/tenants/<tenant-id>/webhook-config/whatsapp" \
  -H "Authorization: Bearer <access_token>"
```

`GET` returns `404` when the provider isn't registered. After `DELETE`, Meta's calls get
`404` until you register again.

## How KeenVector answers Meta

| Request | Response |
|---|---|
| `GET` handshake, token matches | `200` with `hub.challenge` |
| `GET` handshake, token differs | `403 verify token mismatch` |
| Any call for a tenant/provider that isn't registered | `404` |
| `POST` whose `X-Hub-Signature-256` isn't the HMAC-SHA256 of the body under your app secret | `403 invalid signature` |
| `POST` accepted | `200` |
| `POST` that couldn't be handed on internally | `503`, so Meta retries it |

Meta retries a callback that doesn't get a `200`. KeenVector drops duplicates of events it
already accepted, so a retry never starts a workflow twice for the same message.

## Local development with ngrok

Meta needs a public HTTPS URL. To receive callbacks on a laptop:

1. Run webhook-ingress (port `8082`) and `ngrok http 8082`.
2. Use the ngrok host as `$WEBHOOK_HOST` in the Meta callback URL.
3. Register and verify as above.

A free ngrok URL changes every time ngrok restarts. When it does, Meta keeps calling the old
host and nothing arrives: paste the new callback URL into Meta and click **Verify and save**
again. A reserved ngrok domain avoids this. For Instagram Business Login the stack's
`public_base_url` must also match the host, because it rebuilds the `redirect_uri` from it.

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| **Verify and save** fails | Token mismatch (you re-registered and pasted an old token), or Meta can't reach the URL (wrong host, stale ngrok host, tenant not registered → `404`) | `GET` the config for the current token; check the full callback URL opens from outside your network |
| Meta's delivery log shows `403` | The app secret registered in KeenVector isn't this app's secret (wrong app, or the secret was reset in Meta) | `POST` the current app secret again, then paste the new verify token into Meta |
| Nothing in `/recent` | App unpublished (real events held back), `messages` field not subscribed, or the callback still points at an old ngrok host | Send Meta's dashboard test first; subscribe the field; re-save the callback URL |
| Events in `/recent`, but no workflow ran | No published workflow matches the channel | See [Workflows](/api/workflows) |
