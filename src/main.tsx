import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './ErrorBoundary.tsx';
import './index.css';

window.addEventListener('error', (event) => {
  console.error('Global Error Caught:', event.error);
  // We can write to document body if it's completely empty (white screen)
  if (document.body.innerHTML === '' || document.getElementById('root')?.innerHTML === '') {
    document.body.innerHTML = `<div style="padding: 20px; color: red;">Fatal Error: ${event.error?.message}</div>`;
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
