-- Basa work order system (Cloudflare D1 / SQLite)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin','manager','foreman','tech','client')),
  trade TEXT,
  client_id INTEGER,
  pass_hash TEXT NOT NULL,
  pass_salt TEXT NOT NULL,
  must_change INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'active',
  failed INTEGER NOT NULL DEFAULT 0,
  locked_until TEXT,
  last_login TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id INTEGER NOT NULL, expires_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, contact TEXT, email TEXT, phone TEXT, address TEXT, notes TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE TABLE IF NOT EXISTS sites (
  id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER NOT NULL, name TEXT NOT NULL, address TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE TABLE IF NOT EXISTS assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT, site_id INTEGER NOT NULL, tag TEXT NOT NULL, name TEXT NOT NULL, discipline TEXT,
  make TEXT, model TEXT, serial TEXT, rating TEXT, criticality TEXT DEFAULT 'B', notes TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE TABLE IF NOT EXISTS work_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  number TEXT NOT NULL UNIQUE,
  client_id INTEGER, site_id INTEGER, asset_id INTEGER,
  discipline TEXT NOT NULL, type TEXT NOT NULL, priority TEXT NOT NULL DEFAULT 'Normal',
  title TEXT NOT NULL, description TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  requested_by INTEGER, foreman_id INTEGER, lead_id INTEGER,
  due_date TEXT, scheduled_date TEXT, est_hours REAL, quote REAL,
  findings TEXT, work_done TEXT, recommendations TEXT, client_ref TEXT,
  tech_sign TEXT, tech_sign_name TEXT, client_sign TEXT, client_sign_name TEXT, signed_at TEXT,
  report_token TEXT, released_at TEXT, started_at TEXT, completed_at TEXT, reviewed_at TEXT, approved_at TEXT, approved_by INTEGER,
  pm_id INTEGER, sheets TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  updated_at TEXT
);
CREATE INDEX IF NOT EXISTS wo_status ON work_orders(status);
CREATE INDEX IF NOT EXISTS wo_client ON work_orders(client_id);
CREATE INDEX IF NOT EXISTS wo_lead ON work_orders(lead_id);
CREATE TABLE IF NOT EXISTS wo_team (
  id INTEGER PRIMARY KEY AUTOINCREMENT, wo_id INTEGER NOT NULL, user_id INTEGER, name TEXT NOT NULL, role_text TEXT, added_by INTEGER,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE TABLE IF NOT EXISTS checklist (
  id INTEGER PRIMARY KEY AUTOINCREMENT, wo_id INTEGER NOT NULL, section TEXT NOT NULL, item TEXT NOT NULL,
  result TEXT NOT NULL DEFAULT '', reading TEXT, note TEXT, sort INTEGER NOT NULL DEFAULT 0, done_by INTEGER
);
CREATE INDEX IF NOT EXISTS ck_wo ON checklist(wo_id);
CREATE TABLE IF NOT EXISTS time_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT, wo_id INTEGER NOT NULL, user_id INTEGER, worker TEXT NOT NULL, date TEXT NOT NULL, hours REAL NOT NULL, note TEXT, added_by INTEGER,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE TABLE IF NOT EXISTS materials (
  id INTEGER PRIMARY KEY AUTOINCREMENT, wo_id INTEGER NOT NULL, item TEXT NOT NULL, qty REAL NOT NULL, unit TEXT, unit_cost REAL DEFAULT 0, added_by INTEGER,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE TABLE IF NOT EXISTS photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT, wo_id INTEGER NOT NULL, user_id INTEGER, caption TEXT, stage TEXT, data TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE TABLE IF NOT EXISTS activity (
  id INTEGER PRIMARY KEY AUTOINCREMENT, wo_id INTEGER NOT NULL, user_id INTEGER, who TEXT, kind TEXT, text TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS act_wo ON activity(wo_id);
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, wo_id INTEGER, text TEXT NOT NULL, read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS nt_user ON notifications(user_id, read);
CREATE TABLE IF NOT EXISTS pm_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT, asset_id INTEGER NOT NULL, title TEXT NOT NULL, discipline TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'Preventive maintenance',
  every_days INTEGER NOT NULL, next_due TEXT NOT NULL, foreman_id INTEGER, est_hours REAL, active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE TABLE IF NOT EXISTS audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, who TEXT, action TEXT, detail TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE TABLE IF NOT EXISTS test_rows (
  id INTEGER PRIMARY KEY AUTOINCREMENT, wo_id INTEGER NOT NULL, sheet TEXT NOT NULL, data TEXT NOT NULL, result TEXT, remarks TEXT,
  test_date TEXT, next_due TEXT, sort INTEGER NOT NULL DEFAULT 0, added_by INTEGER,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS tr_wo ON test_rows(wo_id, sheet);
