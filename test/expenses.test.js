const { test, before, after } = require('node:test');
const assert = require('node:assert');
const { start } = require('./helper');

let api;
before(async () => (api = await start()));
after(() => api.close());

const month = new Date().toISOString().slice(0, 7);
const date = `${month}-10`;

test('registra un gasto y lo muestra en la lista', async () => {
  await api.call('PUT', '/budget', { amount: 250, month });
  const created = await api.call('POST', '/expenses', { description: 'Almuerzo', amount: 250, category: 'Comida', date });
  assert.strictEqual(created.status, 201);
  assert.strictEqual(created.data.id, 1);
  assert.strictEqual(created.data.date, date);

  const list = await api.call('GET', '/expenses');
  assert.strictEqual(list.data.length, 1);
  assert.strictEqual(list.data[0].description, 'Almuerzo');
});

test('rechaza gastos inválidos', async () => {
  assert.strictEqual((await api.call('POST', '/expenses', { description: '', amount: 10, category: 'Comida', date })).status, 400);
  assert.strictEqual((await api.call('POST', '/expenses', { description: 'x', amount: -5, category: 'Comida', date })).status, 400);
  assert.strictEqual((await api.call('POST', '/expenses', { description: 'x', amount: 5, category: 'Nada', date })).status, 400);
  assert.strictEqual((await api.call('POST', '/expenses', { description: 'x', amount: 5, category: 'Comida' })).status, 400);
  assert.strictEqual((await api.call('POST', '/expenses', { description: 'x', amount: 5, date })).status, 400);
  assert.strictEqual((await api.call('POST', '/expenses', { description: 'x'.repeat(41), amount: 5, category: 'Comida', date })).status, 400);
});

test('combina ambas quincenas en la vista mensual y comparte el presupuesto', async () => {
  const periodMonth = '2032-03';
  await api.call('PUT', '/budget', { amount: 700, month: periodMonth });
  const first = await api.call('POST', '/expenses', {
    description: 'Primera quincena', amount: 300, category: 'Comida', date: `${periodMonth}-15`,
  });
  const second = await api.call('POST', '/expenses', {
    description: 'Segunda quincena', amount: 400, category: 'Hogar', date: `${periodMonth}-16`,
  });
  assert.strictEqual(first.status, 201);
  assert.strictEqual(second.status, 201);
  assert.strictEqual((await api.call('POST', '/expenses', {
    description: 'Excede el mes', amount: 0.01, category: 'Otros', date: `${periodMonth}-20`,
  })).status, 400);

  const monthExpenses = await api.call('GET', `/expenses?month=${periodMonth}&period=month`);
  const firstFortnight = await api.call('GET', `/expenses?month=${periodMonth}&period=fortnight-1`);
  const secondFortnight = await api.call('GET', `/expenses?month=${periodMonth}&period=fortnight-2`);
  assert.strictEqual(monthExpenses.data.length, 2);
  assert.strictEqual(firstFortnight.data.length, 1);
  assert.strictEqual(secondFortnight.data.length, 1);
  const summary = await api.call('GET', `/summary?month=${periodMonth}`);
  assert.strictEqual(summary.data.totalSpent, 700);
  assert.strictEqual(summary.data.remaining, 0);
  assert.strictEqual((await api.call('GET', '/summary?month=2032-04')).data.budget, 0);
});
