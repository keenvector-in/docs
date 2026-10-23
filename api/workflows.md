# Workflows

:::: v-pre

A workflow is a small automation: **a trigger** (a customer messages you, a website form
comes in) followed by **steps** (reply, send a WhatsApp, check a condition, wait). You
build them on a canvas in the console, under **Workflows**.

::: info Console only
Workflows are created, tested and published in the business admin console. There's no
API-key endpoint to create or start a workflow from your own code yet. A workflow starts
only from its trigger.
:::

For ready-made examples, see [Recipes](/api/recipes/).

## Build and publish

1. In the console, open **Workflows** and create a workflow.
2. Drag a trigger onto the canvas, then add steps and connect them. A step with YES/NO
   outputs (Condition, Branch, AI Intent, Capture Contact) continues along the output that
   matched; an output with nothing connected ends the run.
3. Optionally pick the workflow's **channels** in the header (see [Channels](#which-messages-start-a-run)).
4. Click **Save draft**, then **Test** to dry-run it (see [Test](#test-a-draft)).
5. Click **Publish**. New matching events now start a run.

To stop it, click **Pause**. New events stop starting runs; publish again to resume.

### Draft and published versions

Publishing snapshots the graph as a numbered version. Runs always use the **published**
version. Editing afterwards changes only the draft: **Save draft** keeps the published
version running until you click **Publish** again.

### What blocks publishing

Publish checks what the draft doesn't:

- exactly one trigger, with nothing connected into it;
- no loops, and at most one connection per output;
- every step is runnable (no [coming soon](#coming-soon) steps);
- required settings: a Condition needs a field, an operator and a value (and a number for
  greater/less than); Send WhatsApp needs a message; Wait and Delay Until need a valid time;
- a workflow using **Reply** can't be linked to a channel KeenVector can't send on yet;
- **one live workflow per trigger and channel.** If another published workflow with the
  same trigger already starts on the same channel, publishing fails with a `409` naming
  it: add your steps to that workflow, or pause it first. This stops one message from
  getting two replies. A Form Submitted or Contact Created workflow with no linked
  channels counts as every channel, so you can have one live workflow per such trigger.

## Triggers

| Trigger | Starts when | Notes |
|---|---|---|
| **Incoming Message** | A contact messages you | **Channel** setting: *Any channel* or one channel. Messages arrive today from WhatsApp, Instagram and your website chat. |
| **Chatbot Message** | A visitor writes in your website chat | Incoming Message narrowed to the website chat. **Reply** answers in the chat. |
| **Form Submitted** | A visitor sends your website's contact form | `{{message.body}}` is their message; `{{contact.name}}`, `{{contact.email}}`, `{{contact.phone}}` are what they typed. |
| **Contact Created** | Someone reaches you for the first time | `{{contact.*}}` holds what that first contact told KeenVector: the phone for a WhatsApp sender, the email or phone from a form, the display name when known. |

Form Submitted and Contact Created aren't conversations: there's no message to answer, so
**Reply fails** on them. Use **Send WhatsApp** to `{{contact.phone}}` instead.

::: warning Contact Created fires alongside other triggers
A first-time WhatsApp or Instagram sender starts both your Incoming Message workflow and
your Contact Created workflow. A website form from a new person starts both Form Submitted
and Contact Created. Don't send the same greeting from both.
:::

### Which messages start a run

For message triggers, the channels you link in the workflow header win. With no linked
channels, the trigger's own **Channel** setting applies, and *Any channel* matches every
channel, website chat included.

## Steps

| Step | What it does |
|---|---|
| **Reply** | Sends **Message** back to the sender on the channel the message came in on (WhatsApp, Instagram or website chat). |
| **Send WhatsApp** | Sends **Message** on WhatsApp to **Send to** (default `{{message.from}}`). Use it for a fixed number (your team) or `{{contact.phone}}`. |
| **Ask AI** | The AI assistant answers with your knowledge and persona (Settings → AI assistant) and replies on the customer's channel, or sends your handoff message. |
| **Update Contact** | Sets one field on the sender's contact. `name` sets their name; anything else is a custom attribute. Skipped when the sender isn't a known contact yet. |
| **Condition** / **Branch** | Compares a field with a value. YES or NO. |
| **AI Intent** | Asks the AI a yes/no question about the message. YES when the answer is yes with at least **Min. confidence** (default `0.6`); NO otherwise, including when the AI is unavailable. |
| **Capture Contact** | Finds an email, phone number or Instagram `@handle` in the message and saves it on the contact. YES when found. |
| **Wait** | Pauses the run: `30 minutes`, `24 hours`, `2 days`. |
| **Delay Until** | Pauses until the next occurrence of a 24-hour time, e.g. `09:00`, in **UTC**. |
| **End** | Ends the run. |

### Reply or Send WhatsApp?

- **Reply** answers whoever wrote, on the channel they used. It only makes sense after
  Incoming Message or Chatbot Message.
- **Send WhatsApp** always sends on WhatsApp, to whatever **Send to** renders. Use it to
  notify a team member, or to reach a contact after Form Submitted or Contact Created.

::: warning WhatsApp's 24-hour window
Free-text WhatsApp messages reach a person only within 24 hours of their last message to
your WhatsApp number. That's Meta's rule. A Reply to someone who just wrote is always
inside the window. A Send WhatsApp to a team member, or to a form lead who never messaged
you, fails unless they wrote to your number in the last 24 hours. A failed send marks the
step and the run failed.
:::

### Conditions

| Setting | Values |
|---|---|
| **What to check** | `message.body` (Message text), `message.from` (Sender), `message.channel` (Channel), `contact.name`, `contact.email`, `contact.phone` |
| **How to compare** | `contains`, `equals`, `greater_than`, `less_than` |
| **Compare with** | a plain value (variables aren't filled in here) |

- `contains` and `equals` ignore case and surrounding spaces: `Plaza` matches `plaza`.
- `greater_than` and `less_than` compare numbers. If the field isn't a number, the result is NO.

## Variables

Type these into **Message**, **Send to** or Update Contact's **Value**. They are replaced
when the step runs; a variable with no value becomes empty text.

| Variable | Value |
|---|---|
| `{{message.body}}` | The message text (the form's message for Form Submitted) |
| `{{message.from}}` | The sender's address on the channel, e.g. their WhatsApp number. For Form Submitted and Contact Created: the phone, or the email if there's no phone. |
| `{{message.channel}}` | `whatsapp`, `instagram` or `web`. Empty for Form Submitted and Contact Created. |
| `{{contact.name}}` | The contact's name |
| `{{contact.email}}` | The contact's email |
| `{{contact.phone}}` | The contact's phone |
| `{{contact.verify_code}}`, `{{contact.claim_address}}` | Set by Capture Contact when the captured address already belongs to a verified contact: the person must send this code from that address to link the two. |

## Test a draft

**Test** saves the draft and runs it against a sample message you type (channel, sender,
text). Nothing is sent, waits are skipped, and AI steps aren't asked (AI Intent takes NO).
Each step shows what it *would* have done.

The test always uses a message, with no contact details. So `{{contact.*}}`
render empty, and a Reply after Form Submitted or Contact Created looks fine in a test even
though it fails live.

## Coming soon

These appear in the palette so you can sketch with them. You can save and test them (the
test marks them skipped; a YES/NO one takes YES) but you **can't publish** a workflow that
contains one.

- **Triggers:** Webhook, Campaign Started, Payment Received
- **Actions:** Send SMS, Send Email, Send Slack, Send Instagram, Webhook, Add Tag, Remove Tag
- **Logic:** Verify Email, Verify WhatsApp Number
- **Integration:** HTTP Request, Payment Check, CRM Update

To reply on Instagram today, use **Reply** (or **Ask AI**) after an Instagram message.

::::
