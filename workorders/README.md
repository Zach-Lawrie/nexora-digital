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
