const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

// Conexión: usa DATABASE_URL (recomendado) o variables separadas (DB_HOST, DB_NAME, etc.).
// Lanza un error temprano si no hay configuración disponible.
const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
const hasSeparateConfig = Boolean(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER);

if (!hasDatabaseUrl && !hasSeparateConfig) {
  throw new Error(
    "No se encontró configuración de Postgres. Crea un archivo .env (copia .env.example) y define DATABASE_URL o DB_HOST/DB_NAME/DB_USER/DB_PASS."
  );
}

const sequelize = hasDatabaseUrl
  ? new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      logging: false,
    })
  : new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS || "", {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
      dialect: "postgres",
      logging: false,
    });

async function testConnection() {
  try {
    await sequelize.authenticate();
    return { ok: true, message: "Conexión a PostgreSQL OK" };
  } catch (error) {
    return { ok: false, message: "Error al conectar a PostgreSQL", error: error.message };
  }
}

module.exports = { sequelize, testConnection };
