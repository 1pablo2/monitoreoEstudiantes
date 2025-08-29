import { Matriculado, Asignatura, MatriculadoHasAsignatura } from "../models/index.js";
import { Sequelize } from "sequelize";

const obtenerCohortes = async (req, res) => {
  try {
    const cohortes = await Matriculado.findAll({
      attributes: [[Sequelize.fn("DISTINCT", Sequelize.col("anioIngreso")), "anioIngreso"]],
      raw: true,
      order: [["anioIngreso", "ASC"]],
    });

    const lista = cohortes.map(item => item.anioIngreso);
    res.status(200).json(lista);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener cohortes únicos",
      errorValue: error.message,
    });
  }
};

const obtenerMatriculadosPorCohorte = async (req, res) => {
  try {
    const { cohorte, decreto, query } = req.query;

    const criterioBusqueda = { where: {} };

    if (cohorte) {
      criterioBusqueda.where.anioIngreso = cohorte;
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

    const todosMatriculados = await Matriculado.findAll({
      ...criterioBusqueda,
      raw: true
    });

    const agrupadosPorRut = {};
    todosMatriculados.forEach(m => {
      if (!agrupadosPorRut[m.rut]) {
        agrupadosPorRut[m.rut] = m;
      }
    });

    const matriculadosUnicos = Object.values(agrupadosPorRut);

    const asignaturas = await Asignatura.findAll({
      where: { PlanEstudios_codigo: decreto },
      attributes: ['codAsignatura', 'nombreAsignatura', 'prerrequisitos'],
      order: [['codAsignatura', 'ASC']]
    });

    const estados = await MatriculadoHasAsignatura.findAll({
      where: {
        matriculado_anioIngreso: cohorte,
        matriculado_PlanEstudios_codigo: decreto
      },
      attributes: ['matriculado_rut', 'Asignatura_codAsignatura', 'estado'],
      raw: true
    });

    const estadosPorRut = {};
    estados.forEach(({ matriculado_rut, Asignatura_codAsignatura, estado }) => {
      if (!estadosPorRut[matriculado_rut]) {
        estadosPorRut[matriculado_rut] = {};
      }

      const estadoAnterior = estadosPorRut[matriculado_rut][Asignatura_codAsignatura];
      estadosPorRut[matriculado_rut][Asignatura_codAsignatura] =
        estadoAnterior === undefined ? estado : Math.min(estadoAnterior, estado);
    });

    const matriculadosConEstados = matriculadosUnicos.map(m => {
      const estadosMatriculado = estadosPorRut[m.rut] || {};
      asignaturas.forEach(asig => {
        m[asig.codAsignatura] = estadosMatriculado[asig.codAsignatura] ?? null;
      });
      return m;
    });

    return res.status(200).json({
      matriculados: matriculadosConEstados,
      asignaturas
    });
  } catch (error) {
    return res.status(500).json({
      error: "Error al obtener los matriculados",
      errorValue: error.message,
    });
  }
};

export {
  obtenerCohortes,
  obtenerMatriculadosPorCohorte
};