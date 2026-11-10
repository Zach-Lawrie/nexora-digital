# Basa work orders (MEA edition)

Work order system for maintenance, installations, inspections, testing and calibration across
electrical, mechanical, automation and instrumentation work. Separate from the MEA website.

- Live (staging): https://mea-workorders.pages.dev
- Cloudflare Pages project `mea-workorders`, root `workorders/`, static files in `public/`, API in `functions/api/`
- Database: D1 `mea-workorders-db`, bound as `DB`. Tables in `schema.sql`.

## Roles
- **Admin / Manager**: everything, approves jobs, sends reports to clients, people, settings
- **Foreman**: accepts requests, creates jobs, assigns the lead technician, reviews or sends back
- **Technician**: own jobs; the lead adds the team, does the safety checks, checklist, hours, materials, photos, signs and submits
- **Client**: requests work, follows progress, reads and downloads the PDF report, signs off

## Job flow
Requested → Open → Assigned → In progress (safety checks first) ⇄ On hold → Completed (signed) → Reviewed → Approved → Sent to client → Closed (client signs)

## Local testing
```
node dev/seed.mjs <demo-password>          # writes dev/seed.sql (not committed)
node dev/server.mjs dev/local.db 8788      # local server with a SQLite stand-in for D1
node dev/flow.mjs http://localhost:8788 <demo-password>   # runs ~55 workflow checks
```

## Alerts, notices and reminders
- **Phone alerts (web push)**: each person taps *Turn on alerts* under My account (iPhone: add the app to the Home Screen first). Keys (VAPID) are created automatically and stored in `settings`; the private key never leaves the server.
- **Live alerts**: while the app is open, new alerts pop up at the top of the screen.
- **SMS**: Settings → Alerts, reminders and SMS. Providers: Africa's Talking, Twilio, or any webhook (`POST {to:[...], message}`). Sent only for urgent jobs, urgent notices and reminders marked for SMS. Numbers like `077…` get the country code.
- **Notice board** (`#/notices`): supervisors post to everyone, staff, technicians, foremen, managers, a trade team, all clients or one client; priority, pin, expiry, "I have read this" acknowledgement, read receipts and "remind the rest".
- **Reminders**: one-off or repeating (daily, weekdays, weekly, monthly), for yourself or (supervisors) for a group, in company time.
- **Automatic daily reminders** after the set hour: jobs scheduled today, due tomorrow, overdue, waiting for review or approval, reports unsigned for 3 days, and on Mondays tags due within 30 days.
- **Scheduler**: Worker `mea-workorders-cron` calls `POST /api/cron` every 15 minutes with header `x-cron-key` (secret `KEY` = `settings.cron_key`). The app also runs it as a fallback while someone has it open.
- Tests: `node dev/notify.mjs http://localhost:8788 <password> dev/local.db` (fake push service that decrypts and verifies every message, fake SMS gateway).
