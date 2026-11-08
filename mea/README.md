# MEA website, portals and store

Cloudflare Pages project **mea-engineering** (root `mea`, output `public`), with Pages Functions in `functions/` and a D1 database **mea-db** bound as `DB`.

- `public/index.html` – main MEA website
- `public/portal.html` – students, teachers and department staff
- `public/store.html` – public shop and checkout
- `public/admin.html` – admin: departments overview, @mea.co.zw accounts, courses, reports, activity log
- `functions/api/[[path]].js` – the API (sessions, roles, all data)
- `schema.sql`, `seed.sql` – database tables and starting courses

Staff accounts can only be created by an admin and must use an @mea.co.zw email. Students sign up themselves.
