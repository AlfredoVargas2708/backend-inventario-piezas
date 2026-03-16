const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { testConnection } = require("./sequelize/db");
const Lego = require("./sequelize/model");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  return res.json({ ok: true, message: "Servidor levantado" });
});

app.get("/db-test", async (req, res) => {
  const result = await testConnection();
  return res.status(result.ok ? 200 : 500).json(result);
});

app.get('/search', async (req, res) => {
  try {
    const { column, value } = req.query;

    if (!column || !value) {
      return res.status(400).json({ ok: false, message: 'Faltan parámetros column o value' });
    }

    const results = await Lego.findAndCountAll({
      where: {
        [column] : value
      },
      order: [['id', 'ASC']],
    });

    if (results.count === 0) {
      return res.status(404).json({ ok: false, message: 'No se encontraron resultados' });
    }else {
      return res.json({ ok: true, data: results });
    }
  } catch (error) {
    console.error('Error en /search:', error);
    res.status(500).json({ ok: false, message: 'Error al realizar la búsqueda', error: error.message });
  }
})

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
