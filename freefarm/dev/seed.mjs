// Builds example data (all accounts flagged demo=1, shown with an "Example" badge, removable from Admin).
// Usage: node dev/seed.mjs <examplePassword> [adminLogin adminPassword adminName] > dev/seed.sql
import crypto from 'node:crypto';
const [PW, ADMIN, APW, ANAME] = process.argv.slice(2);
const hash = (pw) => { const salt = crypto.randomBytes(16); return { h: crypto.pbkdf2Sync(pw, salt, 100000, 32, 'sha256').toString('hex'), s: salt.toString('hex') }; };
const q = (v) => (v == null ? 'NULL' : typeof v === 'number' ? String(v) : `'${String(v).replace(/'/g, "''")}'`);
const day = (n) => { const d = new Date(); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const out = [];
const hp = hash(PW);
let id = 100;
const U = {};
function user(key, o) {
  id++; U[key] = id;
  const f = { id, phone: o.phone, email: o.email || null, name: o.name, role: o.role, buyer_type: o.buyer_type || null, business: o.business || null, country: 'Zimbabwe', region: o.region, town: o.town, bio: o.bio || null, crops: o.crops || null, vehicle: o.vehicle || null, capacity_kg: o.capacity_kg || null, cold: o.cold ? 1 : 0, routes: o.routes || null, plan: o.plan || 'free', plan_until: o.plan ? day(30) : null, verified: o.verified ? 1 : 0, demo: 1, pass_hash: hp.h, pass_salt: hp.s };
  out.push(`INSERT INTO users (${Object.keys(f).join(',')}) VALUES (${Object.values(f).map(q).join(',')});`);
}
if (ADMIN) {
  const a = hash(APW);
  const isEmail = ADMIN.includes('@');
  out.push(`INSERT INTO users (phone, email, name, role, country, region, pass_hash, pass_salt, must_change) VALUES (${q(isEmail ? '+0000000000' : ADMIN)}, ${q(isEmail ? ADMIN.toLowerCase() : null)}, ${q(ANAME || 'FreeFarm Admin')}, 'admin', 'Zimbabwe', 'Harare', '${a.h}', '${a.s}', 1);`);
}
user('chipo', { phone: '+263770000101', email: 'farmer.chipo@example.com', name: 'Chipo Mukanya', business: 'Mukanya Farm', role: 'farmer', region: 'Mashonaland East', town: 'Marondera', crops: 'Tomatoes, cabbage, onions', bio: '12 hectares, drip irrigation. Supplying Harare markets since 2015.', plan: 'pro', verified: 1 });
user('tendai', { phone: '+263770000102', email: 'farmer.tendai@example.com', name: 'Tendai Chikore', business: 'Chikore Orchards', role: 'farmer', region: 'Manicaland', town: 'Mutasa', crops: 'Avocados, bananas, oranges', bio: 'Hass avocados and bananas from the Honde Valley.', plan: 'pro', verified: 1 });
user('blessing', { phone: '+263770000103', email: 'farmer.blessing@example.com', name: 'Blessing Ndlovu', business: 'Ndlovu Poultry', role: 'farmer', region: 'Matabeleland South', town: 'Esigodini', crops: 'Broilers, eggs, road-runner chickens' });
user('farai', { phone: '+263770000104', email: 'farmer.farai@example.com', name: 'Farai Gumbo', role: 'farmer', region: 'Mashonaland West', town: 'Chinhoyi', crops: 'Maize, sugar beans, soya beans', verified: 1 });
user('ruva', { phone: '+263770000105', email: 'farmer.ruva@example.com', name: 'Ruvimbo Sithole', role: 'farmer', region: 'Midlands', town: 'Gweru', crops: 'Butternut, potatoes, covo' });
user('kariba', { phone: '+263770000106', email: 'farmer.kapenta@example.com', name: 'Sipho Moyo', business: 'Lakeside Kapenta', role: 'farmer', region: 'Mashonaland West', town: 'Kariba', crops: 'Kapenta, bream' });
user('fresh', { phone: '+263770000201', email: 'buyer.freshmart@example.com', name: 'Nyasha Dube', business: 'FreshMart Avondale', role: 'buyer', buyer_type: 'Supermarket', region: 'Harare', town: 'Avondale', crops: 'Tomatoes, onions, potatoes, eggs', plan: 'business', verified: 1 });
user('lodge', { phone: '+263770000202', email: 'buyer.lodge@example.com', name: 'Tariro Mhlanga', business: 'Msasa Lodge Kitchen', role: 'buyer', buyer_type: 'Restaurant / hotel', region: 'Harare', town: 'Msasa', crops: 'Vegetables, chicken, eggs' });
user('juice', { phone: '+263770000203', email: 'buyer.juice@example.com', name: 'Kudzai Banda', business: 'Highveld Juice Co.', role: 'buyer', buyer_type: 'Processor / factory', region: 'Midlands', town: 'Kwekwe', crops: 'Oranges, mangoes, tomatoes (seconds welcome)', plan: 'export', verified: 1 });
user('export', { phone: '+263770000204', email: 'buyer.export@example.com', name: 'Rutendo Marufu', business: 'Zim Fresh Exports', role: 'buyer', buyer_type: 'Exporter', region: 'Harare', town: 'Msasa', crops: 'Avocados, blueberries, macadamia, peas', plan: 'export', verified: 1 });
user('mai', { phone: '+263770000205', email: 'buyer.home@example.com', name: 'Memory Chari', role: 'buyer', buyer_type: 'Household', region: 'Harare', town: 'Mabelreign' });
user('truck1', { phone: '+263770000301', email: 'transport.takura@example.com', name: 'Takura Nhamo', business: 'Nhamo Haulage', role: 'transporter', region: 'Harare', town: 'Harare', vehicle: '8-tonne truck', capacity_kg: 8000, routes: 'Harare, Mashonaland East, Manicaland', plan: 'pro', verified: 1 });
user('truck2', { phone: '+263770000302', email: 'transport.cold@example.com', name: 'Lovemore Zulu', business: 'CoolRun Logistics', role: 'transporter', region: 'Bulawayo', town: 'Bulawayo', vehicle: '3-tonne refrigerated truck', capacity_kg: 3000, cold: 1, routes: 'Bulawayo, Midlands, Harare, Matabeleland South' });
user('truck3', { phone: '+263770000303', email: 'transport.pickup@example.com', name: 'Edmore Musara', role: 'transporter', region: 'Mashonaland West', town: 'Chinhoyi', vehicle: '1-tonne pickup', capacity_kg: 1000, routes: 'Chinhoyi, Harare' });
const L = (farmer, o) => { const f = { farmer_id: U[farmer], kind: o.kind || 'now', crop: o.crop, category: o.cat, variety: o.variety || null, grade: o.grade || null, qty: o.qty, unit: o.unit, unit_kg: o.kg, price: o.price, min_order: o.min || 1, rescue_pct: o.rescue || 0, available_from: o.from || null, best_before: o.bb == null ? null : day(o.bb), country: 'Zimbabwe', region: o.region, town: o.town, delivery: o.delivery || 'pickup', organic: o.organic ? 1 : 0, export_ready: o.export ? 1 : 0, notes: o.notes || null }; out.push(`INSERT INTO listings (${Object.keys(f).join(',')}) VALUES (${Object.values(f).map(q).join(',')});`); };
L('chipo', { crop: 'Tomatoes', cat: 'Vegetables', variety: 'Star 9037', grade: 'A', qty: 120, unit: 'crate', kg: 25, price: 6, min: 5, bb: 2, rescue: 35, region: 'Mashonaland East', town: 'Marondera', delivery: 'both', notes: 'Picked this week, firm and red. Bulk surplus: 35% off before they over-ripen.' });
L('chipo', { crop: 'Cabbage', cat: 'Vegetables', grade: 'A', qty: 800, unit: 'head', kg: 1.5, price: 0.45, min: 50, bb: 10, region: 'Mashonaland East', town: 'Marondera', delivery: 'both' });
L('chipo', { crop: 'Onions', cat: 'Vegetables', variety: 'Texas Grano', qty: 60, unit: '10kg pocket', kg: 10, price: 7, min: 2, bb: 40, region: 'Mashonaland East', town: 'Marondera' });
L('tendai', { crop: 'Avocados', cat: 'Fruit', variety: 'Hass', grade: 'A', qty: 4, unit: 'tonne', kg: 1000, price: 1100, min: 1, bb: 14, region: 'Manicaland', town: 'Mutasa', export: 1, notes: 'Export grade, GlobalG.A.P. in progress. Count 18-22.' });
L('tendai', { crop: 'Bananas', cat: 'Fruit', qty: 90, unit: 'box', kg: 15, price: 5, min: 5, bb: 3, rescue: 25, region: 'Manicaland', town: 'Mutasa', delivery: 'both' });
L('tendai', { kind: 'preharvest', crop: 'Oranges', cat: 'Fruit', variety: 'Valencia', qty: 20, unit: 'tonne', kg: 1000, price: 260, min: 1, from: day(45), region: 'Manicaland', town: 'Mutasa', notes: 'Harvest from mid next month. Reserve now for juice or retail.' });
L('blessing', { crop: 'Broilers', cat: 'Livestock & poultry', qty: 400, unit: 'bird', kg: 2, price: 5.5, min: 10, bb: 7, region: 'Matabeleland South', town: 'Esigodini', delivery: 'farmer', notes: 'Live or dressed. 6 weeks, about 2 kg each.' });
L('blessing', { crop: 'Eggs', cat: 'Dairy & eggs', grade: 'A', qty: 150, unit: 'tray (30)', kg: 1.8, price: 4.2, min: 5, bb: 18, region: 'Matabeleland South', town: 'Esigodini', delivery: 'both' });
L('farai', { crop: 'Maize', cat: 'Grains & legumes', variety: 'White', qty: 30, unit: 'tonne', kg: 1000, price: 290, min: 1, region: 'Mashonaland West', town: 'Chinhoyi' });
L('farai', { crop: 'Sugar beans', cat: 'Grains & legumes', variety: 'Red speckled', qty: 200, unit: '50kg bag', kg: 50, price: 70, min: 2, region: 'Mashonaland West', town: 'Chinhoyi' });
L('farai', { kind: 'preharvest', crop: 'Soya beans', cat: 'Grains & legumes', qty: 50, unit: 'tonne', kg: 1000, price: 480, min: 5, from: day(120), region: 'Mashonaland West', town: 'Chinhoyi', notes: 'Planted. Forward contract available for processors.' });
L('ruva', { crop: 'Butternut', cat: 'Vegetables', qty: 3, unit: 'tonne', kg: 1000, price: 220, min: 0.5, bb: 25, region: 'Midlands', town: 'Gweru' });
L('ruva', { crop: 'Covo / rape', cat: 'Vegetables', qty: 200, unit: 'bunch', kg: 1, price: 0.4, min: 20, bb: 1, rescue: 50, region: 'Midlands', town: 'Gweru', notes: 'Cut this morning. Half price today and tomorrow.' });
L('ruva', { crop: 'Potatoes', cat: 'Vegetables', variety: 'BP1', qty: 150, unit: '10kg pocket', kg: 10, price: 6.5, min: 5, bb: 30, region: 'Midlands', town: 'Gweru', organic: 1 });
L('kariba', { crop: 'Kapenta', cat: 'Fish', qty: 500, unit: 'kg', kg: 1, price: 6, min: 10, bb: 60, region: 'Mashonaland West', town: 'Kariba', delivery: 'both', notes: 'Sun-dried, cleaned, packed in 1 kg and 10 kg bags.' });
L('kariba', { crop: 'Bream / tilapia', cat: 'Fish', qty: 300, unit: 'kg', kg: 1, price: 4.5, min: 10, bb: 3, rescue: 20, region: 'Mashonaland West', town: 'Kariba', delivery: 'farmer', notes: 'Fresh on ice. Needs a cold truck for long trips.' });
const R = (b, o) => out.push(`INSERT INTO requests (buyer_id, crop, category, qty, unit, max_price, needed_by, repeat, country, region, town, notes) VALUES (${[U[b], o.crop, o.cat, o.qty, o.unit, o.max || null, o.by == null ? null : day(o.by), o.repeat || 'once', 'Zimbabwe', o.region, o.town, o.notes || null].map(q).join(',')});`);
R('fresh', { crop: 'Tomatoes', cat: 'Vegetables', qty: 40, unit: 'crate', max: 7, repeat: 'weekly', region: 'Harare', town: 'Avondale', notes: 'Every Monday. Grade A, delivered to the back door.' });
R('juice', { crop: 'Oranges', cat: 'Fruit', qty: 15, unit: 'tonne', max: 250, by: 30, region: 'Midlands', town: 'Kwekwe', notes: 'Juice grade. Blemished fruit is fine.' });
R('export', { crop: 'Avocados', cat: 'Fruit', qty: 10, unit: 'tonne', by: 21, region: 'Harare', town: 'Msasa', notes: 'Hass, count 16-24, for EU. Packhouse in Msasa.' });
R('lodge', { crop: 'Eggs', cat: 'Dairy & eggs', qty: 20, unit: 'tray (30)', max: 4.5, repeat: 'weekly', region: 'Harare', town: 'Msasa' });
const J = (by, o) => out.push(`INSERT INTO jobs (created_by, load, weight_kg, cold, from_place, from_region, to_place, to_region, country, pickup_date, budget) VALUES (${[U[by], o.load, o.kg, o.cold ? 1 : 0, o.from, o.fr, o.to, o.tr, 'Zimbabwe', day(o.d), o.budget || null].map(q).join(',')});`);
J('ruva', { load: '3 tonnes butternut', kg: 3000, from: 'Gweru', fr: 'Midlands', to: 'Mbare Musika, Harare', tr: 'Harare', d: 2, budget: 180 });
J('kariba', { load: '300 kg fresh bream on ice', kg: 300, cold: 1, from: 'Kariba', fr: 'Mashonaland West', to: 'Harare CBD', tr: 'Harare', d: 1 });
console.log(out.join('\n'));
