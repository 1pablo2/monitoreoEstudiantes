import { DataTypes } from "sequelize";
import { sequelize } from "../db/config.js";

const Matriculado = sequelize.define(
  "Matriculado",
  {
    rut: {
      type: DataTypes.STRING(8),
      allowNull: false,
      primaryKey: true,
    },
    dv: {
      type: DataTypes.CHAR(1),
      allowNull: false,
    },
    nombreCompleto: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    anioIngreso: {
      type: DataTypes.CHAR(4),
      allowNull: false,
      primaryKey: true,
    },
    semestre: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      primaryKey: true,
    },
    PlanEstudios_codigo: {
      type: DataTypes.CHAR(4),
      allowNull: false,
      primaryKey: true,
    },
    anioMatricula: {
      type: DataTypes.CHAR(4),
      allowNull: false,
      primaryKey: true
    } 
  },
  {
    tableName: "matriculado",
    timestamps: false,
  }
);

export default Matriculado;