// Local test server: serves public/ and runs the Pages Function against a SQLite file (D1 stand-in).
// Usage: OWNER_CODE=test node dev/server.mjs [dbfile] [port]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dbFile = process.argv[2] || path.join(ROOT, 'dev', 'local.db');
const port = Number(process.argv[3] || 8790);
const sqlite = new DatabaseSync(dbFile);
sqlite.exec(fs.readFileSync(path.join(ROOT, 'schema.sql'), 'utf8'));

const fix = (v) => (v === undefined ? null : typeof v === 'boolean' ? (v ? 1 : 0) : v);
class Stmt {
  constructor(sql) { this.sql = sql; this.args = []; }
  bind(...a) { this.args = a.map(fix); return this; }
  async all() { return { results: sqlite.prepare(this.sql).all(...this.args).map((r) => ({ ...r })) }; }
  async first() { const r = sqlite.prepare(this.sql).get(...this.args); return r ? { ...r } : null; }
  async run() { const r = sqlite.prepare(this.sql).run(...this.args); return { meta: { changes: r.changes } }; }
}
const DB = { prepare: (sql) => new Stmt(sql) };

const tmp = path.join(ROOT, 'dev', '.fn.mjs');
fs.copyFileSync(path.join(ROOT, 'functions', 'api', '[[path]].js'), tmp);
const { onRequest } = await import(pathToFileURL(tmp).href + '?v=' + Date.now());

const TYPES = { '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml', '.webmanifest': 'application/manifest+json' };
http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${port}`);
  if (url.pathname.startsWith('/api/')) {
    const chunks = []; for await (const c of req) chunks.push(c);
    const headers = new Headers(); for (const [k, v] of Object.entries(req.headers)) headers.set(k, Array.isArray(v) ? v.join(', ') : v);
    const request = new Request(url, { method: req.method, headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : Buffer.concat(chunks) });
    const r = await onRequest({ request, env: { DB, OWNER_CODE: process.env.OWNER_CODE || '' } });
    const h = {}; r.headers.forEach((v, k) => { h[k] = v; });
    res.writeHead(r.status, h); res.end(Buffer.from(await r.arrayBuffer())); return;
  }
  let p = path.join(ROOT, 'public', decodeURIComponent(url.pathname));
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  if (!fs.existsSync(p)) { res.writeHead(404); res.end('Not found'); return; }
  res.writeHead(200, { 'content-type': TYPES[path.extname(p)] || 'application/octet-stream' }); res.end(fs.readFileSync(p));
}).listen(port, () => console.log('listening on', port));
