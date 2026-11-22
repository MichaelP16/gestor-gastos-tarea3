const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { start } = require('./helper');

let api;
before(async () => (api = await start()));
after(() => api.close());

test('registra un gasto y lo muestra en la lista', async () => {
  const created = await api.call('POST', '/expenses', { description: 'Almuerzo', amount: 250, category: 'Comida' });
  assert.strictEqual(created.status, 201);
  assert.strictEqual(created.data.id, 1);

  const list = await api.call('GET', '/expenses');
  assert.strictEqual(list.data.length, 1);
  assert.strictEqual(list.data[0].description, 'Almuerzo');
});

test('rechaza gastos inválidos', async () => {
  assert.strictEqual((await api.call('POST', '/expenses', { description: '', amount: 10 })).status, 400);
  assert.strictEqual((await api.call('POST', '/expenses', { description: 'x', amount: -5 })).status, 400);
  assert.strictEqual((await api.call('POST', '/expenses', { description: 'x', amount: 5, category: 'Nada' })).status, 400);
});
