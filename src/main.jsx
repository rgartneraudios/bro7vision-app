import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// 1. Asegúrate de tener importados tus Providers
import { AudioProvider } from './context/AudioContext';
import { WebLLMProvider } from './context/WebLLMContext'; // <-- Importa esto

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. Envuelve la App con tu nuevo Provider */}
    <WebLLMProvider>
      <AudioProvider>
        <App />
      </AudioProvider>
    </WebLLMProvider>
  </React.StrictMode>
);