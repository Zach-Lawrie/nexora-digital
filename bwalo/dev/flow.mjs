// Permission checks against a running server. Usage: node dev/flow.mjs http://localhost:8790 <owner-code>
import { totp } from './.fn.mjs';
const BASE = process.argv[2], CODE = process.argv[3];
let pass = 0, bad = 0;
const ok = (name, cond, extra) => { if (cond) pass++; else { bad++; console.log('FAIL', name, extra ?? ''); } };
class Client {
  constructor() { this.cookie = ''; this.ip = '10.0.0.' + Math.floor(Math.random() * 250) + '.' + Date.now() % 1000 + Math.random(); }
  async call(path, method = 'GET', body) {
    const r = await fetch(BASE + '/api/' + path, { method, headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(this.cookie ? { cookie: this.cookie } : {}), origin: BASE, 'cf-connecting-ip': this.ip }, body: body ? JSON.stringify(body) : undefined });
    const sc = r.headers.get('set-cookie'); if (sc) this.cookie = sc.split(';')[0];
    let j = null; try { j = await r.json(); } catch (e) {}
    return { s: r.status, j };
  }
  put(p, data) { return this.call('doc/' + p, 'PUT', { data }); }
  del(p) { return this.call('doc/' + p, 'DELETE'); }
}
const guest = new Client(), owner = new Client(), org = new Client(), mgr = new Client(), scorer = new Client(), fan = new Client();
const reg = async (c, name, code) => (await c.call('register', 'POST', { name, email: name.toLowerCase() + '@example.com', password: 'password-' + name, code })).j;

ok('bad owner code refused', (await new Client().call('register', 'POST', { name: 'Bad', email: 'bad@example.com', password: 'password1', code: 'nope' })).s === 403);
const O = await reg(owner, 'Owner', CODE); ok('owner registered', O.user && O.user.role === 'owner', JSON.stringify(O));
ok('second owner refused', (await new Client().call('register', 'POST', { name: 'Two', email: 'two@example.com', password: 'password1', code: CODE })).s === 403);
const G = await reg(org, 'Organiser'), M = await reg(mgr, 'Manager'), Sc = await reg(scorer, 'Scorer'), F = await reg(fan, 'Fan');
ok('duplicate email refused', (await new Client().call('register', 'POST', { name: 'Fan', email: 'fan@example.com', password: 'password1' })).s === 409);
ok('short password refused', (await new Client().call('register', 'POST', { name: 'Shorty', email: 's@example.com', password: 'x' })).s === 400);
ok('wrong password refused', (await new Client().call('login', 'POST', { email: 'fan@example.com', password: 'wrong' })).s === 401);
ok('login works', (await new Client().call('login', 'POST', { email: 'fan@example.com', password: 'password-Fan' })).s === 200);
ok('guest cannot write', (await guest.put('leagues/L1', { name: 'X' })).s === 401);

// organiser creates a competition; server forces ownership and the free package
let r = await org.put('leagues/L1', { name: 'Test League', sport: 'Football', createdBy: 'someone-else', plan: 'ent', roles: { [F.user.id]: 'admin' } });
ok('league created', r.s === 200 && r.j.data.createdBy === G.user.id && r.j.data.plan === 'free' && !Object.keys(r.j.data.roles).length, JSON.stringify(r.j));
ok('fan cannot edit league', (await fan.put('leagues/L1', { name: 'Hacked' })).s === 403);
ok('fan cannot delete league', (await fan.del('leagues/L1')).s === 403);
ok('organiser cannot upgrade own package', (await org.put('leagues/L1', { name: 'Test League', sport: 'Football', plan: 'ent' })).j.data.plan === 'free');
ok('owner sets package', (await owner.put('leagues/L1', { name: 'Test League', sport: 'Football', plan: 'pro', createdBy: 'x' })).j.data.plan === 'pro');
ok('organiser still owns league', (await org.put('leagues/L1', { name: 'Test League', sport: 'Football' })).s === 200);
ok('fan cannot edit packages', (await fan.put('config/plans', { items: [] })).s === 403);

