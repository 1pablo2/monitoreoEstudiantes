import VistaMenu from "../comunes/vistaMenu"
import { useState } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { uploadFiles } from '../../services/cargarArchivos.service';
import { Button } from 'primereact/button';

function CargarArchivos() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    const allowedExtensions = ['.xlsx', '.xls'];
    const   MAX_FILE_SIZE_MB = 5;

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
            alert('Los archivos deben ser .xlsx o .xls.');
            return;
        }
        setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
    };

    const handleFileChange = (event) => {
        const selectedFiles = Array.from(event.target.files).filter(isValidFile);
        if (selectedFiles.length === 0) {
            alert('Los archivos deben ser .xlsx o .xls.');
            return;
        }
        setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
    };

const handleUpload = async () => {
    if (files.length === 0) {
        alert('Por favor selecciona al menos un archivo.');
        return;
    }

    setLoading(true);
    try {
        const data = await uploadFiles(files);
        const mensajes = [];
        const nombresAmigables = {
            "Alumnos Matriculados": "Carga de alumnos matriculados",
            "Acta de Término": "Carga de actas de término de asignatura"
        };
        if (data.exitosos.length > 0) {
            mensajes.push(`✅ ${data.exitosos.length === 1 ? 'Una operación fue completada' : 'Varias operaciones fueron completadas correctamente'}.`);
        }

        data.exitosos.forEach(({ scriptName, stdout }) => {
            if (stdout.includes('no existe en la tabla matriculado')) {
                mensajes.push(`⚠️ Advertencia en ${scriptName}: algunos RUTs no figuran como matriculados. Cargue el archivo con los alumnos matriculados antes de cargar el acta de término de asignatura`);
            }
        });

        if (data.fallidos.length > 0) {
            mensajes.push(`❌ ${data.fallidos.length === 1 ? 'Hubo un problema con una de las operaciones' : 'Algunas operaciones no pudieron completarse'}.`);

            data.fallidos.forEach(({ scriptName }) => {
                mensajes.push(`• Error en la ${nombresAmigables[scriptName]}. Por favor revise que el archivo sea correcto y vuelva a intentarlo.`);
            });
        }

        alert(mensajes.join('\n'));
        setFiles([]);
    } catch (error) {
        console.error('Error al cargar archivos:', error);
        alert('Hubo un error al cargar los archivos. Inténtalo nuevamente.');
    } finally {
        setLoading(false);
    }
};


    return (
        <VistaMenu>
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