# backend-inventario-piezas

Un backend minimalista en Node.js + Express que usa Sequelize para conectarse a una base de datos PostgreSQL.

## 🧩 Requisitos previos

- Node.js 18+ (recomendado)
- PostgreSQL accesible (local o remoto)

## 🚀 Configuración

1. Copia el archivo de ejemplo y ajusta las credenciales:

```bash
cp .env.example .env
```

2. Instala dependencias:

```bash
npm install
```

3. Ejecuta en modo desarrollo (con nodemon):

```bash
npm run dev
```

## ✅ Rutas disponibles

- `GET /` - verifica que el servidor está corriendo
- `GET /db-test` - prueba la conexión a PostgreSQL
