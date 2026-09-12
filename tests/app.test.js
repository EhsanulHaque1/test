const request = require('supertest');
const { createApp } = require('../server/app');

describe('todos API', () => {
  let app;
  beforeEach(() => {
    app = createApp();
  });

  test('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('GET /api/todos starts empty', async () => {
    const res = await request(app).get('/api/todos');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  test('POST /api/todos rejects empty title', async () => {
    const res = await request(app).post('/api/todos').send({ title: '   ' });
    expect(res.status).toBe(400);
  });

  test('full create/update/delete lifecycle', async () => {
    const created = await request(app)
      .post('/api/todos')
      .send({ title: 'ship CI' })
      .expect(201);
    expect(created.body).toMatchObject({ title: 'ship CI', done: false });

    const patched = await request(app)
      .patch(`/api/todos/${created.body.id}`)
      .send({ done: true })
      .expect(200);
    expect(patched.body.done).toBe(true);

    await request(app).delete(`/api/todos/${created.body.id}`).expect(204);
    const list = await request(app).get('/api/todos').expect(200);
    expect(list.body).toEqual([]);
  });

  test('PATCH on missing id 404s', async () => {
    await request(app).patch('/api/todos/999').send({ done: true }).expect(404);
  });
});
