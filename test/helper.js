// Utilidad para las pruebas: levanta el servidor en un puerto libre.
const server = require('../src/server');
const store = require('../src/store');

async function start() {
  await new Promise((resolve) => server.listen(0, resolve));
  const base = `http://localhost:${server.address().port}`;
  store.reset();
  async function call(method, path, body) {
    const res = await fetch(base + path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    return { status: res.status, data: text ? JSON.parse(text) : null };
  }
  return { call, close: () => server.close() };
}

module.exports = { start };
