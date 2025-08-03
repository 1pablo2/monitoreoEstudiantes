import React, { useEffect, useState } from "react";
import VistaMenu from "../comunes/vistaMenu";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { obtenerMatriculadosPorCohorte, obtenerCohortes } from "../../services/vistaCohorte.service";
import PopupPreRequisito from "../comunes/popupPreRequisito";
import { useDecreto } from "../../context/decretoContext"
import { renderEstadoCelda } from "../comunes/renderEstadoCelda";
import handleClickAsignatura from "../comunes/handleClickAsignatura";
import { Tooltip } from "primereact/tooltip";
import { InputText } from "primereact/inputtext";
import BotonLeyenda from "../comunes/botonLeyenda";
import './vistaCohorte.css'

function VistaCohorte() {
  const [cohorteSeleccionado, setCohorteSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [matriculados, setMatriculados] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [cohortes, setCohortes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [visiblePopup, setVisiblePopup] = useState(false);
  const [datosPopup, setDatosPopup] = useState({});

  const {decreto} = useDecreto();

  useEffect(() => {
    async function cargarCohortes() {
      try {
        const lista = await obtenerCohortes();
        setCohortes(lista);
      } catch (err) {
        console.error("Error al obtener cohortes:", err);
      }
    }
    cargarCohortes();
  }, []);

  useEffect(() => {
    async function cargarDatos() {
      if (!cohorteSeleccionado || !decreto) return;
      setLoading(true);
      try {
        const {asignaturas, matriculados} = await obtenerMatriculadosPorCohorte({
          cohorte: cohorteSeleccionado,
          decreto: decreto,
          query: busqueda
        });
        setAsignaturas(asignaturas);
        
        const procesados = matriculados.map(matriculado => {
          const partes = matriculado.nombreCompleto?.trim().split(" ") || [];
          return {
            ...matriculado,
            nombres: partes.slice(0, -2).join(" ") || '',
            apellidoPaterno: partes[partes.length - 2] || '',
            apellidoMaterno: partes[partes.length - 1] || ''
          };
        });
        setMatriculados(procesados);

      } catch (err) {
        console.error("Error al obtener matriculados por cohorte:", err);
      } finally {
        setLoading(false);
      }
    }
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cohorteSeleccionado, busqueda, decreto]);


  return (
    <VistaMenu>
      <div className="vista-cohorte-container">
        <div className="filtros-cohorte">
          <div className="filtro-dropdown">
            <label htmlFor="cohorte">Seleccione cohorte:</label>
            <Dropdown
              id="cohorte"
              value={cohorteSeleccionado}
              options={cohortes.map((c) => ({ label: c, value: c }))}
              onChange={(e) => setCohorteSeleccionado(e.value)}
              placeholder="-- Seleccione --"
              className="w-full md:w-14rem"
            />
          </div>

          <div className="busqueda-con-leyenda">
            <div className="buscador-cohorte">
              <label htmlFor="busqueda">Busqueda:</label>
              <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar por nombre o RUT"
                  className="w-full"
                />
              </span>
            </div>
            <BotonLeyenda/>
          </div>
        </div>

        {loading ? (
          <p>Cargando datos...</p>
        ) : (
          <DataTable value={matriculados} paginator rows={10} stripedRows>
            <Column field="rut" header="RUT" />
            <Column field="apellidoPaterno" header="Apellido Paterno" />
            <Column field="apellidoMaterno" header="Apellido Materno" />
            <Column field="nombres" header="Nombres" />
            {asignaturas.map(asig => (
              <Column
                key={asig.codAsignatura}
                field={asig.codAsignatura}
                header={
                  <>
                    <div 
                      style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", whiteSpace:"nowrap"}}
                      data-pr-tooltip={asig.nombreAsignatura}
                      data-pr-position="top"
                    >
                      {asig.codAsignatura}
                    </div>
                    <Tooltip target={`[data-pr-tooltip="${asig.nombreAsignatura}"]`}/>
                  </>
                }
                body={(rowData) => 
                  renderEstadoCelda(rowData, { field: asig.codAsignatura },
                    ( matriculado, codAsignatura) => 
                      handleClickAsignatura({
                        matriculado,
                        codAsignatura,
                        asignaturas,
                        setDatosPopup,
                        setVisiblePopup
                      })
                  )
                }
                style={{ textAlign: "center" }}
              />
            ))}
          </DataTable>
        )}
      </div>

    <PopupPreRequisito
      visible={visiblePopup}
      onHide={() => setVisiblePopup(false)}
      data={datosPopup}
    />
    </VistaMenu>
  );
}

export default VistaCohorte;