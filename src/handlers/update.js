// PUT /expenses/:id -> editar monto, categoría, descripción
const { parseExpense } = require('../validate');

module.exports = {
  method: 'PUT',
  path: /^\/expenses\/(?<id>\d+)$/,
  handle({ res, store, send, body, params }) {
    const { error, data } = parseExpense(body, { partial: true });
    if (error) return send(res, 400, { error });
    const expense = store.update(Number(params.id), data);
    if (!expense) return send(res, 404, { error: 'Gasto no encontrado' });
    send(res, 200, expense);
  },
};
