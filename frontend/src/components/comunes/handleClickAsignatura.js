const handleClickAsignatura = ({
  matriculado,
  codAsignatura,
  asignaturas,
  setDatosPopup,
  setVisiblePopup
}) => {

  if (!Array.isArray(asignaturas)) {
    return;
  }

  const asignatura = asignaturas.find(
    a => a.codAsignatura?.trim().toUpperCase() === codAsignatura?.trim().toUpperCase()
  );

  if (!asignatura) {
    alert("No se encontró información de la asignatura.");
    return;
  }

  if (!asignatura.prerrequisitos) {
    alert("Esta asignatura no tiene prerrequisitos.");
    return;
  }

  const codigosRequisitos = asignatura.prerrequisitos
    .split(',')
    .map(p => p.trim())
    .filter(p => p !== '');

  setDatosPopup({
    estudiante: matriculado,
    asignatura,
    prerequisitos: codigosRequisitos
  });

  setVisiblePopup(true);
};

export default handleClickAsignatura;