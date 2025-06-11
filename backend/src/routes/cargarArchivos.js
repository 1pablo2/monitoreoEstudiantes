import { Router } from "express";
import multer from 'multer';
import { cargarArchivos } from '../controllers/cargarArchivos.js';
    
const router = Router();
const upload = multer();

router.post('/', upload.array('archivos'),cargarArchivos);

export default router;