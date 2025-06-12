import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL+"planestudios";

export async function obtenerDecretos() {
  const res = await axios.get(`${API_URL}/decretos`);
  return res.data;
}