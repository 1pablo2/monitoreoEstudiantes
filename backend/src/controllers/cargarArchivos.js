import { exec } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { guardarFechaActualizacion } from './fechaActualizacion.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const cargarArchivos = (req, res) => {
    const { scripts } = req.query;

    if (!scripts) {
        console.error("Error: Falta el parámetro 'scripts'.");
        return res.status(400).json({
            error: "El parámetro 'scripts' es requerido. Ejemplo: ?scripts=1,2"
        });
    }

    const scriptsArray = scripts.split(',');
    const validScripts = ['1', '2'];
    const invalidScripts = scriptsArray.filter((script) => !validScripts.includes(script));
    if (invalidScripts.length > 0) {
        console.error(`Error: Scripts inválidos: ${invalidScripts}`);
        return res.status(400).json({
            error: `Los siguientes scripts no son válidos: ${invalidScripts.join(', ')}. Valores permitidos: 1, 2`
        });
    }

    const tempDir = join(__dirname, '..', 'uploads', `temp_${Date.now()}`);
    try {
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
            console.log(`Directorio temporal creado: ${tempDir}`);
        }
    } catch (err) {
        console.error(`Error creando el directorio temporal: ${err.message}`);
        return res.status(500).json({ error: 'Error creando el directorio temporal' });
    }

    const files = req.files;
    if (!files || files.length === 0) {
        console.error('Error: No se recibieron archivos en la solicitud.');
        return res.status(400).json({ error: 'No se proporcionaron archivos.' });
    }

    const savedFiles = [];
    try {
        files.forEach(file => {
            const tempFilePath = join(tempDir, file.originalname);
            fs.writeFileSync(tempFilePath, file.buffer);
            savedFiles.push(tempFilePath);
            console.log(`Archivo guardado: ${tempFilePath}`);
        });
    } catch (err) {
        console.error(`Error guardando los archivos: ${err.message}`);
        return res.status(500).json({ error: 'Error guardando los archivos' });
    }

    const script1Path = join(__dirname, '..', 'scripts', 'cargarAlumnosMatriculados.py');
    const script2Path = join(__dirname, '..', 'scripts', 'cargarActaTerminoAsignaturaHistorico.py');

    const ejecutarScript = (scriptPath, scriptName) => {
        return new Promise((resolve, reject) => {
            exec(`python "${scriptPath}" "${tempDir}"`, (error, stdout, stderr) => {
                if (stdout) {
                    console.log(`Salida de ${scriptName} (stdout): ${stdout}`);
                }
                if (stderr) {
                    console.error(`Errores de ${scriptName} (stderr): ${stderr}`);
                }
                if (error) {
                    console.error(`Error ejecutando ${scriptName}: ${error.message}`);
                    return reject({ scriptName, error: error.message, success: false });
                }
                resolve({ scriptName, stdout, success: true });
            });
        });
    };

    const promesas = [];
    if (scriptsArray.includes('1')) promesas.push(ejecutarScript(script1Path, 'Alumnos Matriculados'));
    if (scriptsArray.includes('2')) promesas.push(ejecutarScript(script2Path, 'Acta de Término'));

    Promise.allSettled(promesas)
        .then((resultados) => {
            const exitosos = resultados.filter((r) => r.status === 'fulfilled').map((r) => r.value);
            const fallidos = resultados.filter((r) => r.status === 'rejected').map((r) => r.reason);

            if (exitosos.length > 0) {
                console.log('Actualizando la fecha de última actualización.');
                guardarFechaActualizacion();
            }

            fs.rmSync(tempDir, { recursive: true, force: true });
            console.log('Directorio temporal eliminado.');

            res.status(200).json({
                message: 'Ejecución de scripts completa',
                exitosos,
                fallidos,
            });
        })
        .catch((error) => {
            console.error(`Error ejecutando los scripts: ${error.message}`);
            res.status(500).json({ error: 'Error ejecutando los scripts', detalles: error });
        });
};

export { cargarArchivos };