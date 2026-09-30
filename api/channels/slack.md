# Slack

::: warning Not available yet
KeenVector doesn't support Slack as a channel today. You can't connect a Slack workspace.
`POST /v1/messages` rejects `"channel": "slack"`. The **Send Slack** workflow step appears
in the builder but can't run.
:::

KeenVector's webhook receiver can already verify Slack's signed requests. It answers
Slack's URL-verification handshake and checks the timestamped signature. Messages
received this way aren't passed on to workflows yet, because they carry no sender that
could be replied to.

No date or feature set is promised. To hear when Slack becomes available, ask your
KeenVector account team or watch the [changelog](/api/changelog).

For channels you can use today, see [Connectors](/api/connectors/).
