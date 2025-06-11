import { Router } from "express";
import {
  obtenerCohortes,
  obtenerMatriculadosPorCohorte
} from "../controllers/matriculado.js";

const router = Router();

router.get("/cohortes", obtenerCohortes);
router.get('/buscar', obtenerMatriculadosPorCohorte);

export default router;