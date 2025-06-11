import React, { useEffect, useState } from "react";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import { obtenerDecretos } from "../../services/decretos.service";
import { useDecreto } from "../../context/decretoContext";

function Inicio() {
  const [decretos, setDecretos] = useState([]);
  const {decreto, setDecreto} = useDecreto();
  const navigate = useNavigate();

  useEffect(() => {
    async function cargarDecretos() {
      try {
        const data = await obtenerDecretos();
        setDecretos(data.map(d => ({
          label: d.glosa,
          value: d.codigo
        })));
      } catch (err) {
        console.error("Error al obtener decretos:", err);
      }
    }
    cargarDecretos();
  }, []);

  const irAVista = (tipo) => {
    if (!decreto) return;
    navigate(`/${tipo}`);
  };

  return (
    <div className="inicio-container">
      <h2>Seleccione un Decreto</h2>
      <Dropdown
        value={decreto}
        options={decretos}
        onChange={(e) => setDecreto(e.value)}
        placeholder="-- Seleccione un decreto --"
        className="w-full md:w-20rem mb-4"
      />
      <div className="botones-vistas">
        <Button
          label="Ver por Cohorte"
          onClick={() => irAVista("cohorte")}
          disabled={!decreto}
          className="mr-2"
        />
        <Button
          label="Ver por Asignatura"
          onClick={() => irAVista("asignatura")}
          disabled={!decreto}
        />
      </div>
      <Button 
        label="Cargar Archivos" onClick={() => navigate("/cargar-archivos")}
      />
    </div>
  );
}

export default Inicio;