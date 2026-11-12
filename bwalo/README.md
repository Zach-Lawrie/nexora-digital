# Bwalo: African sports platform

Fixtures, live scores, standings, squads, transfers and news for leagues and tournaments in any sport,
with a fan app and a separate management portal.

- Cloudflare Pages project `bwalo`, root `bwalo/`, static files in `public/`, API in `functions/api/`
- Database: D1 `bwalo-db`, bound as `DB`. Tables in `schema.sql`.
- Secret `OWNER_CODE`: typed once when creating the first account to make it the platform owner. It stops working after that.

## Roles (checked on the server for every write)
- **Platform owner**: everything, accounts, packages
- **Organiser / league administrator**: one competition: settings, teams, fixtures, staff approvals, audit log
- **Scorekeeper**: scores, match status, events and player statistics
- **Media officer**: news and transfer rumours
- **Team manager**: own team's profile, squad, staff, lineups and outgoing transfers
- **Fan**: follows competitions, teams, sports and countries

## Sport engines
Goals and events (football, rugby, hockey, handball), periods (basketball, netball), cricket scorecard,
sets (tennis, volleyball, badminton), bouts (boxing, MMA, judo, chess), races and field events (athletics, swimming, cycling).

## Local testing
```
OWNER_CODE=test node dev/server.mjs dev/local.db 8790   # local server with a SQLite stand-in for D1
node dev/flow.mjs http://localhost:8790 test             # 70 permission and sign-in checks (fresh database)
```

## Not connected yet
Online payments, email, SMS and phone push alerts need outside provider accounts.
