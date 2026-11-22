const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { start } = require('./helper');

let api;
before(async () => (api = await start()));
after(() => api.close());

test('suma decimales sin errores de punto flotante', async () => {
  const month = new Date().toISOString().slice(0, 7);
  const date = `${month}-10`;
  await api.call('PUT', '/budget', { amount: 1, month });
  await api.call('POST', '/expenses', { description: 'A', amount: 0.1, category: 'Otros', date });
  await api.call('POST', '/expenses', { description: 'B', amount: 0.2, category: 'Otros', date });

  const { data } = await api.call('GET', `/summary?month=${month}`);
  assert.strictEqual(data.totalSpent, 0.3);
  assert.strictEqual(data.remaining, 0.7);
  assert.strictEqual(data.byCategory.Otros, 0.3);
});

test('redondea los montos a 2 decimales', async () => {
  const month = new Date().toISOString().slice(0, 7);
  await api.call('PUT', '/budget', { amount: 20, month });
  const r = await api.call('POST', '/expenses', {
    description: 'C', amount: 10.005, category: 'Otros', date: `${month}-10`,
  });
  assert.strictEqual(r.data.amount, Math.round(10.005 * 100) / 100);
});
