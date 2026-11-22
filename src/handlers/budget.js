// PUT /budget -> definir el presupuesto
const { isValidMonth } = require('../validate');

module.exports = {
  method: 'PUT',
  path: /^\/budget$/,
  handle({ res, store, send, body }) {
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount < 0) {
      return send(res, 400, { error: 'El presupuesto debe ser un número mayor o igual a 0' });
    }
    const month = body.month || new Date().toISOString().slice(0, 7);
    if (!isValidMonth(month)) return send(res, 400, { error: 'El mes debe tener el formato YYYY-MM' });
    const spent = store.all()
      .filter((expense) => expense.date.slice(0, 7) === month)
      .reduce((total, expense) => total + Math.round(expense.amount * 100), 0);
    if (Math.round(amount * 100) < spent) {
      return send(res, 400, { error: 'El presupuesto no puede ser menor que lo ya gastado en el mes' });
    }
    send(res, 200, { budget: store.setBudget(month, amount), month });
  },
};
