# FreeFarm

Farm-to-market platform: farmers sell, buyers (households, shops, hotels, processors, exporters) buy or post requests, transporters move the produce.

- Cloudflare Pages project `freefarm` (root `freefarm/`, static files in `public/`, API in `functions/api/`), D1 database `freefarm-db` bound as `DB`.
- Income: fixed fee per completed sale (default $0.30, paid by the farmer, or buyer, or split) and per completed delivery (transporter), recorded in `ledger`; monthly plans (Farmer Pro, Business buyer, Exporter & processor, Transporter Pro) with a free trial. Members pay by EcoCash/bank and submit the reference; admin confirms under Payments.
- Members who owe more than the fee limit cannot list, accept orders or bid until they pay.
- Anti-waste: rescue discounts apply automatically in the last 3 days before the sell-by date; followers and farmers get alerts; pre-harvest listings; buyer requests with farmer offers; transport loads with bids.
- Example accounts (`demo=1`) show an "Example" badge, cannot be ordered from, and are removed with one button in Admin.

Local: `node dev/seed.mjs <pw> admin@x.test <adminpw> "Name" > dev/seed.sql`, load `schema.sql` + `dev/seed.sql` into `dev/local.db`, `node dev/server.mjs dev/local.db 8790`, then `node dev/flow.mjs http://localhost:8790 dev/local.db`.
