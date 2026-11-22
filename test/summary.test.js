const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { start } = require('./helper');

let api;
before(async () => (api = await start()));
after(() => api.close());

test('calcula total gastado y restante', async () => {
  await api.call('PUT', '/budget', { amount: 1000 });
  await api.call('POST', '/expenses', { description: 'Super', amount: 300, category: 'Comida' });
  await api.call('POST', '/expenses', { description: 'Bus', amount: 100, category: 'Transporte' });

  const { data } = await api.call('GET', '/summary');
  assert.strictEqual(data.budget, 1000);
  assert.strictEqual(data.totalSpent, 400);
  assert.strictEqual(data.remaining, 600);
  assert.deepStrictEqual(data.byCategory, { Comida: 300, Transporte: 100 });
});

test('rechaza un presupuesto negativo', async () => {
  assert.strictEqual((await api.call('PUT', '/budget', { amount: -1 })).status, 400);
});
