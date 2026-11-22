const CATEGORIES = ['Comida', 'Transporte', 'Entretenimiento', 'Salud', 'Hogar', 'Otros'];
const $ = (selector) => document.querySelector(selector);
const money = (n) => Number(n).toLocaleString('es-DO', { style: 'currency', currency: 'DOP' });
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = new Date();
const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

async function api(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error((data && data.error) || 'Error en la petición');
  return data;
}

let expenses = [];
let editingId = null;
let filter = '';
let selectedMonth = localToday.slice(0, 7);

function showError(message) {
  $('#error').textContent = message || '';
}

function fillCategories() {
  const options = CATEGORIES.map((category) => `<option value="${category}">${category}</option>`).join('');
  $('#category').innerHTML = '<option value="" selected disabled>Selecciona una categoría</option>' + options;
  $('#filter').innerHTML = '<option value="">Todas</option>' + options;
}

function shiftMonth(month, offset) {
  const [year, monthNumber] = month.split('-').map(Number);
  const shifted = new Date(year, monthNumber - 1 + offset, 1);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(month) {
  const [year, monthNumber] = month.split('-').map(Number);
  return new Intl.DateTimeFormat('es-DO', { month: 'long', year: 'numeric' })
    .format(new Date(year, monthNumber - 1, 1));
}

function syncExpenseDate() {
  const period = $('#period').value;
  const [year, monthNumber] = selectedMonth.split('-').map(Number);
  const lastDay = new Date(year, monthNumber, 0).getDate();
  const minDay = period === 'fortnight-2' ? 16 : 1;
  const maxDay = period === 'fortnight-1' ? 15 : lastDay;
  const min = `${selectedMonth}-${String(minDay).padStart(2, '0')}`;
  const max = `${selectedMonth}-${String(maxDay).padStart(2, '0')}`;
  const dateInput = $('#expense-date');
  dateInput.min = min;
  dateInput.max = max;
  const date = dateInput.value;
  const day = date.startsWith(`${selectedMonth}-`) ? Number(date.slice(8, 10)) : 0;
  if (day < minDay || day > maxDay) {
    const todayDay = Number(localToday.slice(8, 10));
    const defaultDay = selectedMonth === localToday.slice(0, 7)
      ? Math.min(Math.max(todayDay, minDay), maxDay)
      : minDay;
    dateInput.value = `${selectedMonth}-${String(defaultDay).padStart(2, '0')}`;
  }
}

function renderList() {
  $('#list').innerHTML = expenses
    .map(
      (expense) => `<tr>
        <td>${esc(expense.date)}</td>
        <td>${esc(expense.description)}</td>
        <td>${esc(expense.category)}</td>
        <td>${money(expense.amount)}</td>
        <td>
          <button data-action="edit" data-id="${expense.id}" class="secondary">Editar</button>
          <button data-action="delete" data-id="${expense.id}" class="danger">Eliminar</button>
        </td>
      </tr>`
    )
    .join('');
  $('#empty').hidden = expenses.length > 0;
}

function renderMonthlyStats(allExpenses) {
  const previousMonth = shiftMonth(selectedMonth, -1);
  const currentExpenses = allExpenses.filter((expense) => expense.date.slice(0, 7) === selectedMonth);
  const previousExpenses = allExpenses.filter((expense) => expense.date.slice(0, 7) === previousMonth);
  const sum = (items) => items.reduce((total, expense) => total + Math.round(Number(expense.amount) * 100), 0);
  const currentTotal = sum(currentExpenses);
  const previousTotal = sum(previousExpenses);
  const difference = currentTotal - previousTotal;
  const comparison = previousTotal === 0 ? null : (difference / previousTotal) * 100;
  const label = monthLabel(selectedMonth);

  $('#statistics-month').textContent = label;
  $('#month-total').textContent = money(currentTotal / 100);
  $('#month-average').textContent = money(currentExpenses.length ? currentTotal / currentExpenses.length / 100 : 0);
  $('#month-comparison').textContent = comparison === null
    ? '—'
    : `${comparison > 0 ? '+' : ''}${comparison.toFixed(2)}%`;
  $('#month-comparison').classList.toggle('over', comparison !== null && comparison > 0);
  $('#current-month-label').textContent = label;
  $('#previous-month-label').textContent = monthLabel(previousMonth);
  $('#current-month-total').textContent = money(currentTotal / 100);
  $('#previous-month-total').textContent = money(previousTotal / 100);

  const expenseCount = currentExpenses.length;
  const summary = comparison === null
    ? (expenseCount ? `${expenseCount} gasto(s) registrado(s) este mes.` : 'No hay gastos registrados este mes.')
    : `${difference === 0 ? 'Gastaste lo mismo' : `Gastaste ${money(Math.abs(difference) / 100)} ${difference < 0 ? 'menos' : 'más'}`} que en ${monthLabel(previousMonth)}; ${expenseCount} gasto(s) registrado(s).`;
  $('#month-summary').textContent = summary;

  const categoryTotals = new Map();
  for (const expense of currentExpenses) {
    categoryTotals.set(expense.category, (categoryTotals.get(expense.category) || 0) + Math.round(Number(expense.amount) * 100));
  }
  const sortedCategories = [...categoryTotals.entries()].sort((a, b) => b[1] - a[1]);
  const maxCategoryTotal = sortedCategories.length ? sortedCategories[0][1] : 0;
  $('#category-breakdown').innerHTML = sortedCategories.map(([category, total]) => {
    const width = maxCategoryTotal ? (total / maxCategoryTotal) * 100 : 0;
    return `<div class="category-row">
      <strong>${esc(category)}</strong>
      <span class="category-bar"><span style="width:${width}%"></span></span>
      <span class="category-amount">${money(total / 100)}</span>
    </div>`;
  }).join('');
}

async function loadSummary() {
  const summary = await api('GET', `/summary?month=${encodeURIComponent(selectedMonth)}`);
  $('#stat-budget').textContent = money(summary.budget);
  $('#stat-spent').textContent = money(summary.totalSpent);
  $('#stat-remaining').textContent = money(summary.remaining);
  $('#stat-remaining').classList.toggle('over', summary.remaining < 0);
  $('#budget').value = summary.budget || '';
}

async function load() {
  const params = new URLSearchParams({ month: selectedMonth, period: $('#period').value });
  if (filter) params.set('category', filter);
  const [visibleExpenses, allExpenses] = await Promise.all([
    api('GET', `/expenses?${params}`),
    api('GET', '/expenses'),
  ]);
  expenses = visibleExpenses;
  renderList();
  await loadSummary();
  renderMonthlyStats(allExpenses);
  $('#selected-month').textContent = monthLabel(selectedMonth);
}

function resetForm() {
  editingId = null;
  $('#expense-form').reset();
  $('#form-title').textContent = 'Nuevo gasto';
  $('#submit-btn').textContent = 'Agregar';
  $('#cancel-btn').hidden = true;
  syncExpenseDate();
}

$('#cancel-btn').addEventListener('click', () => {
  resetForm();
  showError('');
});

$('#list').addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  const id = Number(button.dataset.id);
  try {
    if (button.dataset.action === 'delete') {
      if (!confirm('¿Eliminar este gasto?')) return;
      await api('DELETE', `/expenses/${id}`);
      if (editingId === id) resetForm();
      await load();
    } else if (button.dataset.action === 'edit') {
      const expense = expenses.find((item) => item.id === id);
      editingId = id;
      $('#description').value = expense.description;
      $('#amount').value = expense.amount;
      $('#category').value = expense.category;
      $('#expense-date').value = expense.date;
      $('#form-title').textContent = 'Editar gasto #' + id;
      $('#submit-btn').textContent = 'Guardar cambios';
      $('#cancel-btn').hidden = false;
    }
  } catch (error) {
    showError(error.message);
  }
});

