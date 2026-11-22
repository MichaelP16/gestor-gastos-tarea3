const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { start } = require('./helper');

let api;
before(async () => (api = await start()));
after(() => api.close());

test('filtra los gastos por categoría', async () => {
  await api.call('POST', '/expenses', { description: 'Pizza', amount: 400, category: 'Comida' });
  await api.call('POST', '/expenses', { description: 'Cine', amount: 350, category: 'Entretenimiento' });
  await api.call('POST', '/expenses', { description: 'Pan', amount: 50, category: 'Comida' });

  const comida = await api.call('GET', '/expenses?category=Comida');
  assert.strictEqual(comida.data.length, 2);
  assert.ok(comida.data.every((e) => e.category === 'Comida'));

  assert.strictEqual((await api.call('GET', '/expenses')).data.length, 3);
  assert.strictEqual((await api.call('GET', '/expenses?category=Salud')).data.length, 0);
});
