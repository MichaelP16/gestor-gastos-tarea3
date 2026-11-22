const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { start } = require('./helper');

let api;
before(async () => (api = await start()));
after(() => api.close());

test('edita el monto y la categoría de un gasto', async () => {
  await api.call('POST', '/expenses', { description: 'Taxi', amount: 300, category: 'Transporte' });
  const r = await api.call('PUT', '/expenses/1', { amount: 450, category: 'Otros' });
  assert.strictEqual(r.status, 200);
  assert.strictEqual(r.data.amount, 450);
  assert.strictEqual(r.data.category, 'Otros');
  assert.strictEqual(r.data.description, 'Taxi');
});

test('editar un gasto inexistente devuelve 404', async () => {
  assert.strictEqual((await api.call('PUT', '/expenses/99', { amount: 5 })).status, 404);
});

test('elimina un gasto', async () => {
  assert.strictEqual((await api.call('DELETE', '/expenses/1')).status, 204);
  assert.strictEqual((await api.call('GET', '/expenses')).data.length, 0);
  assert.strictEqual((await api.call('DELETE', '/expenses/1')).status, 404);
});
