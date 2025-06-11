export const uploadFiles = async (files) => {
    const formData = new FormData();
    files.forEach(file => {
        formData.append('archivos', file);
    });

    const scriptIds = new Set();

    files.forEach(file => {
        const name = file.name.toLowerCase();

        if (name.includes('alumnos') && name.includes('matriculado')) {
            scriptIds.add('1');
        } else if (name.includes('acta') && name.includes('asignatura')) {
            scriptIds.add('2');
        }
    });

    if (scriptIds.size === 0) {
        alert('No se pudo identificar el tipo de archivo para ejecutar el script.');
        throw new Error('Tipo de archivo no reconocido');
    }

    const scriptsParam = Array.from(scriptIds).join(',');

    try {
        const response = await fetch(`http://localhost:8000/cargarArchivos?scripts=${scriptsParam}`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Error al cargar archivos');
        }

        return await response.json();
    } catch (error) {
        console.error('Error al cargar archivos:', error);
        throw error;
    }
};