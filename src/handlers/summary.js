// GET /summary -> total gastado, presupuesto restante y total por categoría
// Los cálculos se hacen en centavos (enteros) para evitar errores de punto flotante.
const toCents = (n) => Math.round(n * 100);
const fromCents = (c) => c / 100;

module.exports = {
  method: 'GET',
  path: /^\/summary$/,
  handle({ res, store, send }) {
    const expenses = store.all();
    const spentCents = expenses.reduce((sum, e) => sum + toCents(e.amount), 0);
    const byCategoryCents = {};
    for (const e of expenses) {
      byCategoryCents[e.category] = (byCategoryCents[e.category] || 0) + toCents(e.amount);
    }
    const byCategory = {};
    for (const [cat, cents] of Object.entries(byCategoryCents)) byCategory[cat] = fromCents(cents);

    const budgetCents = toCents(store.getBudget());
    send(res, 200, {
      budget: fromCents(budgetCents),
      totalSpent: fromCents(spentCents),
      remaining: fromCents(budgetCents - spentCents),
      byCategory,
    });
  },
};
