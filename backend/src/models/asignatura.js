import { DataTypes } from "sequelize";
import { sequelize } from "../db/config.js";

const Asignatura = sequelize.define(
  "Asignatura",
  {
    codAsignatura: {
      type: DataTypes.STRING(12),
      allowNull: false,
      primaryKey: true,
    },
    PlanEstudios_codigo: {
      type: DataTypes.CHAR(4),
      allowNull: false,
      references: {
        model: "PlanEstudios",
        key: "codigo",
      },
      primaryKey: true,
    },
    prerrequisitos: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    nombreAsignatura: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
  },
  {
    tableName: "asignatura",
    timestamps: false,
  }
);

export default Asignatura;