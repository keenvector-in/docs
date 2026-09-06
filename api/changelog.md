# Changelog

Dates are when each change landed in this documentation, not the backend commit date.

## 2026-09-06

- Initial public API reference: `POST`/`GET /v1/messages`, WhatsApp connect/send/templates,
  campaigns, webhook configuration and receipt, outbound webhook delivery.
- Published as an OpenAPI 3.1 spec ([`/openapi.yaml`](/openapi.yaml)) with an interactive
  [Scalar reference](/reference.html).
- Endpoints outside `/v1/messages` are marked **Preview** — they authenticate with a
  development-only `X-Tenant-ID` header, not a real API key, until the platform's auth
  middleware ships.
