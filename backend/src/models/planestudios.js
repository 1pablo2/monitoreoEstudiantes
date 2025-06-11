import { DataTypes } from "sequelize";
import { sequelize } from "../db/config.js";

const PlanEstudios = sequelize.define(
  "PlanEstudios",
  {
    codigo: {
      type: DataTypes.CHAR(4),
      allowNull: false,
      primaryKey: true,
    },
    glosa: {
      type: DataTypes.STRING(90),
      allowNull: false,
    },
    codigoSIES: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
  },
  {
    tableName: "planestudios",
    timestamps: false,
  }
);

export default PlanEstudios;