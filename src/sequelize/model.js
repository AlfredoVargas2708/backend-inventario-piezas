const { DataTypes } = require("sequelize");
const { sequelize } = require("./db"); // Ajusta la ruta según tu configuración

const Lego = sequelize.define(
  "Lego",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    pieza: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    lego: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    cantidad: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    task: {
      type: DataTypes.BIGINT,
      allowNull: false,
    },
    set_nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    esta_pedido: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    esta_reemplazado: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    esta_completo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    comentarios: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "legos",
    timestamps: false,
  },
);

module.exports = Lego;
