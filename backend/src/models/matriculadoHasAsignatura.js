import { DataTypes } from "sequelize";
import { sequelize } from "../db/config.js";

const MatriculadoHasAsignatura = sequelize.define(
  "MatriculadoHasAsignatura",
  {
    aprobado: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
    cursando: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
    pendiente: {
      type: DataTypes.TINYINT,
      allowNull: false,
    },
    Asignatura_codAsignatura: {
      type: DataTypes.STRING(45),
      allowNull: false,
      references: {
        model: "Asignatura",
        key: "codAsignatura",
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
  },
  {
    tableName: "Matriculado_has_Asignatura",
    timestamps: false,
  }
);

export default MatriculadoHasAsignatura;