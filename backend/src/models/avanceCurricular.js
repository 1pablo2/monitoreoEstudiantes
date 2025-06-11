import { DataTypes } from "sequelize";
import { sequelize } from "../db/config.js";

const AvanceCurricular = sequelize.define(
  "AvanceCurricular",
  {
    anio: {
      type: DataTypes.CHAR(4),
      allowNull: false,
    },
    semestre: {
      type: DataTypes.CHAR(1),
      allowNull: false,
    },
    asignatura_codAsignatura: {
      type: DataTypes.STRING(12),
      allowNull: false,
      references: {
        model: "Asignatura",
        key: "codAsignatura",
      },
      primaryKey: true,
    },
    asignatura_PlanEstudios_codigo: {
      type: DataTypes.CHAR(4),
      allowNull: false,
      references: {
        model: "Asignatura",
        key: "PlanEstudios_codigo",
      },
      primaryKey: true,
    },
    matriculado_PlanEstudios_codigo: {
      type: DataTypes.CHAR(4),
      allowNull: false,
      references: {
        model: "Matriculado",
        key: "PlanEstudios_codigo",
      },
      primaryKey: true,
    },
    matriculado_rut: {
      type: DataTypes.STRING(8),
      allowNull: false,
      references: {
        model: "Matriculado",
        key: "rut",
      },
      primaryKey: true,
    },
    matriculado_semestre: {
      type: DataTypes.CHAR(1),
      allowNull: false,
      references: {
        model: "Matriculado",
        key: "semestre",
      },
      primaryKey: true,
    },
    matriculado_anioIngreso: {
      type: DataTypes.CHAR(4),
      allowNull: false,
      references: {
        model: "Matriculado",
        key: "anioIngreso",
      },
      primaryKey: true,
    },
    matriculado_anioMatricula: {
      type: DataTypes.CHAR(4),
      allowNull: false,
      references: {
        model: "Matriculado",
        key: "anioMatricula",
      },
      primaryKey: true,
    },
    PlanEstudios_codigo: {
      type: DataTypes.CHAR(4),
      allowNull: false,
      references: {
        model: "PlanEstudios",
        key: "codigo",
      },
    },
  },
  {
    tableName: "avancecurricular",
    timestamps: false,
  }
);

export default AvanceCurricular;