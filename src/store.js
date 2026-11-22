// Almacén en memoria de gastos y presupuesto.
const expenses = new Map();
let nextId = 1;
const budgets = new Map();

module.exports = {
  all: () => [...expenses.values()],
  get: (id) => expenses.get(id),
  create(data) {
    const expense = { id: nextId++, ...data };
    expenses.set(expense.id, expense);
    return expense;
  },
  update(id, data) {
    if (!expenses.has(id)) return undefined;
    const expense = { ...expenses.get(id), ...data, id };
    expenses.set(id, expense);
    return expense;
  },
  remove: (id) => expenses.delete(id),
  getBudget: (month) => budgets.get(month) || 0,
  setBudget(month, amount) {
    budgets.set(month, amount);
    return amount;
  },
  reset() {
    expenses.clear();
    nextId = 1;
    budgets.clear();
  },
};
