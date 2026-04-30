# CLAUDE.md — 100% Fitness Gym WhatsApp Bot

## Project Overview

WhatsApp chatbot + admin panel for **100% Fitness Gym** (fitness chain, 4 branches in Almaty, Kazakhstan).
Bot handles pricing, branch info, bookings, promotions, trainer/class info, manager contact.
Admin panel lets non-technical gym staff manage all business data without code changes.

**Language:** Russian (bot + admin UI) | **Currency:** KZT (тг)

---

## Architecture

**pnpm monorepo** — two packages sharing one PostgreSQL database:

- `packages/bot` — Express + TypeScript. WhatsApp webhook, conversation state machine, Redis sessions, booking + notification services.
- `packages/admin` — Next.js 15 App Router + Tailwind CSS. Russian UI. Server Actions for CRUD, calls bot API only for WhatsApp-dependent actions.

```
whatsapp-bot/
├── packages/
│   ├── bot/                  # Express + WhatsApp bot
│   │   ├── prisma/           # Schema, migrations, seed
│   │   └── src/
│   │       ├── whatsapp/     # API client, webhook, message builder
│   │       ├── conversation/ # State machine engine
│   │       ├── screens/      # Screen handlers (welcome, menu, prices, booking...)
│   │       ├── services/     # Booking, notification, content
│   │       ├── routes/       # Admin API endpoints
│   │       ├── jobs/         # Scheduled jobs (cleanup, expiry)
│   │       ├── db/           # Prisma client + soft-delete extension
│   │       └── redis/        # Session store
│   └── admin/                # Next.js admin panel
│       └── src/
│           ├── app/          # App Router pages
│           │   ├── api/upload/   # Image upload endpoint (GCS / local)
│           │   ├── broadcasts/   # List, new, [id] edit page
│           │   ├── trainers/     # List + inline edit (TrainerCard)
│           │   └── classes/      # List + inline edit (ClassCard)
│           ├── components/   # Shared UI components
│           │   ├── image-upload.tsx       # Drag-and-drop image uploader
│           │   ├── schedule-editor.tsx    # Visual day/time schedule picker
│           │   └── working-hours-input.tsx # Dual time picker (open–close)
│           └── lib/          # DB client, auth, utils
├── docker-compose.yml        # PostgreSQL 16 + Redis 7
├── .env.example
└── pnpm-workspace.yaml
```

---

## Confirmed Decisions

- **WhatsApp API**: mock mode for dev (logs to console), real API via env vars in production
- **Bot WhatsApp number**: +77086406121 (changed from +77752899276 — that number is now used by Байзакова branch manager on their phone)
- **Admin UI**: entirely in Russian, mobile-responsive (hamburger menu on mobile)
- **Admin panel domain**: admin.100fitnessgym.kz (Cloud Run domain mapping)
- **Booking data**: phone auto-captured from WhatsApp, no name prompt
- **Booking time selection**: 2-step flow — first pick period (Утро/Вечер), then specific slot — to stay within WhatsApp's 10-row list limit
- **Soft deletes**: trainers, clients, branches use `is_active` flag (never hard delete)
- **Price integrity**: `booking.price_at_booking` snapshots price at booking time
- **Manager notifications**: WhatsApp template message to branch manager on every new booking
- **Bot Prisma client**: auto-filters `is_active=true` via Prisma Client Extension
- **Admin Prisma client**: no extension — sees everything including inactive records
- **Image uploads**: GCS in production (`GCS_BUCKET_NAME`), local `public/uploads/` fallback in dev
- **CSV import**: semicolon-delimited, columns `ФИО;Телефон`, duplicates skipped by phone
- **Inline editing**: trainers, classes, and broadcasts support inline editing from their list pages
- **Reusable components**: `ImageUpload`, `ScheduleEditor`, `WorkingHoursInput` — all use hidden inputs so server actions need no changes
- **Logout**: uses plain `<a>` tag (not Next.js `<Link>`) to prevent prefetch CORS errors; redirects to own domain via request headers

---

## Branches (Real Data)

| Branch | Address | Phone | Manager Phone |
|--------|---------|-------|---------------|
| Байзакова | Байзакова 280, 3 этаж | +77752899276 | +77752899276 |
| Кожамкулова | Кожамкулова 136 | +77774702979 | +77774702979 |
| Кабанбай батыра | Кабанбай батыра 147 | +77475806137 | +77475806137 |
| Макатаева | Макатаева 45, 3 этаж | +77478125425 | +77478125425 |

---

## Pricing (Real Data — KZT)

### Байзакова 280
| Type | Time | Price |
|------|------|-------|
| 12 занятий | 07:00–17:00 | 24 000 |
| 12 занятий | 07:00–23:00 | 27 000 |
| Безлимит | 07:00–17:00 | 25 000 |
| Безлимит | 07:00–23:00 | 30 000 |
| 3 месяца | — | 70 000 |
| 6 месяцев | — | 130 000 |
| 12 месяцев | — | 220 000 |

### Кожамкулова 136
| Type | Time | Price |
|------|------|-------|
| 12 занятий | 07:00–17:00 | 19 000 |
| 12 занятий | 07:00–23:00 | 22 000 |
| Безлимит | 07:00–17:00 | 20 000 |
| Безлимит | 07:00–23:00 | 24 000 |
| 3 месяца | — | 65 000 |
| 6 месяцев | — | 120 000 |
| 12 месяцев | — | 170 000 |

