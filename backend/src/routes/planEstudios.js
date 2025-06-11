import { Router } from "express";
import { 
    obtenerDecretos 
} from "../controllers/planestudios.js";

const router = Router();

router.get("/decretos", obtenerDecretos);

export default router;
