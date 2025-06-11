import axios from "axios";

export async function obtenerDecretos() {
  const res = await axios.get("http://localhost:8000/planestudios/decretos");
  return res.data;
}