### Кабанбай батыра 147
| Type | Time | Price |
|------|------|-------|
| 12 занятий | 07:00–17:00 | 19 000 |
| 12 занятий | 07:00–23:00 | 22 000 |
| Безлимит | 07:00–17:00 | 20 000 |
| Безлимит | 07:00–23:00 | 24 000 |
| 3 месяца | — | 65 000 |
| 6 месяцев | — | 120 000 |
| 12 месяцев | — | 170 000 |

### Макатаева 45
| Type | Time | Price |
|------|------|-------|
| 12 занятий | 07:00–17:00 | 19 000 |
| 12 занятий | 07:00–23:00 | 21 000 |
| Безлимит | 07:00–17:00 | 20 000 |
| Безлимит | 07:00–23:00 | 23 000 |
| 3 месяца | — | 50 000 |
| 6 месяцев | — | 90 000 |
| 12 месяцев | — | 130 000 |

---

## Bot Conversation Flow (State Machine)

| State | Screen | Message Type |
|-------|--------|-------------|
| WELCOME | Greeting + main menu | List message (5 items) |
| MAIN_MENU | Handle menu selection | — |
| PRICES_OVERVIEW | General price range | Text + buttons |
| BRANCH_SELECTION | Pick a branch | List message (4 items) |
| BRANCH_MENU | Branch submenu | List message (5 items) |
| BRANCH_PRICES | Monthly vs long-term | Reply buttons (2) |
| BRANCH_PRICES_MONTHLY | 4 membership options | List message |
| BRANCH_PRICES_LONGTERM | 3/6/12 month options | List message |
| CONTACT_MANAGER | Show manager phone | Text message |
| BOOKING_BRANCH | Select branch for booking | List message |
| BOOKING_TYPE | Individual vs group | Reply buttons (2) |
| BOOKING_DATE | Select date (next 7 days) | List message |
| BOOKING_TIME | Select time period → time slot | Reply buttons → List message |
| BOOKING_CONFIRM | Review + confirm | Reply buttons (2) |
| GROUP_CLASSES | Class schedule per branch | List message |
| CLASS_DETAIL | Class info | Text message |
| TRAINERS | Trainer list per branch | List message |
| TRAINER_PROFILE | Trainer detail + photo | Text + image |
| PROMOTIONS | Active promos list | List message |
| PROMO_DETAIL | Promo details | Text message |

---

## WhatsApp API Constraints

- **Reply buttons**: max 3 per message, title max 20 chars
- **List messages**: max 10 rows total, title max 24 chars, description max 72 chars
- **Template messages**: required outside 24h customer service window (manager notifications, broadcasts)
- **Phone number**: bot number (+77086406121) must NOT be on regular WhatsApp or WhatsApp Business app simultaneously
- **Mock mode**: when `WHATSAPP_ACCESS_TOKEN` is empty, bot logs messages to console instead of sending

---

## Key Business Rules

1. Every screen has a "Back" option to return to previous menu
2. Session timeout: 24h → return to main menu (Redis TTL)
3. Booking timeout: 1h for incomplete bookings → cleanup job
4. Pricing is per-branch — different prices at each location
5. Only admins manage clients — bot users cannot self-register
6. Broadcasts are admin-only via template messages
7. Phone number is the user identifier (auto from WhatsApp)

---

## Environment Variables

```env
# WhatsApp Business API (leave empty for mock mode)
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_VERIFY_TOKEN=myverifytoken
WHATSAPP_API_VERSION=v21.0

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/fitness_bot
REDIS_URL=redis://localhost:6379

# Admin Panel
ADMIN_JWT_SECRET=your-secret-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=changeme

# App
BOT_PORT=3000
ADMIN_PORT=3001
NODE_ENV=development

# Image Upload (optional — if empty, saves to local filesystem)
GCS_BUCKET_NAME=

# Notification templates (Meta-approved template names)
WA_TEMPLATE_BOOKING_NOTIFICATION=booking_notification
WA_TEMPLATE_BOOKING_CONFIRMATION=booking_confirmation
WA_TEMPLATE_BROADCAST=broadcast_message
```

## Production URLs

| Service | URL |
|---------|-----|
| Bot webhook | `https://fitness-bot-y55ljl45uq-uc.a.run.app/webhook` |
| Admin panel | `https://admin.100fitnessgym.kz` |
| Admin (Cloud Run direct) | `https://fitness-admin-y55ljl45uq-uc.a.run.app` |

---

## Commands

```bash
# Local development
docker-compose up -d                    # Start PostgreSQL + Redis
pnpm install                            # Install all dependencies
pnpm --filter bot prisma migrate dev    # Run migrations
pnpm --filter bot prisma db seed        # Seed branch + pricing data
pnpm dev                                # Start both bot + admin

# Individual packages
pnpm --filter bot dev                   # Bot only (port 3000)
pnpm --filter admin dev                 # Admin only (port 3001)

# Database
pnpm --filter bot prisma studio         # Visual DB browser
pnpm --filter bot prisma migrate dev    # Create new migration
```
