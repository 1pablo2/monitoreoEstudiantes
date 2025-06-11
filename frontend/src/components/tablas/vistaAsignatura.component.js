import React, { useEffect, useState } from "react";
import VistaMenu from "../comunes/vistaMenu";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { obtenerAsignaturas, obtenerMatriculadosPorAsignatura } from "../../services/vistaAsignatura.service";
import PopupPreRequisito from "../comunes/popupPreRequisito";
import { useDecreto } from "../../context/decretoContext";
import { renderEstadoCelda } from "../comunes/renderEstadoCelda";
import handleClickAsignatura from "../comunes/handleClickAsignatura";
import { Tooltip } from "primereact/tooltip";
import { InputText } from "primereact/inputtext";
import { MultiSelect } from "primereact/multiselect";

function VistaAsignatura() {
  const [asignaturas, setAsignaturas] = useState([]);
  const [asignaturasSeleccionadas, setAsignaturasSeleccionadas] = useState([]);
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [matriculados, setMatriculados] = useState([]);
  const [loading, setLoading] = useState(false);

  const [visiblePopup, setVisiblePopup] = useState(false);
  const [datosPopup, setDatosPopup] = useState({});

  const { decreto } = useDecreto();

  const periodos = [
    { label: "Primer Semestre", value: "1" },
    { label: "Segundo Semestre", value: "2" }
  ];

  useEffect(() => {
    async function cargarAsignaturas() {
      if (!decreto) return;
      try {
        const lista = await obtenerAsignaturas(decreto);
        const listaConEtiquetas = lista.map(asig => ({
        ...asig,
        etiqueta: `${asig.codAsignatura} - ${asig.nombreAsignatura}`
        }));
        setAsignaturas(listaConEtiquetas);   
      } catch (err) {
        console.error("Error al obtener asignaturas:", err);
      }
    }
    cargarAsignaturas();
  }, [decreto]);

  useEffect(() => {
    async function cargarDatos() {
      if (!asignaturasSeleccionadas.length || !periodoSeleccionado) return;
      setLoading(true);
      try {
        const codigos = asignaturasSeleccionadas.map(a => a.codAsignatura);
        const datos = await obtenerMatriculadosPorAsignatura({
          codAsignaturas: codigos,
          periodo: periodoSeleccionado,
          decreto,
          query: busqueda
        });

        const procesados = datos.map((matriculado) => {
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
        console.error("Error al obtener alumnos por asignatura:", err);
      } finally {
        setLoading(false);
      }
    }
    cargarDatos();
  }, [asignaturasSeleccionadas, periodoSeleccionado, busqueda, decreto]);


  return (
    <VistaMenu>
      <div>
        <div className="contenedor-dropdowns-buscador">
          <div className="contenedor-dropdowns">
            <div>
              <label htmlFor="asignatura">Seleccione asignaturas:</label>
              <MultiSelect
                id="asignatura"
                value={asignaturasSeleccionadas}
                options={asignaturas}
                optionLabel="etiqueta"
                placeholder="-- Seleccione --"
                onChange={(e) => setAsignaturasSeleccionadas(e.value)}
                className="w-full md:w-20rem"
                display="chip"
              />
            </div>
            <div>
              <label htmlFor="periodo">Seleccione periodo:</label>
              <Dropdown
                id="periodo"
                value={periodoSeleccionado}
                options={periodos}
                onChange={(e) => setPeriodoSeleccionado(e.value)}
                placeholder="-- Seleccione --"
                className="w-full md:w-14rem"
              />
            </div>
          </div>

          <div className="mb-3">
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
        </div>

        {loading ? (
          <p>Cargando datos...</p>
        ) : (
          <DataTable value={matriculados} paginator rows={10} stripedRows>
            <Column field="anioIngreso" header="Año Ingreso" />
            <Column field="rut" header="RUT" />
            <Column field="apellidoPaterno" header="Apellido Paterno" />
            <Column field="apellidoMaterno" header="Apellido Materno" />
            <Column field="nombres" header="Nombres" />
            {asignaturasSeleccionadas.map(asig => (
              <Column
                key={asig.codAsignatura}
                field={asig.codAsignatura}
                header={
                  <>
                    <span 
                      data-pr-tooltip={asig.nombreAsignatura}
                      data-pr-position="top"
                    >
                  {asig.codAsignatura}
                  </span>
                  <Tooltip target={`[data-pr-tooltip="${asig.nombreAsignatura}"]`}/>
                  </>
                }
                body={(rowData) =>
                  renderEstadoCelda(rowData, { field: asig.codAsignatura },
                    ( matriculado, codAsignatura ) =>
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

export default VistaAsignatura;