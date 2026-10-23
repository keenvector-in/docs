# Email

Send plain-text email from your own domain. You prove you own the domain by publishing one
DNS record. KeenVector signs every message with a DKIM key for that domain.

## 1. Verify a sending domain

Domains are managed in the console under **Email domains** (`/settings/email`). There is no
API-key endpoint for this step. Only a business admin can add, rotate or remove a domain.
Anyone on the team can use **Check now**.

1. **Add the domain.** Enter it and select **Add domain**. A subdomain such as
   `mail.acme.com` is the safer choice because it leaves your main domain's mail
   untouched. Adding a domain that's already on the list returns the same record. You can
   have up to 25 domains.
2. **Publish the record** that the console shows at your DNS provider:

   | Type | Name | Value |
   |---|---|---|
   | `TXT` | `kv1._domainkey.mail.acme.com` | `v=DKIM1; k=rsa; p=MIIBIjANBg…` |

   The console gives the exact name and value, with a copy button. This one DKIM record is
   all you publish. KeenVector doesn't ask you to change SPF.
3. **Wait for verification.** KeenVector looks up the record every 5 minutes, for up to 14
   days after you add the domain. You can also select **Check now** at any time. DNS
   changes can take up to an hour to appear.

| Status | Meaning |
|---|---|
| `pending` | The record hasn't been found yet. The card shows why: no TXT record at that name yet, the record isn't a DKIM key, or the key differs (often truncated by a DNS console). |
| `verified` | Ready to send. |
| `failed` | The domain was verified, and then its record disappeared. Email from it is stopped until the record is back. |

### Rotate the key

On a verified domain, select **Rotate key**. You get a second record (`kv2._domainkey…`) to
publish next to the live one. Email keeps signing with the old key until the new record
resolves. The new key then takes over, and after that you can delete the old record. Only
one rotation can run at a time.

### Remove a domain

**Remove** stops email from that domain at once and deletes its signing key. If you add the
domain again, you get a new record to publish.

## 2. Send

```bash
curl -X POST "$KV_BASE_URL/v1/messages" \
  -H "Authorization: Bearer kv_live_..." \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: invoice-5531" \
  -d '{
    "channel": "email",
    "to": "priya@example.com",
    "subject": "Your invoice #5531",
    "body": "Hi Priya,\n\nYour invoice is attached to your account.\n"
  }'
```

- `subject` is required on email: 1 to 200 characters.
- `body` is plain text, up to 256 KiB. HTML isn't supported.
- `to` is one address per request.
- The message is sent **from `no-reply@<your verified domain>`**, with no display name. If
  you have several verified domains, KeenVector picks one; you can't choose it per
  message.
- The response is `202 Accepted` with status `QUEUED`. The status then moves to `SENT` or
  `FAILED`. Most email refusals show up here as `FAILED` with a reason, not as a `400`.
  Examples are no verified domain, a suppressed recipient, and an address with no `@`. See
  [Messages](/api/messages).

::: warning Not available yet
- **Templates.** Email has no templates. Put the full text in `body`.
- **Receiving email.** There's no inbound email.
- **Choosing the From address or name.**
:::

## Unsubscribe and suppression

Every email carries one-click unsubscribe headers (`List-Unsubscribe` and
`List-Unsubscribe-Post`, per RFC 8058) when the platform's public URL is configured. They
point to:

- `POST /public/email/unsubscribe/{token}` unsubscribes. Mail clients send this for
  one-click unsubscribe.
- `GET /public/email/unsubscribe/{token}` only shows a confirmation page with an
  **Unsubscribe** button. It doesn't unsubscribe by itself, so link scanners can't
  unsubscribe people.

The token is signed and names your business and the recipient, so nobody can unsubscribe
someone else.

An unsubscribed address is **suppressed** for your business. Every later email to it fails
with a reason that says it's suppressed. Suppression is per business: it doesn't affect
other KeenVector customers.

KeenVector also suppresses an address when the mail relay (Amazon SES) reports a
**permanent bounce** or a **spam complaint**. A temporary bounce, such as a full mailbox,
doesn't suppress the address.

::: warning Not available yet
- There's no API or console screen to list suppressed addresses or remove a suppression.
- Bounces and complaints aren't reported back to you as events.
- Bounce and complaint intake depends on platform-side notification setup. Ask your
  account team whether it's active for your account.
:::

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `400` "subject is required on email" | `subject` is missing or blank | Add a subject |
| `FAILED`: "no verified sending domain" | No domain is `verified` yet | Finish step 1 |
| `FAILED`: "… is suppressed (bounce / complaint / unsubscribe)" | The recipient bounced, complained or unsubscribed | Don't retry. Remove the suppression only if the person asks to resubscribe (not self-serve yet) |
| Domain stays `pending`: "holds a different key than the one we issued" | The record value was truncated or mistyped | Paste the value again in one piece |
| Domain turned `failed` | The DKIM record was deleted from DNS | Publish it again, then **Check now** |
