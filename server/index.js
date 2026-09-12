// Entry point: only starts the HTTP server. All routing lives in app.js so
// it stays testable in isolation.
const { createApp } = require('./app');

const port = Number(process.env.PORT) || 3000;
const app = createApp();

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`server listening on http://localhost:${port}`);
});
