const CATEGORIES = ['Comida', 'Transporte', 'Entretenimiento', 'Salud', 'Hogar', 'Otros'];

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function isValidMonth(value) {
  return typeof value === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

// Valida y normaliza los datos de un gasto. Devuelve { error } o { data }.
// Con partial = true solo valida los campos que vengan (para ediciones).
function parseExpense(body, { partial = false } = {}) {
  const data = {};

  if (!partial || body.description !== undefined) {
    if (typeof body.description !== 'string' || body.description.trim() === '') {
      return { error: 'La descripción es obligatoria' };
    }
    const description = body.description.trim();
    if (description.length > 40) {
      return { error: 'La descripción no puede superar los 40 caracteres' };
    }
    data.description = description;
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
    const category = body.category;
    if (!CATEGORIES.includes(category)) {
      return { error: `Categoría inválida. Use: ${CATEGORIES.join(', ')}` };
    }
    data.category = category;
  }
  if (!partial || body.date !== undefined) {
    if (!isValidDate(body.date)) return { error: 'La fecha es obligatoria y debe ser válida' };
    data.date = body.date;
  }
  return { data };
}

module.exports = { CATEGORIES, isValidDate, isValidMonth, parseExpense };
