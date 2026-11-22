// DELETE /expenses/:id -> eliminar un gasto
module.exports = {
  method: 'DELETE',
  path: /^\/expenses\/(?<id>\d+)$/,
  handle({ res, store, send, params }) {
    if (!store.remove(Number(params.id))) return send(res, 404, { error: 'Gasto no encontrado' });
    send(res, 204);
  },
};