const team = (name) => ({ lid: 'L1', name, players: [{ id: name + 'p1', name: name + ' One' }, { id: name + 'p2', name: name + ' Two' }], staff: [], managers: [] });
ok('organiser adds team A', (await org.put('teams/TA', team('A'))).s === 200);
ok('organiser adds team B', (await org.put('teams/TB', team('B'))).s === 200);
ok('fan cannot add team', (await fan.put('teams/TC', team('C'))).s === 403);
ok('fan cannot edit team', (await fan.put('teams/TA', { ...team('A'), name: 'Hacked' })).s === 403);
ok('organiser adds fixture', (await org.put('matches/M1', { lid: 'L1', home: 'TA', away: 'TB', status: 'scheduled', hs: null, as: null, lineups: {}, events: [] })).s === 200);
ok('fan cannot score', (await fan.put('matches/M1', { lid: 'L1', home: 'TA', away: 'TB', status: 'final', hs: 9, as: 0 })).s === 403);
ok('manager-to-be cannot edit team yet', (await mgr.put('teams/TA', { ...team('A'), name: 'Mine' })).s === 403);

// staff requests and approval
ok('manager requests role', (await mgr.put('requests/R1', { lid: 'L1', tid: 'TA', role: 'manager', uid: 'forged' })).j.data.uid === M.user.id);
ok('scorer requests role', (await scorer.put('requests/R2', { lid: 'L1', role: 'scorer' })).s === 200);
const seen = async (c, col) => (await c.call('sync?since=0')).j.docs.filter((d) => d[0] === col).length;
ok('fan sees no requests', (await seen(fan, 'requests')) === 0);
ok('requester sees own request only', (await seen(mgr, 'requests')) === 1);
ok('organiser sees both requests', (await seen(org, 'requests')) === 2);
ok('fan cannot approve', (await fan.call('approve', 'POST', { id: 'R1' })).s === 403);
ok('requester cannot approve self', (await mgr.call('approve', 'POST', { id: 'R1' })).s === 403);
ok('organiser approves manager', (await org.call('approve', 'POST', { id: 'R1' })).s === 200);
ok('organiser approves scorer', (await org.call('approve', 'POST', { id: 'R2' })).s === 200);

// team manager: own team yes, other team no, cannot change managers, lineup only on fixtures
r = await mgr.put('teams/TA', { ...team('A'), name: 'A United', managers: [M.user.id, F.user.id] });
ok('manager edits own team, managers list protected', r.s === 200 && r.j.data.name === 'A United' && r.j.data.managers.length === 1, JSON.stringify(r.j));
ok('manager cannot edit other team', (await mgr.put('teams/TB', { ...team('B'), name: 'Hacked' })).s === 403);
ok('manager cannot delete own team', (await mgr.del('teams/TA')).s === 403);
r = await mgr.put('matches/M1', { lid: 'L1', home: 'TA', away: 'TB', status: 'final', hs: 9, as: 0, lineups: { TA: { start: ['Ap1'], bench: [] }, TB: { start: ['Bp1'], bench: [] } } });
ok('manager sets only own lineup', r.s === 200 && r.j.data.status === 'scheduled' && r.j.data.hs === null && r.j.data.lineups.TA.start[0] === 'Ap1' && !r.j.data.lineups.TB, JSON.stringify(r.j));
ok('manager cannot delete fixture', (await mgr.del('matches/M1')).s === 403);
ok('manager transfers own player', (await mgr.call('transfer', 'POST', { tid: 'TA', pid: 'Ap2', to: 'TB', type: 'loan', fee: 'Free' })).s === 200);
ok('manager cannot take other team player', (await mgr.call('transfer', 'POST', { tid: 'TB', pid: 'Bp1', to: 'TA' })).s === 403);
ok('manager records release', (await mgr.put('transfers/X1', { lid: 'L1', type: 'released', player: 'A One', from: 'A United', to: '' })).s === 200);
ok('manager cannot post rumour', (await mgr.put('transfers/X2', { lid: 'L1', type: 'rumour', player: 'Z' })).s === 403);

