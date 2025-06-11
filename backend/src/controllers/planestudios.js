import { PlanEstudios } from "../models/index.js";

const obtenerDecretos = async (req, res) => {
  try {
    const decretos = await PlanEstudios.findAll({
      attributes: ['codigo', 'glosa'],
      order: [['glosa', 'ASC']]
    });
    res.status(200).json(decretos);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener los decretos",
      errorValue: error.message
    });
  }
};

export { obtenerDecretos };