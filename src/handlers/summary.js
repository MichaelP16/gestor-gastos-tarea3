// GET /summary -> total gastado, presupuesto restante y total por categoría
module.exports = {
  method: 'GET',
  path: /^\/summary$/,
  handle({ res, store, send }) {
    const expenses = store.all();
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const byCategory = {};
    for (const e of expenses) {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    }
    const budget = store.getBudget();
    send(res, 200, { budget, totalSpent, remaining: budget - totalSpent, byCategory });
  },
};
