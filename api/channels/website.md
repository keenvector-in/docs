# Website chat & forms

Your KeenVector website has a contact form and a chatbot. You can also embed the same
chatbot on any other website.<!-- hidden until the business is registered: chatbot on any other website. Form submissions and chat messages reach your
[workflows](/api/workflows). -->

You build the site and chatbot in the console under **Website & Chatbot**. A chatbot needs
**Show chatbot on my website** turned on and at least one message. It only goes live on
the published version of the site.

## Embed the chat widget

In **Website & Chatbot → Chatbot**, copy the snippet and paste it just before
`</body>` on your site:

```html
<script src="https://<tenant-portal host>/widget/keenvector-chat.js"
        data-site="your-site-slug" async></script>
```

| Attribute | Required | Meaning |
|---|---|---|
| `data-site` | Yes | Your site slug. The widget logs a warning and does nothing without it. |
| `data-api` | No | The base URL of the website public API. It defaults to the one built into the script. Set it only if your account team tells you to. |

The widget draws a chat bubble inside a shadow root, so your page's CSS and the widget's
CSS don't affect each other. The widget uses your site's theme. It doesn't render at all if
the site isn't published, the chatbot is off, or the chatbot has no messages.

<!-- hidden until the business is registered:
## How typed messages are answered

Choose the mode with **Answer typed questions with my workflows (Web channel)**:

| Setting | What happens to a typed message |
|---|---|
| Off (default) | Your AI assistant answers right away, in the same response. |
| On | The message becomes an inbound message on the `web` channel. It starts your **Incoming Message** workflows (those for the web channel or for any channel) and your **Chatbot Message** workflows. Their **Reply** and **Ask AI** steps answer in the chat, and the widget picks up the answers by polling. |

The scripted
-->
## How typed messages are answered

Your AI assistant answers a typed message right away, in the same response. The scripted buttons in your chatbot flow run in the widget and don't call the API.

## Public API

These endpoints are anonymous: no API key and no cookies. They are served by the website
public API, which isn't the `message-api` host. Your account team gives you the host.
Locally, it's `http://localhost:8083`. The examples call it `$KV_SITE_API`.

CORS allows any origin. The allowed request headers are `Content-Type` and `X-Chat-Token`.

### Get the published site

```bash
curl "$KV_SITE_API/public/sites/your-site-slug"
```

This returns `200 {"slug": "...", "config": { ... }}`, the published site config. The
response is cached for 60 seconds, so a new publish can take up to a minute to appear. An
unpublished or unknown slug returns `404`.

### Submit a lead (contact form)

```bash
curl -X POST "$KV_SITE_API/public/sites/your-site-slug/leads" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Priya Shah",
    "phone": "+91 98765 43210",
    "email": "priya@example.com",
    "message": "Do you deliver to Pune?",
    "website": ""
  }'
```

| Field | Rules |
|---|---|
| `name` | Required, up to 100 characters. |
| `phone` / `email` | At least one is required. KeenVector strips spaces and symbols from `phone`, which must then be 8 to 15 digits including the country code. |
| `message` | Optional, up to 2000 characters. |
| `website` | Honeypot. Leave it empty and hide it from people. If it's filled in, the lead is dropped silently (still `202`). |

The body can be up to 8 KiB. A successful submission returns `202 Accepted`. It's filed
under the matching contact, so someone who already messaged you on WhatsApp doesn't turn
into a duplicate. It shows up in **Website → Leads**.<!-- hidden until the business is registered: It shows up in **Website → Leads** and starts your **Form Submitted**
workflows. -->

If the phone number already belongs to a verified contact, the `202` has a body:

```json
{ "verify_code": "…", "claim_address": "919876543210", "claim_kind": "phone" }
```

To link this visitor to their earlier conversation, they send `verify_code` from that
number. Nothing else about the existing contact is revealed. Validation errors return
`400 invalid_request` with a message you can show to the visitor.

### Send a chat message

```bash
curl -X POST "$KV_SITE_API/public/sites/your-site-slug/chat" \
  -H "Content-Type: application/json" \
  -d '{ "message": "What are your opening hours?", "session_id": "a1b2c3d4e5f6" }'
```

- `session_id` is chosen by you: 4 to 64 letters, digits, `-` or `_`. Keep it for the
  whole visit.
- `message` can be 1 to 1000 characters.
- **Session token.** The first message of a new session is sent without a token, and the
  response includes `session_token`. Send it as the `X-Chat-Token` header on every later
  message.<!-- hidden until the business is registered: Send it as the `X-Chat-Token` header on every later
  message and poll for that session. --> A message without the token for a session that has
  already started, or with a wrong token, returns `401` ("This chat session has
  expired…"). Start a new session when that happens.

<!-- hidden until the business is registered:
The response depends on the mode:

| Mode | Response |
|---|---|
| AI answers directly | `200 {"reply": "...", "handoff": false, "session_token": "..."}` |
| Workflows answer | `202 {"queued": true, "session_token": "..."}`. Poll for the answer. |
-->
The response is `200 {"reply": "...", "handoff": false, "session_token": "..."}`.

Other errors: `404 chat_disabled` means the chatbot is off. `503 chat_unavailable` means
the assistant is busy or unavailable.

<!-- hidden until the business is registered:
### Poll for workflow replies

```bash
curl "$KV_SITE_API/public/sites/your-site-slug/chat/a1b2c3d4e5f6?after=<last message id>" \
  -H "X-Chat-Token: <session_token>"
```

This returns `200 {"messages": [{"id": "…", "text": "…", "at": "2026-09-30T10:15:00Z"}]}`,
the bot messages for the session newer than `after`. Leave out `after` the first time.
The token is required here, even for the first poll.
-->
### Rate limits

Limits are counted per client IP, with the first `X-Forwarded-For` hop taken as the IP.
Each replica keeps its own count.

| Endpoint | Limit |
|---|---|
| `POST …/chat` | 20 per minute |
| `POST …/leads` | No rate limit. Only the honeypot and the 8 KiB body cap apply. |
<!-- hidden until the business is registered (original table):
| Endpoint | Limit |
|---|---|
| `POST …/chat` | 20 per minute |
| `GET …/chat/{session}` | 240 per minute |
| `POST …/leads` | No rate limit. Only the honeypot and the 8 KiB body cap apply. |
-->

When a limit is hit, the endpoint returns `429 rate_limited`.

<!-- hidden until the business is registered:
## What each event starts

| Visitor action | Workflow triggers |
|---|---|
| Submits the contact form | **Form Submitted**. The run has the visitor's name, email, phone and message, but no conversation, so **Reply** fails. Use **Send WhatsApp** to reach them. |
| Types in the chat (workflow mode on) | **Incoming Message** (web channel) and **Chatbot Message** |
| Types in the chat (workflow mode off) | None. The AI assistant answers directly. |

Chat visitors are anonymous. A web chat run has a contact only after a **Capture Contact**
step finds an email address or phone number in what the visitor typed.
-->
