# Quickstart

Send your first message in four steps: get a key, connect a channel, send, and check the
status.

The examples use `$KV_BASE_URL` for the API host and `$KV_API_KEY` for your key. See
[Environments](/api/environments) for the value of `$KV_BASE_URL`.

```bash
export KV_BASE_URL=http://localhost:8085   # local dev; your KeenVector contact gives you the hosted one
export KV_API_KEY=kv_live_...
```

## 1. Get an API key

KeenVector issues API keys for now. Ask your KeenVector contact for a key for your tenant.
Self-serve keys in the console are coming. Until then there is no console screen for this.

If you run the platform locally, mint a key against your local auth-service:

```bash
# from the core-engine repo
go run ./deploy/local/issuekey -tenant <tenant-uuid> -addr localhost:9091
```

The key is printed once. Only its hash is stored, so save it now. See
[Authentication](/api/authentication).

## 2. Connect a channel

Pick one of these.

**WhatsApp.** You need your own WhatsApp Business Account on Meta. Connect it in the
console under **Integrations**, or with your API key:

```bash
curl -X POST "$KV_BASE_URL/whatsapp/connections" \
  -H "Authorization: Bearer $KV_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "waba_id": "<your WABA id>",
    "phone_number_id": "<your phone number id>",
    "access_token": "<Meta access token>"
  }'
```

A `201` returns the connection. Details are in [WhatsApp](/api/channels/whatsapp).

**Email.** In the console, open **Email domains**, add your domain, publish the DNS
record it shows, and wait for it to verify. Mail goes out from `no-reply@<your domain>`.
Details are in [Email](/api/channels/email).

## 3. Send a message

```bash
curl -X POST "$KV_BASE_URL/v1/messages" \
  -H "Authorization: Bearer $KV_API_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: order-4471-shipped" \
  -d '{
    "channel": "whatsapp",
    "to": "919876543210",
    "body": "Hi! Your order #4471 has shipped."
  }'
```

For email, set `"channel": "email"`, use an email address in `to`, and add a `subject`
(it is required for email):

```json
{ "channel": "email", "to": "asha@example.com", "subject": "Order #4471 shipped", "body": "Hi Asha, ..." }
```

The response is `202 Accepted` with the stored message:

```json
{
  "ID": "01928f3a-7c2e-7b4a-9d61-3f0a8c2e5b17",
  "TenantID": "…",
  "IdempotencyKey": "order-4471-shipped",
  "Channel": "whatsapp",
  "To": "919876543210",
  "Subject": "",
  "Body": "Hi! Your order #4471 has shipped.",
  "Status": "QUEUED",
  "ProviderMessageID": "",
  "Error": "",
  "CreatedAt": "2026-09-30T09:42:07.123456Z"
}
```

`202` means the message is queued. It has not been sent yet. Keep the `ID`.

::: warning WhatsApp free-form text needs an open 24-hour window
WhatsApp only delivers free-form text to someone who has messaged your number in the last
24 hours. This is Meta's rule. Outside that window Meta can accept the send, so the
message can still show `SENT`, but Meta does not deliver it. You cannot send templates
through the API yet. To reach someone for the first time, use a campaign or workflow
in the console.
:::

## 4. Check the status

There are no status webhooks yet ([Events](/api/events)), so you poll. `GET /v1/messages`
returns your newest messages first:

```bash
curl "$KV_BASE_URL/v1/messages?limit=20" -H "Authorization: Bearer $KV_API_KEY"
```

Find your `ID` in the list and read `Status`:

| `Status` | Meaning |
|---|---|
| `QUEUED` | Accepted and waiting for the channel worker. |
| `SENT` | The provider (Meta or the receiving mail server) accepted it. This does not confirm delivery. |
| `FAILED` | It was not sent. `Error` says why, for example no WhatsApp connection, no verified email domain, or the provider refused it. |

Next: [Messages](/api/messages) for the full reference, and [Idempotency](/api/idempotency)
before you add retries.
