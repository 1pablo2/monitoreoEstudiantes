import axios from "axios";

const API_URL = "http://localhost:8000/matriculado";

export const obtenerCohortes = async () => {
    try {
        const response = await axios.get(`${API_URL}/cohortes`);
        return response.data || [];
    } catch (error) {
        console.error("Error al obtener cohortes:", error);
        throw error;
    }
};

export const obtenerMatriculadosPorCohorte = async ({ cohorte = "", periodo = "", decreto="", query = "" } = {}) => {
  try {
    const response = await axios.get(`${API_URL}/buscar`, {
      params: { cohorte, periodo, decreto, query },
    });

    return response.data;
  } catch (error) {
    console.error("Error al obtener matriculados por cohorte:", error);
    throw error;
  }
};