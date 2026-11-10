# FreeFarm

Farm-to-market platform: farmers sell, buyers (households, shops, hotels, processors, exporters) buy or post requests, transporters move the produce.

- Cloudflare Pages project `freefarm` (root `freefarm/`, static files in `public/`, API in `functions/api/`), D1 database `freefarm-db` bound as `DB`.
- Income: fixed fee per completed sale (default $0.30, paid by the farmer, or buyer, or split) and per completed delivery (transporter), recorded in `ledger`; monthly plans (Farmer Pro, Business buyer, Exporter & processor, Transporter Pro) with a free trial. Members pay by EcoCash/bank and submit the reference; admin confirms under Payments.
- Members who owe more than the fee limit cannot list, accept orders or bid until they pay.
- Anti-waste: rescue discounts apply automatically in the last 3 days before the sell-by date; followers and farmers get alerts; pre-harvest listings; buyer requests with farmer offers; transport loads with bids.
- Example accounts (`demo=1`) show an "Example" badge, cannot be ordered from, and are removed with one button in Admin.

Local: `node dev/seed.mjs <pw> admin@x.test <adminpw> "Name" > dev/seed.sql`, load `schema.sql` + `dev/seed.sql` into `dev/local.db`, `node dev/server.mjs dev/local.db 8790`, then `node dev/flow.mjs http://localhost:8790 dev/local.db`.

## Farm management (My farm)
For farmers: fields, crops and livestock batches with crop calendars (auto tasks with input suggestions), growth diary with photos, tasks, workers with attendance, advances and payroll (payslips), store/inventory with low-stock and chemical withholding warnings, farm accounts (sales, wages and purchases booked automatically; profit per crop; CSV), weather from Open-Meteo with frost/heat/rain/wind/dry-spell alerts and weather-based disease risk, AI plant doctor (Workers AI `@cf/meta/llama-3.2-11b-vision-instruct`) with regional outbreak alerts, AI farm advisor (`@cf/meta/llama-3.1-8b-instruct`), automation rules on weather and sensors (devices POST to `/api/farm/data` with the farm key).
Free plan limits: 2 fields, 3 active crops, 3 workers, 3 scans and 3 advisor questions a month, no sensors. Farm Manager plan (`price_farmer_farm`) removes limits.
Suppliers (role `supplier`) sell farm inputs in the `Farm inputs` category; farmers buy them and the purchase is booked in their farm accounts.
Pages project needs bindings `DB` (D1) and `AI` (Workers AI). Tests: start the dev server with `WEATHER_URL=http://localhost:8798/v1/forecast MOCK_AI=1`, then `node dev/farm_test.mjs http://localhost:8790 dev/local.db`.
