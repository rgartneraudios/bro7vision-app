// main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// 1. Solo mantenemos los Providers que sí se usan
import { AudioProvider } from './context/AudioContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* 2. La estructura se simplifica */}
    <AudioProvider>
      <App />
    </AudioProvider>
  </React.StrictMode>
);