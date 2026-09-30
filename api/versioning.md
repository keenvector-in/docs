# Versioning

The messaging API is versioned in the path: `/v1/messages`. Within `v1` we avoid
breaking changes. Adding a new optional request field, a new response field, or a new
`error_code` is not a breaking change, so your client should ignore fields it does not
know about.

Breaking changes are announced in the [changelog](/api/changelog) before they land.

## Planned change: snake_case response fields

Message responses currently use Go-style keys (`ID`, `TenantID`, `ProviderMessageID`,
`CreatedAt`, …). Before general availability they will become snake_case (`id`,
`tenant_id`, `provider_message_id`, `created_at`, …). Request fields (`channel`, `to`,
`subject`, `body`) are already snake_case and will not change.

::: info Preview endpoints
The connection endpoints (`/whatsapp/connections`, `/instagram/connections`) have no
version prefix yet. Their paths may change before GA.
:::
