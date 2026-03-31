const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const { testConnection } = require("./sequelize/db");
const Lego = require("./sequelize/model");
const { fn, col } = require("sequelize");
const axios = require("axios");

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

app.get("/columns", async (req, res) => {
  const columns = Object.keys(Lego.rawAttributes);
  return res.status(200).json(columns);
});

app.get("/value", async (req, res) => {
  try {
    const { columns, values } = req.query;

    if (!columns || !values) {
      return res
        .status(400)
        .json({ ok: false, message: "Faltan parámetros columns o values" });
    }

    const result = await Lego.findOne({
      where: {
        [columns.split(",")[0].trim()]: values.split(",")[0].trim(),
        [columns.split(",")[1].trim()]: values.split(",")[1].trim(),
      },
    });

    return res.json({
      ok: true,
      data: result,
    });
  } catch (error) {
    console.error("Error en /search:", error);
    res.status(500).json({
      ok: false,
      message: "Error al realizar la búsqueda",
      error: error.message,
    });
  }
});

app.get("/search", async (req, res) => {
  try {
    const { column, value, pageSize, page } = req.query;

    if (!column || !value) {
      return res.status(400).json({
        ok: false,
        message: "Faltan parámetros column o value o page o pageSize",
      });
    }

    const parsedPage = Math.max(1, parseInt(page) || 1);
    const parsedPageSize = Math.max(1, parseInt(pageSize) || 10);
    const offset = (parsedPage - 1) * parsedPageSize;
    const hasPagination = page && pageSize;

    const results = await Lego.findAndCountAll({
      where: { [column]: value },
      order: [["id", "ASC"]],
      // ✅ Solo aplica limit/offset si vienen los dos parámetros
      ...(hasPagination && {
        limit: parsedPageSize,
        offset,
      }),
    });

    if (results.count === 0) {
      return res
        .status(404)
        .json({ ok: false, message: "No se encontraron resultados" });
    }

    return res.json({
      ok: true,
      data: results.rows,
      filasTotales: results.count,
      // ✅ Solo incluye datos de paginación si aplica
      ...(hasPagination && {
        paginasTotales: Math.ceil(results.count / parsedPageSize),
        page: parsedPage,
        pageSize: parsedPageSize,
      }),
    });
  } catch (error) {
    console.error("Error en /search:", error);
    res.status(500).json({
      ok: false,
      message: "Error al realizar la búsqueda",
      error: error.message,
    });
  }
});

app.post("/duplicado", async (req, res) => {
  try {
    const { lego, pieza, task, cantidad } = req.body;

    if (!lego || !pieza || !task || !cantidad) {
      return res.status(400).json({
        ok: false,
        message: "Faltan campos obligatorios",
      });
    }

    const existe = await Lego.findOne({
      where: {
        lego: lego,
        pieza: pieza,
        task: task,
        cantidad: cantidad,
      },
    });

    return res.json({
      ok: true,
      existe: !!existe, // true o false
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      message: "Error del servidor",
    });
  }
});

app.get("/searchAllByColumn", async (req, res) => {
  try {
    const { column, value_column, other_column } = req.query;

    if (!column || !value_column || !other_column) {
      return res
        .status(400)
        .json({ ok: false, message: "Falta parámetro column" });
    }

    const results = await Lego.findAll({
      attributes: [column, [fn("SUM", col("cantidad")), "cantidad_total"]],
      where: {
        [other_column]: value_column,
      },
      group: [column],
      raw: true,
    });

    return res.json({
      ok: true,
      data: results,
    });
  } catch (error) {
    console.error("Error en /searchAllByColumn:", error);
    res.status(500).json({
      ok: false,
      message: "Error al realizar la búsqueda",
      error: error.message,
    });
  }
});

app.post("/agregar", async (req, res) => {
  try {
    const body = req.body;

    if (!body)
      return res
        .status(400)
        .json({ ok: false, message: "Falta el elemento a agregar" });

    await Lego.create(body);

    return res.json({
      ok: true,
      message: "Elemento creado correctamente",
    });
  } catch (error) {
    console.error("Error en /editar:", error);
    res.status(500).json({
      ok: false,
      message: "Error al editar el elemento",
      error: error.message,
    });
  }
});

app.put("/editar", async (req, res) => {
  try {
    const body = req.body;

    if (!body)
      return res
        .status(400)
        .json({ ok: false, message: "Falta el elemento a agregar" });

    await Lego.update(body, {
      where: {
        id: body.id,
      },
    });

    return res.json({
      ok: true,
      message: "Elemento editado correctamente",
    });
  } catch (error) {
    console.error("Error en /editar:", error);
    res.status(500).json({
      ok: false,
      message: "Error al editar el elemento",
      error: error.message,
    });
  }
});

const qs = require("querystring"); // o puedes usar URLSearchParams

app.post("/brickset/instructions", async (req, res) => {
  try {
    const { setNumber } = req.body;

    const response = await axios.post(
      "https://brickset.com/api/v3.asmx/getInstructions2",
      new URLSearchParams({
        apiKey: process.env.BRICKSET_API_KEY,
        userHash: "",
        setNumber: setNumber, // directo, sin params wrapper
      }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    res.json(response.data);
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Error al consultar Brickset" });
  }
});

app.delete("/eliminar/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id)
      return res
        .status(400)
        .json({ ok: false, message: "Falta el identificador para eliminar" });

    await Lego.destroy({
      where: {
        id: id,
      },
    });

    return res.json({
      ok: true,
      message: "Elemento eliminado correctamente",
    });
  } catch (error) {
    console.error("Error en /eliminar:", error);
    res.status(500).json({
      ok: false,
      message: "Error al eliminar el elemento",
      error: error.message,
    });
  }
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
