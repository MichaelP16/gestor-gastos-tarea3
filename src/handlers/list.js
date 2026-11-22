// GET /expenses -> listar los gastos
module.exports = {
  method: 'GET',
  path: /^\/expenses$/,
  handle({ res, store, send }) {
    send(res, 200, store.all());
  },
};
