import { Matriculado, Asignatura, MatriculadoHasAsignatura } from "../models/index.js";
import { Sequelize } from "sequelize";

const obtenerAsignaturas = async (req, res) => {
  try {
    const { decreto } = req.query;

    const whereClause = decreto
      ? { PlanEstudios_codigo: decreto }
      : {};

    const asignaturas = await Asignatura.findAll({
      attributes: ['codAsignatura', 'nombreAsignatura','prerrequisitos'],
      where: whereClause,
      order: [['codAsignatura', 'ASC']]
    });

    res.status(200).json(asignaturas);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener las asignaturas",
      errorValue: error.message
    });
  }
};


const obtenerMatriculadosPorAsignatura = async (req, res) => {
  try {
    const { codAsignatura, periodo, decreto, query } = req.query;

    if (!codAsignatura || !periodo || !decreto) {
      return res.status(400).json({ error: "codAsignatura, periodo y decreto son requeridos" });
    }

    const criterioBusqueda = { where: {} };

    if (periodo) {
      criterioBusqueda.where.semestre = periodo;
    }

    if (decreto) {
      criterioBusqueda.where.PlanEstudios_codigo = decreto;
    }

    if (query) {
      criterioBusqueda.where[Sequelize.Op.or] = [
        { nombreCompleto: { [Sequelize.Op.like]: `%${query}%` } },
        { rut: { [Sequelize.Op.like]: `%${query}%` } }
      ];
    }

    const matriculados = await Matriculado.findAll({
      ...criterioBusqueda,
      raw: true
    });

    const estados = await MatriculadoHasAsignatura.findAll({
      where: {
        matriculado_PlanEstudios_codigo: decreto,
        matriculado_semestre: periodo,
        Asignatura_codAsignatura: {
          [Sequelize.Op.in]: Array.isArray(codAsignatura) ? codAsignatura : [codAsignatura]
        }
      },
      attributes: ['matriculado_rut', 'Asignatura_codAsignatura', 'estado'],
      raw: true
    });

    const estadosPorRut = {};
    estados.forEach(e => {
      if (!estadosPorRut[e.matriculado_rut]) {
        estadosPorRut[e.matriculado_rut] = {};
      }
      estadosPorRut[e.matriculado_rut][e.Asignatura_codAsignatura] = e.estado;
    });

    const resultado = matriculados.map(m => {
      const estadosMatriculado = estadosPorRut[m.rut] || {};
      const datos = {
        rut: m.rut,
        anioIngreso: m.anioIngreso,
        nombreCompleto: m.nombreCompleto
      };
      codAsignatura.forEach(cod => {
        datos[cod] = estadosMatriculado[cod] ?? null;
      });
      return datos;
    });

    return res.status(200).json(resultado);
  } catch (error) {
    console.error("Error al obtener alumnos por asignatura:", error);
    res.status(500).json({
      error: "Error al obtener datos por asignatura",
      errorValue: error.message
    });
  }
};

export {
  obtenerAsignaturas,
  obtenerMatriculadosPorAsignatura
};