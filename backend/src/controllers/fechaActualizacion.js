import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const guardarFechaActualizacion = () => {
    const filePath = path.join(__dirname, '..', 'ultimaActualizacion.json');
    const fechaActual = new Date().toISOString();

    fs.writeFileSync(filePath, JSON.stringify({ fecha: fechaActual }, null, 2));
};

export const obtenerFechaActualizacion = (req, res) => {
    const filePath = path.join(__dirname, '..', 'ultimaActualizacion.json');

    if (fs.existsSync(filePath)) {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        res.json({ fecha: data.fecha });
    } else {
        res.json({ fecha: null });
    }
};