import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";

export default function VistaMenu({ children }) {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      {}
      <Button
        icon="pi pi-bars"
        onClick={() => setVisible(true)}
        className="p-button-text p-button-lg"
        style={{ position: "fixed", top: "1rem", left: "1rem", zIndex: 1001, color: "black" }}
      />

      {}
      <Sidebar visible={visible} onHide={() => setVisible(false)} position="left">
        <h3>Menú</h3>
        <Button label="Inicio" icon="pi pi-home" className="p-button-text" onClick={() => navigate("/")} />
        <Button label="Vista Cohorte" icon="pi pi-users" className="p-button-text" onClick={() => navigate("/cohorte")} />
        <Button label="Vista Asignatura" icon="pi pi-book" className="p-button-text" onClick={() => navigate("/asignatura")} />
        <Button label="Cargar Archivos" icon="pi pi-upload" className="p-button-text" onClick={() => navigate("/cargar-archivos")} />
      </Sidebar>

      {}
      <div style={{ paddingTop: "4rem" }}>{children}</div>
    </>
  );
}
