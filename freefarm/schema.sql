-- FreeFarm farm-to-market platform (Cloudflare D1 / SQLite)
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL UNIQUE, email TEXT UNIQUE, name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('farmer','buyer','transporter','admin')),
  buyer_type TEXT, business TEXT, country TEXT NOT NULL DEFAULT 'Zimbabwe', region TEXT, town TEXT, bio TEXT,
  crops TEXT, vehicle TEXT, capacity_kg REAL, cold INTEGER NOT NULL DEFAULT 0, routes TEXT,
  plan TEXT NOT NULL DEFAULT 'free', plan_until TEXT, verified INTEGER NOT NULL DEFAULT 0, demo INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active', pass_hash TEXT NOT NULL, pass_salt TEXT NOT NULL, must_change INTEGER NOT NULL DEFAULT 0,
  failed INTEGER NOT NULL DEFAULT 0, locked_until TEXT, last_login TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY, user_id INTEGER NOT NULL, expires_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT);
CREATE TABLE IF NOT EXISTS listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT, farmer_id INTEGER NOT NULL, kind TEXT NOT NULL DEFAULT 'now',
  crop TEXT NOT NULL, category TEXT NOT NULL, variety TEXT, grade TEXT, qty REAL NOT NULL, unit TEXT NOT NULL, unit_kg REAL NOT NULL DEFAULT 1,
  price REAL NOT NULL, min_order REAL NOT NULL DEFAULT 1, rescue_pct INTEGER NOT NULL DEFAULT 0,
  available_from TEXT, best_before TEXT, country TEXT NOT NULL, region TEXT, town TEXT,
  delivery TEXT NOT NULL DEFAULT 'pickup', organic INTEGER NOT NULL DEFAULT 0, export_ready INTEGER NOT NULL DEFAULT 0,
  photo TEXT, notes TEXT, status TEXT NOT NULL DEFAULT 'active', views INTEGER NOT NULL DEFAULT 0, warned INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')), updated_at TEXT
);
CREATE INDEX IF NOT EXISTS ls_status ON listings(status, crop);
CREATE TABLE IF NOT EXISTS requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT, buyer_id INTEGER NOT NULL, crop TEXT NOT NULL, category TEXT, qty REAL NOT NULL, unit TEXT NOT NULL,
  max_price REAL, needed_by TEXT, repeat TEXT NOT NULL DEFAULT 'once', country TEXT NOT NULL, region TEXT, town TEXT, notes TEXT,
  status TEXT NOT NULL DEFAULT 'open', created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE TABLE IF NOT EXISTS offers (
  id INTEGER PRIMARY KEY AUTOINCREMENT, request_id INTEGER NOT NULL, farmer_id INTEGER NOT NULL, qty REAL NOT NULL, price REAL NOT NULL,
  available_from TEXT, note TEXT, status TEXT NOT NULL DEFAULT 'pending', order_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT, number TEXT NOT NULL UNIQUE, listing_id INTEGER, offer_id INTEGER, buyer_id INTEGER NOT NULL, farmer_id INTEGER NOT NULL,
  crop TEXT NOT NULL, qty REAL NOT NULL, unit TEXT NOT NULL, unit_kg REAL NOT NULL DEFAULT 1, price REAL NOT NULL, total REAL NOT NULL, rescue INTEGER NOT NULL DEFAULT 0,
  delivery TEXT NOT NULL, address TEXT, needed_by TEXT, payment TEXT NOT NULL DEFAULT 'cash', paid INTEGER NOT NULL DEFAULT 0, note TEXT,
  status TEXT NOT NULL DEFAULT 'placed', fee REAL NOT NULL DEFAULT 0, cancel_reason TEXT, rating INTEGER, review TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')), accepted_at TEXT, delivered_at TEXT, completed_at TEXT, updated_at TEXT
);
CREATE INDEX IF NOT EXISTS od_buyer ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS od_farmer ON orders(farmer_id);
CREATE TABLE IF NOT EXISTS jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT, order_id INTEGER, created_by INTEGER NOT NULL, transporter_id INTEGER,
  load TEXT NOT NULL, weight_kg REAL, cold INTEGER NOT NULL DEFAULT 0, from_place TEXT NOT NULL, from_region TEXT, to_place TEXT NOT NULL, to_region TEXT,
  country TEXT NOT NULL DEFAULT 'Zimbabwe', pickup_date TEXT, budget REAL, price REAL, status TEXT NOT NULL DEFAULT 'open', fee REAL NOT NULL DEFAULT 0, rating INTEGER,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')), updated_at TEXT
);
CREATE TABLE IF NOT EXISTS bids (
  id INTEGER PRIMARY KEY AUTOINCREMENT, job_id INTEGER NOT NULL, transporter_id INTEGER NOT NULL, price REAL NOT NULL, note TEXT, status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT, thread TEXT NOT NULL, user_id INTEGER NOT NULL, text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS msg_thread ON messages(thread);
CREATE TABLE IF NOT EXISTS ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, kind TEXT NOT NULL, amount REAL NOT NULL, ref TEXT, note TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS lg_user ON ledger(user_id);
CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, purpose TEXT NOT NULL, plan TEXT, months INTEGER, amount REAL NOT NULL,
  method TEXT NOT NULL, reference TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending', decided_by INTEGER, decided_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE TABLE IF NOT EXISTS follows (user_id INTEGER NOT NULL, crop TEXT NOT NULL, PRIMARY KEY (user_id, crop));
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, text TEXT NOT NULL, link TEXT, read INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE INDEX IF NOT EXISTS nt_user ON notifications(user_id, read);
CREATE TABLE IF NOT EXISTS audit (
  id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, who TEXT, action TEXT, detail TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
