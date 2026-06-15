import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';

import './index.css';

// Automatically prefix /api calls in production with the VITE_API_URL environment variable.
// This allows direct browser-to-backend communication, avoiding Vercel serverless proxy timeout limits.
const viteApiUrl = (import.meta as any).env?.VITE_API_URL;
if (viteApiUrl) {
  const originalFetch = window.fetch;
  window.fetch = async (input, init) => {
    let targetInput = input;
    if (typeof input === 'string' && input.startsWith('/api')) {
      targetInput = `${viteApiUrl}${input}`;
    }
    return originalFetch(targetInput, init);
  };
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
