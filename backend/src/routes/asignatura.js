import { Router } from "express";
import {
  obtenerAsignaturas,
  obtenerMatriculadosPorAsignatura
} from "../controllers/asignatura.js";

const router = Router();

router.get("/", obtenerAsignaturas);
router.get("/matriculados", obtenerMatriculadosPorAsignatura);

export default router;
