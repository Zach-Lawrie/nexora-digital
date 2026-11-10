// Writes seed.sql (demo accounts, clients, sites, assets, PM plans). Usage: node dev/seed.mjs <password>
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PW = process.argv[2];
if (!PW || PW.length < 8) { console.error('give a demo password (8+ chars)'); process.exit(1); }
const hex = (b) => [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
async function hash(pw) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
  return [hex(bits), hex(salt)];
}
const q = (v) => (v == null ? 'NULL' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const ins = (t, cols, rows) => rows.map((r) => `INSERT INTO ${t} (${cols.join(',')}) VALUES (${r.map(q).join(',')});`).join('\n');
const day = (n) => { const d = new Date(); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

const clients = [
  [1, 'Shamva Gold Processing', 'Mr Tendai Moyo (Plant Engineer)', 'plant@shamvagold.example', '+263 77 220 9014', 'Shamva, Mashonaland Central'],
  [2, 'Kariba Foods (Pvt) Ltd', 'Mrs Rudo Chiweshe (Maintenance Manager)', 'maintenance@karibafoods.example', '+263 242 664 210', 'Workington, Harare'],
  [3, 'Msasa Ridge Lodge', 'Mr Brian Sithole (General Manager)', 'gm@msasaridge.example', '+263 83 284 6610', 'Victoria Falls'],
];
const sites = [
  [1, 1, 'Processing plant', 'Shamva mine, plant area'], [2, 1, 'Pump station', 'Mazowe river intake'],
  [3, 2, 'Factory floor', '14 Coventry Rd, Workington'], [4, 2, 'Cold rooms', '14 Coventry Rd, Workington'],
  [5, 3, 'Main lodge', 'Park Way, Victoria Falls'],
];
const assets = [
  [1, 1, 'BM-01', 'Ball mill main drive motor 315 kW', 'Electrical', 'WEG', 'W22 355', 'WEG-881203', '315 kW 525 V', 'A'],
  [2, 1, 'SP-04', 'Slurry pump 8x6', 'Mechanical', 'Warman', '8/6 AH', 'WAR-22817', '90 kW', 'A'],
  [3, 1, 'PLC-01', 'Plant control PLC panel', 'Automation', 'Siemens', 'S7-1500', 'S7-55120', '24 V DC', 'A'],
  [4, 1, 'MCC-02', 'Motor control centre 2', 'Electrical', 'ABB', 'MNS', 'ABB-MCC-2', '525 V 1600 A', 'A'],
  [5, 2, 'RWP-01', 'Raw water pump with VSD', 'Electrical', 'Grundfos', 'NK 125', 'GF-77120', '75 kW', 'B'],
  [6, 2, 'FT-101', 'Intake flow transmitter', 'Instrumentation', 'Endress+Hauser', 'Promag 50', 'EH-50-3321', '4–20 mA', 'B'],
  [7, 3, 'CV-03', 'Packing line conveyor', 'Mechanical', 'Interroll', 'RollerDrive', 'IR-3312', '3 kW', 'B'],
  [8, 3, 'DB-F1', 'Factory distribution board 1', 'Electrical', 'Schneider', 'Prisma', 'SE-DB-F1', '400 A', 'B'],
  [9, 4, 'CR-01', 'Cold room 1 refrigeration plant', 'Mechanical', 'Bitzer', '4FES-5Y', 'BZ-11872', '7.5 kW', 'A'],
  [10, 5, 'GEN-01', 'Standby generator 200 kVA', 'Electrical', 'Cummins', 'C200D5', 'CUM-200-881', '200 kVA', 'A'],
];
const PEOPLE = [
  ['admin@meazim.com', 'MEA Admin', '', 'admin', 'Multi', null],
  ['manager@meazim.com', 'Lawrence Mumba', '', 'manager', 'Multi', null],
  ['foreman.electrical@meazim.com', 'Tawanda Mhike', '+263 77 410 2291', 'foreman', 'Electrical', null],
  ['foreman.mechanical@meazim.com', 'Joseph Chiwara', '+263 77 410 2292', 'foreman', 'Mechanical', null],
  ['tech.kuda@meazim.com', 'Kudakwashe Rusike', '+263 77 410 2301', 'tech', 'Electrical', null],
  ['tech.tendai@meazim.com', 'Tendai Mafa', '+263 77 410 2302', 'tech', 'Mechanical', null],
  ['tech.simon@meazim.com', 'Simon Ndoro', '+263 77 410 2303', 'tech', 'Automation', null],
  ['tech.ruth@meazim.com', 'Ruth Gora', '+263 77 410 2304', 'tech', 'Instrumentation', null],
  ['client.shamva@meazim.com', 'Tendai Moyo', '+263 77 220 9014', 'client', null, 1],
  ['client.kariba@meazim.com', 'Rudo Chiweshe', '+263 242 664 210', 'client', null, 2],
];
const users = [];
for (const [i, p] of PEOPLE.entries()) { const [h, s] = await hash(PW); users.push([i + 1, p[0], p[1], p[2], p[3], p[4], p[5], h, s, 0]); }
const pm = [
  [1, 1, 'Monthly motor inspection', 'Electrical', 'Inspection', 30, day(3), 3, 3],
  [2, 2, 'Pump bearing and seal check', 'Mechanical', 'Preventive maintenance', 14, day(-1), 4, 2],
  [3, 3, 'PLC backup and health check', 'Automation', 'Preventive maintenance', 90, day(20), 3, 2],
  [4, 6, 'Flow transmitter calibration', 'Instrumentation', 'Calibration', 180, day(40), 3, 3],
  [5, 10, 'Generator load test', 'Electrical', 'Testing & commissioning', 30, day(12), 3, 2],
  [6, 9, 'Cold room service', 'Mechanical', 'Preventive maintenance', 60, day(30), 4, 4],
];
const sql = [
  '-- Basa demo data for MEA',
  ins('settings', ['key', 'value'], [['company', 'MEA · Mechanical, Electrical & Automation'], ['short', 'MEA'], ['tagline', 'Engineering services, maintenance and automation'], ['address', 'Harare, Zimbabwe'], ['email', 'manager@meazim.com'], ['website', 'meazim.com'], ['color', '#d9822b'], ['labour_rate', '35'], ['vat', '15'], ['currency', 'USD'], ['report_costs', '1'], ['logo', 'data:image/png;base64,' + fs.readFileSync(path.join(ROOT, 'dev', 'logo-small.png')).toString('base64')]]),
  ins('clients', ['id', 'name', 'contact', 'email', 'phone', 'address'], clients),
  ins('sites', ['id', 'client_id', 'name', 'address'], sites),
  ins('assets', ['id', 'site_id', 'tag', 'name', 'discipline', 'make', 'model', 'serial', 'rating', 'criticality'], assets),
  ins('users', ['id', 'email', 'name', 'phone', 'role', 'trade', 'client_id', 'pass_hash', 'pass_salt', 'must_change'], users),
  ins('pm_plans', ['id', 'asset_id', 'title', 'discipline', 'type', 'every_days', 'next_due', 'foreman_id', 'est_hours'], pm),
].join('\n');
fs.writeFileSync(path.join(ROOT, 'dev', 'seed.sql'), sql + '\n');
console.log('wrote dev/seed.sql');
