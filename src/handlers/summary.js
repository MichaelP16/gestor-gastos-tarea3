// GET /summary -> total gastado, presupuesto restante y total por categoría
// Los cálculos se hacen en centavos (enteros) para evitar errores de punto flotante.
const { isValidMonth } = require('../validate');
const toCents = (n) => Math.round(n * 100);
const fromCents = (c) => c / 100;

module.exports = {
  method: 'GET',
  path: /^\/summary$/,
  handle({ res, store, send, query }) {
    const month = query.get('month') || new Date().toISOString().slice(0, 7);
    if (!isValidMonth(month)) return send(res, 400, { error: 'El mes debe tener el formato YYYY-MM' });
    const expenses = store.all().filter((expense) => expense.date.slice(0, 7) === month);
    const spentCents = expenses.reduce((sum, e) => sum + toCents(e.amount), 0);
    const byCategoryCents = {};
    for (const e of expenses) {
      byCategoryCents[e.category] = (byCategoryCents[e.category] || 0) + toCents(e.amount);
    }
    const byCategory = {};
    for (const [cat, cents] of Object.entries(byCategoryCents)) byCategory[cat] = fromCents(cents);

    const budgetCents = toCents(store.getBudget(month));
    send(res, 200, {
      month,
      budget: fromCents(budgetCents),
      totalSpent: fromCents(spentCents),
      remaining: fromCents(budgetCents - spentCents),
      byCategory,
    });
  },
};
