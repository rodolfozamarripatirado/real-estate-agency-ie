# Harbour & Oak — Irish estate agency portal

A bilingual (EN/ES) property website for an Irish estate agency, with a staff back office.
Public listings expose only customer-facing information; vendor details, keys, alarm codes,
commission and internal notes live behind staff authentication and are never part of public queries.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Prisma 6 · PostgreSQL · Three.js

---

## Table of contents

1. [What is included](#what-is-included)
2. [Requirements](#requirements)
3. [Quick start (local)](#quick-start-local)
4. [Environment variables](#environment-variables)
5. [Demo accounts](#demo-accounts)
6. [Roles and permissions](#roles-and-permissions)
7. [How it is implemented](#how-it-is-implemented)
8. [Publishing to GitHub](#publishing-to-github)
9. [Deployment](#deployment)
10. [Scripts](#scripts)
11. [Troubleshooting](#troubleshooting)
12. [Known limitations](#known-limitations)

---

## What is included

**Public website**

- Home page with hero search (county, type, buy/rent), featured listings and company information
- Property search: keyword, county, type, price range, bedrooms and sorting
- Property detail pages: photo gallery with lightbox, key facts, BER rating, features, map, similar
  properties and a viewing enquiry form
- In-house 360° panorama viewer (drag to look, scroll to zoom, auto-rotate, fullscreen) plus
  Matterport and YouTube/Vimeo/MP4 tour embeds
- About and contact pages driven by the company settings record
- EN/ES switch persisted in a cookie (applies to public and staff UI)

**Staff portal** (`/admin`, sign-in at `/login`)

- Dashboard with portfolio counts, total value, recent listings and latest enquiries
- Property CRUD with four tabs: public listing, **private & compliance**, gallery, tours
- Bilingual title/summary/description/features with English fallback
- Publish / unpublish, drafts, sale-agreed / sold / let-agreed states, homepage featuring
- Gallery ordering and cover image selection; tour ordering
- Staff-only record per property: vendor contact, guide price, commission, exclusivity date,
  key location, alarm code, access notes, solicitor, legal status, internal notes
- Enquiry inbox with status workflow (new / contacted / closed) and internal notes
- Staff account management (administrators only): create, edit, change role, reset password, delete
- Editable company details, PSRA licence number, contact information and hero image

---

## Requirements

- **Node.js 20.9+** and npm
- **PostgreSQL 14+** — either a local Docker container or a hosted service (Neon, Supabase, Aiven…)
- No API keys required: maps use the public Google Maps embed, images are plain URLs

---

## Quick start (local)

The project lives at:

```
\\wsl.localhost\Ubuntu-22.04\home\rodolfo\freebuff-projects\Property · Ireland
```

From WSL the path is `/home/rodolfo/freebuff-projects/Property · Ireland` (note the spaces and the
`·` character — always quote it in commands).

```bash
cd "/home/rodolfo/freebuff-projects/Property · Ireland"
```

### 1. Start a local database

```bash
docker run -d --name harbour-oak-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=immo \
  -p 5433:5432 postgres:16
```

Port **5433** is used on purpose so it does not clash with other local Postgres instances; the
included `.env` already points at `postgresql://postgres:postgres@localhost:5433/immo`.

### 2. Configure the environment

A working development `.env` is included (it is git-ignored, so it never reaches GitHub). To start
from scratch, copy the template and fill it in:

```bash
cp .env.example .env
```

### 3. Install, create the schema and seed demo content

```bash
npm install          # also runs `prisma generate`
npx prisma db push   # creates the tables from prisma/schema.prisma
npm run db:seed      # demo company, 2 staff accounts, 8 properties, 3 enquiries
```

### 4. Run

```bash
npm run dev     # development, http://localhost:3000
# or
npm run build && npm start   # production build
```

Open <http://localhost:3000>. The staff portal is at <http://localhost:3000/login>.

---

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string. Use `?sslmode=require` for hosted databases. |
| `AUTH_SECRET` | yes | Signs the staff session JWT. Generate with `openssl rand -base64 32`. Rotating it logs everyone out. |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | seed only | Administrator created by `npm run db:seed`. |
| `AGENT_EMAIL` / `AGENT_PASSWORD` | seed only | Agent created by `npm run db:seed`. |
| `NEXT_PUBLIC_SITE_URL` | recommended | Canonical site URL used for metadata. |

Example:

```bash
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
AUTH_SECRET="<openssl rand -base64 32>"
ADMIN_EMAIL="admin@yourdomain.ie"
ADMIN_PASSWORD="<strong password>"
AGENT_EMAIL="agent@yourdomain.ie"
AGENT_PASSWORD="<strong password>"
NEXT_PUBLIC_SITE_URL="https://your-domain.ie"
```

---

## Demo accounts

Created by the seed script (or by the values in `.env`):

```
admin@harbourandoak.ie / Harbour2026!   (administrator)
agent@harbourandoak.ie / Agent2026!     (agent)
```

**Change or delete these before going live.** Accounts are managed at `/admin/users`.

---

## Roles and permissions

| Capability | Administrator | Agent |
| --- | --- | --- |
| Properties, galleries, 3D tours, private files | ✓ | ✓ |
| Enquiry inbox | ✓ | ✓ |
| Company settings (`/admin/settings`) | ✓ | — |
| Staff accounts (`/admin/users`) | ✓ | — |

Authorisation is read from the **database role**, not from the role stored in the session cookie,
so a role change takes effect immediately. The navigation hides what is not allowed, the admin
layout redirects unauthorised pages, and every server action re-checks the role.

Lock-out guards: an administrator cannot change their own role, cannot delete their own account, and
the last remaining administrator cannot be removed or demoted.

---

## How it is implemented

### Directory layout

```
prisma/schema.prisma           Data model (properties, private records, media, tours, enquiries, staff)
prisma/seed.ts                 Idempotent demo data
src/app/(site)/                Public website: home, /properties, /properties/[slug], about, contact
src/app/login/                 Staff sign-in (server action + client form)
src/app/admin/                 Staff portal
  page.tsx                     Dashboard
  properties/                  List, create, edit
  properties/[id]/page.tsx     Edit page (loads public + private record)
  enquiries/                   Inbox and status updates
  settings/                    Company settings (administrators)
  users/                       Staff account management (administrators)
  actions.ts                   Property / enquiry server actions
  property-form.tsx            Four-tab property editor (client)
src/app/actions/enquiry.ts     Public enquiry submission (validation + honeypot)
src/app/actions/locale.ts      EN/ES switch (cookie)
src/components/                Header/footer, cards, gallery, panorama viewer, tour tabs, icons
src/lib/                       Prisma client, auth, i18n, formatting, company settings, constants
public/panoramas/              Sample equirectangular panorama used by the 360° demo
```

### Data model

| Model | Notes |
| --- | --- |
| `Property` | Public, customer-facing listing. Bilingual copy, address, price, beds/baths, BER, features, coordinates, status, publish date. |
| `PropertyPrivate` | **Staff-only**, one-to-one with `Property`. Vendor contact, guide price, commission, exclusivity, keys, alarm, access notes, solicitor, legal status, internal notes. |
| `PropertyImage` | URL, bilingual alt text, `sortOrder`, `isCover`. |
| `PropertyTour` | `PANORAMA` / `MATTERPORT` / `VIDEO`, bilingual title, URL, `sortOrder`. |
| `Enquiry` | Viewing enquiry, optional property, locale, workflow status, internal note. |
| `CompanySettings` | Single row (id = 1) with name, taglines, about, contact details, PSRA number, opening hours, hero image. |
| `User` | Staff account: unique email, bcrypt hash, `Role` (`ADMIN` / `AGENT`). |

Enums: `Role`, `ListingType`, `PropertyType`, `PropertyStatus`, `TourType`, `EnquiryStatus`.

### Separation of public and private data

`Property` and `PropertyPrivate` are separate tables. Public pages query `Property` with `images`
and `tours` only; the private record is loaded exclusively by authenticated admin pages and
mutations. This makes it structurally hard for vendor details to leak into a public response.

### Authentication and authorisation

- Sessions are signed JWTs (HS256, 7 days) in an `httpOnly`, `sameSite=lax` cookie; passwords use bcrypt.
- `src/lib/auth.ts` exposes `requireUser()` / `requireActiveUser()` (active DB user or redirect),
  `requireAdmin()` (staff account management), `getStaffUser()` and `getAdminUser()`.
- `src/app/admin/layout.tsx` guards the whole portal; each server action re-checks the session and
  role, so calling an action directly cannot bypass the UI.
- All admin pages are marked `noindex`.

### Internationalisation

- Dictionaries in `src/lib/dictionaries/{en,es}.ts`; `src/lib/i18n.ts` resolves the active locale and
  interpolates `{placeholders}`.
- The choice is stored in a cookie by `src/app/actions/locale.ts`; `src/lib/i18n-server.ts` reads it
  on the server and `I18nProvider` exposes it to client components.
- Property content itself is bilingual (`titleEn` / `titleEs`, …) with English fallback when the
  Spanish field is empty.

### Forms and validation

Server actions validate input and return field-level errors. Public enquiries include a honeypot
field to reject simple bots. Mutations run through Prisma transactions where several records must
stay consistent (property + private record + images + tours).

### Tours and media

- `panorama-viewer.tsx` renders equirectangular images with Three.js (sRGB output, drag to look,
  wheel/buttons to zoom, auto-rotate toggle, fullscreen).
- Matterport and video tours are embedded in `tour-section.tsx`; video accepts YouTube, Vimeo or
  direct MP4 URLs.
- Galleries accept image **URLs** (no upload pipeline). Remote hosts must be allowed in
  `next.config.ts` (`images.remotePatterns`); `images.unsplash.com` and `plus.unsplash.com` are
  pre-allowed, as is `threejs.org` for the sample panorama.

---

## Publishing to GitHub

The folder is a complete, self-contained project. `node_modules`, `.next` and `.env` are ignored by
`.gitignore`, so only source, config, demo assets and the documentation are committed.

```bash
cd "/home/rodolfo/freebuff-projects/Property · Ireland"

git init -b main
git add .
git commit -m "Harbour & Oak estate agency portal"

# create an empty repository on github.com first (no README), then:
git remote add origin git@github.com:<your-user>/<repo>.git   # or https://github.com/<your-user>/<repo>.git
git push -u origin main
```

If you use the GitHub CLI instead:

```bash
gh repo create harbour-and-oak --private --source . --remote origin --push
```

After cloning on another machine:

```bash
cp .env.example .env     # fill in DATABASE_URL and AUTH_SECRET
npm install
npx prisma db push
npm run db:seed
npm run dev
```

---

## Deployment

1. Create a managed PostgreSQL database (Neon, Supabase, Aiven…) and copy its connection string.
2. Set `DATABASE_URL`, `AUTH_SECRET` and `NEXT_PUBLIC_SITE_URL` in the hosting provider's
   environment settings. Do **not** rely on the seeded demo passwords in production.
3. Apply the schema during the release step: `npx prisma db push` (or `prisma migrate deploy` once
   you start using migrations).
4. Deploy to Vercel or any Node host. `npm run build` must run with the production variables present.
5. Sign in, open `/admin/settings` to enter the real company details, then create real staff accounts
   at `/admin/users` and delete the demo ones.

---

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run db:push` | Push `prisma/schema.prisma` to the database |
| `npm run db:seed` | Seed demo content |
| `npm run db:studio` | Open Prisma Studio |

---

## Troubleshooting

**`@prisma/client did not initialize yet`** — the client was not generated:
`npx prisma generate`.

**npm skips install scripts** (`npm warn install-scripts …`) — newer npm versions block lifecycle
scripts by default, which leaves Prisma's engines and esbuild unbuilt. Run `npx prisma generate`
after installing, and approve the scripts if prompted (`npm install-scripts approve prisma`).

**`Can't reach database server`** — check that the container is running
(`docker ps`, `docker start harbour-oak-db`) and that the port in `DATABASE_URL` matches
(`5433` for the Docker command above). If the error mentions a host you do not recognise
(e.g. `db:5432`), an inherited shell variable is overriding `.env`: Prisma/Next read the process
environment first. Clear it for that shell (`unset DATABASE_URL`) or pass the right value inline.

**Port 3000 already in use** — `npm run dev -- -p 3001` or stop the other process.

**Images not loading** — add the remote host to `images.remotePatterns` in `next.config.ts` and
restart.

**Seed produces no enquiries** — the seed only inserts enquiries when the table is empty; it is
idempotent for properties and staff.

---

## Known limitations

- Single-factor email/password authentication; add MFA/SSO before handling sensitive client data at
  scale.
- Enquiries are stored in the database only — no email notification is sent yet. Add a transactional
  email provider if staff must be alerted immediately.
- Galleries accept URLs rather than uploaded files; wire S3 / Vercel Blob / Cloudinary for staff uploads.
- No audit log of staff account or property changes.
- Temporary passwords are set by the administrator; no invitation email flow.
