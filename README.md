# 100% Fitness Gym — WhatsApp Bot + Admin Panel

WhatsApp chatbot and admin panel for 100% Fitness Gym (4 branches in Almaty, Kazakhstan).

## Quick Start

```bash
# 1. Start PostgreSQL + Redis
docker-compose up -d

# 2. Install dependencies
pnpm install

# 3. Copy .env and configure
cp .env.example .env
cp .env packages/bot/.env
cp .env packages/admin/.env

# 4. Run database migration + seed
cd packages/bot
npx prisma migrate dev
npx prisma db seed
cd ../..

# 5. Start both bot and admin
pnpm dev
```

- Bot: http://localhost:3000 (webhook: `/webhook`, health: `/health`)
- Admin: http://localhost:3001 (login: admin / changeme)

## Architecture

- `packages/bot` — Express + TypeScript. WhatsApp webhook, conversation state machine, booking + notification services.
- `packages/admin` — Next.js 15 + Tailwind. Russian UI. Pricing matrix, booking management, client CSV import, broadcasts.

Both share one PostgreSQL database via Prisma.

## Admin Panel Features

- **Branches** — edit address, phone, manager phone, working hours (visual time picker)
- **Pricing** — click-to-edit price matrix across all branches
- **Trainers** — add/edit with photo upload (drag-and-drop), inline editing
- **Group Classes** — add/edit with visual schedule editor (day/time picker), inline editing
- **Promotions** — create with image upload, date ranges, toggle active/inactive
- **Bookings** — view, confirm, cancel bookings
- **Clients** — manage clients, CSV import (format: `ФИО;Телефон`, duplicates skipped)
- **Broadcasts** — create, edit drafts, send via WhatsApp, view sent history

## Image Uploads

Images (trainer photos, promotion images) are uploaded via drag-and-drop in the admin panel.

- **Production**: stored in Google Cloud Storage (`GCS_BUCKET_NAME` env var)
- **Local dev**: saved to `packages/admin/public/uploads/` (no GCS setup needed)

## WhatsApp Mock Mode

When `WHATSAPP_ACCESS_TOKEN` is empty, the bot logs all outgoing messages to console instead of sending them. This lets you develop and test without Meta API credentials.

## Deployment

The project is configured for Google Cloud Run via `cloudbuild.yaml`. See [SETUP.md](SETUP.md) for detailed deployment instructions.
