# Thank website leads on WhatsApp

:::: v-pre

When a visitor sends your website's contact form, thank them on WhatsApp and alert your team.

```
Form Submitted
  └─ Send WhatsApp to {{contact.phone}}  (thank-you)
       └─ Send WhatsApp to your team     (new lead)
```

## Before you start

- Your website is published with a contact form that asks for a phone number.
- WhatsApp is connected.
- No other published Form Submitted workflow. Only one can be live.

## Build it

1. In the console, open **Workflows** and create a workflow, e.g. *Website leads*.
2. Add a **Form Submitted** trigger.
3. Add a **Send WhatsApp** and connect the trigger to it:
   - **Send to:** `{{contact.phone}}`
   - **Message:** `Hi {{contact.name}}, thanks for contacting us! We'll reply here shortly.`
4. Add a second **Send WhatsApp** after it:
   - **Send to:** your team member's WhatsApp number
   - **Message:**

     ```
     New website lead: {{contact.name}}, {{contact.phone}}, {{contact.email}}
     {{message.body}}
     ```
5. **Save draft**, then **Publish**.

Set **Send to** explicitly. Its default, `{{message.from}}`, is the lead's phone, or their
**email** if they left the phone blank, which WhatsApp can't deliver to.

::: warning Use Send WhatsApp, not Reply
A form isn't a conversation, so there's nothing to reply to: a **Reply** step fails on this
trigger. **Test** won't show that, because a test always runs with a sample message, and
`{{contact.*}}` is empty in tests. Submit your own form to try it end to end.
:::

::: warning WhatsApp's 24-hour window
Both messages are free text, which WhatsApp delivers only to someone who messaged your
business number in the last 24 hours. A lead who has never written to you won't get the
thank-you, and the step fails. The same applies to the team number.
:::

A form from a new person also creates a contact, so a published
[Contact Created](/api/recipes/welcome-new-contacts) workflow runs for them too. Don't
send them two greetings.

::::