// scorekeeper: results yes, structure no
r = await scorer.put('matches/M1', { lid: 'L1', home: 'TA', away: 'TB', status: 'final', hs: 2, as: 1, lineups: {}, events: [] });
ok('scorer records result', r.s === 200 && r.j.data.hs === 2);
ok('scorer cannot add fixture', (await scorer.put('matches/M2', { lid: 'L1', home: 'TA', away: 'TB', status: 'scheduled' })).s === 403);
ok('scorer cannot delete fixture', (await scorer.del('matches/M1')).s === 403);
ok('scorer cannot edit team', (await scorer.put('teams/TB', team('B'))).s === 403);
ok('scorer cannot publish news', (await scorer.put('news/N1', { lid: 'L1', title: 'x', body: 'y', pub: true })).s === 403);

// news drafts hidden; audit hidden
ok('organiser saves draft', (await org.put('news/N1', { lid: 'L1', title: 'Draft', body: 'y', pub: false, by: 'forged' })).j.data.by === G.user.id);
ok('guest cannot read draft', (await seen(guest, 'news')) === 0);
ok('organiser reads draft', (await seen(org, 'news')) === 1);
ok('organiser logs action', (await org.call('log', 'POST', { lid: 'L1', text: 'Did something' })).s === 200);
ok('fan cannot write audit', (await fan.call('log', 'POST', { lid: 'L1', text: 'Fake' })).s === 403);
ok('audit cannot be overwritten', (await org.put('audit/L1', { items: [] })).s === 403);
ok('guest sees no audit', (await seen(guest, 'audit')) === 0);
ok('organiser sees audit', (await seen(org, 'audit')) === 1);
ok('guest sees public data', (await seen(guest, 'teams')) === 2 && (await seen(guest, 'matches')) === 1);

// package limits
await owner.put('config/plans', { items: [{ id: 'pro', name: 'Pro', maxTeams: 2, news: false, staff: false, stats: true }] });
ok('team limit enforced', (await org.put('teams/TC', team('C'))).s === 403);
ok('newsroom gated by package', (await org.put('news/N2', { lid: 'L1', title: 'x', body: 'y', pub: true })).s === 403);
ok('staff requests gated by package', (await fan.put('requests/R3', { lid: 'L1', role: 'media' })).s === 403);

// incremental sync and deletion
const before = (await guest.call('sync?since=0')).j.seq;
await org.put('teams/TB', { ...team('B'), name: 'B City' });
r = (await guest.call('sync?since=' + before)).j;
ok('incremental sync returns the change', r.docs.length === 1 && r.docs[0][2].name === 'B City', JSON.stringify(r.docs).slice(0, 200));

// two-step sign-in
const setup = (await fan.call('2fa/setup', 'POST', {})).j;
ok('2fa wrong code refused', (await fan.call('2fa/enable', 'POST', { code: '000000' })).s === 400);
ok('2fa enabled', (await fan.call('2fa/enable', 'POST', { code: await totp(setup.secret, Math.floor(Date.now() / 30000)) })).s === 200);
r = await new Client().call('login', 'POST', { email: 'fan@example.com', password: 'password-Fan' });
ok('login now needs a code', r.s === 401 && r.j.need2fa);
ok('login with code works', (await new Client().call('login', 'POST', { email: 'fan@example.com', password: 'password-Fan', code: await totp(setup.secret, Math.floor(Date.now() / 30000)) })).s === 200);

// owner account tools
ok('fan cannot list accounts', (await fan.call('users')).s === 403);
ok('owner lists accounts', (await owner.call('users')).j.users.length === 5);
ok('owner suspends fan', (await owner.call('users/' + F.user.id, 'POST', { action: 'suspend' })).s === 200);
ok('suspended session is dead', (await fan.call('me')).j.user === null);
ok('suspended login refused', (await new Client().call('login', 'POST', { email: 'fan@example.com', password: 'password-Fan' })).s === 403);

