// GET /expenses?category=Comida -> listar gastos, con filtro opcional por categoría
module.exports = {
  method: 'GET',
  path: /^\/expenses$/,
  handle({ res, store, send, query }) {
    const category = query.get('category');
    const expenses = store.all();
    send(res, 200, category ? expenses.filter((e) => e.category === category) : expenses);
  },
};
