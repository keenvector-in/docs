# Forward WhatsApp messages to your team

:::: v-pre

When a customer mentions one of your brands, thank them and forward the message to the team
member who handles that brand, on their own WhatsApp. This example routes messages that
mention **plaza**.

```
Incoming Message (Any channel)
  └─ Condition: Message text contains "plaza"
       ├─ YES → Reply "thanks" → Send WhatsApp to your team
       └─ NO  → (nothing connected: the run ends)
```

## Before you start

- WhatsApp connected and its webhook receiving messages ([Receiving provider webhooks](/api/receiving-webhooks)).
- No other **published** Incoming Message workflow on the same channels. Only one can be
  live per channel, otherwise publishing fails with a conflict. If you already have one, add
  these steps to it instead.

## Build it

1. In the console, open **Workflows** and create a workflow, e.g. *Plaza enquiries*.
2. Add an **Incoming Message** trigger. Leave **Channel** on *Any channel*.
3. Add a **Condition** and connect the trigger to it:
   - **What to check:** Message text
   - **How to compare:** Contains
   - **Compare with:** `plaza`
4. From the Condition's **YES** output, add a **Reply**:
   - **Message:** `Thanks for your message! Our Plaza team will get back to you shortly.`
5. From the Reply, add a **Send WhatsApp**:
   - **Send to:** your team member's WhatsApp number, e.g. `919800000000`
   - **Message:**

     ```
     New Plaza enquiry from {{contact.name}} ({{message.from}}, {{contact.phone}}):
     {{message.body}}
     ```
6. **Save draft**, then **Test** with a message such as `Is Plaza open on Sunday?`. The
   Condition should show YES and both sends should read "would send".
7. Test `Hello` too: the Condition shows NO and the run ends.
8. **Publish**.

## How the brand branch works

The Condition's `contains` ignores case, so `Plaza`, `PLAZA` and `keenplaza.com` all go
down YES. Everything else goes down NO, and since nothing is connected there, the run just
ends. Connect NO to another step (a different Reply, an **Ask AI**) to handle the rest.
For several brands, chain Conditions: connect NO to a second Condition that checks the next
brand name, each with its own team number.

`{{contact.name}}` and `{{contact.phone}}` are empty until KeenVector knows them. For a
WhatsApp sender, `{{message.from}}` always holds their number.

::: warning The team number must be inside WhatsApp's 24-hour window
The Reply goes to a customer who just wrote, so it always delivers. The Send WhatsApp to
your team is a free-text message too, and WhatsApp only delivers it if that team member
messaged your business number in the last 24 hours. Otherwise the step fails. Have them
message the number regularly, or check the run's outcome.
:::

Because the trigger is *Any channel*, Instagram and website-chat messages also run this
workflow. The Reply answers on their channel, and the forward to your team still goes out on
WhatsApp. Pick **WhatsApp** as the trigger's channel to limit it.

::::
