import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

function BotonLeyenda() {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button
        label="Leyenda"
        icon="pi pi-question-circle"
        className="p-button-warning boton-leyenda"
        onClick={() => setVisible(true)}
      />
      <Dialog
        header="Leyenda de símbolos"
        visible={visible}
        onHide={() => setVisible(false)}
        style={{ width: '25rem' }}
        modal
      >
        <ul>
          <li><strong>✅</strong> Aprobado</li>
          <li><strong>❌</strong> Reprobado</li>
          <li><strong>⏳</strong> Pendiente</li>
          <li><strong>📘</strong> Cursando</li>
        </ul>
      </Dialog>
    </>
  );
}

export default BotonLeyenda;