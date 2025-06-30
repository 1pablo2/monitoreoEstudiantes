import React from "react";

export const renderEstadoCelda = (rowData, column, onClickAsignatura) => {
  const estado = rowData[column.field];

  const texto =
    estado === 1 ? "⏳" :
    estado === 2 ? "✅" :
    estado === 3 ? "❌" :
    estado === 4 ? "📘" : "";

  const clase =
    estado === 1 ? "estado-pendiente" :
    estado === 2 ? "estado-aprobado" :
    estado === 3 ? "estado-reprobado" :
    estado === 4 ? "estado-cursando" : "";

  return (
    <div
      className={`celda-estado ${clase}`}
      style={{ cursor: "pointer" }}
      onClick={() => 
        onClickAsignatura?.(rowData, column.field)}
    >
      {texto}
    </div>
  );
};