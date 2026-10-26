# SAME PAGE

**Different desires. Shared understanding.**

SAME PAGE is a private, intention-first dating beta for women seeking men and
men seeking women in Ghana. It replaces the public photo feed and endless swipe
with considered introductions: verified phone numbers, explicit intentions,
hard compatibility gates and a transparent score you can inspect.

[![CI](https://github.com/pkaycodes/same-page/actions/workflows/ci.yml/badge.svg)](https://github.com/pkaycodes/same-page/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-12362a.svg)](LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000.svg)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16%2B-336791.svg)](https://www.postgresql.org)

![SAME PAGE landing page](docs/01-landing-desktop.png)

> **Project status:** working responsive beta. There is no hosted public demo
> yet: the app needs a seeded PostgreSQL database, a real SMS provider and the
> legal/privacy sign-offs listed below. The screenshots in this repository were
> captured from the running app with the seeded demo data.

## What it does

- **Phone-first onboarding.** A six-digit code signs you in; demo accounts are
  available locally so the product can be reviewed without SMS.
- **Intentions before appearance.** Profiles lead with what someone is looking
  for, their relationship circumstances, boundaries and a short written answer.
- **Hard eligibility gates.** Opposite-gender matching, mutual age ranges,
  shared intentions, dealbreakers, blocks, reports and account state are checked
  on the server before anyone is ranked.
- **An explainable score.** The deterministic baseline is broken into intentions,
  relationship dynamics, life circumstances, communication/boundaries and shared
  interests. Every score shows the reasons and the weights.
- **No public photo browse.** Discovery is alias-first and text-first. The beta
  has no photo, voice or video feature.
- **Private text conversations.** Requests are accepted or declined before chat
  opens. Messaging is text-only.
- **Safety controls close by.** Block, report, pause discovery, end a
  conversation and review privacy settings from the app shell.
- **Privacy controls that change the query.** Age, broad location and intentions
  can be hidden; the AI free-text flag is off by default.
- **Responsive shell.** Desktop sidebar and mobile bottom navigation, keyboard
  focus states, reduced-motion support and 44 px touch targets.

## Screens

| Discovery | Profile detail |
| --- | --- |
| ![Discovery](docs/03-discover-desktop.png) | ![Profile](docs/04-profile-desktop.png) |

| Mobile discovery | Matching model |
| --- | --- |
| ![Mobile discovery](docs/10-discover-mobile.png) | ![Matching](docs/08-matching-desktop.png) |

## Product rules encoded in the app

- Women seek men and men seek women. Seeking is derived on the server; there is
  no independent seeking setting in the client.
- Eligibility is deterministic. AI can never create eligibility or override a
  block, report, consent choice, dealbreaker, moderation action or account state.
- The compatibility score is a guide, not a verdict. The breakdown is visible.
- Phone numbers, legal names, exact locations and private messages are not shown
  on profiles or sent to the AI layer. Written profile text requires a separate
  opt-in before it can be used.
- The beta is text-only. There is no public photo browsing, payment, voice or
  video feature.

## Quick start

### 1. PostgreSQL

You need PostgreSQL 16 or newer. With [Postgres.app](https://postgresapp.com) on
macOS:

```bash
createdb samepage_dev
```

The app creates its tables and seeds the demo profiles on first request. For
production, replace this bootstrap with reviewed migrations.

### 2. Environment

```bash
cp .env.example .env.local
```

The defaults connect to a local PostgreSQL socket. To use a TCP connection:

```bash
DATABASE_URL=postgresql://samepage:password@127.0.0.1:5432/samepage_dev
```

Set a real `AUTH_SECRET` in every shared environment:

```bash
openssl rand -hex 32
```

### 3. Run

Requires Node.js 20.9+ (developed on Node 24).

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

### Demo access

The join screen exposes two review accounts outside production:

| Account | Phone | Alias |
| --- | --- | --- |
| Ama | `+233200000001` | `Ama_K` |
| Kwame | `+233200000002` | `Kwame_A` |

Or create a demo session directly:

```bash
curl -i -X POST http://localhost:3000/api/auth/demo \
  -H 'Content-Type: application/json' \
  -d '{"kind":"ama"}'
```

Demo access is off in production unless `DEMO_MODE=true` is explicitly set.

## Environment variables

| Variable | Purpose | Local default |
| --- | --- | --- |
| `DATABASE_URL` | PostgreSQL connection string | Unix-socket fallback |
| `PGHOST` | Socket/host fallback | `/tmp` |
| `PGPORT` | Port fallback | `5432` |
| `PGUSER` | User fallback | `stackzz` |
| `PGPASSWORD` | Password fallback | empty |
| `PGDATABASE` | Database fallback | `samepage_dev` |
| `AUTH_SECRET` | Signs sessions and OTP material | insecure local default |
| `OTP_DEV_MODE` | Return/show the OTP locally | on outside production |
| `DEMO_MODE` | Enable the Ama/Kwame review accounts | on outside production |
| `SEED_DEMO_DATA` | Seed 21 profiles into an empty database | on outside production |
| `AI_MATCHING_ENABLED` | Feature flag for the future AI layer | `false` |

## Quality checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

The 14-test Vitest suite covers PostgreSQL bootstrap and seed data, the
eligibility gates (including same-gender rejection, age ranges, intentions and
boundaries), deterministic scoring, phone/code validation, message limits and
privacy settings. CI runs the same commands against a real PostgreSQL service on
every push and pull request.

`scripts/qa-screenshots.mjs` captures desktop and mobile review screenshots with
Playwright and the system Chrome channel. It is a local review helper, not part
of the runtime.

## Structure

```text
src/app/                 App Router pages and API route handlers
src/app/(app)/           authenticated desktop/mobile shell
src/components/          onboarding, discovery, requests, chat, safety, settings
src/lib/auth.ts          OTP, sessions, demo login and route guards
src/lib/db.ts            PostgreSQL pool, bootstrap and timestamp handling
src/lib/matching.ts      deterministic eligibility and scoring engine
src/lib/repository.ts    async data access for discovery, requests and chat
src/lib/schema.ts        local PostgreSQL schema
src/lib/seed.ts          21-profile demo data
docs/                    browser captures from the running beta
```

### Stack

Next.js 16 (App Router) · React 19 · TypeScript · PostgreSQL via `pg` · Zod ·
Vitest · Playwright · hand-written CSS. No UI framework, no ORM and no analytics.

### How the server boundary works

- Sessions are opaque random tokens; only a SHA-256 hash is stored in the
  database, and the cookie is `httpOnly`, `SameSite=Lax` and secure in
  production.
- OTP codes are stored as keyed hashes with attempts and expiry, not plaintext.
- Discovery, profile access, requests and messages all re-check the signed-in
  user, eligibility and blocks on the server.
- Money and AI are intentionally absent from the MVP. `AI_MATCHING_ENABLED`
  stays off until the vendor, data-processing agreement, region and privacy
  review are complete.

## Deployment

This is a server-rendered Next.js app, not a static site. A deployment needs:

1. A managed PostgreSQL database with backups and connection pooling.
2. A real SMS provider for OTP delivery.
3. `AUTH_SECRET` from a secret manager.
4. `DEMO_MODE=false`, `OTP_DEV_MODE=false` and `SEED_DEMO_DATA=false`.
5. A privacy notice, terms, community rules and moderation staffing.
6. Legal review of the matching policy, age assurance, automated-decision
   disclosure and retention periods.

The current bootstrap is suitable for development and review, not production.
Before launch, replace `schema.ts` with versioned migrations and least-privilege
database roles.

## Known blockers before production

- No SMS delivery yet. `OTP_DEV_MODE` exposes the code locally only.
- The schema bootstrap runs from application code; production needs migrations,
  backups, restricted roles and connection pooling.
- AI matching is disabled. Vendor, DPA, region, retention and pricing are not
  signed off.
- Legal review is still required for the gender policy wording, trans-inclusion
  copy, automated-decision disclosure, age assurance and retention schedule.
- No photo, voice, video, payment or native app experience exists in this beta.

## Scope

This repository contains the working application and its review screenshots. The
commercial proposal, wireframes, pricing, vendor decision record and internal
legal notes are intentionally not part of the public repository.

## License

[MIT](LICENSE) © 2026 Papakwame Afrifa Mensa
