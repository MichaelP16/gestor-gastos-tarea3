// POST /expenses -> registrar un gasto
const { parseExpense } = require('../validate');

module.exports = {
  method: 'POST',
  path: /^\/expenses$/,
  handle({ res, store, send, body }) {
    const { error, data } = parseExpense(body);
    if (error) return send(res, 400, { error });
    send(res, 201, store.create(data));
  },
};
