// Almacén en memoria de gastos y presupuesto.
const expenses = new Map();
let nextId = 1;
let budget = 0;

module.exports = {
  all: () => [...expenses.values()],
  get: (id) => expenses.get(id),
  create(data) {
    const expense = { id: nextId++, date: new Date().toISOString().slice(0, 10), ...data };
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
  getBudget: () => budget,
  setBudget(amount) {
    budget = amount;
    return budget;
  },
  reset() {
    expenses.clear();
    nextId = 1;
    budget = 0;
  },
};
