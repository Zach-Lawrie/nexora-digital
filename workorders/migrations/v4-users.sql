-- v4: allow the 'stores' and 'dept' roles. SQLite cannot change a CHECK constraint, so the users table is rebuilt.
-- Run once on an existing database (new databases get it from schema.sql). Check both counts match before the DROP.
CREATE TABLE users_new (
  id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, name TEXT NOT NULL, phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin','manager','foreman','tech','client','stores','dept')),
  trade TEXT, client_id INTEGER, pass_hash TEXT NOT NULL, pass_salt TEXT NOT NULL,
  must_change INTEGER NOT NULL DEFAULT 1, status TEXT NOT NULL DEFAULT 'active', failed INTEGER NOT NULL DEFAULT 0,
  locked_until TEXT, last_login TEXT, created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  notify_push INTEGER NOT NULL DEFAULT 1, notify_sms INTEGER NOT NULL DEFAULT 1, shift_hours REAL
);
INSERT INTO users_new (id,email,name,phone,role,trade,client_id,pass_hash,pass_salt,must_change,status,failed,locked_until,last_login,created_at,notify_push,notify_sms,shift_hours)
  SELECT id,email,name,phone,role,trade,client_id,pass_hash,pass_salt,must_change,status,failed,locked_until,last_login,created_at,notify_push,notify_sms,shift_hours FROM users;
DROP TABLE users;
ALTER TABLE users_new RENAME TO users;
