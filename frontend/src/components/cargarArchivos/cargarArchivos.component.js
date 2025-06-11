import VistaMenu from "../comunes/vistaMenu"
import { useState } from 'react';
import { ProgressSpinner } from 'primereact/progressspinner';
import { uploadFiles } from '../../services/cargarArchivos.service';
import { Button } from 'primereact/button';

function CargarArchivos() {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    const allowedExtensions = ['.xlsx', '.xls'];
    const isValidFile = (file) => {
        const fileType = file.type;
        const fileExtension = file.name.split('.').pop().toLowerCase();
        return (
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
            console.log('Archivos cargados exitosamente:', data);
            setFiles([]);
            alert('Archivos cargados exitosamente.');
        } catch (error) {
            console.error('Error al cargar archivos:', error);
            alert('Hubo un error al cargar los archivos. Inténtalo nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <VistaMenu>
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