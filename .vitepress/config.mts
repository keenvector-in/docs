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
        ],
      },
      {
        text: 'Guides',
        items: [
          { text: 'Sending messages', link: '/api/messages' },
          { text: 'Webhooks', link: '/api/webhooks' },
          { text: 'Error handling', link: '/api/errors' },
          { text: 'Rate limits', link: '/api/rate-limits' },
        ],
      },
      {
        text: 'Channels',
        items: [
          { text: 'WhatsApp', link: '/api/channels/whatsapp' },
          { text: 'Instagram (coming soon)', link: '/api/channels/instagram' },
          { text: 'SMS (coming soon)', link: '/api/channels/sms' },
          { text: 'Email (coming soon)', link: '/api/channels/email' },
          { text: 'Slack (coming soon)', link: '/api/channels/slack' },
        ],
      },
      {
        text: 'Reference',
        items: [
          { text: 'API reference (interactive)', link: '/reference.html', target: '_self' },
          { text: 'Endpoint summary', link: '/api/reference' },
          { text: 'OpenAPI spec (raw)', link: '/openapi.yaml', target: '_self' },
          { text: 'SDKs', link: '/api/sdks' },
          { text: 'Changelog', link: '/api/changelog' },
        ],
      },
    ],
    search: { provider: 'local' },
  },
})
