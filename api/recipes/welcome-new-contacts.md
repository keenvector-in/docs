# Welcome new contacts

:::: v-pre

Send a one-time welcome on WhatsApp the first time someone reaches you.

```
Contact Created
  └─ Send WhatsApp to {{contact.phone}}  (welcome)
```

## Build it

1. In the console, open **Workflows** and create a workflow, e.g. *Welcome*.
2. Add a **Contact Created** trigger.
3. Add a **Send WhatsApp** and connect the trigger to it:
   - **Send to:** `{{contact.phone}}`
   - **Message:** `Welcome! Save this number to get updates from us. Reply any time with a question.`
4. **Save draft**, then **Publish**. Only one Contact Created workflow can be live.

Contact Created runs once per person: when KeenVector first sees them. `{{contact.phone}}`
is their WhatsApp number when they first wrote on WhatsApp, or the phone from your website
form. Someone who first reached you on Instagram, or left only an email, has no phone, so
the send fails for them.

::: warning It fires alongside your other triggers
A first-time WhatsApp sender starts **both** this workflow and your Incoming Message
workflow, and a new website lead starts both this and Form Submitted. If those already greet
people, the contact gets two messages. Keep the greeting in one place.
:::

A first-time WhatsApp sender has just written to you, so the welcome is inside WhatsApp's
24-hour window. A form lead who never messaged your number isn't, and WhatsApp won't
deliver free text to them.

::::