$('#expense-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = {
    description: $('#description').value,
    amount: Number($('#amount').value),
    category: $('#category').value,
    date: $('#expense-date').value,
  };
  try {
    showError('');
    if (editingId !== null) {
      await api('PUT', `/expenses/${editingId}`, data);
      resetForm();
      await load();
      return;
    }
    await api('POST', '/expenses', data);
    resetForm();
    await load();
  } catch (error) {
    showError(error.message);
  }
});

$('#budget-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    showError('');
    await api('PUT', '/budget', { amount: Number($('#budget').value), month: selectedMonth });
    await load();
  } catch (error) {
    showError(error.message);
  }
});

$('#filter').addEventListener('change', () => {
  filter = $('#filter').value;
  load().catch((error) => showError(error.message));
});

$('#period').addEventListener('change', () => {
  syncExpenseDate();
  load().catch((error) => showError(error.message));
});

$('#previous-month').addEventListener('click', () => {
  resetForm();
  selectedMonth = shiftMonth(selectedMonth, -1);
  syncExpenseDate();
  load().catch((error) => showError(error.message));
});

$('#next-month').addEventListener('click', () => {
  resetForm();
  selectedMonth = shiftMonth(selectedMonth, 1);
  syncExpenseDate();
  load().catch((error) => showError(error.message));
});

fillCategories();
syncExpenseDate();
load().catch((error) => showError(error.message));
