// Express app factory. Kept separate from the server bootstrap so tests can
// import `app` and hit it with supertest without opening a real port.
const path = require('path');
const express = require('express');

function createApp() {
  const app = express();
  app.use(express.json());

  // Serve the static frontend from /public
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // In-memory store — fine for a demo, would be a real DB in production.
  let nextId = 1;
  const todos = new Map();

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  app.get('/api/todos', (_req, res) => {
    res.json([...todos.values()]);
  });

  app.post('/api/todos', (req, res) => {
    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }
    const todo = { id: nextId++, title, done: false };
    todos.set(todo.id, todo);
    res.status(201).json(todo);
  });

  app.patch('/api/todos/:id', (req, res) => {
    const id = Number(req.params.id);
    const todo = todos.get(id);
    if (!todo) return res.status(404).json({ error: 'not found' });
    if (typeof req.body?.done === 'boolean') todo.done = req.body.done;
    if (typeof req.body?.title === 'string') todo.title = req.body.title.trim();
    res.json(todo);
  });

  app.delete('/api/todos/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!todos.delete(id)) return res.status(404).json({ error: 'not found' });
    res.status(204).end();
  });

  return app;
}

module.exports = { createApp };
