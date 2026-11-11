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
  must_change INTEGER NOT NULL DEFAULT 1, notify_push INTEGER NOT NULL DEFAULT 1, notify_sms INTEGER NOT NULL DEFAULT 1,
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
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, wo_id INTEGER, text TEXT NOT NULL, kind TEXT, read INTEGER NOT NULL DEFAULT 0,
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
CREATE TABLE IF NOT EXISTS push_subs (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, endpoint TEXT NOT NULL UNIQUE, p256dh TEXT NOT NULL, auth TEXT NOT NULL, ua TEXT, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')));
CREATE TABLE IF NOT EXISTS announcements (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, body TEXT, priority TEXT NOT NULL DEFAULT 'Info', audience TEXT NOT NULL, pinned INTEGER NOT NULL DEFAULT 0, expires TEXT, ack_required INTEGER NOT NULL DEFAULT 0, sms INTEGER NOT NULL DEFAULT 0, created_by INTEGER, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')));
CREATE TABLE IF NOT EXISTS ann_reads (ann_id INTEGER NOT NULL, user_id INTEGER NOT NULL, read_at TEXT, ack_at TEXT, PRIMARY KEY (ann_id, user_id));
CREATE TABLE IF NOT EXISTS reminders (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, body TEXT, audience TEXT NOT NULL, next_at TEXT NOT NULL, repeat TEXT NOT NULL DEFAULT 'none', sms INTEGER NOT NULL DEFAULT 0, active INTEGER NOT NULL DEFAULT 1, created_by INTEGER, last_sent TEXT, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')));
CREATE TABLE IF NOT EXISTS auto_sent (k TEXT PRIMARY KEY, at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')));
CREATE TABLE IF NOT EXISTS stores (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, site_id INTEGER, notes TEXT, active INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')));
CREATE TABLE IF NOT EXISTS parts (id INTEGER PRIMARY KEY AUTOINCREMENT, part_no TEXT NOT NULL UNIQUE, name TEXT NOT NULL, category TEXT, unit TEXT NOT NULL DEFAULT 'each', cost REAL NOT NULL DEFAULT 0, min_qty REAL, reorder_qty REAL, supplier TEXT, notes TEXT, active INTEGER NOT NULL DEFAULT 1, alerted INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')));
CREATE TABLE IF NOT EXISTS stock (part_id INTEGER NOT NULL, store_id INTEGER NOT NULL, qty REAL NOT NULL DEFAULT 0, bin TEXT, PRIMARY KEY (part_id, store_id));
CREATE TABLE IF NOT EXISTS stock_moves (id INTEGER PRIMARY KEY AUTOINCREMENT, part_id INTEGER NOT NULL, store_id INTEGER NOT NULL, qty REAL NOT NULL, kind TEXT NOT NULL, wo_id INTEGER, unit_cost REAL, ref TEXT, note TEXT, user_id INTEGER, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')));
CREATE INDEX IF NOT EXISTS sm_part ON stock_moves(part_id);
CREATE TABLE IF NOT EXISTS reservations (id INTEGER PRIMARY KEY AUTOINCREMENT, part_id INTEGER NOT NULL, store_id INTEGER NOT NULL, wo_id INTEGER NOT NULL, qty REAL NOT NULL, status TEXT NOT NULL DEFAULT 'reserved', user_id INTEGER, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')));
CREATE TABLE IF NOT EXISTS asset_parts (asset_id INTEGER NOT NULL, part_id INTEGER NOT NULL, qty REAL NOT NULL DEFAULT 1, on_pm INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (asset_id, part_id));
CREATE TABLE IF NOT EXISTS purchase_requests (id INTEGER PRIMARY KEY AUTOINCREMENT, part_id INTEGER NOT NULL, store_id INTEGER, qty REAL NOT NULL, status TEXT NOT NULL DEFAULT 'requested', supplier TEXT, unit_cost REAL, note TEXT, requested_by INTEGER, wo_id INTEGER, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')), ordered_at TEXT, received_at TEXT);
CREATE TABLE IF NOT EXISTS clock (id INTEGER PRIMARY KEY AUTOINCREMENT, wo_id INTEGER NOT NULL, user_id INTEGER NOT NULL, kind TEXT NOT NULL DEFAULT 'work', start_at TEXT NOT NULL, end_at TEXT, note TEXT);
CREATE INDEX IF NOT EXISTS clk_wo ON clock(wo_id);
CREATE INDEX IF NOT EXISTS clk_user ON clock(user_id, end_at);
CREATE TABLE IF NOT EXISTS cm_points (id INTEGER PRIMARY KEY AUTOINCREMENT, asset_id INTEGER NOT NULL, name TEXT NOT NULL, kind TEXT NOT NULL, unit TEXT, warn REAL, alarm REAL, direction TEXT NOT NULL DEFAULT 'high', interval_days INTEGER, last_value REAL, last_at TEXT, last_status TEXT, active INTEGER NOT NULL DEFAULT 1);
CREATE TABLE IF NOT EXISTS cm_readings (id INTEGER PRIMARY KEY AUTOINCREMENT, point_id INTEGER NOT NULL, value REAL NOT NULL, status TEXT, note TEXT, user_id INTEGER, wo_id INTEGER, at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS cmr_point ON cm_readings(point_id);
CREATE TABLE IF NOT EXISTS tpm_items (id INTEGER PRIMARY KEY AUTOINCREMENT, asset_id INTEGER NOT NULL, item TEXT NOT NULL, kind TEXT, sort INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS tpm_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, asset_id INTEGER NOT NULL, operator TEXT NOT NULL, shift TEXT, date TEXT NOT NULL, results TEXT, issues INTEGER NOT NULL DEFAULT 0, hour_meter REAL, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')));
CREATE TABLE IF NOT EXISTS oee_logs (id INTEGER PRIMARY KEY AUTOINCREMENT, asset_id INTEGER NOT NULL, date TEXT NOT NULL, shift TEXT, planned_min REAL NOT NULL, downtime_min REAL NOT NULL DEFAULT 0, ideal_rate REAL NOT NULL, total_units REAL NOT NULL, good_units REAL NOT NULL, operator TEXT, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')));
CREATE TABLE IF NOT EXISTS projects (id INTEGER PRIMARY KEY AUTOINCREMENT, number TEXT NOT NULL UNIQUE, name TEXT NOT NULL, client_id INTEGER, site_id INTEGER, manager_id INTEGER, start_date TEXT, end_date TEXT, budget REAL, status TEXT NOT NULL DEFAULT 'planning', description TEXT, client_ref TEXT, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')));
CREATE TABLE IF NOT EXISTS project_milestones (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER NOT NULL, name TEXT NOT NULL, due TEXT, weight REAL NOT NULL DEFAULT 1, done_at TEXT, sort INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS project_costs (id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER NOT NULL, date TEXT NOT NULL, kind TEXT, amount REAL NOT NULL, note TEXT, user_id INTEGER, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')));
-- After creating these tables, also run migrations/v3-columns.sql (adds the v3 columns to older tables).
