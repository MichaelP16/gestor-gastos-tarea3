// POST /expenses -> registrar un gasto
const { parseExpense } = require('../validate');

module.exports = {
  method: 'POST',
  path: /^\/expenses$/,
  handle({ res, store, send, body }) {
    const { error, data } = parseExpense(body);
    if (error) return send(res, 400, { error });
    const month = data.date.slice(0, 7);
    const spent = store.all()
      .filter((expense) => expense.date.slice(0, 7) === month)
      .reduce((total, expense) => total + Math.round(expense.amount * 100), 0);
    const budget = Math.round(store.getBudget(month) * 100);
    if (spent + Math.round(data.amount * 100) > budget) {
      return send(res, 400, { error: 'El gasto supera el presupuesto mensual disponible' });
    }
    send(res, 201, store.create(data));
  },
};
