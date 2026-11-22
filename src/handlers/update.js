// PUT /expenses/:id -> editar monto, categoría, descripción
const { parseExpense } = require('../validate');

module.exports = {
  method: 'PUT',
  path: /^\/expenses\/(?<id>\d+)$/,
  handle({ res, store, send, body, params }) {
    const { error, data } = parseExpense(body, { partial: true });
    if (error) return send(res, 400, { error });
    const id = Number(params.id);
    const existing = store.get(id);
    if (!existing) return send(res, 404, { error: 'Gasto no encontrado' });
    const updated = { ...existing, ...data };
    const month = updated.date.slice(0, 7);
    const spent = store.all()
      .filter((expense) => expense.id !== id && expense.date.slice(0, 7) === month)
      .reduce((total, expense) => total + Math.round(expense.amount * 100), 0);
    if (spent + Math.round(updated.amount * 100) > Math.round(store.getBudget(month) * 100)) {
      return send(res, 400, { error: 'El gasto supera el presupuesto mensual disponible' });
    }
    const expense = store.update(id, data);
    if (!expense) return send(res, 404, { error: 'Gasto no encontrado' });
    send(res, 200, expense);
  },
};
