import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'KeenVector Docs',
  description: 'Developer documentation for the KeenVector platform API',
  srcDir: '.',
  srcExclude: ['**/node_modules/**'],
  head: [['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }]],
  themeConfig: {
    logo: '/brand/logo-mark.svg',
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Quickstart', link: '/api/quickstart' },
      { text: 'Connectors', link: '/api/connectors/' },
      { text: 'API Reference', link: '/reference.html', target: '_self' },
      { text: 'Changelog', link: '/api/changelog' },
    ],
    sidebar: [
      {
        text: 'Get started',
        items: [
          { text: 'Overview', link: '/api/' },
          { text: 'Quickstart', link: '/api/quickstart' },
          { text: 'Authentication', link: '/api/authentication' },
          { text: 'Environments & base URL', link: '/api/environments' },
        ],
      },
      {
        text: 'Send messages',
        items: [
          { text: 'Messages', link: '/api/messages' },
          { text: 'Idempotency', link: '/api/idempotency' },
          { text: 'Pagination', link: '/api/pagination' },
          { text: 'Errors', link: '/api/errors' },
          { text: 'Rate limits', link: '/api/rate-limits' },
          { text: 'Versioning', link: '/api/versioning' },
        ],
      },
      {
        text: 'Connectors',
        items: [
          { text: 'Overview', link: '/api/connectors/' },
          { text: 'WhatsApp & Instagram: two ways', link: '/api/connectors/meta' },
          { text: 'WhatsApp', link: '/api/channels/whatsapp' },
          { text: 'Instagram', link: '/api/channels/instagram' },
          { text: 'Email', link: '/api/channels/email' },
          { text: 'Website chat & forms', link: '/api/channels/website' },
          { text: 'SMS (not available yet)', link: '/api/channels/sms' },
          { text: 'Slack (not available yet)', link: '/api/channels/slack' },
        ],
      },
      {
        text: 'Webhooks',
        items: [
          { text: 'Two directions', link: '/api/webhooks' },
          { text: 'Receiving provider webhooks', link: '/api/receiving-webhooks' },
          { text: 'Events to your server', link: '/api/events' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'API reference (interactive)', link: '/reference.html', target: '_self' },
          { text: 'Endpoint summary', link: '/api/reference' },
          { text: 'OpenAPI spec (raw)', link: '/openapi.yaml', target: '_self' },
          { text: 'Code samples', link: '/api/sdks' },
          { text: 'Changelog', link: '/api/changelog' },
        ],
      },
    ],
    search: { provider: 'local' },
  },
})
