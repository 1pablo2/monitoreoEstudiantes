import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL+"asignaturas";

export const obtenerAsignaturas = async (decreto) => {
  try {
    const response = await axios.get(`${API_URL}/`,{
      params: {decreto}
  });
    return response.data;
  } catch (error) {
    console.error("Error al obtener asignaturas:", error);
    throw error;
  }
};

export const obtenerMatriculadosPorAsignatura = async ({ codAsignaturas, periodo, decreto, query }) => {
  try {
    const response = await axios.get(`${API_URL}/matriculados`, {
      params: { codAsignatura: codAsignaturas, periodo, decreto, query },
    });
    return response.data || [];
  } catch (error) {
    console.error("Error al obtener matriculados por asignatura:", error);
    throw error;
  }
};