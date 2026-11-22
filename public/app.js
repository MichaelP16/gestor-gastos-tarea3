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

function showError(message) {
  $('#error').textContent = message || '';
}

function fillCategories() {
  const options = CATEGORIES.map((c) => `<option>${c}</option>`).join('');
  $('#category').innerHTML = options;
}

function renderList() {
  $('#list').innerHTML = expenses
    .map(
      (e) => `<tr>
        <td>${esc(e.date)}</td>
        <td>${esc(e.description)}</td>
        <td>${esc(e.category)}</td>
        <td>${money(e.amount)}</td>
      </tr>`
    )
    .join('');
  $('#empty').hidden = expenses.length > 0;
}


async function load() {
  let url = '/expenses';
  expenses = await api('GET', url);
  renderList();
}


$('#expense-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = {
    description: $('#description').value,
    amount: Number($('#amount').value),
    category: $('#category').value,
  };
  try {
    showError('');
    await api('POST', '/expenses', data);
    $('#expense-form').reset();
    await load();
  } catch (err) {
    showError(err.message);
  }
});



fillCategories();
load().catch((err) => showError(err.message));
