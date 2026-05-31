# Zentrip

Zentrip is a premium MVP peer-to-peer car rental marketplace for Uzbekistan, inspired by Turo-style flows and built for local demo and investor presentation use. It supports owner and renter onboarding, manual KYC verification, vehicle moderation, date-based booking logic, mock payments, messaging, reviews, disputes, and an admin control center.

## Project Overview

- Brand: `Zentrip`
- Currency: `UZS`
- Roles:
  - `ADMIN`
  - `OWNER`
  - `RENTER`
- Localization structure:
  - English
  - Uzbek
  - Russian
- Core marketplace rules:
  - Rentals cannot exceed 30 days.
  - Renter KYC must be approved before checkout.
  - Owner KYC must be approved before listing submission.
  - Listings require OSAGO confirmation.
  - Booked and blocked dates cannot be reserved again.
  - Deposits are simulated as held and later released.

## Tech Stack

- Next.js 16 App Router
- TypeScript
- Tailwind CSS
- Prisma ORM
- SQLite for local development
- Custom JWT cookie auth with `bcrypt`
- Zod validation
- React Hook Form
- `date-fns`
- Local upload storage in `public/uploads`
- Mock payment simulation for UzCard, HUMO, Click, Payme, Visa, Mastercard, and cash placeholder
- Vitest for utility tests

## Setup

Run the app locally with:

```bash
pnpm install
cp .env.example .env
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma db seed
pnpm dev
```

Open:

```text
http://localhost:3000
```

Notes:

- `cp` works in PowerShell as an alias for `Copy-Item`.
- The default `.env.example` uses a local SQLite file at `prisma/dev.db`.
- You can run everything from the VS Code integrated terminal. Docker is no longer required for local testing.
- `pnpm db:setup` is still available as a convenience shortcut if you want one command for local schema sync plus seeding.

## Demo Credentials

Admin:

```text
email: admin@uzcar.uz
password: Admin123!
```

Owner:

```text
email: owner@uzcar.uz
password: Owner123!
```

Renter:

```text
email: renter@uzcar.uz
password: Renter123!
```

Additional seeded accounts:

```text
owner2@uzcar.uz / Owner234!
renter2@uzcar.uz / Renter234!
renter3@uzcar.uz / Renter345!
```

## Database Commands

Generate Prisma client:

```bash
pnpm prisma generate
```

Create and apply the local SQLite development migration:

```bash
pnpm prisma migrate dev
```

Seed demo data:

```bash
pnpm prisma db seed
```

Optional convenience helper to sync the schema and seed in one step:

```bash
pnpm db:setup
```

Open Prisma Studio:

```bash
pnpm prisma studio
```

Validate the Prisma schema:

```bash
pnpm prisma validate
```

## Reset the Local Database

Reset the local SQLite database and reseed:

```bash
pnpm db:reset
```

Or use Prisma directly:

```bash
pnpm prisma migrate reset --force
```

## Main Features

- Public marketplace:
  - Homepage with hero, search, featured cars, trust section, and owner CTA
  - Search page with city/date/price/category/transmission/fuel/seats filters
  - Car detail page with gallery, specs, owner card, pricing, reviews, and disabled unavailable dates
- Authentication and access control:
  - Register as owner or renter
  - Secure password hashing with `bcrypt`
  - Role-based redirects and protected dashboards
  - Suspended-account and forbidden pages
- Owner workflow:
  - Submit KYC
  - Create and edit listings
  - Upload multiple car photos
  - Add blocked dates
  - Submit listings for admin review
  - Approve, reject, start, and complete booking requests
- Renter workflow:
  - Submit KYC
  - Browse active vehicles
  - Select available dates
  - View full price breakdown with 12% platform fee
  - Simulate payment and submit booking requests
  - Message owners, open disputes, and leave reviews after completed trips
- Admin workflow:
  - View platform stats
  - Review and approve/reject KYC submissions
  - Review and approve/reject/deactivate listings
  - Search and suspend users
  - Inspect bookings and payment states
  - Resolve disputes with admin notes
- Data and business logic:
  - Overlap checks for bookings
  - Availability blocking
  - Mock deposit hold and release flow
  - Owner payout record creation on trip completion
  - Seeded vehicles, bookings, reviews, messages, and pending moderation queues

## Seed Data Included

- 1 admin
- 2 owners
- 3 renters
- 8 vehicles across:
  - Tashkent
  - Samarkand
  - Bukhara
  - Fergana
- Multiple booking statuses:
  - `PENDING_OWNER_APPROVAL`
  - `CONFIRMED`
  - `ACTIVE`
  - `COMPLETED`
  - `CANCELLED`
  - `DISPUTED`
- Reviews
- Messages
- Pending KYC documents
- Pending listings for admin approval

## Testing and Validation

Run the checks used for this MVP:

```bash
pnpm lint
pnpm test
pnpm build
```

Covered utility tests:

- `calculateBookingPrice()`
- `checkDateOverlap()`
- `canUserBookVehicle()`
- `getBookingStatusLabel()`
- 30-day rental validation
- Role guard helper

## Known Prototype Limitations

- Payments are fully mocked and do not connect to real Uzbek payment providers.
- KYC is manual admin moderation only; there is no third-party verification API.
- Uploads are stored on the local filesystem in `public/uploads`, which is suitable for local demos but not production.
- Local development now uses SQLite for simplicity instead of PostgreSQL, so production database migration would be a separate step.
- Localization structure is present, but only a light static label layer is implemented for MVP.
- Saved cars is intentionally a placeholder section.
- No SMS, email, or push delivery integrations are wired yet.
- No map-based geosearch or real-time availability sync is included.

## Deployment Notes

For Vercel:

- Replace the local SQLite setup with a production database strategy before launch.
- Set:
  - `DATABASE_URL`
  - `AUTH_SECRET`
  - `NEXT_PUBLIC_APP_URL`
- Local file uploads are ephemeral on serverless platforms. Replace `public/uploads` with S3, Cloudinary, R2, or another object store before production use.

For Railway:

- Railway is still a good production option, but this local MVP is configured for SQLite-first development.
- If you move to Railway Postgres later, regenerate the Prisma schema and migration history for PostgreSQL before deploy.
- Ensure the app has persistent or external object storage for uploads in production.

## Important Paths

- Prisma schema: [prisma/schema.prisma](/C:/Users/user/Documents/Codex/2026-05-19/you-are-a-senior-full-stack/prisma/schema.prisma)
- Seed script: [prisma/seed.ts](/C:/Users/user/Documents/Codex/2026-05-19/you-are-a-senior-full-stack/prisma/seed.ts)
- Auth helpers: [src/lib/auth.ts](/C:/Users/user/Documents/Codex/2026-05-19/you-are-a-senior-full-stack/src/lib/auth.ts)
- Pricing logic: [src/lib/pricing.ts](/C:/Users/user/Documents/Codex/2026-05-19/you-are-a-senior-full-stack/src/lib/pricing.ts)
- Availability logic: [src/lib/availability.ts](/C:/Users/user/Documents/Codex/2026-05-19/you-are-a-senior-full-stack/src/lib/availability.ts)
- Validation schemas: [src/lib/validators.ts](/C:/Users/user/Documents/Codex/2026-05-19/you-are-a-senior-full-stack/src/lib/validators.ts)
