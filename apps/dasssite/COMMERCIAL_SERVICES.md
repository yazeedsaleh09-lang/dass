# Commercial services boundary

The public site now has a complete commercial-product shell, but the repository does not contain a production identity, payment, email, ticketing, or entitlement service. Those capabilities are intentionally isolated behind `PlatformServices` in `src/product/types.ts`.

## Current behavior

`DASS_DEMO_MODE=true` is explicit in `render.yaml` and defaults to `true` for local builds. In this mode:

- account sessions, profiles, settings, inventory, demo checkouts, receipts, and support drafts use versioned browser `localStorage`;
- every affected page displays a persistent “local demo” disclosure;
- password reset validates the address but reports that no email was delivered;
- checkout never renders card fields, never contacts a payment provider, and requires an explicit acknowledgement;
- successful demo checkout creates a clearly marked local demo receipt;
- failed and cancelled checkout sessions do not grant an entitlement;
- no match history, achievements, service health, or support delivery is fabricated.

Set `DASS_DEMO_MODE=false` to disable account and commercial mutations. The unavailable adapter then rejects those operations with an honest provider-not-connected message.

## Production implementation contract

Implement a new `PlatformServices` adapter without changing page code. The adapter needs server-backed operations for:

1. Identity: signup, sign-in, verified email, password reset, session rotation, revocation, rate limits, and multi-device policy.
2. Profiles: unique usernames, moderation, avatar and frame selection, and privacy controls.
3. Catalog and entitlements: server-authoritative product/plan ids, ownership, equipped cosmetics, and audited grants.
4. Checkout: server-created provider sessions, signed webhooks, idempotency keys, tax invoices, refunds, cancellation, and subscription state.
5. History and achievements: records derived from authoritative completed games, never client-submitted outcomes.
6. Support: authenticated ticket creation, abuse controls, attachment policy, delivery state, and staff tooling.
7. Privacy: retention windows, export/delete workflows, consent records, and a reviewed production privacy notice.

The server must ignore client-supplied prices and resolve all totals from the central catalog, as the demo adapter already does.

## Required production configuration

Provider-specific variables do not exist yet and must not be invented. When a provider is selected, document its exact variable names here and configure them as Render secrets. At minimum the implementation will need:

- an application origin for redirects and canonical URLs;
- identity service credentials and callback secrets;
- payment public/server keys plus a webhook signing secret;
- transactional email credentials and a verified sender;
- support/ticketing credentials;
- database connection and encryption/rotation policy.

Recommended neutral configuration boundary (names are architectural placeholders, not active variables):

| Concern | Browser-visible | Server-only |
| --- | --- | --- |
| Mode/origin | `DASS_DEMO_MODE`, public origin | allowed redirect origins |
| Identity | provider public project id if required | admin/service credential, callback secret |
| Payment | provider public key only when its hosted UI requires it | secret key, webhook signing secret |
| Email | none | API credential and verified sender |
| Support | none | ticketing credential and destination |

No server secret may be passed through esbuild `define`, written to `public/`, or returned by a diagnostics endpoint.

## Checkout and webhook sequence

1. The browser submits only the catalog reference id and billing interval to an authenticated server route such as `POST /api/checkout/sessions`.
2. The server resolves the current catalog price, currency, tax behavior, account, and existing entitlement. It creates an idempotency key scoped to account + cart + attempt.
3. The server creates a provider-hosted checkout session and returns only its safe redirect/public session fields.
4. A route such as `POST /api/payments/webhook` reads the raw request body, verifies the provider signature and timestamp, rejects replays, then records the provider event id under a unique constraint.
5. Entitlements are granted only after a server-to-provider status verification or a verified terminal webhook. Browser success redirects never grant ownership.
6. Refund, cancellation, dispute, expiry, and subscription-change events update the entitlement ledger idempotently and retain an audit record.

Provider sandbox validation must cover duplicate webhook delivery, events arriving out of order, retry after timeout, cancelled hosted checkout, refund, subscription renewal failure, and an amount/currency mismatch. Production activation also requires reviewed terms, privacy and refund policies, tax invoice handling, alerting, backups, and a rollback path.

## Support and abuse boundary

A production support adapter must apply schema validation again on the server, authenticate when available, rate-limit by account and network signals, use bot/spam controls, redact sensitive diagnostics, and keep an audit trail. Player reports need immutable room/player references generated by the server; display names alone are insufficient. If attachments are added, store them outside the web root, scan type and content, cap size, strip active metadata, and serve through short-lived authorized URLs. Staff notifications must not include access tokens, payment secrets, or hidden game actions.

Before enabling real commerce, set `DASS_DEMO_MODE=false`, deploy the production adapter, complete legal review, and run provider sandbox plus webhook-replay tests.

## Deliberate separation from multiplayer

The commercial site module does not import, mutate, or wrap room creation, room codes, QR generation, host reclaim, duplicate-join prevention, or player reconnect logic. Those verified paths remain in the TV, player, and server applications.
