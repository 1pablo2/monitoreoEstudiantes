import { Router } from 'express';
import { obtenerFechaActualizacion } from '../controllers/fechaActualizacion.js';

const router = Router();

router.get('/ultima-actualizacion', obtenerFechaActualizacion);

export default router;