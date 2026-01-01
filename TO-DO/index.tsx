import React from 'react';
import './src/index.css';
import { createRoot } from 'react-dom/client';

import App from './src/App';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Uygulama kök elemanı bulunamadı.');
}

const root = createRoot(container);
root.render(<App />);
