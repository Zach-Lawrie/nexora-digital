-- MEA school portal: intakes, lessons, assessments, timetable, fees, companies, lab, resources.
-- Safe to run once on top of schema.sql. Every new table is IF NOT EXISTS; column additions run once.

CREATE TABLE IF NOT EXISTS companies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

ALTER TABLE users ADD COLUMN company_id INTEGER REFERENCES companies(id);
ALTER TABLE users ADD COLUMN company_manager INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS intakes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id),
  name TEXT NOT NULL,
  venue TEXT NOT NULL DEFAULT 'Online' CHECK (venue IN ('Harare','Online')),
  start_date TEXT,
  end_date TEXT,
  capacity INTEGER,
  schedule TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

ALTER TABLE enrolments ADD COLUMN intake_id INTEGER REFERENCES intakes(id);
ALTER TABLE enrolments ADD COLUMN company_id INTEGER REFERENCES companies(id);

CREATE TABLE IF NOT EXISTS modules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  sort INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  mime TEXT NOT NULL DEFAULT 'application/octet-stream',
  size INTEGER NOT NULL DEFAULT 0,
  chunks INTEGER NOT NULL DEFAULT 0,
  owner_id INTEGER REFERENCES users(id),
  purpose TEXT NOT NULL CHECK (purpose IN ('lesson','submission','article')),
  complete INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE TABLE IF NOT EXISTS file_chunks (
  file_id INTEGER NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  n INTEGER NOT NULL,
  data BLOB NOT NULL,
  PRIMARY KEY (file_id, n)
);

CREATE TABLE IF NOT EXISTS lessons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  module_id INTEGER REFERENCES modules(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'reading' CHECK (kind IN ('video','reading','file','link')),
  body TEXT,
  url TEXT,
  file_id INTEGER REFERENCES files(id),
  sort INTEGER NOT NULL DEFAULT 0,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE TABLE IF NOT EXISTS lesson_done (
  enrolment_id INTEGER NOT NULL REFERENCES enrolments(id) ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  done_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  PRIMARY KEY (enrolment_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  instructions TEXT,
  due_date TEXT,
  max_score REAL NOT NULL DEFAULT 100,
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE TABLE IF NOT EXISTS submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  assignment_id INTEGER NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  enrolment_id INTEGER NOT NULL REFERENCES enrolments(id) ON DELETE CASCADE,
  text TEXT,
  file_id INTEGER REFERENCES files(id),
  submitted_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  score REAL,
  feedback TEXT,
  marked_by INTEGER REFERENCES users(id),
  marked_at TEXT,
  UNIQUE (assignment_id, enrolment_id)
);

CREATE TABLE IF NOT EXISTS quizzes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  pass_pct INTEGER NOT NULL DEFAULT 60,
  attempts INTEGER NOT NULL DEFAULT 2,
  questions TEXT NOT NULL DEFAULT '[]',
  published INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quiz_id INTEGER NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
  enrolment_id INTEGER NOT NULL REFERENCES enrolments(id) ON DELETE CASCADE,
  answers TEXT NOT NULL,
  score REAL NOT NULL,
  max_score REAL NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

CREATE TABLE IF NOT EXISTS class_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  intake_id INTEGER NOT NULL REFERENCES intakes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  place TEXT,
  link TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);
CREATE TABLE IF NOT EXISTS attendance (
  session_id INTEGER NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
  enrolment_id INTEGER NOT NULL REFERENCES enrolments(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('present','late','absent','excused')),
  marked_by INTEGER REFERENCES users(id),
  PRIMARY KEY (session_id, enrolment_id)
);

CREATE TABLE IF NOT EXISTS notices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  intake_id INTEGER REFERENCES intakes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  enrolment_id INTEGER NOT NULL REFERENCES enrolments(id) ON DELETE CASCADE,
  from_id INTEGER NOT NULL REFERENCES users(id),
  body TEXT NOT NULL,
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  number TEXT NOT NULL UNIQUE,
  student_id INTEGER REFERENCES users(id),
  company_id INTEGER REFERENCES companies(id),
  enrolment_id INTEGER REFERENCES enrolments(id),
  description TEXT NOT NULL,
  amount REAL NOT NULL CHECK (amount >= 0),
  due_date TEXT,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid','paid','void')),
  paid_at TEXT,
  method TEXT,
  reference TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

CREATE TABLE IF NOT EXISTS lab_slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  station TEXT NOT NULL,
  starts_at TEXT NOT NULL,
  ends_at TEXT NOT NULL,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  enrolment_id INTEGER REFERENCES enrolments(id) ON DELETE SET NULL,
  access TEXT,
  created_by INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

CREATE TABLE IF NOT EXISTS course_kit (
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  qty INTEGER NOT NULL DEFAULT 1,
  required INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (course_id, product_id)
);

CREATE TABLE IF NOT EXISTS articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  cat TEXT NOT NULL DEFAULT 'Automation',
  mins INTEGER NOT NULL DEFAULT 4,
  sum TEXT,
  data TEXT NOT NULL DEFAULT '{}',
  published INTEGER NOT NULL DEFAULT 1,
  sort INTEGER NOT NULL DEFAULT 0,
  updated_by INTEGER REFERENCES users(id),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now'))
);

CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id, sort);
CREATE INDEX IF NOT EXISTS idx_sessions_intake ON class_sessions(intake_id, starts_at);
CREATE INDEX IF NOT EXISTS idx_messages_enrol ON messages(enrolment_id, created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_student ON invoices(student_id);
CREATE INDEX IF NOT EXISTS idx_invoices_company ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_lab_start ON lab_slots(starts_at);