// cross-site and cascade delete
const x = await fetch(BASE + '/api/doc/leagues/L9', { method: 'PUT', headers: { 'content-type': 'application/json', cookie: org.cookie, origin: 'https://evil.example' }, body: '{"data":{"name":"x"}}' });
ok('cross-site write refused', x.status === 403);
// slides: organiser for own competition only, never on the home page; owner anywhere
r = await org.put('slides/S1', { lid: 'L1', type: 'announcement', title: 'Kick-off moved', home: true, link: 'javascript:alert(1)' });
ok('organiser adds slide, home and bad link refused', r.s === 200 && r.j.data.home === false && !r.j.data.link, JSON.stringify(r.j));
ok('fan cannot add slide', (await fan.put('slides/S2', { lid: 'L1', type: 'advert', title: 'x' })).s === 401 || (await mgr.put('slides/S2', { lid: 'L1', type: 'advert', title: 'x' })).s === 403);
ok('organiser cannot add home slide', (await org.put('slides/S3', { type: 'advert', title: 'x', home: true })).s === 403);
ok('owner adds home slide', (await owner.put('slides/S4', { type: 'advert', title: 'Sponsor', home: true, link: 'https://example.com' })).j.data.home === true);
ok('owner shows organiser slide on home', (await owner.put('slides/S1', { lid: 'L1', type: 'announcement', title: 'Kick-off moved', home: true })).j.data.home === true);
ok('organiser edit keeps home choice', (await org.put('slides/S1', { lid: 'L1', type: 'announcement', title: 'Kick-off moved again', home: false })).j.data.home === true);
ok('organiser cannot edit home slide', (await org.put('slides/S4', { type: 'advert', title: 'Mine' })).s === 403);
for (let i = 0; i < 5; i++) await guest.call('click', 'POST', { id: 'S4' });
ok('clicks counted, capped per visitor', (await owner.call('clicks')).j.clicks.S4 === 3);
ok('organiser cannot see home slide clicks', (await org.call('clicks')).j.clicks.S4 === undefined);
ok('fan cannot read clicks', (await new Client().call('clicks')).s === 401);
ok('organiser cannot set news sources', (await org.put('config/feeds', { items: [] })).s === 403);
ok('owner sets news sources', (await owner.put('config/feeds', { items: [{ name: 'Test RSS', url: BASE + '/dev-feed.xml' }, { name: 'Test Atom', url: BASE + '/dev-feed-atom.xml' }, { name: 'Broken', url: BASE + '/nope.xml' }] })).s === 200);
const hl = (await guest.call('headlines')).j;
ok('headlines parsed from RSS and Atom', hl.items.length === 4 && hl.items.some((i) => i.src === 'Test Atom') && hl.report.find((x) => x.name === 'Broken').ok === false, JSON.stringify(hl).slice(0, 400));
ok('entities and CDATA cleaned', hl.items.some((i) => i.title === 'Warriors & Chipolopolo draw 1–1 in “thriller”'), JSON.stringify(hl.items.map((i) => i.title)));
ok('html tags in titles removed', hl.items.some((i) => i.title === 'Athletics trials set'), JSON.stringify(hl.items.map((i) => i.title)));
ok('newest first', hl.items[0].at >= hl.items[hl.items.length - 1].at);
ok('organiser deletes league', (await org.del('leagues/L1')).s === 200);
ok('competition slides removed with it', (await seen(guest, 'slides')) === 1);
ok('everything under it is gone', (await seen(guest, 'teams')) === 0 && (await seen(guest, 'matches')) === 0 && (await seen(guest, 'leagues')) === 0);
console.log(`${pass} passed, ${bad} failed`);
process.exit(bad ? 1 : 0);
