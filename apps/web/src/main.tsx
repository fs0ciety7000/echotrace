import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './styles/global.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import { applySettings, useSettings } from './state/settings.ts';

applySettings(useSettings.getState());

const root = document.getElementById('root');
if (!root) throw new Error('#root introuvable');
createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
