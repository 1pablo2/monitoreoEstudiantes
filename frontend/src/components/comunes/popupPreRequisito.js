import React from 'react';
import { Dialog } from 'primereact/dialog';

const PopupPrerequisito = ({ visible, onHide, data }) => {
  const { estudiante, asignatura, prerequisitos = [] } = data || {};

  return (
    <Dialog
      header={`Pre-Requisitos para ${asignatura?.codAsignatura || ''}`}
      visible={visible}
      style={{ width: '450px' }}
      modal
      onHide={onHide}
    >
      {estudiante && (
        <>
          <p><strong>Estudiante:</strong> {estudiante.nombreCompleto}</p>

          <p><strong>Pre-requisitos:</strong></p>
          <ul>
            {prerequisitos.length > 0
              ? prerequisitos.map((c, i) => <li key={i}> {c}</li>)
              : <li>No tiene pre-requisitos.</li>}
          </ul>
        </>
      )}
    </Dialog>
  );
};

export default PopupPrerequisito;