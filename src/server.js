const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const store = require('./store');

const publicDir = path.join(__dirname, '..', 'public');
const handlersDir = path.join(__dirname, 'handlers');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8' };

// Carga automáticamente cada handler de src/handlers/*.js
const handlers = fs
  .readdirSync(handlersDir)
  .filter((f) => f.endsWith('.js'))
  .map((f) => require(path.join(handlersDir, f)));

function send(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body === undefined ? '' : JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => (raw += chunk));
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('JSON inválido'));
      }
    });
  });
}

function serveStatic(pathname, res) {
  const file = path.normalize(path.join(publicDir, pathname === '/' ? 'index.html' : pathname));
  if (!file.startsWith(publicDir) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    return false;
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
  return true;
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  for (const h of handlers) {
    const m = url.pathname.match(h.path);
    if (req.method === h.method && m) {
      let body = {};
      try {
        body = await readBody(req);
      } catch (e) {
        return send(res, 400, { error: e.message });
      }
      return h.handle({ req, res, store, send, body, params: m.groups || {}, query: url.searchParams });
    }
  }

  if (req.method === 'GET' && serveStatic(url.pathname, res)) return;
  send(res, 404, { error: 'Ruta no encontrada' });
});

if (require.main === module) {
  const port = process.env.PORT || 3000;
  server.listen(port, () => console.log(`Servidor en http://localhost:${port}`));
}

module.exports = server;
