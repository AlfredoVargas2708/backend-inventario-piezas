const express = require("express");
const dotenv = require("dotenv");
const { testConnection } = require("./db");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  return res.json({ ok: true, message: "Servidor levantado" });
});

app.get("/db-test", async (req, res) => {
  const result = await testConnection();
  return res.status(result.ok ? 200 : 500).json(result);
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
