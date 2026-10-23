# Connect WhatsApp & Instagram: two ways

WhatsApp and Instagram both run on Meta's platform, so a business needs a Meta account set up
before KeenVector can message on its behalf. There are two ways to do that. Pick one per
business.

| | **1. Sign up through KeenVector** | **2. Bring your own Meta app** |
|---|---|---|
| Who it's for | Most businesses — you just want your number working | Teams that already run a Meta app, or want full control of it |
| Meta app | KeenVector's (KeenVector is the Meta Tech Provider) | Yours, in your Meta developer account |
| How you connect | One signup link: log in with Facebook, pick or create your business, add and verify your number | Create the app, copy IDs and a permanent token into KeenVector |
| Webhooks | Handled by KeenVector — nothing to configure | You register your app secret and point your app's webhook at KeenVector |
| Meta business verification & app review | KeenVector's | Yours (Meta only delivers real messages to published apps) |
| Access tokens | Issued and renewed through KeenVector's app | You create them; use a permanent System User token |
| Meta's messaging charges | Billed by Meta to the payment method on your WhatsApp account | Same |
| Available | **Not yet** — see below | **Yes, today** |

## 1. Sign up through KeenVector (Tech Provider)

::: warning Not available yet
KeenVector's side of the signup is built. It switches on once KeenVector's own Meta approvals
are in place — business verification, Tech Provider onboarding and an Embedded Signup
configuration. Until then the **Sign up with Meta** button doesn't appear, and nothing on this
page is a promise of a date. Use
[Bring your own Meta app](#_2-bring-your-own-meta-app) meanwhile — a business connected that
way can switch later.
:::

How it will work once it's live:

1. In the KeenVector console, open **Integrations → WhatsApp** and choose **Sign up with
   Meta**.
2. Meta's signup window opens. Log in with Facebook, choose your business portfolio (or create
   one), create or pick a WhatsApp Business Account, and add your phone number. Meta verifies
   it with a code by SMS or call.
3. Add a payment method in the same window if Meta asks — conversation charges are between you
   and Meta.
4. Close the window. KeenVector receives the account, number and token from Meta, subscribes
   to your number's events, and shows it as **Connected**. There is no app, secret or
   webhook for you to set up.

Instagram works the same way through **Log in with Instagram** in the console, which already
uses KeenVector's app — see [Instagram](/api/channels/instagram) for what that path covers
today.

## 2. Bring your own Meta app

Available now. You own the Meta app and its settings; KeenVector uses the account details and
token you give it.

1. **Create the app.** In [Meta for Developers](https://developers.facebook.com/apps), create
   an app of type Business and add the WhatsApp use case. Meta gives you a test number; add
   your real number under **API Setup** when you're ready.
2. **Get the three values** KeenVector needs: the **WhatsApp Business Account ID**, the
   **phone number ID** and a **permanent System User token** with the
   `whatsapp_business_messaging` and `whatsapp_business_management` permissions. See
   [WhatsApp → What you need from Meta](/api/channels/whatsapp#what-you-need-from-meta).
3. **Connect the account** — in the console (**Integrations → WhatsApp**) or with
   `POST /whatsapp/connections` ([WhatsApp → Connect](/api/channels/whatsapp#connect)).
4. **Wire your app's webhook to KeenVector** so incoming messages reach KeenVector:
   register your app secret, then paste the callback URL and verify token into your app's
   **WhatsApp → Configuration → Webhook** and subscribe to `messages`
   ([Receiving provider webhooks](/api/receiving-webhooks)).
5. **Publish your app.** While it's unpublished, Meta only sends the dashboard's test
   webhooks — no real customer messages. Publishing needs your own Meta business
   verification.

For Instagram with your own app, connect with `POST /instagram/connections` and register the
`instagram` webhook the same way ([Instagram](/api/channels/instagram)).

## Switching later

Moving from your own app to signing up through KeenVector (once it's available) means
disconnecting in KeenVector and signing up again with the same number. Your contacts
and message history stay in KeenVector. Moving a number between WhatsApp Business
Accounts is a Meta process — talk to your KeenVector contact before you start.
