// GET /expenses?category=Comida -> listar gastos, con filtro opcional por categoría
const { isValidMonth } = require('../validate');

module.exports = {
  method: 'GET',
  path: /^\/expenses$/,
  handle({ res, store, send, query }) {
    const category = query.get('category');
    const month = query.get('month');
    const period = query.get('period');
    if (month && !isValidMonth(month)) return send(res, 400, { error: 'El mes debe tener el formato YYYY-MM' });
    if (period && !['month', 'fortnight-1', 'fortnight-2'].includes(period)) {
      return send(res, 400, { error: 'El periodo seleccionado no es válido' });
    }
    let expenses = store.all();
    if (month) expenses = expenses.filter((expense) => expense.date.slice(0, 7) === month);
    if (period === 'fortnight-1') expenses = expenses.filter((expense) => Number(expense.date.slice(8, 10)) <= 15);
    if (period === 'fortnight-2') expenses = expenses.filter((expense) => Number(expense.date.slice(8, 10)) >= 16);
    if (category) expenses = expenses.filter((expense) => expense.category === category);
    send(res, 200, expenses);
  },
};
