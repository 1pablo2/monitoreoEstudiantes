import VistaMenu from "../comunes/vistaMenu"
import { useState, useRef } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { uploadFiles } from '../../services/cargarArchivos.service';
import { Button } from 'primereact/button';
import { Toast } from "primereact/toast";

function CargarArchivos() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const toast = useRef(null)

    const allowedExtensions = ['.xlsx', '.xls'];
    const   MAX_FILE_SIZE_MB = 5;

    const mostrarNotificacion = (severity, resumen, detalle) => {
        toast.current?.show({
            severity,
            summary: resumen,
            detail: detalle,
            sticky: true,
        });
    };

    const isValidFile = (file) => {
        const fileType = file.type;
        const fileExtension = file.name.split('.').pop().toLowerCase();
        const fileSizeMB = file.size / (1024*1024);
        return (
            fileSizeMB <= MAX_FILE_SIZE_MB &&
            (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                fileType === 'application/vnd.ms-excel') &&
            allowedExtensions.includes(`.${fileExtension}`)
        );
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const droppedFiles = Array.from(event.dataTransfer.files).filter(isValidFile);
        if (droppedFiles.length === 0) {
            mostrarNotificacion('warn', 'Archivo inválido', 'Los archivos deben ser .xlsx o .xls.');
            return;
        }
        setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
    };

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files).filter(isValidFile);
        if (selectedFiles.length === 0) {
            mostrarNotificacion('warn', 'Archivo inválido', 'Los archivos deben ser .xlsx o .xls.');
            return;
        }
        setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    };

const handleUpload = async () => {
    if (files.length === 0) {
        mostrarNotificacion('warn', 'Ningún archivo seleccionado', 'Por favor selecciona al menos un archivo.');
        return;
    }

    setLoading(true);
    try {
        const data = await uploadFiles(files);
        const nombresAmigables = {
            "Alumnos Matriculados": "Carga de alumnos matriculados",
            "Acta de Término": "Carga de actas de término de asignatura"
        };
        if (data.exitosos.length > 0) {
            mostrarNotificacion('success', 'Operación completada', data.exitosos.length === 1
                    ? 'Una operación fue completada correctamente.'
                    : 'Varias operaciones fueron completadas correctamente.');
        }

        data.exitosos.forEach(({ scriptName, stdout }) => {
            const anioMatch = stdout.match(/RUTS_NO_ENCONTRADOS_ANIOS:([0-9,]+)/);
            if (anioMatch) {
                const anios = anioMatch[1].split(',').join(', ');
                mostrarNotificacion(
                        'warn',
                        `Advertencia en ${scriptName}`,
                        `Algunos RUTs no figuran como matriculados para el(los) año(s) ${anios}. Cargue primero el archivo de alumnos matriculados.`
                    );
            }
        });

        if (data.fallidos.length > 0) {
            mostrarNotificacion('error', 'Error de carga', data.fallidos.length === 1
                    ? 'Hubo un problema con una de las operaciones.'
                    : 'Algunas operaciones no pudieron completarse.');

            data.fallidos.forEach(({ scriptName }) => {
                mostrarNotificacion('error', 'Error en archivo', `• Error en la ${nombresAmigables[scriptName]}. Revise el archivo y vuelva a intentarlo.`);
            });
        }

        setFiles([]);
    } catch (error) {
mostrarNotificacion('error', 'Error inesperado', 'Hubo un error al cargar los archivos. Inténtalo nuevamente.');
    } finally {
        setLoading(false);
    }
};


    return (
        <VistaMenu>
            <Toast ref={toast} position="top-right" />
            <div style={{ backgroundColor: '#fdf8e4', border: '1px solid #e0d29d', borderRadius: '8px', padding: '16px', marginBottom: '20px', color: '#5c4e00', textAlign: "left" }}>
                <h3 style={{ marginTop: 0 }}>📄 Guía para cargar archivos:</h3>
                <ol style={{ paddingLeft: '20px' }}>
                    <li><strong>Primero</strong>, sube el archivo <u>"Alumnos matriculados"</u> correspondiente al semestre.</li>
                    <li><strong>Luego</strong>, sube uno o más archivos de <u>"Acta de término de asignatura"</u>.</li>
                    <li>Solo se permiten archivos <code>.xls</code> y <code>.xlsx</code>.</li>
                    <li>Verifica que la carga haya sido exitosa en los mensajes que aparecerán luego.</li>
                </ol>
            </div>
            <div
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleDrop}
                style={{
                    border: '2px dashed #ccc',
                    padding: '20px',
                    textAlign: 'center',
                    borderRadius: '10px',
                }}
            >
                <p>Arrastra y suelta los archivos aquí o haz clic para seleccionar archivos desde tu dispositivo.</p>
                <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="file-input"
                    accept=".xlsx, .xls"
                />
                <label htmlFor="file-input" style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}>
                    Seleccionar Archivos
                </label>
                {files.length > 0 && (
                    <div>
                        <h3>Archivos seleccionados:</h3>
                        <ul>
                            {files.map((file, index) => (
                                <li key={index}>{file.name}</li>
                            ))}
                        </ul>
                        <Button label="Cargar Archivos" onClick={handleUpload} disabled={loading} />
                    </div>
                )}
                {loading && <ProgressSpinner />}
            </div>
        </VistaMenu>
    );
}

export default CargarArchivos;