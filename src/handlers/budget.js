// PUT /budget -> definir el presupuesto
module.exports = {
  method: 'PUT',
  path: /^\/budget$/,
  handle({ res, store, send, body }) {
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount < 0) {
      return send(res, 400, { error: 'El presupuesto debe ser un número mayor o igual a 0' });
    }
    send(res, 200, { budget: store.setBudget(amount) });
  },
};
