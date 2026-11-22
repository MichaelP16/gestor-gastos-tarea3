const CATEGORIES = ['Comida', 'Transporte', 'Entretenimiento', 'Salud', 'Hogar', 'Otros'];

// Valida y normaliza los datos de un gasto. Devuelve { error } o { data }.
// Con partial = true solo valida los campos que vengan (para ediciones).
function parseExpense(body, { partial = false } = {}) {
  const data = {};

  if (!partial || body.description !== undefined) {
    if (typeof body.description !== 'string' || body.description.trim() === '') {
      return { error: 'La descripción es obligatoria' };
    }
    data.description = body.description.trim();
  }
  if (!partial || body.amount !== undefined) {
    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || Math.round(amount * 100) <= 0) {
      return { error: 'El monto debe ser un número mayor que 0' };
    }
    // Se redondea a 2 decimales para evitar montos como 0.1 + 0.2 = 0.30000000000000004
    data.amount = Math.round(amount * 100) / 100;
  }
  if (!partial || body.category !== undefined) {
    const category = body.category === undefined ? 'Otros' : body.category;
    if (!CATEGORIES.includes(category)) {
      return { error: `Categoría inválida. Use: ${CATEGORIES.join(', ')}` };
    }
    data.category = category;
  }
  return { data };
}

module.exports = { CATEGORIES, parseExpense };
