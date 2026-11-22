const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { start } = require('./helper');

let api;
before(async () => (api = await start()));
after(() => api.close());

test('filtra los gastos por categoría', async () => {
  const month = new Date().toISOString().slice(0, 7);
  const date = `${month}-10`;
  await api.call('PUT', '/budget', { amount: 1000, month });
  await api.call('POST', '/expenses', { description: 'Pizza', amount: 400, category: 'Comida', date });
  await api.call('POST', '/expenses', { description: 'Cine', amount: 350, category: 'Entretenimiento', date });
  await api.call('POST', '/expenses', { description: 'Pan', amount: 50, category: 'Comida', date });

  const comida = await api.call('GET', '/expenses?category=Comida');
  assert.strictEqual(comida.data.length, 2);
  assert.ok(comida.data.every((e) => e.category === 'Comida'));

  assert.strictEqual((await api.call('GET', '/expenses')).data.length, 3);
  assert.strictEqual((await api.call('GET', '/expenses?category=Salud')).data.length, 0);
});
