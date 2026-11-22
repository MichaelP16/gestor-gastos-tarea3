const CATEGORIES = ['Comida', 'Transporte', 'Entretenimiento', 'Salud', 'Hogar', 'Otros'];
const $ = (selector) => document.querySelector(selector);
const money = (n) => Number(n).toLocaleString('es-DO', { style: 'currency', currency: 'DOP' });
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

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

function showError(message) {
  $('#error').textContent = message || '';
}

function fillCategories() {
  const options = CATEGORIES.map((c) => `<option>${c}</option>`).join('');
  $('#category').innerHTML = options;
  $('#filter').innerHTML = '<option value="">Todas</option>' + options;
}

function renderList() {
  $('#list').innerHTML = expenses
    .map(
      (e) => `<tr>
        <td>${esc(e.date)}</td>
        <td>${esc(e.description)}</td>
        <td>${esc(e.category)}</td>
        <td>${money(e.amount)}</td>
        <td>
          <button data-action="edit" data-id="${e.id}" class="secondary">Editar</button>
          <button data-action="delete" data-id="${e.id}" class="danger">Eliminar</button>
        </td>
      </tr>`
    )
    .join('');
  $('#empty').hidden = expenses.length > 0;
}

async function loadSummary() {
  const s = await api('GET', '/summary');
  $('#stat-budget').textContent = money(s.budget);
  $('#stat-spent').textContent = money(s.totalSpent);
  $('#stat-remaining').textContent = money(s.remaining);
  $('#stat-remaining').classList.toggle('over', s.remaining < 0);
}

async function load() {
  let url = '/expenses';
  if (filter) url += '?category=' + encodeURIComponent(filter);
  expenses = await api('GET', url);
  renderList();
  await loadSummary();
}

function resetForm() {
  editingId = null;
  $('#expense-form').reset();
  $('#form-title').textContent = 'Nuevo gasto';
  $('#submit-btn').textContent = 'Agregar';
  $('#cancel-btn').hidden = true;
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
      const e = expenses.find((x) => x.id === id);
      editingId = id;
      $('#description').value = e.description;
      $('#amount').value = e.amount;
      $('#category').value = e.category;
      $('#form-title').textContent = 'Editar gasto #' + id;
      $('#submit-btn').textContent = 'Guardar cambios';
      $('#cancel-btn').hidden = false;
    }
  } catch (err) {
    showError(err.message);
  }
});

$('#expense-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = {
    description: $('#description').value,
    amount: Number($('#amount').value),
    category: $('#category').value,
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
    $('#expense-form').reset();
    await load();
  } catch (err) {
    showError(err.message);
  }
});

$('#budget-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    await api('PUT', '/budget', { amount: Number($('#budget').value) });
    await loadSummary();
  } catch (err) {
    showError(err.message);
  }
});

$('#filter').addEventListener('change', async (event) => {
  filter = event.target.value;
  await load();
});

fillCategories();
load().catch((err) => showError(err.message));
