# CarePoint Admin

Hospital administration system for one hospital: licences & compliance (with scanned copies and expiry warnings), stock (drugs, sundries, stationery, registers, groceries), department requests and usage, misuse checks, procurement, kiosk, theatres, medical aid claims, cash book, assets, repairs, vehicles, employees, attendance, leave, meetings, strategic plan, patients seen, deliveries, disease patterns and monthly reports.

## How it works
- `public/`: the app (no build step). `js/core.js` offline store and sync, `js/stock.js` stock engine, `js/modules.js` other modules, `js/app.js` shell, dashboard, reports, settings, `js/sample.js` sample data.
- `functions/api/[[path]].js`: Cloudflare Pages Function. Sign-in (PBKDF2 passwords, HttpOnly cookie), role permissions per record type (money hidden from roles without access), sync (`GET/POST /api/sync`), users, activity log, backup and restore.
- `schema.sql`: D1 tables. All records live in `docs` with a sequence number so each device pulls only what changed.
- Offline: each device keeps a full copy in IndexedDB and queues changes until the network returns. `sw.js` caches the app itself.
- Stock balances are never stored: they are worked out from the movement ledger, so two people working offline cannot overwrite each other's balance.

## Roles
Administrator, Nurse in charge, Storekeeper, Kiosk attendant, Accounts & claims, Department staff (tied to one department), Transport officer, Records clerk. Only Administrator and Accounts & claims see money.

## Hosting
Cloudflare Pages project `carepoint-admin` (root `carepoint-admin`, output `public`), D1 database `carepoint-admin-db` bound as `DB`, secret `SETUP_CODE` for the first administrator.

## Local testing
`SETUP_CODE=test node dev/server.mjs /tmp/cp.db 8796` then open http://localhost:8796
