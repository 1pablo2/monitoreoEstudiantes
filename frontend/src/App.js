import './App.css';
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import CargarArchivos from './components/cargarArchivos/cargarArchivos.component';
import VistaCohorte from './components/tablas/vistaCohorte.component';
import VistaAsignatura from './components/tablas/vistaAsignatura.component';
import Inicio from './components/inicio/inicio.component';

function App() {
  const fechaActual = new Date().toLocaleDateString();

  return (
    <div className="App">
      <header>
        <h2>Seguimiento Académico</h2>
        <div className="ultima-actualizacion">Última actualización: {fechaActual}</div>
      </header>

      <Router>
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/cohorte" element={<VistaCohorte />} />
          <Route path="/asignatura" element={<VistaAsignatura />} />
          <Route path="/cargar-archivos" element={<CargarArchivos />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;