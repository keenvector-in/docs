# Environments & base URL

## Production

The hosted base URL is **not published yet**. Your KeenVector contact gives it to you with
your API key. Keep it in configuration, for example `KV_BASE_URL`, and do not hard-code it.

All paths in these docs are relative to that base, for example `$KV_BASE_URL/v1/messages`.

## Local development

When you run core-engine yourself, `message-api` listens on port **8085**:

```bash
export KV_BASE_URL=http://localhost:8085
curl "$KV_BASE_URL/healthz"
```

`GET /healthz` needs no key and reports whether the service and its database are up.

The local k3s stack can also expose `message-api` by hostname through Traefik. See
`deploy/local/ingress.yaml` in core-engine; the host depends on your machine's IP.

## Test mode

::: warning Not available yet
There are no test or sandbox keys. Only `kv_live_` keys exist, and every send goes to the
real provider through your real connection. To test safely, send to numbers and addresses
you own. You can also run the platform locally, where email goes to MailHog.
:::
