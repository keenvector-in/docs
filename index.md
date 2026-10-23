---
layout: home

hero:
  name: KeenVector Docs
  text: Messaging and connectors for your business
  tagline: Connect your own WhatsApp, Instagram, email and website chat. Send from your server.
  # hidden until the business is registered:
  # text: Messaging, connectors and automations for your business
  # tagline: Connect your own WhatsApp, Instagram, email and website chat. Send from your server, automate replies in workflows.
  actions:
    - theme: brand
      text: Quickstart
      link: /api/quickstart
    - theme: alt
      text: Connectors
      link: /api/connectors/
    - theme: alt
      text: API reference
      link: /reference.html

features:
  - title: Send messages
    details: One endpoint for WhatsApp and email, with idempotent retries and a status you can poll.
    link: /api/messages
  - title: Connect channels
    details: WhatsApp Business, Instagram, a verified email domain and your website chat — from the console or the API.
    link: /api/connectors/
  - title: Receive provider webhooks
    details: Wire your Meta app to KeenVector once; inbound messages reach KeenVector.
    # hidden until the business is registered: details: Wire your Meta app to KeenVector once; inbound messages start your workflows.
    link: /api/receiving-webhooks
  # hidden until the business is registered:
  # - title: Automate with workflows
  #   details: Triggers for messages, website chat, forms and new contacts; reply, forward, branch, ask AI.
  #   link: /api/workflows
---
