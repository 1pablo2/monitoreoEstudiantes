import 'primereact/resources/themes/lara-light-blue/theme.css';    
import 'primereact/resources/primereact.min.css';                  
import 'primeicons/primeicons.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { DecretoProvider } from './context/decretoContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <DecretoProvider>
    <App />
  </DecretoProvider>
);