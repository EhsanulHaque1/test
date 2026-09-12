// Minimal vanilla-JS frontend that talks to the /api/todos endpoints.
const list = document.getElementById('list');
const form = document.getElementById('new-todo');
const input = document.getElementById('title');
const status = document.getElementById('status');

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok && res.status !== 204) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return res.status === 204 ? null : res.json();
}

function render(todos) {
  list.innerHTML = '';
  for (const todo of todos) {
    const li = document.createElement('li');
    if (todo.done) li.classList.add('done');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.done;
    checkbox.addEventListener('change', async () => {
      await api(`/api/todos/${todo.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ done: checkbox.checked }),
      });
      refresh();
    });

    const span = document.createElement('span');
    span.textContent = todo.title;

    const del = document.createElement('button');
    del.type = 'button';
    del.textContent = '✕';
    del.addEventListener('click', async () => {
      await api(`/api/todos/${todo.id}`, { method: 'DELETE' });
      refresh();
    });

    li.append(checkbox, span, del);
    list.append(li);
  }
  status.textContent = todos.length ? `${todos.length} item(s)` : 'Nothing yet.';
}

async function refresh() {
  try {
    render(await api('/api/todos'));
  } catch (err) {
    status.textContent = `Error: ${err.message}`;
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  await api('/api/todos', { method: 'POST', body: JSON.stringify({ title }) });
  input.value = '';
  refresh();
});

refresh();
