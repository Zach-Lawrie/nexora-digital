// Dumps dev/local.db to SQL chunks for D1 (dev/dump-N.sql)
import fs from 'node:fs'; import { DatabaseSync } from 'node:sqlite';
const d = new DatabaseSync('dev/local.db');
const T = ['settings', 'clients', 'sites', 'assets', 'users', 'pm_plans', 'work_orders', 'wo_team', 'checklist', 'time_logs', 'materials', 'activity', 'notifications'];
const q = (v) => v == null ? 'NULL' : typeof v === 'number' || typeof v === 'bigint' ? String(v) : `'${String(v).replace(/'/g, "''")}'`;
const lines = [];
for (const t of T) for (const r of d.prepare(`SELECT * FROM ${t}`).all()) { if (t === 'settings' && r.key === 'logo') r.value = '/brand/logo.png'; if (t === 'activity' && r.kind === 'photo') continue; const k = Object.keys(r); lines.push(`INSERT INTO ${t} (${k.join(',')}) VALUES (${k.map((x) => q(r[x])).join(',')});`); }
let chunk = [], size = 0, n = 0;
const flush = () => { if (chunk.length) fs.writeFileSync(`dev/dump-${n++}.sql`, chunk.join('\n')); chunk = []; size = 0; };
for (const l of lines) { if (size + l.length > 90000) flush(); chunk.push(l); size += l.length; }
flush(); console.log(lines.length, 'rows in', n, 'files');
