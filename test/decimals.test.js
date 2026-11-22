const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { start } = require('./helper');

let api;
before(async () => (api = await start()));
after(() => api.close());

test('suma decimales sin errores de punto flotante', async () => {
  await api.call('PUT', '/budget', { amount: 1 });
  await api.call('POST', '/expenses', { description: 'A', amount: 0.1, category: 'Otros' });
  await api.call('POST', '/expenses', { description: 'B', amount: 0.2, category: 'Otros' });

  const { data } = await api.call('GET', '/summary');
  assert.strictEqual(data.totalSpent, 0.3);
  assert.strictEqual(data.remaining, 0.7);
  assert.strictEqual(data.byCategory.Otros, 0.3);
});

test('redondea los montos a 2 decimales', async () => {
  const r = await api.call('POST', '/expenses', { description: 'C', amount: 10.005, category: 'Otros' });
  assert.strictEqual(r.data.amount, Math.round(10.005 * 100) / 100);
});
